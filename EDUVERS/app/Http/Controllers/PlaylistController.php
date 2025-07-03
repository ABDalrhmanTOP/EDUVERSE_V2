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
        // If the course is paid, check for active subscription
        if ($playlist->paid) {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'error' => 'You must be logged in and subscribed to access this course.'
                ], 403);
            }
            $hasActive = \App\Models\Subscription::where('user_id', $user->id)
                ->where('playlist_id', $id)
                ->where('status', 'active')
                ->exists();
            if (!$hasActive) {
                return response()->json([
                    'error' => 'You need to subscribe to access this course.'
                ], 403);
            }
        }
        return response()->json($playlist);
    }
}
