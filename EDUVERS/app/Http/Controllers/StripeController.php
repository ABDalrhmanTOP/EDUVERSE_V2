<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Subscription;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Exception\ApiErrorException;
use Illuminate\Support\Facades\Mail;
use App\Models\Playlist;

class StripeController extends Controller
{
    public function __construct()
    {
        $stripeSecret = config('services.stripe.secret');
        if (!$stripeSecret) {
            Log::error('Stripe secret key not found in configuration');
            throw new \Exception('Stripe configuration missing');
        }
        Stripe::setApiKey($stripeSecret);
        Log::info('Stripe initialized with key: ' . substr($stripeSecret, 0, 20) . '...');
    }

    /**
     * Create a payment intent for subscription
     */
    public function createPaymentIntent(Request $request)
    {
        try {
            $request->validate([
                'planId' => 'required|string',
                'amount' => 'required|integer|min:100', // Minimum 1 USD
                'currency' => 'required|string|size:3'
            ]);

            $user = $request->user();
            
            // Define subscription plans
            $plans = [
                'basic' => [
                    'name' => 'Basic Plan',
                    'description' => 'Access to basic courses with standard support',
                    'features' => [
                        'Access to all basic courses',
                        'Basic support',
                        'Course completion certificate',
                        '1 month access'
                    ]
                ],
                'premium' => [
                    'name' => 'Premium Plan',
                    'description' => 'Access to advanced courses with premium support',
                    'features' => [
                        'All basic plan features',
                        'Access to advanced courses',
                        '24/7 premium support',
                        'Certified certificate',
                        'Exclusive content',
                        'Live training sessions'
                    ]
                ],
                'enterprise' => [
                    'name' => 'Enterprise Plan',
                    'description' => 'Complete solution for organizations',
                    'features' => [
                        'All premium plan features',
                        'Team management',
                        'Detailed reports',
                        'Custom training',
                        'Dedicated support',
                        'Company integration'
                    ]
                ]
            ];

            if (!isset($plans[$request->planId])) {
                return response()->json(['error' => 'Invalid plan selected'], 400);
            }

            $plan = $plans[$request->planId];

            // Create payment intent
            Log::info('Creating payment intent', [
                'amount' => $request->amount,
                'currency' => strtolower($request->currency),
                'user_id' => $user->id,
                'plan_id' => $request->planId
            ]);
            
            $paymentIntent = PaymentIntent::create([
                'amount' => $request->amount,
                'currency' => strtolower($request->currency),
                'metadata' => [
                    'user_id' => $user->id,
                    'plan_id' => $request->planId,
                    'plan_name' => $plan['name']
                ]
            ]);
            
            Log::info('Payment intent created successfully', [
                'payment_intent_id' => $paymentIntent->id,
                'client_secret' => substr($paymentIntent->client_secret, 0, 20) . '...'
            ]);

            // Create subscription record
            $subscription = Subscription::create([
                'user_id' => $user->id,
                'plan_id' => $request->planId,
                'plan_name' => $plan['name'],
                'plan_description' => $plan['description'],
                'amount' => $request->amount,
                'currency' => strtoupper($request->currency),
                'status' => 'pending',
                'payment_intent_id' => $paymentIntent->id,
                'start_date' => now(),
                'end_date' => now()->addMonth(),
                'features' => $plan['features']
            ]);

            return response()->json([
                'clientSecret' => $paymentIntent->client_secret,
                'subscription_id' => $subscription->id
            ]);

        } catch (ApiErrorException $e) {
            Log::error('Stripe API Error: ' . $e->getMessage());
            return response()->json(['error' => 'Payment processing failed'], 500);
        } catch (\Exception $e) {
            Log::error('Payment Intent Creation Error: ' . $e->getMessage());
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Update subscription after successful payment
     */
    public function updateSubscription(Request $request)
    {
        try {
            $request->validate([
                'planId' => 'required|string',
                'paymentIntentId' => 'required|string',
                'amount' => 'required|integer',
                'status' => 'required|string'
            ]);

            $user = $request->user();

            // Find subscription by payment intent ID
            $subscription = Subscription::where('payment_intent_id', $request->paymentIntentId)
                ->where('user_id', $user->id)
                ->first();

            if (!$subscription) {
                return response()->json(['error' => 'Subscription not found'], 404);
            }

            // Update subscription status
            $subscription->update([
                'status' => $request->status,
                'transaction_id' => $request->paymentIntentId
            ]);

            // Cancel any existing active subscriptions
            Subscription::where('user_id', $user->id)
                ->where('id', '!=', $subscription->id)
                ->where('status', 'active')
                ->update([
                    'status' => 'cancelled',
                    'cancelled_at' => now(),
                    'cancellation_reason' => 'New subscription activated'
                ]);

            return response()->json([
                'message' => 'Subscription updated successfully',
                'subscription' => $subscription->fresh()
            ]);

        } catch (\Exception $e) {
            Log::error('Subscription Update Error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update subscription'], 500);
        }
    }

    /**
     * Get subscription history for user
     */
    public function getSubscriptionHistory(Request $request)
    {
        try {
            $user = $request->user();

            $subscriptions = Subscription::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($subscription) {
                    return [
                        'id' => $subscription->id,
                        'plan_id' => $subscription->plan_id,
                        'plan_name' => $subscription->plan_name,
                        'plan_description' => $subscription->plan_description,
                        'amount' => $subscription->amount,
                        'currency' => $subscription->currency,
                        'status' => $subscription->status,
                        'payment_method' => $subscription->payment_method,
                        'transaction_id' => $subscription->transaction_id,
                        'start_date' => $subscription->start_date->toISOString(),
                        'end_date' => $subscription->end_date->toISOString(),
                        'cancelled_at' => $subscription->cancelled_at?->toISOString(),
                        'cancellation_reason' => $subscription->cancellation_reason,
                        'features' => $subscription->features,
                        'created_at' => $subscription->created_at->toISOString()
                    ];
                });

            return response()->json([
                'subscriptions' => $subscriptions
            ]);

        } catch (\Exception $e) {
            Log::error('Subscription History Error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch subscription history'], 500);
        }
    }

    /**
     * Cancel subscription
     */
    public function cancelSubscription(Request $request, $subscriptionId)
    {
        try {
            $user = $request->user();

            $subscription = Subscription::where('id', $subscriptionId)
                ->where('user_id', $user->id)
                ->first();

            if (!$subscription) {
                return response()->json(['error' => 'Subscription not found'], 404);
            }

            if ($subscription->status !== 'active') {
                return response()->json(['error' => 'Subscription is not active'], 400);
            }

            $subscription->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'cancellation_reason' => $request->input('reason', 'User cancelled')
            ]);

            return response()->json([
                'message' => 'Subscription cancelled successfully',
                'subscription' => $subscription->fresh()
            ]);

        } catch (\Exception $e) {
            Log::error('Subscription Cancellation Error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to cancel subscription'], 500);
        }
    }

    /**
     * Get current active subscription
     */
    public function getCurrentSubscription(Request $request)
    {
        try {
            $user = $request->user();

            $subscription = Subscription::where('user_id', $user->id)
                ->where('status', 'active')
                ->where('end_date', '>', now())
                ->first();

            if (!$subscription) {
                return response()->json(['subscription' => null]);
            }

            return response()->json([
                'subscription' => [
                    'id' => $subscription->id,
                    'plan_id' => $subscription->plan_id,
                    'plan_name' => $subscription->plan_name,
                    'plan_description' => $subscription->plan_description,
                    'amount' => $subscription->amount,
                    'currency' => $subscription->currency,
                    'status' => $subscription->status,
                    'start_date' => $subscription->start_date->toISOString(),
                    'end_date' => $subscription->end_date->toISOString(),
                    'features' => $subscription->features
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Current Subscription Error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch current subscription'], 500);
        }
    }

    /**
     * Webhook handler for Stripe events
     */
    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = config('services.stripe.webhook_secret');

        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload, $sigHeader, $endpointSecret
            );
        } catch (\UnexpectedValueException $e) {
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Handle the event
        switch ($event->type) {
            case 'payment_intent.succeeded':
                $this->handlePaymentSucceeded($event->data->object);
                break;
            case 'payment_intent.payment_failed':
                $this->handlePaymentFailed($event->data->object);
                break;
            default:
                Log::info('Unhandled event type: ' . $event->type);
        }

        return response()->json(['status' => 'success']);
    }

    private function handlePaymentSucceeded($paymentIntent)
    {
        $subscription = Subscription::where('payment_intent_id', $paymentIntent->id)->first();
        
        if ($subscription) {
            $subscription->update([
                'status' => 'active',
                'transaction_id' => $paymentIntent->id
            ]);
        }
    }

    private function handlePaymentFailed($paymentIntent)
    {
        $subscription = Subscription::where('payment_intent_id', $paymentIntent->id)->first();
        
        if ($subscription) {
            $subscription->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'cancellation_reason' => 'Payment failed'
            ]);
        }
    }

    public function checkout(Request $request)
    {
        \Stripe\Stripe::setApiKey(env('STRIPE_SECRET'));

        $paymentMethodId = $request->input('payment_method_id');
        $amount = $request->input('amount');
        $planName = $request->input('plan_name');
        $user = $request->user();

        try {
            $paymentIntent = \Stripe\PaymentIntent::create([
                'amount' => $amount * 100,
                'currency' => 'usd',
                'payment_method' => $paymentMethodId,
                'confirmation_method' => 'manual',
                'confirm' => true,
                'payment_method_types' => ['card'],
            ]);

            if ($paymentIntent->status === 'succeeded') {
                \App\Models\Subscription::create([
                    'user_id' => $user ? $user->id : null,
                    'plan_id' => $request->input('planId'),
                    'plan_name' => $planName,
                    'amount' => $amount,
                    'currency' => 'USD',
                    'status' => 'active',
                    'payment_intent_id' => $paymentIntent->id,
                    'payment_method' => $paymentMethodId,
                    'transaction_id' => $paymentIntent->id,
                    'start_date' => now(),
                    'end_date' => now()->addMonth(),
                ]);
                return response()->json(['success' => true, 'paymentIntent' => $paymentIntent]);
            } else {
                return response()->json(['success' => false, 'message' => 'Payment not completed.'], 400);
            }
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    // جلب الكورسات النشطة للمستخدم
    public function activeCourses(Request $request)
    {
        $user = $request->user();
        $activePlaylistIds = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->pluck('playlist_id');
        $playlists = Playlist::whereIn('id', $activePlaylistIds)->get();
        return response()->json($playlists);
    }

    // حذف اشتراك كورس محدد
    public function removeCourseSubscription(Request $request, $playlistId)
    {
        $user = $request->user();
        Subscription::where('user_id', $user->id)
            ->where('playlist_id', $playlistId)
            ->delete();
        return response()->json(['success' => true]);
    }
}
