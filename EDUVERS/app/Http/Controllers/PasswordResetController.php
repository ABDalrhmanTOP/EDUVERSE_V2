<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class PasswordResetController extends Controller
{
    public function sendResetLink(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        $token = Str::random(60);
        $email = $request->email;


        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            ['token' => $token, 'created_at' => now()]
        );

        // إرسال البريد الإلكتروني
        Mail::raw('Click this link to reset your password: ' . url('/reset-password?token=' . $token), function ($message) use ($email) {
            $message->to($email)->subject('Reset Password Link');
        });

        return response()->json(['message' => 'Password reset link sent!'], 200);
    }


                    public function resetPassword(Request $request)
                {
                    $request->validate([
                        'token' => 'required',
                        'email' => 'required|email|exists:users,email',
                        'password' => 'required|min:8|confirmed',
                    ]);

                    $record = DB::table('password_reset_tokens')->where('token', $request->token)->where('email', $request->email)->first();

                    if (!$record || now()->diffInMinutes($record->created_at) > 60) {
                        return response()->json(['message' => 'Token is invalid or expired.'], 400);
                    }

                    // تحديث كلمة المرور
                    DB::table('users')->where('email', $request->email)->update([
                        'password' => Hash::make($request->password),
                    ]);

                    // حذف الرمز
                    DB::table('password_reset_tokens')->where('email', $request->email)->delete();

                    return response()->json(['message' => 'Password has been reset successfully!'], 200);
                }
}
