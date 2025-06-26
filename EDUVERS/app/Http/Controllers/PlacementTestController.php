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
    // Start a placement test: randomly select 1 easy, 1 medium, 1 hard question per subject
    public function start(Request $request)
    {
        $user = Auth::user();
        $courseId = $request->input('course_id');
        $year = $request->input('year');
        $semester = $request->input('semester');

        // Get course information
        $course = DB::table('playlists')->where('id', $courseId)->first();
        if (!$course) {
            return response()->json(['error' => 'Course not found'], 404);
        }

        // Get questions for the course's year and semester
        $questions = PlacementQuestion::where('year', $year)
            ->where('semester', $semester)
            ->inRandomOrder()
            ->limit(5) // Limit to 5 questions for now
            ->get();

        $questions = $questions->map(function ($q) {
            return [
                'id' => $q->id,
                'text' => $q->question, // Map 'question' field to 'text'
                'type' => $q->type === 'true_false' ? 'truefalse' : $q->type, // Map true_false to truefalse
                'options' => is_string($q->options) ? json_decode($q->options, true) : $q->options,
                'correct_answer' => $q->correct_answer,
                'difficulty' => $q->difficulty,
                'code_template' => $q->code_template,
                'test_cases' => is_string($q->test_cases) ? json_decode($q->test_cases, true) : $q->test_cases,
            ];
        });

        if ($questions->isEmpty()) {
            // If no questions found, create some default questions
            $questions = collect([
                [
                    'id' => 1,
                    'text' => 'What is the basic structure of a C++ program?',
                    'type' => 'mcq',
                    'options' => ['main() function', 'class definition', 'include statement', 'All of the above'],
                    'correct_answer' => 'All of the above',
                    'difficulty' => 'easy'
                ],
                [
                    'id' => 2,
                    'text' => 'Which of the following is used for output in C++?',
                    'type' => 'mcq',
                    'options' => ['cin', 'cout', 'printf', 'scanf'],
                    'correct_answer' => 'cout',
                    'difficulty' => 'easy'
                ],
                [
                    'id' => 3,
                    'text' => 'What is the correct way to declare a variable in C++?',
                    'type' => 'mcq',
                    'options' => ['int x = 5;', 'x = 5;', 'var x = 5;', 'variable x = 5;'],
                    'correct_answer' => 'int x = 5;',
                    'difficulty' => 'easy'
                ],
                [
                    'id' => 4,
                    'text' => 'C++ is an object-oriented programming language.',
                    'type' => 'truefalse',
                    'correct_answer' => 'True',
                    'difficulty' => 'easy'
                ],
                [
                    'id' => 5,
                    'text' => 'Write a simple C++ program to print "Hello World"',
                    'type' => 'code',
                    'correct_answer' => '#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello World";\n    return 0;\n}',
                    'difficulty' => 'easy'
                ]
            ]);
        }

        // Store the test session
        $test = PlacementTest::create([
            'user_id' => $user->id,
            'year' => $year,
            'semester' => $semester,
            'subject' => 'all',
            'score' => null,
            'passed' => false,
            'taken_at' => now()->toDateTimeString(),
        ]);

        // Save selected question IDs in session
        session(['placement_test_questions' => $questions->pluck('id')->toArray()]);
        session(['placement_test_id' => $test->id]);

        return response()->json([
            'test_id' => $test->id,
            'questions' => $questions,
        ]);
    }

    // Submit answers and grade
    public function submit(Request $request)
    {
        $user = Auth::user();
        $courseId = $request->input('course_id');
        $year = $request->input('year');
        $semester = $request->input('semester');
        $answers = $request->input('answers'); // array: question_id => answer/code

        // Get the test ID from session or create a new one
        $testId = session('placement_test_id');
        if (!$testId) {
            $test = PlacementTest::create([
                'user_id' => $user->id,
                'year' => $year,
                'semester' => $semester,
                'subject' => 'all',
                'score' => null,
                'passed' => false,
                'taken_at' => now()->toDateTimeString(),
            ]);
            $testId = $test->id;
        }

        $score = 0;
        $totalQuestions = count($answers);
        $results = [];

        foreach ($answers as $qid => $answer) {
            // Simple answer checking based on question ID
            switch ($qid) {
                case 1: // C++ program structure
                    $correct = in_array(strtolower($answer), ['all of the above', 'all of above', 'all']);
                    break;
                case 2: // Output in C++
                    $correct = strtolower($answer) === 'cout';
                    break;
                case 3: // Variable declaration
                    $correct = strtolower($answer) === 'int x = 5;';
                    break;
                case 4: // C++ is OOP
                    $correct = strtolower($answer) === 'true';
                    break;
                case 5: // Hello World code
                    // Simple check for key elements
                    $code = strtolower($answer);
                    $correct = strpos($code, '#include') !== false &&
                        strpos($code, 'main') !== false &&
                        strpos($code, 'cout') !== false;
                    break;
                default:
                    // For database questions, check against correct_answer
                    $question = PlacementQuestion::find($qid);
                    if ($question) {
                        if ($question->type === 'mcq' || $question->type === 'true_false') {
                            $correct = (strtolower($answer) === strtolower($question->correct_answer));
                        } elseif ($question->type === 'coding') {
                            // Simple code validation for now
                            $code = strtolower($answer);
                            $correct = !empty(trim($code));
                        } else {
                            $correct = true; // Default to correct for unknown types
                        }
                    } else {
                        $correct = true; // Default to correct for unknown questions
                    }
            }

            $results[$qid] = $correct;
            if ($correct) $score++;
        }

        // Calculate pass/fail (70% to pass)
        $passed = ($score >= $totalQuestions * 0.7);

        // Save score and pass/fail
        $test = PlacementTest::find($testId);
        if ($test) {
            $test->score = $score;
            $test->passed = $passed;
            $test->save();
        }

        // Unlock courses if passed
        if ($passed && $courseId) {
            UserCourseUnlock::firstOrCreate([
                'user_id' => $user->id,
                'course_id' => $courseId,
                'unlock_reason' => 'placement',
            ], [
                'unlocked_at' => now(),
            ]);
        }

        // Clear session
        session()->forget(['placement_test_questions', 'placement_test_id']);

        return response()->json([
            'result' => [
                'score' => $score,
                'total' => $totalQuestions,
                'percentage' => $totalQuestions > 0 ? round(($score / $totalQuestions) * 100, 2) : 0,
                'passed' => $passed,
                'results' => $results,
            ]
        ]);
    }
}
