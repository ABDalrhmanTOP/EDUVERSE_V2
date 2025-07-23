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
        $playlists = Playlist::with('tasks')->get();
        return response()->json($playlists);
    }

    public function adminIndex()
    {
        $playlists = Playlist::with('tasks')->get();
        return response()->json($playlists);
    }

    /**
     * Show a single playlist by ID.
     */
    public function show($id, Request $request)
    {
        $playlist = Playlist::find($id);
        if (!$playlist) {
            return response()->json(['message' => 'Playlist not found'], 404);
        }
        return response()->json($playlist);
    }
}
