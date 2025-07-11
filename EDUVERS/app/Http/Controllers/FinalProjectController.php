<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Models\FinalProjectSubmission;
use App\Models\UserProgress;

class FinalProjectController extends Controller
{
    /**
     * Submit the final project.
     * Expects:
     * - code_solution (string)
     * - mcq_answers (array)
     * - tf_answers (array)
     * - playlist_id (integer)
     * - video_id (string)
     * - rating (optional, integer 0-5)
     * - feedback (optional, string)
     */
    public function submitFinalProject(Request $request)
    {
        $validated = $request->validate([
            'mcq_answers'   => 'array',
            'tf_answers'    => 'array',
            'code_solutions' => 'nullable|array',
            'playlist_id'   => 'required|integer',
            'video_id'      => 'required|string',
            'rating'        => 'nullable|integer|min:0|max:5',
            'feedback'      => 'nullable|string',
        ]);

        $userId = Auth::id();
        if (!$userId) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not authenticated',
            ], 401);
        }

        // 1. Fetch all questions for the final project (final_project_questions) for the given playlist_id
        $finalTest = DB::table('final_projects')->where('course_id', $validated['playlist_id'])->first();
        if (!$finalTest) {
            return response()->json([
                'status' => 'error',
                'message' => 'No final project found for this course.'
            ], 404);
        }
        $questions = DB::table('final_project_questions')->where('final_project_id', $finalTest->id)->get();

        $mcqMarks = 0;
        $tfMarks = 0;
        $codingMarks = 0;
        $totalMcq = 0;
        $totalTf = 0;
        $totalCoding = 0;
        $maxMcq = 0;
        $maxTf = 0;
        $maxCoding = 0;
        $correctMcq = [];
        $correctTf = [];
        $correctCode = [];

        foreach ($questions as $q) {
            $mark = floatval($q->mark ?? 1);
            if ($q->type === 'mcq') {
                $totalMcq++;
                $maxMcq += $mark;
                $correctMcq[$q->id] = $q->correct_answer;
                $userAnswer = $validated['mcq_answers'][$q->id] ?? null;
                if ($userAnswer && strtoupper($userAnswer) === strtoupper($q->correct_answer)) {
                    $mcqMarks += $mark;
                }
            } elseif ($q->type === 'true_false') {
                $totalTf++;
                $maxTf += $mark;
                $correctTf[$q->id] = $q->correct_answer;
                $userAnswer = $validated['tf_answers'][$q->id] ?? null;
                if ($userAnswer && strtolower($userAnswer) === strtolower($q->correct_answer)) {
                    $tfMarks += $mark;
                }
            } elseif ($q->type === 'code') {
                $totalCoding++;
                $maxCoding += $mark;
                $correctCode[$q->id] = $q->code_template ?? '';
                $userCode = $validated['code_solutions'][$q->id] ?? '';
                // Basic code evaluation (can be enhanced)
                $codeScore = $this->runStaticAnalysis($userCode);
                $codingMarks += $codeScore * $mark / 3; // scale static analysis (0-3) to mark
            }
        }
        $finalMark = $mcqMarks + $tfMarks + $codingMarks;
        $maxTotal = $maxMcq + $maxTf + $maxCoding;
        $grade = $finalMark >= 0.9 * $maxTotal ? 'A' : ($finalMark >= 0.7 * $maxTotal ? 'B' : ($finalMark >= 0.5 * $maxTotal ? 'C' : 'F'));

        // Link submission with user progress
        $userProgress = \App\Models\UserProgress::where('user_id', $userId)
            ->where('video_id', $validated['video_id'])
            ->where('playlist_id', $validated['playlist_id'])
            ->first();

        // If no user progress exists, create one automatically
        if (!$userProgress) {
            try {
                $userProgress = \App\Models\UserProgress::create([
                    'user_id' => $userId,
                    'video_id' => $validated['video_id'],
                    'playlist_id' => $validated['playlist_id'],
                    'last_timestamp' => '00:00:00',
                    'completed_tasks' => [],
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Error creating user progress record: ' . $e->getMessage(),
                ], 500);
            }
        }
        // Store final project submission
        try {
            $submission = FinalProjectSubmission::create([
                'user_progress_id' => $userProgress->id,
                'code_solution'    => json_encode($validated['code_solutions'] ?? []),
                'mcq_answers'      => $validated['mcq_answers'],
                'tf_answers'       => $validated['tf_answers'],
                'coding_marks'     => $codingMarks,
                'mcq_marks'        => $mcqMarks,
                'tf_marks'         => $tfMarks,
                'final_mark'       => $finalMark,
                'grade'            => $grade,
                'rating'           => $validated['rating'] ?? null,
                'feedback'         => $validated['feedback'] ?? null,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Error storing final project submission'
            ], 500);
        }
        return response()->json([
            'status'  => 'success',
            'message' => 'Project submission evaluated and stored',
            'data'    => [
                'final_mark'       => $finalMark,
                'grade'            => $grade,
                'coding_marks'     => $codingMarks,
                'mcq_marks'        => $mcqMarks,
                'tf_marks'         => $tfMarks,
                'max_mcq'          => $maxMcq,
                'max_tf'           => $maxTf,
                'max_coding'       => $maxCoding,
                'max_total'        => $maxTotal,
                'total_questions'  => [
                    'mcq' => $totalMcq,
                    'tf'  => $totalTf,
                    'coding' => $totalCoding,
                ],
                'correct_mcq'      => $correctMcq,
                'correct_tf'       => $correctTf,
                'correct_code'     => $correctCode,
                'submission_id'    => $submission->id,
                'user_progress_id' => $userProgress->id,
            ],
        ], 200);
    }

    /**
     * Show the final project questions for a given playlist.
     * GET /final-projects/{playlistId}
     */
    public function show($playlistId)
    {
        // This logic expects the final project tables to be used for final project questions.
        $finalTest = DB::table('final_projects')->where('course_id', $playlistId)->first();
        if (!$finalTest) {
            return response()->json([
                'status' => 'error',
                'message' => 'No final project questions found for this course.'
            ], 404);
        }
        $questions = DB::table('final_project_questions')->where('final_project_id', $finalTest->id)->get();
        $mcq = [];
        $tf = [];
        $coding = [];
        foreach ($questions as $q) {
            if ($q->type === 'mcq') {
                $mcq[] = [
                    'id' => $q->id,
                    'text' => $q->question,
                    'options' => json_decode($q->options, true) ?? [],
                ];
            } elseif ($q->type === 'true_false') {
                $tf[] = [
                    'id' => $q->id,
                    'text' => $q->question,
                ];
            } elseif ($q->type === 'code') {
                $coding[] = [
                    'id' => $q->id,
                    'prompt' => $q->question,
                    'language' => 'cpp',
                ];
            }
        }
        return response()->json([
            'status' => 'success',
            'data' => [
                'mcq' => $mcq,
                'tf' => $tf,
                'coding' => $coding,
            ]
        ]);
    }

    /**
     * Check if a course has a final project.
     * GET /final-projects/check/{playlistId}
     */
    public function check($playlistId)
    {
        $finalProject = DB::table('final_projects')->where('course_id', $playlistId)->first();

        if ($finalProject) {
            return response()->json([
                'status' => 'success',
                'has_final_project' => true,
                'project' => $finalProject
            ]);
        } else {
            return response()->json([
                'status' => 'success',
                'has_final_project' => false,
                'project' => null
            ]);
        }
    }

    /**
     * Run a more sophisticated static analysis on the submitted code.
     * Returns a score between 0 and 3.
     */
    private function runStaticAnalysis($code)
    {
        $score = 0;
        if (preg_match('/\bmain\s*\(/', $code)) {
            $score += 1;
        }
        if (preg_match('/\bclass\s+\w+/', $code)) {
            $score += 1;
        }
        if (preg_match('/std::(vector|set|map)\s*<.*>/', $code)) {
            $score += 1;
        }
        return min($score, 3);
    }
}
