<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserProgress;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class UserProgressController extends Controller
{
    /**
     * Save or update user progress.
     */
    public function saveProgress(Request $request)
{
    Log::info('Save Progress Request Received:', $request->all());

    $validated = $request->validate([
        'video_id' => 'required|string',
        'last_timestamp' => 'required|string',
        'playlist_id' => 'required|integer',
    ]);

    $userId = Auth::id();
    if (!$userId) {
        Log::warning('User not authenticated.');
        return response()->json(['message' => 'User not authenticated'], 401);
    }

    try {
        $progress = UserProgress::updateOrCreate(
            [
                'user_id' => $userId,
                'video_id' => $validated['video_id'],
            ],
            [
                'last_timestamp' => $validated['last_timestamp'],
                'playlist_id' => $validated['playlist_id'],
            ]
        );

        Log::info('Progress Saved Successfully:', ['progress' => $progress]);
        return response()->json(['message' => 'Progress saved', 'progress' => $progress], 200);
    } catch (\Exception $e) {
        Log::error('Error Saving Progress:', ['error' => $e->getMessage()]);
        return response()->json(['message' => 'Error saving progress'], 500);
    }
}


    /**
     * Get user progress.
     */
    public function getProgress(Request $request)
{
    $validated = $request->validate([
        'video_id' => 'required|string',
    ]);

    $userId = Auth::id();
    if (!$userId) {
        return response()->json(['message' => 'User not authenticated'], 401);
    }

    $progress = UserProgress::where('user_id', $userId)
        ->where('video_id', $validated['video_id'])
        ->first();

    if (!$progress) {
        Log::info('No progress found. Returning default values.', [
            'user_id' => $userId,
            'video_id' => $validated['video_id']
        ]);

        return response()->json([
            'id' => null,
            'user_id' => $userId,
            'video_id' => $validated['video_id'],
            'last_timestamp' => '00:00:00', // Always return a valid timestamp
            'playlist_id' => null,
            'completed_tasks' => [],
        ], 200);
    }

    return response()->json([
        'id' => $progress->id,
        'user_id' => $progress->user_id,
        'video_id' => $progress->video_id,
        'last_timestamp' => $progress->last_timestamp ?? '00:00:00', // Fallback to default if null
        'playlist_id' => $progress->playlist_id,
        'completed_tasks' => $progress->completed_tasks ?? [],
    ], 200);
}


    /**
     * Mark a task as completed.
     */
    public function completeTask(Request $request)
{
    Log::info('Complete Task Request:', $request->all());

    $validated = $request->validate([
        'task_id' => 'required|integer',
        'video_id' => 'required|string', // Ensure video_id is validated
    ]);

    $userId = Auth::id();
    if (!$userId) {
        Log::warning('Unauthenticated user attempted to mark a task as completed.');
        return response()->json(['message' => 'User not authenticated'], 401);
    }

    try {
        $progress = UserProgress::where('user_id', $userId)
            ->where('video_id', $validated['video_id'])
            ->first();

        if (!$progress) {
            Log::info('No progress found for user.', [
                'user_id' => $userId,
                'video_id' => $validated['video_id']
            ]);
            return response()->json(['message' => 'No progress found'], 404);
        }

        $completedTasks = $progress->completed_tasks ?: [];
        if (!in_array($validated['task_id'], $completedTasks)) {
            $completedTasks[] = $validated['task_id'];
        }

        $progress->update(['completed_tasks' => $completedTasks]);

        Log::info('Task marked as completed successfully:', [
            'task_id' => $validated['task_id'],
            'completed_tasks' => $completedTasks,
        ]);

        return response()->json([
            'message' => 'Task marked as completed',
            'completed_tasks' => $completedTasks,
        ], 200);
    } catch (\Exception $e) {
        Log::error('Error marking task as completed:', ['error' => $e->getMessage()]);
        return response()->json(['message' => 'Error marking task as completed'], 500);
    }
}

}
