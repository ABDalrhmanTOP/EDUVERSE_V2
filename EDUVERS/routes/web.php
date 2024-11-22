<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserProgressController;

// Public route for the welcome page
Route::get('/', function () {
    return view('welcome');
});

// Group routes that require authentication, sanctum, and session verification
Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified',
])->group(function () {
    Route::get('/dashboard', function () {
        return view('dashboard');
    })->name('dashboard');

    // Additional routes for authenticated users (if any)

});
