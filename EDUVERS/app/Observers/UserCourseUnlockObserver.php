<?php

namespace App\Observers;

use App\Models\UserCourseUnlock;
use App\Jobs\GenerateRecommendationRulesJob;
use Illuminate\Support\Facades\Log;

class UserCourseUnlockObserver
{
    /**
     * Handle the UserCourseUnlock "created" event.
     */
    public function created(UserCourseUnlock $userCourseUnlock): void
    {
        $this->scheduleRecommendationUpdate();
    }

    /**
     * Handle the UserCourseUnlock "updated" event.
     */
    public function updated(UserCourseUnlock $userCourseUnlock): void
    {
        $this->scheduleRecommendationUpdate();
    }

    /**
     * Handle the UserCourseUnlock "deleted" event.
     */
    public function deleted(UserCourseUnlock $userCourseUnlock): void
    {
        $this->scheduleRecommendationUpdate();
    }

    /**
     * Schedule recommendation rules update
     */
    private function scheduleRecommendationUpdate(): void
    {
        try {
            // Dispatch job with delay to batch multiple changes
            GenerateRecommendationRulesJob::dispatch()->delay(now()->addMinutes(5));

            Log::info('Recommendation rules update job dispatched');
        } catch (\Exception $e) {
            Log::error('Failed to dispatch recommendation rules update job: ' . $e->getMessage());
        }
    }
}
