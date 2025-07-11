<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Subscription;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Exception\ApiErrorException;
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
    }

    /**
     * Process checkout payment
     */
    public function checkout(Request $request)
    {
        \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

        $paymentMethodId = $request->input('payment_method_id');
        $amount = $request->input('amount');
        $planName = $request->input('plan_name');
        $planId = $request->input('planId');
        $user = $request->user();

        // Determine allowed courses based on the plan
        $allowedCourses = $this->getAllowedCoursesByPlan($planId);

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
                // Create subscription and ensure allowed_courses is saved
                $subscription = \App\Models\Subscription::create([
                    'user_id' => $user ? $user->id : null,
                    'plan_id' => $planId,
                    'plan_name' => $planName,
                    'amount' => $amount,
                    'currency' => 'USD',
                    'status' => 'active',
                    'payment_intent_id' => $paymentIntent->id,
                    'payment_method' => $paymentMethodId,
                    'transaction_id' => $paymentIntent->id,
                    'start_date' => now(),
                    'end_date' => now()->addMonth(),
                    'allowed_courses' => $allowedCourses,
                ]);

                // Log subscription info to ensure saving
                Log::info('Subscription created successfully', [
                    'user_id' => $user ? $user->id : null,
                    'plan_id' => $planId,
                    'allowed_courses' => $allowedCourses,
                    'subscription_id' => $subscription->id
                ]);

                return response()->json([
                    'success' => true,
                    'paymentIntent' => $paymentIntent,
                    'subscription' => [
                        'id' => $subscription->id,
                        'allowed_courses' => $subscription->allowed_courses,
                        'plan_name' => $subscription->plan_name
                    ]
                ]);
            } else {
                return response()->json(['success' => false, 'message' => 'Payment not completed.'], 400);
            }
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    /**
     * Determine allowed courses by plan
     */
    private function getAllowedCoursesByPlan($planId)
    {
        $planMap = [
            '1' => 1,   // Single Course Plan
            '3' => 3,   // Three Courses Plan
            '10' => 10, // Ten Courses Plan
        ];

        return $planMap[$planId] ?? 0;
    }

    /**
     * Get subscription status for user
     */
    public function getSubscriptionStatus(Request $request)
    {
        try {
            $user = $request->user();

            $subscription = Subscription::where('user_id', $user->id)
                ->where('status', 'active')
                ->where('end_date', '>', now())
                ->first();

            if (!$subscription) {
                return response()->json([
                    'has_active_subscription' => false,
                    'subscription' => null,
                    'remaining_courses' => 0,
                    'used_courses' => 0,
                    'total_allowed_courses' => 0
                ]);
            }

            $usedCourses = $user->unlockedCourses()->count();
            $remainingCourses = max(0, $subscription->allowed_courses - $usedCourses);

            return response()->json([
                'has_active_subscription' => true,
                'subscription' => [
                    'id' => $subscription->id,
                    'plan_id' => $subscription->plan_id,
                    'plan_name' => $subscription->plan_name,
                    'amount' => $subscription->amount,
                    'currency' => $subscription->currency,
                    'status' => $subscription->status,
                    'start_date' => $subscription->start_date->toISOString(),
                    'end_date' => $subscription->end_date->toISOString(),
                    'allowed_courses' => $subscription->allowed_courses,
                ],
                'remaining_courses' => $remainingCourses,
                'used_courses' => $usedCourses,
                'total_allowed_courses' => $subscription->allowed_courses
            ]);

        } catch (\Exception $e) {
            Log::error('Subscription Status Error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch subscription status'], 500);
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
                        'amount' => $subscription->amount,
                        'currency' => $subscription->currency,
                        'status' => $subscription->status,
                        'transaction_id' => $subscription->transaction_id,
                        'start_date' => $subscription->start_date->toISOString(),
                        'end_date' => $subscription->end_date->toISOString(),
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
}







