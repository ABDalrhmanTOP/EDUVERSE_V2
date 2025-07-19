<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Models\User;
use App\Models\EmailVerificationCode;
use Illuminate\Support\Facades\Hash;

class EmailVerificationController extends Controller
{
    /**
     * 1) Send a verification code to the user's email.
     */
    public function sendVerificationCode(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Check if user exists
        $user = User::where('email', $request->email)->orWhere('username', $request->username)->first();
        if ($user) {
            if ($user->email_verified_at) {
                return response()->json(['message' => 'Email already taken'], 409);
            }
            // User exists but not verified, update info and resend code
            $user->update([
                'name' => $request->name,
                'username' => $request->username,
                'password' => Hash::make($request->password),
            ]);
        } else {
            // Create user with email_verified_at = null
            $user = User::create([
                'name' => $request->name,
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'email_verified_at' => null,
            ]);
        }

        // Generate random 6-digit code
        $code = rand(100000, 999999);

        // Store in DB
        EmailVerificationCode::create([
            'email' => $request->email,
            'code' => $code,
            'created_at' => now()
        ]);

        // Send styled email using a Mailable
        Mail::to($request->email)->send(new \App\Mail\VerificationCodeMail($request->name, $code));

        return response()->json([
            'message' => 'Verification code sent to your email. Please enter it within 1 minute.'
        ], 200);
    }

    /**
     * 2) Verify the code. If correct and not expired, register the user.
     * Optionally, just mark "verified" and let them call /register separately.
     */
    public function verifyCode(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'password' => 'required|string|min:8|confirmed',
            'code' => 'required'
        ]);

        // Find the code record
        $record = EmailVerificationCode::where('email', $request->email)
            ->where('code', $request->code)
            ->orderByDesc('id')
            ->first();

        if (!$record) {
            return response()->json(['message' => 'Invalid verification code'], 400);
        }

        // Check if older than 1 minute
        $created = Carbon::parse($record->created_at);
        if ($created->diffInSeconds(now()) > 60) {
            return response()->json(['message' => 'Verification code expired'], 400);
        }

        // Find the user
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Update user as verified
        $user->update([
            'email_verified_at' => now(),
            'name' => $request->name,
            'username' => $request->username,
            'password' => Hash::make($request->password),
        ]);

        // Send welcome notification and email
        \App\Services\NotificationService::welcomeUser($user);

        // Optionally, create token if you want to log them in immediately
        $token = $user->createToken('auth_token')->plainTextToken;

        // Clean up the verification code
        $record->delete();

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
            'token' => $token,
        ], 201);
    }
}
