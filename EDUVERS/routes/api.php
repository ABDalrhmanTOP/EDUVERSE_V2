<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserProgressController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\PlaylistController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

// Public Routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected Routes (Authentication Required)
Route::middleware('auth:sanctum')->group(function () {
    // Authentication
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // User Progress
    Route::post('/user-progress', [UserProgressController::class, 'saveProgress'])->name('user-progress.save');
    Route::get('/user-progress', [UserProgressController::class, 'getProgress'])->name('user-progress.get');
    Route::post('/user-progress/tasks', [UserProgressController::class, 'completeTask'])->name('user-progress.completeTask');

    // Task Code Evaluation
});
Route::post('/evaluate-code', [TaskController::class, 'evaluateCode']);

// Unprotected Routes
Route::get('/tasks/{playlistId}', [TaskController::class, 'getTasks']);
Route::get('/playlists/{id}', [PlaylistController::class, 'show']);

// Debugging Route (Only for local/testing environments)
if (app()->environment('local', 'testing')) {
    Route::post('/test', function (Request $request) {
        return response()->json(['message' => 'It works!', 'data' => $request->all()]);
    });
}

// Fallback Route for Undefined Endpoints
Route::fallback(function () {
    Log::warning('API Route not found', ['url' => request()->url()]);
    return response()->json(['message' => 'API Route not found.'], 404);
});
