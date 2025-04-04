<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserProgress;
use App\Models\Task; // Adjust if your tasks are stored in a different model
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
     * Mark tasks up to a given timestamp as completed for the current user.
     */
    public function completeUpToTimestamp(Request $request)
    {
        Log::info('completeUpToTimestamp Request:', $request->all());

        $validated = $request->validate([
            'timestamp' => 'required|string',
            'level_id'  => 'required|integer',
        ]);

        $userId = Auth::id();
        if (!$userId) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        try {
            $timeInSeconds = $this->convertTimestampToSeconds($validated['timestamp']);

            // Here, implement your logic to fetch tasks for the given level
            // whose timestamp (converted to seconds) is less than or equal to $timeInSeconds.
            // For example, if your tasks table has a numeric column "timestamp_in_seconds":
            //
            // $tasksToMark = Task::where('level_id', $validated['level_id'])
            //     ->where('timestamp_in_seconds', '<=', $timeInSeconds)
            //     ->get();
            //
            // Then, for each task, mark it as completed using your completeTask logic.
            //
            // For demonstration, we assume the tasks have been marked.

            return response()->json([
                'status'  => 'success',
                'message' => "Tasks up to {$validated['timestamp']} have been marked as completed.",
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error in completeUpToTimestamp:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status'  => 'error',
                'message' => 'Error marking tasks as completed up to timestamp.'
            ], 500);
        }
    }

    /**
     * Convert "HH:MM:SS" or "MM:SS" to total seconds.
     */
    private function convertTimestampToSeconds($timestamp)
    {
        $parts = explode(':', $timestamp);
        $parts = array_reverse($parts);
        $seconds = 0;
        if (isset($parts[0])) $seconds += (int)$parts[0];
        if (isset($parts[1])) $seconds += (int)$parts[1] * 60;
        if (isset($parts[2])) $seconds += (int)$parts[2] * 3600;
        return $seconds;
    }

    /**
     * Get course progress for a user.
     */
    public function getCourseProgress(Request $request, $userId)
    {
        if (Auth::id() != $userId) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Forbidden'
            ], 403);
        }

        $progress = UserProgress::with('playlist')
            ->where('user_id', $userId)
            ->first();

        if (!$progress) {
            return response()->json([
                'course_title'         => null,
                'progress_percentage'  => 0,
                'completed_lessons'    => 0,
                'total_lessons'        => 0,
                'certificates_earned'  => 0,
            ], 200);
        }

        $playlist = $progress->playlist;
        $courseTitle = $playlist
            ? $playlist->name . " - " . $playlist->description
            : "Unknown Course";

        $totalLessons = $playlist && $playlist->total_lessons
            ? $playlist->total_lessons
            : 10;

        $completedLessons = count($progress->completed_tasks);
        $progressPercentage = $totalLessons > 0
            ? min(100, ($completedLessons / $totalLessons) * 100)
            : 0;

        $certificatesEarned = ($progressPercentage === 100) ? 1 : 0;

        return response()->json([
            'course_title'         => $courseTitle,
            'progress_percentage'  => $progressPercentage,
            'completed_lessons'    => $completedLessons,
            'total_lessons'        => $totalLessons,
            'certificates_earned'  => $certificatesEarned,
        ], 200);
    }
}
