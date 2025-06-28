<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User; // تأكد من استخدام المسار الصحيح للنموذ
use Illuminate\Support\Facades\Storage;
use App\Services\NotificationService;

class UserController extends Controller
{
    // جلب جميع المستخدمين
    public function index()
    {
        $users = User::all();
        return response()->json($users);
    }

    // جلب مستخدم معين
    public function show($id)
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    // إضافة مستخدم جديد
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'role' => 'sometimes|string|in:user,admin',
            'job' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'experience' => 'nullable|string|max:255',
            'semester' => 'nullable|integer|min:1|max:2',
            'career_goals' => 'nullable|string',
            'hobbies' => 'nullable|array',
            'expectations' => 'nullable|array',
            'university' => 'nullable|string|max:255',
            'education_level' => 'nullable|string|max:255',
            'field_of_study' => 'nullable|string|max:255',
            'student_year' => 'nullable|string|max:255',
            'years_of_experience' => 'nullable|string|max:255',
            'specialization' => 'nullable|string|max:255',
            'industry' => 'nullable|string|max:255',
            'company_size' => 'nullable|string|max:255',
            'teaching_subject' => 'nullable|string|max:255',
            'research_field' => 'nullable|string|max:255',
            'has_completed_general_form' => 'nullable|boolean',
        ]);

        $userData = [
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'username' => $validated['username'],
            'password' => bcrypt($validated['password']),
        ];

        // إضافة الحقون الاختيارية إذا تم توفيرها
        $optionalFields = [
            'role',
            'job',
            'country',
            'experience',
            'semester',
            'career_goals',
            'university',
            'education_level',
            'field_of_study',
            'student_year',
            'years_of_experience',
            'specialization',
            'industry',
            'company_size',
            'teaching_subject',
            'research_field',
            'has_completed_general_form'
        ];

        foreach ($optionalFields as $field) {
            if (isset($validated[$field])) {
                $userData[$field] = $validated[$field];
            }
        }

        // Handle array fields
        if (isset($validated['hobbies']) && is_array($validated['hobbies'])) {
            $userData['hobbies'] = json_encode($validated['hobbies']);
        }
        if (isset($validated['expectations']) && is_array($validated['expectations'])) {
            $userData['expectations'] = json_encode($validated['expectations']);
        }

        $user = User::create($userData);

        // Create notification for new user registration
        NotificationService::userRegistered($user);

        return response()->json($user, 201);
    }

    // تعديل بيانات مستخدم
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name'  => 'sometimes|string|max:255',
            'username' => 'sometimes|string|max:255|unique:users,username,' . $id,
            'email' => "sometimes|email|unique:users,email,{$id}",
            'password' => 'sometimes|min:6',
            'role' => 'sometimes|string|in:user,admin',
            'job' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'experience' => 'nullable|string|max:255',
            'semester' => 'nullable|integer|min:1|max:2',
            'career_goals' => 'nullable|string',
            'hobbies' => 'nullable|array',
            'expectations' => 'nullable|array',
            'university' => 'nullable|string|max:255',
            'education_level' => 'nullable|string|max:255',
            'field_of_study' => 'nullable|string|max:255',
            'student_year' => 'nullable|string|max:255',
            'years_of_experience' => 'nullable|string|max:255',
            'specialization' => 'nullable|string|max:255',
            'industry' => 'nullable|string|max:255',
            'company_size' => 'nullable|string|max:255',
            'teaching_subject' => 'nullable|string|max:255',
            'research_field' => 'nullable|string|max:255',
            'has_completed_general_form' => 'nullable|boolean',
        ]);

        // Track changed fields
        $changedFields = [];
        foreach ($validated as $field => $value) {
            if ($user->$field != $value) {
                $changedFields[] = $field;
            }
        }

        // إعالج كلمة المرور بشكل منفصل
        if (isset($validated['password'])) {
            $validated['password'] = bcrypt($validated['password']);
            $changedFields[] = 'password';
        }

        // Handle array fields - convert to JSON for database storage
        if (isset($validated['hobbies']) && is_array($validated['hobbies'])) {
            $validated['hobbies'] = json_encode($validated['hobbies']);
        }
        if (isset($validated['expectations']) && is_array($validated['expectations'])) {
            $validated['expectations'] = json_encode($validated['expectations']);
        }

        $user->update($validated);

        // Create notification for user update with changed fields
        NotificationService::profileUpdated($user, $changedFields);

        return response()->json($user);
    }

    // حذف مستخدم
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // إنهاء عملية حذف مستخدمين المشرفين
        if ($user->role === 'admin') {
            return response()->json(['error' => 'لا يمكن حذف مستخدمين المشرفين'], 403);
        }

        $user->delete();
        return response()->json(['message' => 'تم حذف المستخدم بنجاح']);
    }

    // رفع صورة الملف الشخصي
    public function uploadProfilePicture(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'profile_picture' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
        ]);

        try {
            // حذف الصورة القديمة إذا كانت موجودة
            if ($user->profile_photo_path) {
                Storage::disk('public')->delete($user->profile_photo_path);
            }

            // حفظ الصورة الجديدة
            $path = $request->file('profile_picture')->store('profile-pictures', 'public');

            // تحديث مسار الصورة في قاعدة البيانات
            $user->update([
                'profile_photo_path' => $path
            ]);

            return response()->json([
                'message' => 'تم رفع الصورة بنجاح',
                'profile_photo_path' => Storage::url($path)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'فشل في رفع الصورة: ' . $e->getMessage()
            ], 500);
        }
    }
}
