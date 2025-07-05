<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Models\FinalTest;
use App\Models\FinalTestQuestion;
use App\Models\FinalTestSubmission;
use App\Models\UserProgress;

class FinalTestSubmissionController extends Controller
{
    /**
     * Submit the final test.
     * Expects:
     * - course_id (integer)
     * - mcq_answers (array)
     * - tf_answers (array)
     * - code_solutions (array)
     * - rating (optional, integer 0-5)
     * - feedback (optional, string)
     */
    public function submitFinalTest(Request $request)
    {
        $validated = $request->validate([
            'course_id'      => 'required|integer|exists:playlists,id',
            'mcq_answers'    => 'array',
            'tf_answers'     => 'array',
            'code_solutions' => 'array',
            'rating'         => 'nullable|integer|min:0|max:5',
            'feedback'       => 'nullable|string',
        ]);

        $userId = Auth::id();
        if (!$userId) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not authenticated',
            ], 401);
        }

        // Get the final test for this course
        $finalTest = FinalTest::where('course_id', $validated['course_id'])->first();
        if (!$finalTest) {
            return response()->json([
                'status'  => 'error',
                'message' => 'No final test found for this course.',
            ], 404);
        }

        // Get all questions for this final test
        $questions = FinalTestQuestion::where('final_test_id', $finalTest->id)->get();
        if ($questions->isEmpty()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'No questions found for this final test.',
            ], 404);
        }

        // Initialize scoring variables
        $codingMarks = 0;
        $mcqMarks = 0;
        $tfMarks = 0;
        $totalMcq = 0;
        $totalTf = 0;
        $totalCoding = 0;
        $correctMcqAnswers = [];
        $correctTfAnswers = [];
        $idealCodeSolutions = [];

        // Ensure arrays are properly initialized
        $validated['mcq_answers'] = $validated['mcq_answers'] ?? [];
        $validated['tf_answers'] = $validated['tf_answers'] ?? [];
        $validated['code_solutions'] = $validated['code_solutions'] ?? [];

        // Grade each question
        foreach ($questions as $question) {
            switch ($question->type) {
                case 'mcq':
                    $totalMcq++;
                    $userAnswer = $validated['mcq_answers'][$question->id] ?? '';
                    $correctAnswer = $question->correct_answer;
                    $correctMcqAnswers[$question->id] = $correctAnswer;

                    if (strtoupper($userAnswer) === strtoupper($correctAnswer)) {
                        $mcqMarks += 1;
                    }
                    break;

                case 'true_false':
                    $totalTf++;
                    $userAnswer = $validated['tf_answers'][$question->id] ?? '';
                    $correctAnswer = $question->correct_answer;
                    $correctTfAnswers[$question->id] = $correctAnswer;

                    if (strtolower($userAnswer) === strtolower($correctAnswer)) {
                        $tfMarks += 1;
                    }
                    break;

                case 'code':
                    $totalCoding++;
                    $userCode = $validated['code_solutions'][$question->id] ?? '';
                    $idealCodeSolutions[$question->id] = $question->code_template ?? '// Ideal solution not provided';

                    // Basic code evaluation (can be enhanced with Judge0 API)
                    $codeScore = $this->evaluateCode($userCode, $question);
                    $codingMarks += $codeScore;
                    break;
            }
        }

        // Calculate final marks (out of 10)
        $finalMcqMarks = $totalMcq > 0 ? ($mcqMarks / $totalMcq) * 3 : 0; // 3 marks for MCQ
        $finalTfMarks = $totalTf > 0 ? ($tfMarks / $totalTf) * 2 : 0; // 2 marks for TF
        $finalCodingMarks = $totalCoding > 0 ? ($codingMarks / $totalCoding) * 5 : 0; // 5 marks for coding

        $finalMark = $finalMcqMarks + $finalTfMarks + $finalCodingMarks;

        // Determine grade
        if ($finalMark >= 9) {
            $grade = 'A';
        } elseif ($finalMark >= 7) {
            $grade = 'B';
        } elseif ($finalMark >= 5) {
            $grade = 'C';
        } else {
            $grade = 'F';
        }

        // Get user progress record
        $userProgress = UserProgress::where('user_id', $userId)
            ->where('playlist_id', $validated['course_id'])
            ->first();

        if (!$userProgress) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User progress record not found.',
            ], 404);
        }

        // Store final test submission
        try {
            $submission = FinalTestSubmission::create([
                'user_progress_id' => $userProgress->id,
                'final_test_id'    => $finalTest->id,
                'mcq_answers'      => $validated['mcq_answers'],
                'tf_answers'       => $validated['tf_answers'],
                'code_solutions'   => $validated['code_solutions'],
                'coding_marks'     => $finalCodingMarks,
                'mcq_marks'        => $finalMcqMarks,
                'tf_marks'         => $finalTfMarks,
                'final_mark'       => $finalMark,
                'grade'            => $grade,
                'rating'           => $validated['rating'] ?? null,
                'feedback'         => $validated['feedback'] ?? null,
            ]);
        } catch (\Exception $e) {
            Log::error('Error storing final test submission: ' . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => 'Error storing final test submission'
            ], 500);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Final test submitted and evaluated successfully',
            'data'    => [
                'final_mark'           => round($finalMark, 2),
                'grade'                => $grade,
                'coding_marks'         => round($finalCodingMarks, 2),
                'mcq_marks'            => round($finalMcqMarks, 2),
                'tf_marks'             => round($finalTfMarks, 2),
                'total_questions'      => [
                    'mcq' => $totalMcq,
                    'tf'  => $totalTf,
                    'coding' => $totalCoding,
                ],
                'correct_answers'      => [
                    'mcq' => $correctMcqAnswers,
                    'tf'  => $correctTfAnswers,
                ],
                'ideal_code_solutions' => $idealCodeSolutions,
                'submission_id'        => $submission->id,
                'user_progress_id'     => $userProgress->id,
            ],
        ], 200);
    }

    /**
     * Evaluate code submission and return a score between 0 and 1.
     * This is a basic evaluation that can be enhanced with Judge0 API.
     */
    private function evaluateCode($userCode, $question)
    {
        $score = 0;

        // Basic checks
        if (empty(trim($userCode))) {
            return 0;
        }

        // Check for basic C++ structure
        if (preg_match('/\bmain\s*\(/', $userCode)) {
            $score += 0.2;
        }

        if (preg_match('/#include\s*</', $userCode)) {
            $score += 0.1;
        }

        if (preg_match('/using\s+namespace\s+std/', $userCode)) {
            $score += 0.1;
        }

        if (preg_match('/cout\s*</', $userCode)) {
            $score += 0.1;
        }

        if (preg_match('/return\s+0/', $userCode)) {
            $score += 0.1;
        }

        // Check for specific requirements based on question
        if (preg_match('/\bclass\s+\w+/', $userCode)) {
            $score += 0.2;
        }

        if (preg_match('/\bpublic\s*:/', $userCode)) {
            $score += 0.1;
        }

        if (preg_match('/\bprivate\s*:/', $userCode)) {
            $score += 0.1;
        }

        // Check for function definitions
        if (preg_match('/\w+\s+\w+\s*\([^)]*\)\s*{/', $userCode)) {
            $score += 0.1;
        }

        return min($score, 1.0); // Cap at 1.0
    }

    /**
     * Check if a course has a final test (public route)
     */
    public function checkFinalTest($courseId)
    {
        try {
            $finalTest = FinalTest::where('course_id', $courseId)->first();

            if ($finalTest) {
                return response()->json([
                    'status' => 'success',
                    'has_final_test' => true,
                    'test' => [
                        'id' => $finalTest->id,
                        'title' => $finalTest->title,
                        'description' => $finalTest->description,
                    ]
                ]);
            } else {
                return response()->json([
                    'status' => 'success',
                    'has_final_test' => false
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to check final test'
            ], 500);
        }
    }

    /**
     * Get final test data including questions (public route)
     */
    public function getFinalTestData($courseId)
    {
        try {
            $finalTest = FinalTest::where('course_id', $courseId)->first();

            if (!$finalTest) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No final test found for this course'
                ], 404);
            }

            $questions = FinalTestQuestion::where('final_test_id', $finalTest->id)->get();

            return response()->json([
                'status' => 'success',
                'test' => [
                    'id' => $finalTest->id,
                    'title' => $finalTest->title,
                    'description' => $finalTest->description,
                ],
                'questions' => $questions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to load final test data'
            ], 500);
        }
    }
}
