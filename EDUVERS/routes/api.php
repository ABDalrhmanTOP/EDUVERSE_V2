<?php

use Illuminate\Support\Facades\Route;
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
use App\Http\Controllers\FinalTestSubmissionController;
use App\Http\Controllers\TaskPlaylistVideoController;
use App\Http\Controllers\EduBotController;
use App\Http\Controllers\PlacementTestController;
use App\Http\Controllers\NotificationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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

// Public routes for final tests
Route::get('/final-tests/check/{courseId}', [FinalTestSubmissionController::class, 'checkFinalTest']);
Route::get('/final-tests/{courseId}/data', [FinalTestSubmissionController::class, 'getFinalTestData']);

// YouTube video duration route (public, no auth required)
Route::get('/youtube/video-duration/{videoId}', [CourseController::class, 'getVideoDuration']);
Route::get('/youtube/test/{videoId}', [CourseController::class, 'testVideoDuration']);

// Test route for debugging
Route::get('/test-admin', function () {
    return response()->json(['message' => 'Admin route test successful']);
});

/*
|--------------------------------------------------------------------------
| Protected Routes (Sanctum Auth)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // User progress
    Route::post('/user-progress', [UserProgressController::class, 'saveProgress']);
    Route::get('/user-progress', [UserProgressController::class, 'getProgress']);
    Route::post('/user-progress/tasks', [UserProgressController::class, 'completeTask']);
    Route::get('/user-progress/tasks', [UserProgressController::class, 'getCompletedTasks']);
    Route::post('/user-progress/completeUpToTimestamp', [UserProgressController::class, 'completeUpToTimestamp']);
    Route::get('/user-progress/course-progress/{userId}', [UserProgressController::class, 'getCourseProgress']);
    Route::post('/user-progress/update', [UserProgressController::class, 'updateProgress']);

    // Profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/picture', [ProfileController::class, 'updatePicture']);
    Route::delete('/profile/picture', [ProfileController::class, 'removePicture']);
    Route::post('/profile/general-form', [ProfileController::class, 'saveGeneralForm']);

    // Test & Course
    Route::get('/showTest/{levelId}', [TestController::class, 'showTest']);
    Route::post('/submitTest/{levelId}', [TestController::class, 'submitTest']);
    Route::get('/checkTestTaken', [ResultTest::class, 'checkTestTaken']);
    Route::post('/submitTest/{level}', [ResultTest::class, 'submitTest']);

    // Final Project & Feedback
    Route::post('/final-project', [FinalProjectController::class, 'submitFinalProject']);
    Route::post('/user-feedback', [UserRatingController::class, 'store']);

    // Final Test Submission
    Route::post('/final-test/submit', [FinalTestSubmissionController::class, 'submitFinalTest']);

    // Placement Test
    Route::post('/placement-test/check-completion', [PlacementTestController::class, 'checkCompletion']);
    Route::post('/placement-test/start', [PlacementTestController::class, 'start']);
    Route::post('/placement-test/submit', [PlacementTestController::class, 'submit']);

    // Course routes
    Route::get('/courses', [CourseController::class, 'index']);
    Route::get('/courses/{id}', [CourseController::class, 'show']);

    // Playlist routes
    Route::get('/playlists/{id}/videos', [PlaylistController::class, 'getVideos']);

    // Task routes
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::get('/tasks/{id}', [TaskController::class, 'show']);
    Route::post('/tasks/{id}/submit', [TaskController::class, 'submit']);

    // User rating routes
    Route::get('/user-ratings', [UserRatingController::class, 'index']);
    Route::post('/user-ratings', [UserRatingController::class, 'store']);
    Route::put('/user-ratings/{id}', [UserRatingController::class, 'update']);

    // Final project routes
    Route::get('/final-projects', [FinalProjectController::class, 'index']);
    Route::post('/final-projects', [FinalProjectController::class, 'store']);
    Route::get('/final-projects/{id}', [FinalProjectController::class, 'show']);

    // EduBot routes
    Route::post('/edubot/chat', [EduBotController::class, 'chat']);
    Route::get('/edubot/history', [EduBotController::class, 'getHistory']);

    // Notification routes
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::patch('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::delete('/notifications', [NotificationController::class, 'deleteAll']);
    Route::get('/notifications/settings', [NotificationController::class, 'settings']);
    Route::put('/notifications/settings', [NotificationController::class, 'updateSettings']);

    // Return all course progress for the authenticated user
    Route::get('/user-progress/all', [UserProgressController::class, 'getAllCourseProgress']);
});

Route::middleware('auth:sanctum')->post('/update-user-profile-for-test', [UserController::class, 'updateProfileForTest']);

/*
|--------------------------------------------------------------------------
| Admin Routes (Protected with Admin Middleware)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', \App\Http\Middleware\AdminMiddleware::class])->group(function () {
    // Admin User Management
    Route::get('/admin/users', [UserController::class, 'index']);
    Route::get('/admin/users/{id}', [UserController::class, 'show']);
    Route::post('/admin/users', [UserController::class, 'store']);
    Route::put('/admin/users/{id}', [UserController::class, 'update']);
    Route::delete('/admin/users/{id}', [UserController::class, 'destroy']);
    Route::post('/admin/users/{id}/profile-picture', [UserController::class, 'uploadProfilePicture']);

    // Admin Course Management
    Route::get('/admin/courses', [CourseController::class, 'adminIndex']);
    Route::post('/admin/courses', [CourseController::class, 'store']);
    Route::put('/admin/courses/{id}', [CourseController::class, 'update']);
    Route::delete('/admin/courses/{id}', [CourseController::class, 'destroy']);

    // Admin Playlist Management
    Route::get('/admin/playlists', [PlaylistController::class, 'adminIndex']);
    Route::post('/admin/playlists', [PlaylistController::class, 'store']);
    Route::put('/admin/playlists/{id}', [PlaylistController::class, 'update']);
    Route::delete('/admin/playlists/{id}', [PlaylistController::class, 'destroy']);

    // Admin Task Management
    Route::get('/admin/tasks', [TaskController::class, 'adminIndex']);
    Route::post('/admin/tasks', [TaskController::class, 'store']);
    Route::put('/admin/tasks/{id}', [TaskController::class, 'update']);
    Route::delete('/admin/tasks/{id}', [TaskController::class, 'destroy']);

    // User Progress Management
    Route::get('/admin/user-progress/user/{user_id}', [UserDetailController::class, 'getAllByUserId']);

    // Task management routes
    Route::get('/admin/task/{id}', [TaskPlaylistVideoController::class, 'show']);
    Route::post('/admin/task', [TaskPlaylistVideoController::class, 'store']);
    Route::put('/admin/task/{id}', [TaskPlaylistVideoController::class, 'update']);
    Route::delete('/admin/task/{id}', [TaskPlaylistVideoController::class, 'destroy']);

    // Admin Notification routes
    Route::get('/admin/notifications', [NotificationController::class, 'adminIndex']);

    // Placement & Final Test Management
    Route::apiResource('/admin/placement-tests', App\Http\Controllers\Admin\PlacementTestController::class);
    Route::apiResource('/admin/placement-test-questions', App\Http\Controllers\Admin\PlacementTestQuestionController::class);
    Route::apiResource('/admin/final-tests', App\Http\Controllers\Admin\FinalTestController::class);
    Route::apiResource('/admin/final-test-questions', App\Http\Controllers\Admin\FinalTestQuestionController::class);
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
| Fallback
|--------------------------------------------------------------------------
*/
Route::fallback(function () {
    return response()->json(['error' => 'API endpoint not found'], 404);
});
