<?php
    namespace App\Http\Controllers;

    use Illuminate\Http\Request;
    use App\Models\User; // تأكد من استخدام المسار الصحيح للنموذ

    class UserController extends Controller
    {
        // جلب جميع المستخدمين
        public function index()
        {
            $users = User::all();
            return response()->json($users);
        }

        // إضافة مستخدم جديد
        public function store(Request $request)
        {
            $validated = $request->validate([
                'name'  => 'required|string|max:255',
                'username'=> 'required|string|max:255',
                'email' => 'required|email|unique:users',
                'password' => 'required|min:6',
            ]);

            $user = User::create([
                'name'     => $validated['name'],
                'email'    => $validated['email'],
                'username' =>$validated['username'],
                'password' => bcrypt($validated['password']),
            ]);

            return response()->json($user, 201);
        }

        // تعديل بيانات مستخدم
        public function update(Request $request, $id)
        {
            $user = User::findOrFail($id);
            $validated = $request->validate([
                'name'  => 'sometimes|required|string|max:255',
                'username'=> 'required|string|max:255',
                'email' => "sometimes|required|email|unique:users,email,{$id}",
                'password' => 'sometimes|required|min:6',
            ]);

            if(isset($validated['password'])) {
                $validated['password'] = bcrypt($validated['password']);
            }

            $user->update($validated);
            return response()->json($user);
        }

        // حذف مستخدم
        public function destroy($id)
        {
            $user = User::findOrFail($id);
            $user->delete();
            return response()->json(['message' => 'User deleted successfully']);
        }
    }


