<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserProgressController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TestController;
use App\Http\Controllers\ResultTest;
use App\Http\Controllers\PlaylistController;
use Illuminate\Http\Request;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\EmailVerificationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\UserDetailController;

// Authentication Routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');

// Task Routes (Public)
Route::get('/tasks/{playlistId}', [TaskController::class, 'getTasks']);

// Playlist Route (Public)
Route::get('/playlists/{id}', [PlaylistController::class, 'show']);

// Routes Protected by Sanctum
Route::middleware('auth:sanctum')->group(function () {
    // User Progress Routes
    Route::post('/user-progress', [UserProgressController::class, 'saveProgress'])->name('user-progress.save');
    Route::get('/user-progress', [UserProgressController::class, 'getProgress'])->name('user-progress.get');
    Route::post('/user-progress/tasks', [UserProgressController::class, 'completeTask'])->name('user-progress.completeTask');
});

// Debugging Route (Optional)
Route::post('/test', function (Request $request) {
    return response()->json(['message' => 'It works!', 'data' => $request->all()]);
});



// test lavel
Route::middleware('auth:sanctum')->get('/showTest/{levelId}', [TestController::class, 'showTest']);
Route::middleware('auth:sanctum')->post('/submitTest/{levelId}', [TestController::class, 'submitTest']);
Route::middleware('auth:sanctum')->get('/checkTestTaken', [ResultTest::class, 'checkTestTaken']);
Route::post('/submitTest/{level}', [ResultTest::class, 'submitTest']);

// You likely have routes wrapped in a middleware like 'auth:sanctum' or 'auth:api'
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
});



Route::post('/send-verification-code', [EmailVerificationController::class, 'sendVerificationCode']);
Route::post('/verify-code', [EmailVerificationController::class, 'verifyCode']);

Route::middleware(['auth:sanctum', \App\Http\Middleware\AdminMiddleware::class])->group(function () {
    // تعريف المسارات هنا

//Route::middleware('auth:api')->group(function() {
    // إدارة المستخدمين
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::get('/user-progress/user/{user_id}', [UserDetailController::class, 'getAllByUserId']);
    //  إدارة الكورسات
    Route::get('/courses', [CourseController::class, 'index']);
    Route::post('/courses', [CourseController::class, 'store']);
    Route::put('/courses/{id}', [CourseController::class, 'update']);
    Route::delete('/courses/{id}', [CourseController::class, 'destroy']);
});
