<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Subscription;
use App\Models\User;

class CheckSubscriptions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscriptions:check {user_id?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check subscriptions and allowed_courses for users';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->argument('user_id');

        if ($userId) {
            $this->checkUserSubscription($userId);
        } else {
            $this->checkAllSubscriptions();
        }
    }

    private function checkUserSubscription($userId)
    {
        $user = User::find($userId);
        if (!$user) {
            $this->error("User with ID {$userId} not found.");
            return;
        }

        $this->info("Checking subscription for user: {$user->name} (ID: {$user->id})");

        $subscriptions = Subscription::where('user_id', $userId)->get();

        if ($subscriptions->isEmpty()) {
            $this->warn("No subscriptions found for user {$userId}");
            return;
        }

        foreach ($subscriptions as $subscription) {
            $this->displaySubscriptionInfo($subscription);
        }
    }

    private function checkAllSubscriptions()
    {
        $this->info("Checking all subscriptions...");

        $subscriptions = Subscription::with('user')->get();

        if ($subscriptions->isEmpty()) {
            $this->warn("No subscriptions found in the system.");
            return;
        }

        $this->table(
            ['User ID', 'User Name', 'Plan Name', 'Status', 'Allowed Courses', 'Used Courses', 'Remaining'],
            $subscriptions->map(function ($subscription) {
                $usedCourses = $subscription->user->unlockedCourses()->count();
                $remaining = max(0, $subscription->allowed_courses - $usedCourses);

                return [
                    $subscription->user_id,
                    $subscription->user->name ?? 'N/A',
                    $subscription->plan_name,
                    $subscription->status,
                    $subscription->allowed_courses,
                    $usedCourses,
                    $remaining
                ];
            })->toArray()
        );
    }

    private function displaySubscriptionInfo($subscription)
    {
        $this->info("Subscription ID: {$subscription->id}");
        $this->info("Plan: {$subscription->plan_name}");
        $this->info("Status: {$subscription->status}");
        $this->info("Allowed Courses: {$subscription->allowed_courses}");
        $this->info("Start Date: {$subscription->start_date}");
        $this->info("End Date: {$subscription->end_date}");

        $usedCourses = $subscription->user->unlockedCourses()->count();
        $remaining = max(0, $subscription->allowed_courses - $usedCourses);

        $this->info("Used Courses: {$usedCourses}");
        $this->info("Remaining Courses: {$remaining}");
        $this->line('');
    }
}
