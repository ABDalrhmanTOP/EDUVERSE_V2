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
            'video_id'       => 'required|string',
            'last_timestamp' => 'required|string',
            'playlist_id'    => 'required|integer',
        ]);

        $userId = Auth::id();
        if (!$userId) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not authenticated',
            ], 401);
        }

        try {
            $progress = UserProgress::updateOrCreate(
                [
                    'user_id'     => $userId,
                    'video_id'    => $validated['video_id'],
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
                'status'  => 'success',
                'message' => 'Progress saved',
                'data'    => $progress
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
     * Get user progress for specific video and playlist.
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
            return response()->json([
                'status'  => 'success',
                'message' => 'No progress found',
                'data'    => [
                    'id'              => null,
                    'user_id'         => $userId,
                    'video_id'        => $validated['video_id'],
                    'playlist_id'     => $validated['playlist_id'],
                    'last_timestamp'  => '00:00:00',
                    'completed_tasks' => [],
                ]
            ], 200);
        }

        if (!is_array($progress->completed_tasks)) {
            $progress->completed_tasks = [];
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Progress retrieved',
            'data'    => $progress,
        ], 200);
    }

    /**
     * Mark a task as completed.
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
            $progress = UserProgress::firstOrNew([
                'user_id'     => $userId,
                'video_id'    => $validated['video_id'],
                'playlist_id' => $validated['playlist_id'],
            ]);

            if (!$progress->exists) {
                $progress->last_timestamp = "00:00:00";
                $progress->completed_tasks = [];
            }

            $completedTasks = is_array($progress->completed_tasks) ? $progress->completed_tasks : [];
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
                'status'  => 'success',
                'message' => 'Task marked as completed',
                'data'    => $progress,
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

    /**
     * Get course progress for a user.
     */
    public function getCourseProgress(Request $request, $userId)
    {
        // Ensure the authenticated user is the same as $userId (or allow admin rights)
        if (Auth::id() != $userId) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Forbidden'
            ], 403);
        }

        // Retrieve the user progress record along with the related playlist
        $progress = UserProgress::with('playlist')->where('user_id', $userId)->first();

        if (!$progress) {
            // Return default values if no progress is found
            return response()->json([
                'course_title' => null,
                'progress_percentage' => 0,
                'completed_lessons' => 0,
                'total_lessons' => 0,
                'certificates_earned' => 0,
            ], 200);
        }

        // Retrieve the related playlist
        $playlist = $progress->playlist;

        // Merge playlist name and description using a hyphen.
        // If no playlist is associated, fall back to a default title.
        $courseTitle = $playlist
            ? $playlist->name . " - " . $playlist->description
            : "Unknown Course";

        // Assume the playlist has a total_lessons field; otherwise, use a default value.
        $totalLessons = $playlist && $playlist->total_lessons
            ? $playlist->total_lessons
            : 10;

        // Count the completed lessons from the completed_tasks array.
        $completedLessons = count($progress->completed_tasks);

        // Calculate progress percentage (cap at 100).
        $progressPercentage = $totalLessons > 0
            ? min(100, ($completedLessons / $totalLessons) * 100)
            : 0;

        // Award a certificate if progress is 100%.
        $certificatesEarned = ($progressPercentage === 100) ? 1 : 0;

        return response()->json([
            'course_title' => $courseTitle,
            'progress_percentage' => $progressPercentage,
            'completed_lessons' => $completedLessons,
            'total_lessons' => $totalLessons,
            'certificates_earned' => $certificatesEarned,
        ], 200);
    }
}
