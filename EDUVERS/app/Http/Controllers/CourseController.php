<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Playlist;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    // Fetch all courses
    public function index()
    {
        // If you don't need to eager load ratings, simply use:
        $playlists = Playlist::all();
        return response()->json($playlists);
    }

    // Add new course
    public function store(Request $request)
    {
        $validated = $request->validate([
            'video_id' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $playlist = Playlist::create($validated);
        return response()->json($playlist, 201);
    }

    public function update(Request $request, $id)
    {
        $playlist = Playlist::findOrFail($id);
        $validated = $request->validate([
            'video_id' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $playlist->update($validated);
        return response()->json($playlist);
    }

    public function destroy($id)
    {
        $playlist = Playlist::findOrFail($id);
        $playlist->delete();
        return response()->json(['message' => 'Course deleted successfully']);
    }
}
