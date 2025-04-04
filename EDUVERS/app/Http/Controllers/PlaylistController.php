<?php

namespace App\Http\Controllers;

use App\Models\Playlist;
use Illuminate\Http\Request;

class PlaylistController extends Controller
{
    /**
     * Return all playlists.
     */
    public function index()
    {
        // Adjust how you fetch them if needed (e.g., paginate, filter).
        $playlists = Playlist::all();
        return response()->json($playlists, 200);
    }

    /**
     * Show a single playlist by ID.
     */
    public function show($id)
    {
        $playlist = Playlist::find($id);
        if (!$playlist) {
            return response()->json(['message' => 'Playlist not found'], 404);
        }
        return response()->json($playlist);
    }
}
