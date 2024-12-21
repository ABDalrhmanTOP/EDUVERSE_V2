<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\Level;
use App\Models\Question;
use App\Models\Result;
use Illuminate\Http\Request;

class TestController extends Controller
{
    public function showTest(Request $request, $levelId)
{
    $user = User::find(Auth::id());

    if (!$user || $user->id !== Auth::id()) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }

    $level = Level::find($levelId);

    if (!$level) {
        return response()->json(['error' => 'Level not found'], 404);
    }

    // جلب 5 أسئلة عشوائية من المستوى المحدد
    $questions = Question::where('level_id', $levelId)->inRandomOrder()->take(5)->get();

    if ($questions->isEmpty()) {
        return response()->json(['error' => 'No questions available for this level'], 404);
    }

    return response()->json(['questions' => $questions], 200);
}



public function submitTest(Request $request, $levelId)
{
    $validator = Validator::make($request->all(), [
        'answers' => 'required|array',
        'answers.*.question_id' => 'required|exists:questions,id',
        'answers.*.student_answer' => 'required|string',
    ]);

    if ($validator->fails()) {
        return response()->json(['error' => $validator->errors()], 400);
    }

    $user = User::find(Auth::id());

    if (!$user || $user->id !== Auth::id()) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }

    $level = Level::find($levelId);

    if (!$level) {
        return response()->json(['error' => 'Level not found'], 404);
    }

    $score = 0;
    $correctAnswers = [];

    foreach ($request->answers as $answer) {
        $question = Question::find($answer['question_id']);
        $isCorrect = $answer['student_answer'] == $question->correct_answer;


        if ($isCorrect) {
            $score++;
            $correctAnswers[] = $question->id;
        }
    }
    //تخزين نتيجة الاختبار
    if (Auth::check()) {
        $test = Result::create([
            'user_id' => Auth::id(),
            'level_id' => $levelId,
            'score' => $score,
        ]);
    } else {
        return response()->json(['error' => 'User not authenticated'], 401);
    }


    // منطق رفع المستوى (إذا كانت الدرجة 4 أو أكثر)
    $nextLevel = null;
    if ($score >= 4) {
        $nextLevel = Level::where('id', '>', $levelId)->first();
    }
    if($nextLevel->id == 3) {
      $nextLevel="You have skipped the videos, go to the project";

     }
    // إرجاع النتيجة مع المستوى التالي
    return response()->json([
        'test' => $test,
        'score' => $score,
        'correct_answers' => $correctAnswers,
        'next_level' => $nextLevel
    ], 200);
}

}
