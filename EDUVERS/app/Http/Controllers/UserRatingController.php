<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserRating;
use App\Models\UserProgress;
use Illuminate\Support\Facades\Auth;

class UserRatingController extends Controller
{
    public function store(Request $request)
    {
        // Validate request input: now we expect a user_progress_id instead of user_id/playlist_id.
        $validated = $request->validate([
            'rating'           => 'required|integer|min:1|max:5',
            'user_progress_id' => 'required|integer',
            'feedback'         => 'nullable|string',
        ]);

        $userId = Auth::id();
        if (!$userId) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Verify that the provided user_progress_id belongs to this user.
        $userProgress = UserProgress::where('id', $validated['user_progress_id'])
            ->where('user_id', $userId)
            ->first();

        if (!$userProgress) {
            return response()->json(['message' => 'User progress not found or not valid'], 404);
        }

        // Create or update the rating record using the user_progress_id.
        $userRating = UserRating::updateOrCreate(
            [
                'user_progress_id' => $userProgress->id,
            ],
            [
                'rating'   => $validated['rating'],
                'feedback' => $validated['feedback'] ?? null,
            ]
        );

        return response()->json([
            'message' => 'Rating saved successfully.',
            'data'    => $userRating,
        ], 201);
    }
}
