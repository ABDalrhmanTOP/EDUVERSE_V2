<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserProgressController;
use App\Http\Controllers\TaskController;
use Illuminate\Http\Request;

// Authentication Routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');

// Task Routes
Route::get('/tasks/{playlistId}', [TaskController::class, 'getTasks']);

// Routes Protected by Sanctum
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // User Progress Routes
    Route::post('/user-progress', [UserProgressController::class, 'saveProgress']);
    Route::get('/user-progress', [UserProgressController::class, 'getProgress']);
    Route::post('/user-progress/tasks', [UserProgressController::class, 'completeTask']);
});

// Debugging Route (Optional)
Route::post('/test', function (Request $request) {
    return response()->json(['message' => 'It works!', 'data' => $request->all()]);
});
