<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Services\NotificationService;

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

        // Track changed fields
        $changedFields = [];
        if ($user->name !== $validated['name']) {
            $changedFields[] = 'name';
        }
        if ($user->username !== $validated['username']) {
            $changedFields[] = 'username';
        }
        if ($user->email !== $validated['email']) {
            $changedFields[] = 'email';
        }

        $user->name = $validated['name'];
        $user->username = $validated['username'];
        $user->email = $validated['email'];

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
            $changedFields[] = 'password';
        }

        $user->save();

        // Create notification for profile update with changed fields
        NotificationService::profileUpdated($user, $changedFields);

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
        $user->update(['profile_photo_path' => $path]);

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

    public function saveGeneralForm(Request $request)
    {
        $request->validate([
            'job' => 'nullable|string',
            'country' => 'nullable|string',
            'experience' => 'nullable|string',
            'career_goals' => 'nullable|string',
            'hobbies' => 'nullable|string',
            'expectations' => 'nullable|string',
            'semester' => 'nullable|integer|min:1|max:2',
            'university' => 'nullable|string',
            'education_level' => 'nullable|string',
            'field_of_study' => 'nullable|string',
            'student_year' => 'nullable|string',
            'years_of_experience' => 'nullable|string',
            'specialization' => 'nullable|string',
            'teaching_subject' => 'nullable|string',
            'research_field' => 'nullable|string',
            'company_size' => 'nullable|string',
            'industry' => 'nullable|string',
        ]);

        $user = auth()->user();

        $user->update([
            'job' => $request->job ?? '',
            'university' => $request->university ?? '',
            'country' => $request->country ?? '',
            'experience' => $request->experience ?? '',
            'career_goals' => $request->career_goals ?? '',
            'hobbies' => $request->hobbies ?? '',
            'expectations' => $request->expectations ?? '',
            'education_level' => $request->education_level ?? '',
            'field_of_study' => $request->field_of_study ?? '',
            'student_year' => $request->student_year ?? '',
            'years_of_experience' => $request->years_of_experience ?? '',
            'specialization' => $request->specialization ?? '',
            'teaching_subject' => $request->teaching_subject ?? '',
            'research_field' => $request->research_field ?? '',
            'company_size' => $request->company_size ?? '',
            'industry' => $request->industry ?? '',
            'semester' => $request->semester ?? 1,
            'has_completed_general_form' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profile information saved successfully',
            'user' => $user->fresh()
        ]);
    }
}
