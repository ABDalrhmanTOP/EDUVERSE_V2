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
        // Return just the user’s info, or omit sensitive data if desired
        return response()->json([
            'user' => Auth::user()
        ]);
    }

    /**
     * Update the authenticated user's profile.
     */
    public function update(Request $request)
    {
        $user = $request->user(); // Authenticated user from the token/session

        // Validate incoming data.
        // We exclude the current user ID for uniqueness checks, so user can keep same email/username.
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username,' . $user->id,
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8', // If user wants to update their password
        ]);

        // Update fields
        $user->name = $validated['name'];
        $user->username = $validated['username'];
        $user->email = $validated['email'];

        // If a new password was provided, hash it
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully!',
            'user' => $user
        ], 200);
    }
}
