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

        // Optional: check if email already used by a confirmed user
        $exists = User::where('email', $request->email)->exists();
        if ($exists) {
            return response()->json(['message' => 'Email already taken'], 409);
        }

        // Generate random 6-digit code
        $code = rand(100000, 999999);

        // Store in DB
        EmailVerificationCode::create([
            'email' => $request->email,
            'code' => $code,
            'created_at' => now()
        ]);

        // Send email
        // This can be a real Mailable. For simplicity:
        Mail::raw(
            "Your verification code is: {$code}. It expires in 1 minute.",
            function ($message) use ($request) {
                $message->to($request->email)->subject('Email Verification Code');
            }
        );

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

        // If valid & not expired, we create the user
        // or you can call your existing registration logic
        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

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
