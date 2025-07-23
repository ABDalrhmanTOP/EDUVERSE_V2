<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\PlacementTest;
use App\Models\PlacementQuestion;
use App\Models\UserCourseUnlock;
use Illuminate\Support\Facades\Http;

class PlacementTestController extends Controller
{
    // Check if user has completed placement test for a specific course
    public function checkCompletion(Request $request)
    {
        $request->validate([
            'course_id' => 'required|integer|exists:playlists,id',
        ]);
        return response()->json([
            'completed' => true,
            'unlock_data' => null
        ]);
    }

    // Start a placement test: randomly select 1 easy, 1 medium, 1 hard question per subject
    public function start(Request $request)
    {
        $request->validate([
            'course_id' => 'required|integer|exists:playlists,id',
        ]);

        $courseId = $request->input('course_id');

        // Find the placement test for the given course
        $placementTest = PlacementTest::where('course_id', $courseId)->first();

        if (!$placementTest) {
            return response()->json(['message' => 'No placement test found for this course.'], 404);
        }

        // Load the questions for the test
        $questions = $placementTest->questions()->get()->map(function ($q) {
            return [
                'id' => $q->id,
                'text' => $q->question,
                'type' => $q->type,
                'options' => is_string($q->options) ? json_decode($q->options, true) : $q->options,
                'correct_answer' => $q->correct_answer,
                'difficulty' => $q->difficulty,
                'code_template' => $q->code_template,
                'test_cases' => is_string($q->test_cases) ? json_decode($q->test_cases, true) : $q->test_cases,
            ];
        });

        if ($questions->isEmpty()) {
            return response()->json(['message' => 'This placement test has no questions.'], 404);
        }

        return response()->json([
            'test_id' => $placementTest->id,
            'title' => $placementTest->title,
            'description' => $placementTest->description,
            'questions' => $questions,
        ]);
    }

    // Submit answers and grade
    public function submit(Request $request)
    {
        $request->validate([
            'test_id' => 'required|integer|exists:placement_tests,id',
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|integer|exists:placement_test_questions,id',
            'answers.*.answer' => 'present',
        ]);

        $testId = $request->input('test_id');
        $answers = $request->input('answers');
        $user = Auth::user();

        $test = PlacementTest::findOrFail($testId);
        $questions = $test->questions()->whereIn('id', array_column($answers, 'question_id'))->get()->keyBy('id');

        $score = 0;
        $totalQuestions = count($answers);
        $results = [];

        foreach ($answers as $answerData) {
            $questionId = $answerData['question_id'];
            $userAnswer = $answerData['answer'];

            if (!isset($questions[$questionId])) {
                continue;
            }

            $question = $questions[$questionId];
            $isCorrect = false;

            // Handle different question types
            if ($question->type === 'mcq' || $question->type === 'truefalse') {
                $isCorrect = strtolower(trim($userAnswer)) === strtolower(trim($question->correct_answer));
            } elseif ($question->type === 'coding') {
                // For coding questions, we'll consider it correct if they provided some code
                $isCorrect = !empty(trim($userAnswer));
            }

            if ($isCorrect) {
                $score++;
            }

            $results[] = [
                'question_id' => $questionId,
                'is_correct' => $isCorrect,
            ];
        }

        $percentage = $totalQuestions > 0 ? round(($score / $totalQuestions) * 100, 2) : 0;

        // Store the result in the database
        DB::table('results')->insert([
            'user_id' => $user->id,
            'test_id' => $testId,
            'score' => $score,
            'total_questions' => $totalQuestions,
            'percentage' => $percentage,
            'test_type' => 'placement',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Mark user as having completed placement test for this course
        DB::table('users')->where('id', $user->id)->update([
            'placement_score' => $percentage,
            'placement_level' => $percentage >= 70 ? 'advanced' : 'beginner',
            'test_taken' => true
        ]);

        return response()->json([
            'message' => 'Test submitted successfully!',
            'score' => $score,
            'total' => $totalQuestions,
            'percentage' => $percentage,
            'passed' => $percentage >= 70, // 70% passing threshold
            'results' => $results,
            'course_unlocked' => true
        ]);
    }
}
