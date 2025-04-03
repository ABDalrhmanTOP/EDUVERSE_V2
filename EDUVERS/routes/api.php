<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserProgressController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TestController;
use App\Http\Controllers\ResultTest;
use App\Http\Controllers\PlaylistController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\EmailVerificationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\UserDetailController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\UserRatingController;
use App\Http\Controllers\FinalProjectController;

// Public Routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected Routes (Authentication Required)
Route::middleware('auth:sanctum')->group(function () {

    // Auth Routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // User Progress (for saving progress, getting progress & completing tasks)
    Route::post('/user-progress', [UserProgressController::class, 'saveProgress'])->name('user-progress.save');
    Route::get('/user-progress', [UserProgressController::class, 'getProgress'])->name('user-progress.get');
    Route::post('/user-progress/tasks', [UserProgressController::class, 'completeTask'])->name('user-progress.completeTask');

    // Normal User Course Progress Route (renamed to avoid conflict)
    Route::get('/user-progress/course-progress/{userId}', [UserProgressController::class, 'getCourseProgress']);

    // Profile Routes
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/picture', [ProfileController::class, 'updatePicture']);

    // Test and Course Routes
    Route::middleware('auth:sanctum')->get('/showTest/{levelId}', [TestController::class, 'showTest']);
    Route::middleware('auth:sanctum')->post('/submitTest/{levelId}', [TestController::class, 'submitTest']);
    Route::middleware('auth:sanctum')->get('/checkTestTaken', [ResultTest::class, 'checkTestTaken']);
    Route::post('/submitTest/{level}', [ResultTest::class, 'submitTest']);
    Route::get('/courses', [CourseController::class, 'index']);

    // Final Project and Feedback
    Route::post('/final-project', [FinalProjectController::class, 'submitFinalProject']);
    Route::post('/user-feedback', [UserRatingController::class, 'store']);
});

// Admin Routes (Protected with additional middleware)
Route::middleware(['auth:sanctum', \App\Http\Middleware\AdminMiddleware::class])->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::get('/user-progress/user/{user_id}', [UserDetailController::class, 'getAllByUserId']);
    Route::post('/courses', [CourseController::class, 'store']);
    Route::put('/courses/{id}', [CourseController::class, 'update']);
    Route::delete('/courses/{id}', [CourseController::class, 'destroy']);
});

// Unprotected Routes
Route::get('/tasks/{playlistId}', [TaskController::class, 'getTasks']);
Route::get('/playlists/{id}', [PlaylistController::class, 'show']);

// Additional Routes
Route::post('/evaluate-code', [TaskController::class, 'evaluateCode']);

// Email Verification
Route::post('/send-verification-code', [EmailVerificationController::class, 'sendVerificationCode']);
Route::post('/verify-code', [EmailVerificationController::class, 'verifyCode']);

// Chat Route (if needed)
Route::get('/chat', [ChatController::class, 'index']);

// Fallback for Undefined Endpoints
Route::fallback(function () {
    Log::warning('API Route not found', ['url' => request()->url()]);
    return response()->json(['message' => 'API Route not found.'], 404);
});
// Return all course progress for the authenticated user, split into two arrays
Route::middleware('auth:sanctum')->get(
    '/user-progress/all',
    [UserProgressController::class, 'getAllCourseProgress']
)->name('user-progress.getAll');
