<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskPlaylistVideoController extends Controller
{
    public function show($id)
    {
        $task = Task::findOrFail($id);
        return response()->json($task);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'playlist_id' => 'required|integer',
            'video_id' => 'required|integer',
            'timestamp' => 'nullable|string',
            'title' => 'required|string|max:255',
            'prompt' => 'nullable|string',
            'expected_output' => 'nullable|string',
            'syntax_hint' => 'nullable|string',
            'type' => 'nullable|string',
            'options' => 'nullable|json',
        ]);

        $task = Task::create($validated);

        return response()->json($task, 201);
    }

    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);
        $validated = $request->validate([
            'playlist_id' => 'sometimes|integer',
            'video_id' => 'sometimes|integer',
            'timestamp' => 'nullable|string',
            'title' => 'sometimes|string|max:255',
            'prompt' => 'nullable|string',
            'expected_output' => 'nullable|string',
            'syntax_hint' => 'nullable|string',
            'type' => 'nullable|string',
            'options' => 'nullable|json',
        ]);

        $task->update($validated);

        return response()->json($task);
    }

    public function destroy($id)
    {
        $task = Task::findOrFail($id);
        $task->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}
