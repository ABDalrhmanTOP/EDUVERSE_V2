<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class FinalProjectController extends Controller
{
    /**
     * Submit the final project.
     * Expects:
     * - code_solution (string)
     * - mcq_answers (array)
     * - tf_answers (array)
     */
    public function submitFinalProject(Request $request)
    {
        $validated = $request->validate([
            'code_solution' => 'required|string',
            'mcq_answers'   => 'required|array',
            'tf_answers'    => 'required|array',
        ]);

        $userId = Auth::id();
        if (!$userId) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not authenticated',
            ], 401);
        }

        // Use Judge0 API to compile/execute the code (simulate quality check)
        $judge0Url = "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true";
        $encodedCode = base64_encode($validated['code_solution']);

        // Disable SSL verification for development purposes:
        $judge0Response = Http::withOptions(['verify' => false])
            ->withHeaders([
                'X-RapidAPI-Host' => 'judge0-ce.p.rapidapi.com',
                'X-RapidAPI-Key'  => env('JUDGE0_API_KEY'),
            ])->post($judge0Url, [
                'source_code' => $encodedCode,
                'language_id' => 54,  // C++ language id
                'stdin'       => '',
            ]);

        if (!$judge0Response->successful()) {
            Log::error("Judge0 API call failed", ['response' => $judge0Response->body()]);
            return response()->json([
                'status'  => 'error',
                'message' => 'Code evaluation failed due to an external API error.'
            ], 500);
        }

        $judgeData = $judge0Response->json();
        $judgeScore = 0;
        if (isset($judgeData['status']) && $judgeData['status']['id'] == 3) {
            $judgeScore = 5;
        } else {
            $judgeScore = 0;
        }

        // Heuristic static analysis: simple keyword checks for OOP and STL
        $code = $validated['code_solution'];
        $heuristicScore = 0;
        if (stripos($code, 'class') !== false) {
            $heuristicScore += 2;
        }
        if (
            stripos($code, 'std::vector') !== false ||
            stripos($code, 'std::set') !== false ||
            stripos($code, 'std::map') !== false
        ) {
            $heuristicScore += 2;
        }
        if (stripos($code, 'main') !== false) {
            $heuristicScore += 1;
        }
        if ($heuristicScore > 3) {
            $heuristicScore = 3;
        }

        $codingMarks = $judgeScore + $heuristicScore; // out of 5

        // MCQ grading: Predefined answer key
        $mcqKey = [
            'q1' => 'C',
            'q2' => 'C',
        ];
        $mcqMarks = 0;
        $totalMcq = count($mcqKey);
        foreach ($mcqKey as $qid => $correctAnswer) {
            if (
                isset($validated['mcq_answers'][$qid]) &&
                strtoupper($validated['mcq_answers'][$qid]) === strtoupper($correctAnswer)
            ) {
                $mcqMarks += 1;
            }
        }
        if ($totalMcq > 0) {
            $mcqMarks = ($mcqMarks / $totalMcq) * 3; // out of 3 marks
        }

        // True/False grading: Predefined key
        $tfKey = [
            'q1' => 'false',
            'q2' => 'true',
        ];
        $tfMarks = 0;
        $totalTf = count($tfKey);
        foreach ($tfKey as $qid => $correctAnswer) {
            if (
                isset($validated['tf_answers'][$qid]) &&
                strtolower($validated['tf_answers'][$qid]) === strtolower($correctAnswer)
            ) {
                $tfMarks += 1;
            }
        }
        if ($totalTf > 0) {
            $tfMarks = ($tfMarks / $totalTf) * 2; // out of 2 marks
        }

        $finalMark = $codingMarks + $mcqMarks + $tfMarks; // Total out of 10

        if ($finalMark >= 9) {
            $grade = 'A';
        } elseif ($finalMark >= 7) {
            $grade = 'B';
        } elseif ($finalMark >= 5) {
            $grade = 'C';
        } else {
            $grade = 'F';
        }

        Log::info('Final Project graded', [
            'user_id'       => $userId,
            'coding_marks'  => $codingMarks,
            'mcq_marks'     => $mcqMarks,
            'tf_marks'      => $tfMarks,
            'final_mark'    => $finalMark,
            'grade'         => $grade,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Project submission evaluated',
            'data'    => [
                'final_mark'   => $finalMark,
                'grade'        => $grade,
                'coding_marks' => $codingMarks,
                'mcq_marks'    => $mcqMarks,
                'tf_marks'     => $tfMarks,
            ],
        ], 200);
    }
}
