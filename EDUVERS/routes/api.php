<?php

use Illuminate\Support\Facades\Route;
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
use App\Http\Controllers\TaskPlaylistVideoController;
use App\Http\Controllers\EduBotController;
use App\Http\Controllers\PlacementTestController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// For showing all playlists (fixing the 404):
Route::get('/playlists', [PlaylistController::class, 'index']);

// For showing a single playlist by ID:
Route::get('/playlists/{id}', [PlaylistController::class, 'show']);

// YouTube video duration route (public, no auth required)
Route::get('/youtube/video-duration/{videoId}', [CourseController::class, 'getVideoDuration']);
Route::get('/youtube/test/{videoId}', [CourseController::class, 'testVideoDuration']);

/*
|--------------------------------------------------------------------------
| Protected Routes (Sanctum Auth)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // User progress
    Route::post('/user-progress', [UserProgressController::class, 'saveProgress'])->name('user-progress.save');
    Route::get('/user-progress', [UserProgressController::class, 'getProgress'])->name('user-progress.get');
    Route::post('/user-progress/tasks', [UserProgressController::class, 'completeTask'])->name('user-progress.completeTask');

    // <-- THE NEW ROUTE:
    Route::post('/user-progress/completeUpToTimestamp', [UserProgressController::class, 'completeUpToTimestamp'])
        ->name('user-progress.completeUpToTimestamp');

    // Normal user course progress route
    Route::get('/user-progress/course-progress/{userId}', [UserProgressController::class, 'getCourseProgress']);

    // Profile
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::put('/profile', [ProfileController::class, 'update']);
        Route::post('/profile/picture', [ProfileController::class, 'updatePicture']);
        Route::delete('/profile/picture', [ProfileController::class, 'removePicture']);
    });

    // Test & Course
    Route::get('/showTest/{levelId}', [TestController::class, 'showTest']);
    Route::post('/submitTest/{levelId}', [TestController::class, 'submitTest']);
    Route::get('/checkTestTaken', [ResultTest::class, 'checkTestTaken']);
    Route::post('/submitTest/{level}', [ResultTest::class, 'submitTest']);

    // Final Project & Feedback
    Route::post('/final-project', [FinalProjectController::class, 'submitFinalProject']);
    Route::post('/user-feedback', [UserRatingController::class, 'store']);

    // Placement Test
    Route::post('/placement-test/start', [PlacementTestController::class, 'start']);
    Route::post('/placement-test/submit', [PlacementTestController::class, 'submit']);
});

/*
|--------------------------------------------------------------------------
| Admin Routes (Protected with Admin Middleware)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', \App\Http\Middleware\AdminMiddleware::class])->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    Route::get('/user-progress/user/{user_id}', [UserDetailController::class, 'getAllByUserId']);

    Route::post('/courses', [CourseController::class, 'store']);
    Route::put('/courses/{id}', [CourseController::class, 'update']);
    Route::delete('/courses/{id}', [CourseController::class, 'destroy']);

    // Task management routes
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::get('/task/{id}', [TaskPlaylistVideoController::class, 'show']);
    Route::post('/task', [TaskPlaylistVideoController::class, 'store']);
    Route::put('/task/{id}', [TaskPlaylistVideoController::class, 'update']);
    Route::delete('/task/{id}', [TaskPlaylistVideoController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| Tasks, Evaluations, Emails, etc.
|--------------------------------------------------------------------------
*/
Route::get('/tasks/{playlistId}', [TaskController::class, 'getTasks']);
Route::post('/evaluate-code', [TaskController::class, 'evaluateCode']);
Route::post('/send-verification-code', [EmailVerificationController::class, 'sendVerificationCode']);
Route::post('/verify-code', [EmailVerificationController::class, 'verifyCode']);

/*
|--------------------------------------------------------------------------
| Return all course progress for the authenticated user
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->get('/user-progress/all', [UserProgressController::class, 'getAllCourseProgress'])
    ->name('user-progress.getAll');

/*
|--------------------------------------------------------------------------
| Fallback
|--------------------------------------------------------------------------
*/
Route::fallback(function () {
    return response()->json(['error' => 'API endpoint not found'], 404);
});
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/user-progress/update', [UserProgressController::class, 'updateProgress']);
});

Route::get('/edubot', [EduBotController::class, 'index']);
Route::post('/edubot', [EduBotController::class, 'store']);
Route::get('/edubot/{id}', [EduBotController::class, 'show']);
Route::put('/edubot/{id}', [EduBotController::class, 'update']);
Route::delete('/edubot/{id}', [EduBotController::class, 'destroy']);

// Public GET route for courses
Route::get('/courses', [CourseController::class, 'index']);
