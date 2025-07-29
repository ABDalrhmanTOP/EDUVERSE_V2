<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\UserCourseUnlock;
use App\Observers\UserCourseUnlockObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register observer for automatic recommendation updates
        UserCourseUnlock::observe(UserCourseUnlockObserver::class);
    }
}
