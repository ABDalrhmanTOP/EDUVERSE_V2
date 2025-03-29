<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TaskController extends Controller
{
    public function getTasks($playlistId)
    {
        $tasks = Task::where('playlist_id', $playlistId)->get();

        if ($tasks->isEmpty()) {
            return response()->json(['message' => 'No tasks found'], 404);
        }

        return response()->json($tasks);
    }

    public function evaluateCode(Request $request)
    {
        Log::info('Evaluate code endpoint hit', ['data' => $request->all()]);

        // Validate incoming request
        $request->validate([
            'code' => 'required|string|min:1',
            'language_id' => 'required|integer',
            'task_id' => 'required|integer',
        ]);

        try {
            // Fetch the task
            $task = Task::findOrFail($request->task_id);
            $encodedCode = base64_encode($request->code);

            // Send code to Judge0 API
            $response = Http::withHeaders([
                'X-RapidAPI-Host' => 'judge0-ce.p.rapidapi.com',
                'X-RapidAPI-Key' => env('JUDGE0_API_KEY'),
            ])->withOptions(['verify' => false])
                ->post('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true', [
                    'source_code' => $encodedCode,
                    'language_id' => $request->language_id,
                    'stdin' => '',
                ]);

            Log::info('Judge0 API Response', ['response' => $response->json()]);
            $responseData = $response->json();

            // Handle API errors
            if ($response->failed() || $response->status() >= 400) {
                return $this->handleApiError($responseData);
            }

            // Parse outputs
            $stdout = isset($responseData['stdout']) ? base64_decode($responseData['stdout']) : null;

            if ($stdout === null) {
                // Handle no output received
                return $this->handleNoOutput($responseData);
            }

            // Compare output with expected result
            if (trim($stdout) === trim($task->expected_output)) {
                return response()->json(['success' => true, 'message' => 'Correct!', 'output' => $stdout]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Incorrect output.',
                    'expected' => $task->expected_output,
                    'received' => $stdout,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Error in evaluateCode method', [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'An unexpected error occurred.', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Simplify and handle API errors.
     */
    private function handleApiError($responseData)
    {
        $compile_output = isset($responseData['compile_output']) ? base64_decode($responseData['compile_output']) : null;
        $stderr = isset($responseData['stderr']) ? base64_decode($responseData['stderr']) : null;

        if ($compile_output) {
            $errorDetails = $this->simplifyError($compile_output, true);
            Log::error('Compilation Error', ['details' => $errorDetails]);
            return response()->json(['error' => 'Compilation Error', 'details' => $errorDetails], 400);
        }

        if ($stderr) {
            $errorDetails = $this->simplifyError($stderr, false);
            Log::error('Runtime Error', ['details' => $errorDetails]);
            return response()->json(['error' => 'Runtime Error', 'details' => $errorDetails], 400);
        }

        Log::error('Unknown Judge0 Error', ['response' => $responseData]);
        return response()->json(['error' => 'Unknown error occurred.', 'details' => 'Please try again later.'], 400);
    }

    /**
     * Handle missing outputs.
     */
    private function handleNoOutput($responseData)
    {
        $compile_output = isset($responseData['compile_output']) ? base64_decode($responseData['compile_output']) : null;
        $stderr = isset($responseData['stderr']) ? base64_decode($responseData['stderr']) : null;

        if ($compile_output) {
            $errorDetails = $this->simplifyError($compile_output, true);
            Log::error('Compilation Error', ['details' => $errorDetails]);
            return response()->json(['error' => 'Compilation Error', 'details' => $errorDetails], 400);
        }

        if ($stderr) {
            $errorDetails = $this->simplifyError($stderr, false);
            Log::error('Runtime Error', ['details' => $errorDetails]);
            return response()->json(['error' => 'Runtime Error', 'details' => $errorDetails], 400);
        }

        Log::error('No output received from code execution');
        return response()->json(['error' => 'No output received from code execution.'], 500);
    }

    /**
     * Simplify error messages for user-friendly display.
     */
    private function simplifyError($error, $isCompileError = false)
    {
        // Remove file references
        $error = preg_replace('/main\.cpp:\s?/', '', $error);

        // Extract and simplify error patterns
        $lines = explode("\n", $error);
        $simplifiedLines = [];

        foreach ($lines as $line) {
            if (preg_match('/(\d+):(\d+): (error|warning): (.+)/', $line, $matches)) {
                $lineNumber = $matches[1];
                $errorMessage = ucfirst($matches[4]);
                $simplifiedLines[] = "On line $lineNumber: $errorMessage";
            }
        }

        return implode("\n", $simplifiedLines);
    }
}
