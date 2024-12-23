<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Checkestaken;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
class ResultTest extends Controller
{
    public function checkTestTaken(Request $request)
    {
        $user = User::find(Auth::id());
        $Checkestaken = Checkestaken::find($user->id);
        $testlevel=$Checkestaken->testlevel;
        if($testlevel) {
            return response()->json([
                'taken' => true,
            ]);
        }

        return response()->json([
            'taken' => false,
        ]);
    }

    // حفظ نتيجة الاختبار بعد إجرائه
    public function submitTest(Request $request, $level)
    {
        $user = Auth::user(); // الحصول على المستخدم الحالي

        // التحقق من الإجابات
        // قم بمعالجة الإجابات وحفظها حسب احتياجاتك

        // تغيير حالة الاختبار للمستخدم
        $user->test_taken = true;
        $user->test_level = $level; // تحديث مستوى الاختبار
        $user->save();

        return response()->json([
            'message' => 'Test submitted successfully',
            'next_level' => $this->getNextLevel($level), // يمكنك تحديد المستوى التالي بناءً على منطقك
        ]);
    }

}
