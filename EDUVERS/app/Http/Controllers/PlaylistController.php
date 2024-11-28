<?php
namespace App\Http\Controllers;

use App\Models\Playlist;
use Illuminate\Http\Request;

class PlaylistController extends Controller
{
    public function show($id)
    {
        $playlist = Playlist::find($id);
        if (!$playlist) {
            return response()->json(['message' => 'Playlist not found'], 404);
        }
        return response()->json($playlist);
    }
}
