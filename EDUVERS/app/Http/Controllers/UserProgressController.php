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
            'video_id'      => 'required|string',
            'last_timestamp' => 'required|string',
            'playlist_id'   => 'required|integer',
        ]);

        $userId = Auth::id();
        if (!$userId) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not authenticated',
            ], 401);
        }

        try {
            // Always match on user_id, video_id, playlist_id
            $progress = UserProgress::updateOrCreate(
                [
                    'user_id'    => $userId,
                    'video_id'   => $validated['video_id'],
                    'playlist_id' => $validated['playlist_id'],
                ],
                [
                    'last_timestamp' => $validated['last_timestamp'],
                ]
            );

            // Ensure completed_tasks is an array
            if (!is_array($progress->completed_tasks)) {
                $progress->completed_tasks = [];
                $progress->save();
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Progress saved',
                'data'   => $progress
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error Saving Progress:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status'  => 'error',
                'message' => 'Error saving progress'
            ], 500);
        }
    }

    /**
     * Get user progress.
     */
    public function getProgress(Request $request)
    {
        $validated = $request->validate([
            'video_id'    => 'required|string',
            'playlist_id' => 'required|integer',
        ]);

        $userId = Auth::id();
        if (!$userId) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        $progress = UserProgress::where('user_id', $userId)
            ->where('video_id', $validated['video_id'])
            ->where('playlist_id', $validated['playlist_id'])
            ->first();

        if (!$progress) {
            // Return a helpful "no progress" structure
            return response()->json([
                'status' => 'success',
                'message' => 'No progress found',
                'data'   => [
                    'id'             => null,
                    'user_id'        => $userId,
                    'video_id'       => $validated['video_id'],
                    'playlist_id'    => $validated['playlist_id'],
                    'last_timestamp' => '00:00:00',
                    'completed_tasks' => [],
                ]
            ], 200);
        }

        // Ensure completed_tasks is an array
        if (!is_array($progress->completed_tasks)) {
            $progress->completed_tasks = [];
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Progress retrieved',
            'data'   => $progress,
        ], 200);
    }

    /**
     * Mark a task as completed (auto-create if missing).
     */
    public function completeTask(Request $request)
    {
        Log::info('Complete Task Request:', $request->all());

        $validated = $request->validate([
            'video_id'    => 'required|string',
            'playlist_id' => 'required|integer',
            'task_id'     => 'required|string',
        ]);

        $userId = Auth::id();
        if (!$userId) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        try {
            // Instead of just "where(...)->first()", we do "firstOrNew()"
            $progress = UserProgress::firstOrNew([
                'user_id'    => $userId,
                'video_id'   => $validated['video_id'],
                'playlist_id' => $validated['playlist_id'],
            ]);

            // If it's a new row, set defaults
            if (!$progress->exists) {
                $progress->last_timestamp = "00:00:00";
                $progress->completed_tasks = [];
            }

            // Ensure completed_tasks is an array
            $completedTasks = is_array($progress->completed_tasks)
                ? $progress->completed_tasks
                : [];

            if (!in_array($validated['task_id'], $completedTasks)) {
                $completedTasks[] = $validated['task_id'];
            }

            $progress->completed_tasks = $completedTasks;
            $progress->save();

            Log::info('Task marked as completed successfully:', [
                'task_id'         => $validated['task_id'],
                'completed_tasks' => $completedTasks,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Task marked as completed',
                'data'   => $progress,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error marking task as completed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status'  => 'error',
                'message' => 'Error marking task as completed'
            ], 500);
        }
    }
}
