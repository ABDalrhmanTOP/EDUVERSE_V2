<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class SocialAuthController extends Controller
{
    // Redirect to Google
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    // Handle Google callback
    public function handleGoogleCallback()
    {
        try {
            $socialUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return response()->json(['message' => 'Google authentication failed', 'error' => $e->getMessage()], 401);
        }
        return $this->findOrCreateSocialUser($socialUser, 'google');
    }

    // Redirect to GitHub
    public function redirectToGithub()
    {
        return Socialite::driver('github')->stateless()->redirect();
    }

    // Handle GitHub callback
    public function handleGithubCallback()
    {
        try {
            $socialUser = Socialite::driver('github')->stateless()->user();
        } catch (\Exception $e) {
            return response()->json(['message' => 'GitHub authentication failed', 'error' => $e->getMessage()], 401);
        }
        return $this->findOrCreateSocialUser($socialUser, 'github');
    }

    // Find or create user, return token
    protected function findOrCreateSocialUser($socialUser, $provider)
    {
        $user = User::where('email', $socialUser->getEmail())->first();
        if (!$user) {
            $user = User::create([
                'name' => $socialUser->getName() ?: $socialUser->getNickname() ?: 'User',
                'email' => $socialUser->getEmail(),
                'username' => $socialUser->getNickname() ?: explode('@', $socialUser->getEmail())[0],
                'password' => Hash::make(Str::random(16)),
                'role' => 'user',
            ]);
            // Send welcome notification and email
            \App\Services\NotificationService::welcomeUser($user);
        }
        $token = $user->createToken('auth_token')->plainTextToken;
        // Redirect to frontend with token and user info
        $frontendUrl = 'http://localhost:3000/auth/callback';
        $userJson = urlencode(json_encode($user));
        $redirectUrl = "$frontendUrl?token=$token&user=$userJson";
        return redirect($redirectUrl);
    }
}
