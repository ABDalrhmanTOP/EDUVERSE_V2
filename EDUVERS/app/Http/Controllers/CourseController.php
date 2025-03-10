<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Playlist;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    // جلب جميع الكورسات
    public function index()
    {
        $Playlists = playlist::all();
        return response()->json($Playlists);
    }

    // إضافة كورس جديد
    public function store(Request $request)
    {
        $validated = $request->validate([
            'video_id' =>'required|string|max:255',
            'name'       => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $Playlist = Playlist::create($validated);
        return response()->json($Playlist, 201);
    }


    public function update(Request $request, $id)
    {
        $Playlist = Playlist::findOrFail($id);
        $validated = $request->validate([
            'video_id' =>'required|string|max:255',
            'name'       => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $Playlist->update($validated);
        return response()->json($Playlist);
    }

    public function destroy($id)
    {
        $Playlist = Playlist::findOrFail($id);
        $Playlist->delete();
        return response()->json(['message' => 'Course deleted successfully']);
    }
}


