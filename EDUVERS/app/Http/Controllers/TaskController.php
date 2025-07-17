<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TaskController extends Controller
{
    public function index()
    {
        $tasks = Task::with('playlist')->get();
        return response()->json($tasks);
    }

    public function adminIndex()
    {
        $tasks = Task::with('playlist')->get();
        return response()->json($tasks);
    }

    public function getTasks($playlistId)
    {
        $tasks = Task::where('playlist_id', $playlistId)->with('playlist')->get();

        if ($tasks->isEmpty()) {
            return response()->json(['message' => 'No tasks found'], 404);
        }

        return response()->json($tasks);
    }

    public function evaluateCode(Request $request)
    {
        try {
            $request->validate([
                'source_code' => 'required|string',
                'language_id' => 'required|integer',
                'test_cases' => 'required|array',
                'test_cases.*.input' => 'required|string',
                'test_cases.*.output' => 'required|string',
            ]);

            $sourceCode = $request->input('source_code');
            $languageId = $request->input('language_id');
            $testCases = $request->input('test_cases');

            // Prepare test cases for Judge0
            $testInputs = [];
            $expectedOutputs = [];
            foreach ($testCases as $testCase) {
                $testInputs[] = $testCase['input'];
                $expectedOutputs[] = trim($testCase['output']);
            }

            // Submit code to Judge0
            $response = Http::post('http://localhost:2358/submissions', [
                'source_code' => $sourceCode,
                'language_id' => $languageId,
                'stdin' => implode("\n", $testInputs),
            ]);

            if (!$response->successful()) {
                return response()->json(['error' => 'Failed to submit code to Judge0'], 500);
            }

            $submission = $response->json();
            $token = $submission['token'];

            // Wait for compilation and execution
            sleep(2);

            // Get results
            $resultResponse = Http::get("http://localhost:2358/submissions/{$token}");
            if (!$resultResponse->successful()) {
                return response()->json(['error' => 'Failed to get execution results'], 500);
            }

            $result = $resultResponse->json();
            $status = $result['status']['id'];

            // Handle different status codes
            if ($status === 1 || $status === 2) {
                // Still processing, wait a bit more
                sleep(1);
                $resultResponse = Http::get("http://localhost:2358/submissions/{$token}");
                $result = $resultResponse->json();
                $status = $result['status']['id'];
            }

            if ($status === 3) {
                // Success - check output
                $output = trim($result['stdout']);
                $actualOutputs = explode("\n", $output);
                $actualOutputs = array_map('trim', $actualOutputs);

                $passed = 0;
                $total = count($expectedOutputs);
                $results = [];

                for ($i = 0; $i < $total; $i++) {
                    $expected = $expectedOutputs[$i];
                    $actual = isset($actualOutputs[$i]) ? $actualOutputs[$i] : '';
                    $isCorrect = ($expected === $actual);
                    if ($isCorrect) $passed++;

                    $results[] = [
                        'test_case' => $i + 1,
                        'input' => $testCases[$i]['input'],
                        'expected' => $expected,
                        'actual' => $actual,
                        'passed' => $isCorrect
                    ];
                }

                return response()->json([
                    'success' => true,
                    'passed' => $passed,
                    'total' => $total,
                    'results' => $results
                ]);
            } elseif ($status === 4) {
                // Compilation Error
                $errorDetails = $result['compile_output'] ?? 'Compilation failed';
                return response()->json([
                    'success' => false,
                    'error' => 'Compilation Error',
                    'details' => $errorDetails
                ]);
            } elseif ($status === 5) {
                // Runtime Error
                $errorDetails = $result['stderr'] ?? 'Runtime error occurred';
                return response()->json([
                    'success' => false,
                    'error' => 'Runtime Error',
                    'details' => $errorDetails
                ]);
            } else {
                // Other errors
                return response()->json([
                    'success' => false,
                    'error' => 'Execution Error',
                    'details' => 'Unknown error occurred during execution'
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Server Error',
                'details' => 'An error occurred while processing your request'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'playlist_id' => 'required|integer',
                'video_id' => 'required|string',
                'timestamp' => [
                    'required',
                    'string',
                    function ($attribute, $value, $fail) use ($request) {
                        // Validate format hh:mm:ss
                        if (!preg_match('/^([0-9]{1,2}):([0-5][0-9]):([0-5][0-9])$/', $value)) {
                            $fail('Timestamp must be in hh:mm:ss format.');
                            return;
                        }
                        $exists = Task::where('playlist_id', $request->playlist_id)
                            ->where('timestamp', $value)
                            ->exists();
                        if ($exists) {
                            $fail('The timestamp must be unique for this course.');
                            return;
                        }
                        // Validate timestamp < video duration (if provided)
                        if ($request->has('video_duration')) {
                            $duration = $this->convertTimestampToSeconds($request->video_duration);
                            $ts = $this->convertTimestampToSeconds($value);
                            if ($ts >= $duration) {
                                $fail('Task timestamp must be less than the course video duration.');
                            }
                        }
                    },
                ],
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'prompt' => 'nullable|string',
                'expected_output' => 'nullable|string',
                'syntax_hint' => 'nullable|string',
                'type' => 'required|string',
                'options' => 'nullable|json',
                'question' => 'nullable|string',
                'correct_answer' => 'nullable',
                'tf_question' => 'nullable|string',
                'tf_answer' => 'nullable',
                'coding_question' => 'nullable|string',
                'coding_test_cases' => 'nullable|json',
                'coding_solution' => 'nullable|string',
                'coding_language' => 'nullable|string',
                'points' => 'nullable|integer',
            ]);

            $task = Task::create($validated);

            return response()->json($task, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create task',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $task = Task::findOrFail($id);
            $task->delete();

            return response()->json([
                'success' => true,
                'message' => 'Task deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete task'
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);
        $validated = $request->validate([
            'playlist_id' => 'sometimes|integer',
            'video_id' => 'sometimes|string',
            'timestamp' => [
                'sometimes',
                'string',
                function ($attribute, $value, $fail) use ($request, $id, $task) {
                    // Validate format hh:mm:ss
                    if (!preg_match('/^([0-9]{1,2}):([0-5][0-9]):([0-5][0-9])$/', $value)) {
                        $fail('Timestamp must be in hh:mm:ss format.');
                        return;
                    }
                    $playlistId = $request->playlist_id ?? $task->playlist_id;
                    $exists = Task::where('playlist_id', $playlistId)
                        ->where('timestamp', $value)
                        ->where('id', '!=', $id)
                        ->exists();
                    if ($exists) {
                        $fail('The timestamp must be unique for this course.');
                        return;
                    }
                    // Validate timestamp < video duration (if provided)
                    if ($request->has('video_duration')) {
                        $duration = $this->convertTimestampToSeconds($request->video_duration);
                        $ts = $this->convertTimestampToSeconds($value);
                        if ($ts >= $duration) {
                            $fail('Task timestamp must be less than the course video duration.');
                        }
                    }
                },
            ],
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'prompt' => 'nullable|string',
            'expected_output' => 'nullable|string',
            'syntax_hint' => 'nullable|string',
            'type' => 'sometimes|string',
            'options' => 'nullable|json',
            'question' => 'nullable|string',
            'correct_answer' => 'nullable',
            'tf_question' => 'nullable|string',
            'tf_answer' => 'nullable',
            'coding_question' => 'nullable|string',
            'coding_test_cases' => 'nullable|json',
            'coding_solution' => 'nullable|string',
            'coding_language' => 'nullable|string',
            'points' => 'nullable|integer',
        ]);

        $task->update($validated);

        return response()->json($task);
    }

    // Helper to convert hh:mm:ss to seconds
    private function convertTimestampToSeconds($timestamp)
    {
        $parts = explode(':', $timestamp);
        $seconds = 0;
        if (count($parts) === 3) {
            $seconds += (int)$parts[0] * 3600; // hours
            $seconds += (int)$parts[1] * 60;   // minutes
            $seconds += (int)$parts[2];        // seconds
        } elseif (count($parts) === 2) {
            $seconds += (int)$parts[0] * 60;
            $seconds += (int)$parts[1];
        } else {
            $seconds += (int)$parts[0];
        }
        return $seconds;
    }
}
