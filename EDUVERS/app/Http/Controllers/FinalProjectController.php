<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            'code_solution' => 'required|string',
            'mcq_answers'   => 'required|array',
            'tf_answers'    => 'required|array',
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

        // --- 1. Call Judge0 API to compile/execute the code ---
        $judge0Url = "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true";
        $encodedCode = base64_encode($validated['code_solution']);

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
            return response()->json(['error' => 'Failed to submit code to Judge0'], 500);
        }

        $judgeData = $judge0Response->json();
        $judgeScore = (isset($judgeData['status']) && $judgeData['status']['id'] == 3) ? 5 : 0;

        // --- 2. Run static analysis ---
        $code = $validated['code_solution'];
        $staticAnalysisScore = $this->runStaticAnalysis($code); // returns 0-3
        $codingMarks = min($judgeScore + $staticAnalysisScore, 5);

        // --- 3. Grade MCQ section ---
        $mcqKey = ['q1' => 'C', 'q2' => 'C'];
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

        // --- 4. Grade True/False section ---
        $tfKey = ['q1' => 'false', 'q2' => 'true'];
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

        // Final mark calculation (out of 10)
        $finalMark = $codingMarks + $mcqMarks + $tfMarks;
        if ($finalMark >= 9) {
            $grade = 'A';
        } elseif ($finalMark >= 7) {
            $grade = 'B';
        } elseif ($finalMark >= 5) {
            $grade = 'C';
        } else {
            $grade = 'F';
        }

        // Define an ideal correct code solution (sample answer)
        $correctCode = <<<CODE
#include <iostream>
#include <vector>
#include <string>
using namespace std;

class Person {
private:
    string name;
    int age;
public:
    Person(string n, int a): name(n), age(a) {}
    string getName() { return name; }
    int getAge() { return age; }
    void printInfo() {
        cout << "Name: " << name << ", Age: " << age << endl;
    }
};

class Student : public Person {
private:
    vector<string> courses;
public:
    Student(string n, int a): Person(n, a) {}
    void addCourse(string course) {
        courses.push_back(course);
    }
    void printCourses() {
        cout << "Courses: ";
        for (auto &c : courses) {
            cout << c << " ";
        }
        cout << endl;
    }
};

int main() {
    Student s("John Doe", 21);
    s.addCourse("Math");
    s.addCourse("Computer Science");
    s.addCourse("Physics");
    s.printInfo();
    s.printCourses();
    return 0;
}
CODE;

        // --- 5. Link submission with user progress ---
        $userProgress = \App\Models\UserProgress::where('user_id', $userId)
            ->where('video_id', $validated['video_id'])
            ->where('playlist_id', $validated['playlist_id'])
            ->first();

        if (!$userProgress) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User progress record not found for final project submission.',
            ], 404);
        }

        // --- 6. Store final project submission ---
        try {
            $submission = FinalProjectSubmission::create([
                'user_progress_id' => $userProgress->id,
                'code_solution'    => $validated['code_solution'],
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
                'correct_mcq'      => $mcqKey,
                'correct_tf'       => $tfKey,
                'correct_code'     => $correctCode,
                'submission_id'    => $submission->id,
                'user_progress_id' => $userProgress->id,
            ],
        ], 200);
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
