<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Services\NotificationService;

class AuthController extends Controller
{

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',

        ]);

        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role' => $request->role ?? 'user',
        ]);

        // Create welcome notification for new user
        NotificationService::welcomeUser($user);

        // Create admin notification about new user registration
        NotificationService::userRegistered($user);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'password' => 'required',
        ]);

        $loginField = null;
        $loginValue = null;
        if ($request->has('email')) {
            $loginField = 'email';
            $loginValue = $request->input('email');
        } elseif ($request->has('username')) {
            $loginField = 'username';
            $loginValue = $request->input('username');
        } else {
            return response()->json(['message' => 'Email or username is required'], 422);
        }

        if (!Auth::attempt([$loginField => $loginValue, 'password' => $request->password])) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Auth::user() returned null'], 500);
        }

        if (!$user instanceof User) {
            return response()->json(['message' => 'Auth::user() is not an instance of User'], 500);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ]);
    }
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logout successful',
        ]);
    }


    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}
