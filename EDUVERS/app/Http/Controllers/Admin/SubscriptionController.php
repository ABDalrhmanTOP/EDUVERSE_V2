<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class SubscriptionController extends Controller
{
    /**
     * Get all subscriptions with user and plan details
     */
    public function index()
    {
        try {
            $subscriptions = Subscription::with(['user:id,name,email'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($subscription) {
                    return [
                        'id' => $subscription->id,
                        'user_id' => $subscription->user_id,
                        'user_name' => $subscription->user->name ?? 'Unknown User',
                        'user_email' => $subscription->user->email ?? 'No Email',
                        'plan_name' => $this->getPlanName($subscription->plan_id),
                        'plan_details' => $this->getPlanDetails($subscription->plan_id),
                        'amount' => $subscription->amount,
                        'status' => $subscription->status,
                        'start_date' => $subscription->start_date,
                        'end_date' => $subscription->end_date,
                        'created_at' => $subscription->created_at,
                        'updated_at' => $subscription->updated_at,
                        'notes' => $subscription->notes ?? null,
                    ];
                });

            return response()->json([
                'success' => true,
                'subscriptions' => $subscriptions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch subscriptions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get subscription statistics
     */
    public function statistics()
    {
        try {
            $stats = [
                'total_subscriptions' => Subscription::count(),
                'active_subscriptions' => Subscription::where('status', 'active')->count(),
                'expired_subscriptions' => Subscription::where('status', 'expired')->count(),
                'cancelled_subscriptions' => Subscription::where('status', 'cancelled')->count(),
                'pending_subscriptions' => Subscription::where('status', 'pending')->count(),
                'total_revenue' => Subscription::where('status', 'active')->sum('amount'),
                'monthly_revenue' => Subscription::where('status', 'active')
                    ->whereMonth('created_at', now()->month)
                    ->sum('amount'),
            ];

            return response()->json([
                'success' => true,
                'statistics' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update subscription
     */
    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'status' => 'required|in:active,expired,cancelled,pending',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after:start_date',
                'amount' => 'required|numeric|min:0',
                'notes' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $subscription = Subscription::findOrFail($id);

            $subscription->update([
                'status' => $request->status,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'amount' => $request->amount,
                'notes' => $request->notes,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Subscription updated successfully',
                'subscription' => $subscription
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update subscription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete subscription
     */
    public function destroy($id)
    {
        try {
            $subscription = Subscription::findOrFail($id);
            $subscription->delete();

            return response()->json([
                'success' => true,
                'message' => 'Subscription deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete subscription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get subscription by ID
     */
    public function show($id)
    {
        try {
            $subscription = Subscription::with(['user:id,name,email'])
                ->findOrFail($id);

            $subscriptionData = [
                'id' => $subscription->id,
                'user_id' => $subscription->user_id,
                'user_name' => $subscription->user->name ?? 'Unknown User',
                'user_email' => $subscription->user->email ?? 'No Email',
                'plan_name' => $this->getPlanName($subscription->plan_id),
                'plan_details' => $this->getPlanDetails($subscription->plan_id),
                'amount' => $subscription->amount,
                'status' => $subscription->status,
                'start_date' => $subscription->start_date,
                'end_date' => $subscription->end_date,
                'created_at' => $subscription->created_at,
                'updated_at' => $subscription->updated_at,
                'notes' => $subscription->notes ?? null,
            ];

            return response()->json([
                'success' => true,
                'subscription' => $subscriptionData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch subscription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search subscriptions
     */
    public function search(Request $request)
    {
        try {
            $query = Subscription::with(['user:id,name,email']);

            // Search by user name or email
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // Filter by status
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Filter by date range
            if ($request->has('start_date')) {
                $query->where('created_at', '>=', $request->start_date);
            }

            if ($request->has('end_date')) {
                $query->where('created_at', '<=', $request->end_date);
            }

            $subscriptions = $query->orderBy('created_at', 'desc')->get()
                ->map(function ($subscription) {
                    return [
                        'id' => $subscription->id,
                        'user_id' => $subscription->user_id,
                        'user_name' => $subscription->user->name ?? 'Unknown User',
                        'user_email' => $subscription->user->email ?? 'No Email',
                        'plan_name' => $this->getPlanName($subscription->plan_id),
                        'plan_details' => $this->getPlanDetails($subscription->plan_id),
                        'amount' => $subscription->amount,
                        'status' => $subscription->status,
                        'start_date' => $subscription->start_date,
                        'end_date' => $subscription->end_date,
                        'created_at' => $subscription->created_at,
                        'updated_at' => $subscription->updated_at,
                        'notes' => $subscription->notes ?? null,
                    ];
                });

            return response()->json([
                'success' => true,
                'subscriptions' => $subscriptions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search subscriptions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export subscriptions data
     */
    public function export(Request $request)
    {
        try {
            $subscriptions = Subscription::with(['user:id,name,email'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($subscription) {
                    return [
                        'ID' => $subscription->id,
                        'User Name' => $subscription->user->name ?? 'Unknown User',
                        'User Email' => $subscription->user->email ?? 'No Email',
                        'Plan' => $this->getPlanName($subscription->plan_id),
                        'Amount' => $subscription->amount / 100, // Convert from cents
                        'Status' => ucfirst($subscription->status),
                        'Start Date' => $subscription->start_date,
                        'End Date' => $subscription->end_date,
                        'Created At' => $subscription->created_at->format('Y-m-d H:i:s'),
                        'Notes' => $subscription->notes ?? '',
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $subscriptions,
                'filename' => 'subscriptions_' . date('Y-m-d_H-i-s') . '.csv'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export subscriptions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get plan name based on plan ID
     */
    private function getPlanName($planId)
    {
        $plans = [
            '1' => 'Single Course Plan',
            '3' => 'Three Courses Plan',
            '10' => 'Ten Courses Plan',
        ];

        return $plans[$planId] ?? 'Unknown Plan';
    }

    /**
     * Get plan details based on plan ID
     */
    private function getPlanDetails($planId)
    {
        $planDetails = [
            '1' => 'Access to 1 course',
            '3' => 'Access to 3 courses',
            '10' => 'Access to 10 courses',
        ];

        return $planDetails[$planId] ?? 'No details available';
    }
}
