<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\UserProgress;
use App\Models\Task;

class UserProgressController extends Controller
{
    
    // UserProgressController.php
    public function saveProgress(Request $request)
    {
        $request->validate([
            'video_id' => 'required|string',
            'last_timestamp' => 'required|integer',
        ]);
    
        $user = Auth::user();
    
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
    
        // Convert seconds to hh:mm:ss format
        $hours = floor($request->last_timestamp / 3600);
        $minutes = floor(($request->last_timestamp % 3600) / 60);
        $seconds = $request->last_timestamp % 60;
        $formattedTimestamp = sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);
    
        UserProgress::updateOrCreate(
            ['user_id' => $user->id, 'video_id' => $request->video_id],
            ['last_timestamp' => $formattedTimestamp]
        );
    
        return response()->json(['message' => 'Progress saved successfully']);
    }
    

public function getProgress(Request $request)
{
    $request->validate(['video_id' => 'required|string']);
    $user = Auth::user();
    $progress = UserProgress::where('user_id', $user->id)
        ->where('video_id', $request->video_id)
        ->first();

    return response()->json([
        'last_timestamp' => $progress->last_timestamp ?? 0,
        'completed_tasks' => $progress->completed_tasks ?? [],
    ]);
}

    public function completeTask(Request $request)
    {
        $request->validate([
            'task_id' => 'required|integer',
        ]);

        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        $taskId = $request->task_id;

        $progress = UserProgress::where('user_id', $user->id)
            ->firstOrFail();

        $completedTasks = $progress->completed_tasks ?? [];

        if (!in_array($taskId, $completedTasks)) {
            $completedTasks[] = $taskId;
            $progress->update(['completed_tasks' => $completedTasks]);
        }

        return response()->json([
            'message' => 'Task marked as completed',
            'completed_tasks' => $completedTasks,
        ]);
    }
}
