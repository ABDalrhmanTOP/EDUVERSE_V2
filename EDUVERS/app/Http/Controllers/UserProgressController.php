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
        try {
            $request->validate([
                'video_id' => 'required|string',
                'playlist_id' => 'required|integer',
                'last_timestamp' => 'required|string',
            ]);

            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $videoId = $request->input('video_id');
            $playlistId = $request->input('playlist_id');
            $lastTimestamp = $request->input('last_timestamp');

            // Find existing progress or create new
            $progress = UserProgress::where('user_id', $user->id)
                ->where('playlist_id', $playlistId)
                ->first();

            if ($progress) {
                $progress->update([
                    'last_timestamp' => $lastTimestamp,
                    'updated_at' => now(),
                ]);
            } else {
                UserProgress::create([
                    'user_id' => $user->id,
                    'playlist_id' => $playlistId,
                    'video_id' => $videoId,
                    'last_timestamp' => $lastTimestamp,
                ]);
            }

            return response()->json(['message' => 'Progress saved successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to save progress'], 500);
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
        try {
            $request->validate([
                'task_id' => 'required|integer',
                'playlist_id' => 'required|integer',
                'video_id' => 'required|string',
            ]);

            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $taskId = $request->input('task_id');
            $playlistId = $request->input('playlist_id');
            $videoId = $request->input('video_id');

            // Find or create progress record
            $progress = UserProgress::where('user_id', $user->id)
                ->where('playlist_id', $playlistId)
                ->first();

            if (!$progress) {
                $progress = UserProgress::create([
                    'user_id' => $user->id,
                    'playlist_id' => $playlistId,
                    'video_id' => $videoId,
                    'last_timestamp' => '00:00:00',
                    'completed_tasks' => [],
                ]);
            } else {
                // Update video_id if it's empty or different
                if (empty($progress->video_id) || $progress->video_id !== $videoId) {
                    $progress->update(['video_id' => $videoId]);
                }
            }

            // Ensure completed_tasks is an array
            $completedTasks = is_array($progress->completed_tasks) ? $progress->completed_tasks : [];

            // Add task to completed list if not already there
            if (!in_array($taskId, $completedTasks)) {
                $completedTasks[] = $taskId;
                $progress->update(['completed_tasks' => $completedTasks]);
            }

            return response()->json(['message' => 'Task marked as completed']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to complete task'], 500);
        }
    }

    /**
     * Mark tasks up to a given timestamp as completed for the current user.
     */
    public function completeUpToTimestamp(Request $request)
    {
        try {
            $request->validate([
                'timestamp' => 'required|string',
                'playlist_id' => 'required|integer',
            ]);

            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $timestamp = $request->input('timestamp');
            $playlistId = $request->input('playlist_id');

            // Find or create progress record
            $progress = UserProgress::where('user_id', $user->id)
                ->where('playlist_id', $playlistId)
                ->first();

            if (!$progress) {
                $progress = UserProgress::create([
                    'user_id' => $user->id,
                    'playlist_id' => $playlistId,
                    'video_id' => '',
                    'last_timestamp' => $timestamp,
                    'completed_tasks' => [],
                ]);
            } else {
                $progress->update(['last_timestamp' => $timestamp]);
            }

            return response()->json(['message' => 'Progress updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update progress'], 500);
        }
    }

    /**
     * Get completed tasks for a specific playlist and video.
     */
    public function getCompletedTasks(Request $request)
    {
        try {
            $request->validate([
                'playlist_id' => 'required|integer',
                'video_id' => 'required|string',
            ]);

            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $playlistId = $request->input('playlist_id');
            $videoId = $request->input('video_id');

            // Find progress record
            $progress = UserProgress::where('user_id', $user->id)
                ->where('playlist_id', $playlistId)
                ->where('video_id', $videoId)
                ->first();

            if (!$progress) {
                return response()->json([
                    'status' => 'success',
                    'completed_tasks' => []
                ]);
            }

            // Ensure completed_tasks is an array
            $completedTasks = is_array($progress->completed_tasks) ? $progress->completed_tasks : [];

            return response()->json([
                'status' => 'success',
                'completed_tasks' => $completedTasks
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to get completed tasks'], 500);
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

    /**
     * Store user answer and check correctness for MCQ and True/False tasks.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'task_id' => 'required|integer',
            'answer' => 'required',
            'playlist_id' => 'required|integer',
        ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $task = Task::find($validated['task_id']);
        if (!$task) {
            return response()->json(['error' => 'Task not found'], 404);
        }

        $userAnswer = trim(strtolower($validated['answer']));
        $correct = false;
        $message = '';

        if ($task->type === 'mcq') {
            // For MCQ, expected_output contains the correct option key (like "A", "B", etc.)
            $expected = trim(strtolower($task->expected_output));
            $correct = ($userAnswer === $expected);
        } elseif ($task->type === 'truefalse') {
            // For True/False, expected_output contains the correct answer ("true" or "false")
            $expected = trim(strtolower($task->expected_output));
            $correct = ($userAnswer === $expected);
        } else {
            // For other types, just return not supported
            return response()->json(['error' => 'Task type not supported for answer checking'], 400);
        }

        if ($correct) {
            // Mark task as completed for user
            $progress = UserProgress::where('user_id', $user->id)
                ->where('playlist_id', $validated['playlist_id'])
                ->first();
            if (!$progress) {
                $progress = UserProgress::create([
                    'user_id' => $user->id,
                    'playlist_id' => $validated['playlist_id'],
                    'video_id' => '',
                    'last_timestamp' => '00:00:00',
                    'completed_tasks' => [$task->id],
                ]);
            } else {
                $completed = is_array($progress->completed_tasks) ? $progress->completed_tasks : [];
                if (!in_array($task->id, $completed)) {
                    $completed[] = $task->id;
                    $progress->update(['completed_tasks' => $completed]);
                }
            }
            $message = 'Correct answer!';
        } else {
            $message = 'Incorrect answer.';
        }

        return response()->json([
            'correct' => $correct,
            'message' => $message
        ]);
    }

    /**
     * Get all course progress for the authenticated user.
     */
    public function getAllCourseProgress()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $progress = UserProgress::with('playlist')
                ->where('user_id', $user->id)
                ->get();

            return response()->json($progress);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to get course progress'], 500);
        }
    }
}
