<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class ProfileController extends Controller
{
    /**
     * Show the authenticated user's profile.
     */
    public function show(Request $request)
    {
        return response()->json([
            'user' => Auth::user()
        ]);
    }

    /**
     * Update the authenticated user's profile.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username,' . $user->id,
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
        ]);

        $user->name = $validated['name'];
        $user->username = $validated['username'];
        $user->email = $validated['email'];

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully!',
            'user' => $user
        ], 200);
    }

    /**
     * Update the authenticated user's profile picture.
     */
    public function updatePicture(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'User not authenticated'], 401);
        }

        if (!$request->hasFile('profile_picture')) {
            return response()->json(['message' => 'No picture provided'], 400);
        }

        $file = $request->file('profile_picture');

        // Store the file on the "public" disk in a "profile_pictures" folder
        $path = $file->store('profile_pictures', 'public');

        // Update user's profile photo path
        $user->profile_photo_path = $path;
        $user->save();

        return response()->json([
            'message' => 'Picture updated successfully!',
            'path' => $path
        ], 200);
    }

    /**
     * Remove the authenticated user's profile picture.
     */
    public function removePicture(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'User not authenticated'], 401);
        }

        // Optionally: Delete the file from storage if needed.
        $user->profile_photo_path = null;
        $user->save();

        return response()->json([
            'message' => 'Profile picture removed successfully!'
        ], 200);
    }
}
