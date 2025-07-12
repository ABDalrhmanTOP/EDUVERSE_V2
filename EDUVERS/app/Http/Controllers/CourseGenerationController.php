<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class CourseGenerationController extends Controller
{
    /**
     * Generate course content from YouTube URL
     */
    public function generateCourse(Request $request): JsonResponse
    {
        // Set PHP execution time to 5 minutes for AI processing
        set_time_limit(300);
        ini_set('max_execution_time', 300);

        // Validate input
        $validator = Validator::make($request->all(), [
            'youtube_url' => 'required|url',
            'timestamp' => 'required|string|regex:/^\d{2}:\d{2}:\d{2}$/',
            'video_title' => 'nullable|string',
            'video_description' => 'nullable|string',
            'video_channel' => 'nullable|string',
            'video_published' => 'nullable|string',
            'video_captions' => 'nullable|string',
            'video_duration' => 'nullable|string|regex:/^\d{2}:\d{2}:\d{2}$/',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Get n8n webhook URL from environment
            $n8nWebhookUrl = env('N8N_WEBHOOK_URL', 'http://localhost:5680/webhook-test/generate-course-content');

            // Clean and prepare captions data
            $captions = $request->video_captions;
            if ($captions) {
                // Remove duplicate lines and clean captions
                $lines = explode("\n", $captions);
                $uniqueLines = array_unique(array_filter($lines, 'trim'));
                $captions = implode("\n", $uniqueLines);

                // Clean captions: remove special characters that might break JSON
                $captions = preg_replace('/[\x00-\x1F\x7F]/', '', $captions); // Remove control characters
                $captions = preg_replace('/\s+/', ' ', $captions); // Normalize whitespace
                $captions = trim($captions);

                // Limit captions length to prevent JSON size issues
                if (strlen($captions) > 30000) {
                    $captions = substr($captions, 0, 30000) . '... [truncated]';
                }
            }

            // Prepare data for n8n workflow
            $workflowData = [
                'youtube_url' => $request->youtube_url,
                'timestamp' => $request->timestamp, // Course duration timestamp
                'request_id' => uniqid('course_gen_'),
                'request_timestamp' => now()->toISOString(), // Request time
                // Include video metadata for AI analysis
                'video_title' => $request->video_title,
                'video_description' => $request->video_description,
                'video_channel' => $request->video_channel,
                'video_published' => $request->video_published,
                'video_captions' => $captions,
                'video_duration' => $request->video_duration, // Course duration for timestamp validation
            ];

            // Log the data being sent to n8n for debugging
            Log::info('Sending data to n8n workflow', [
                'workflow_data_keys' => array_keys($workflowData),
                'has_captions' => !empty($captions),
                'captions_length' => $captions ? strlen($captions) : 0,
                'has_title' => !empty($request->video_title),
                'has_description' => !empty($request->video_description),
                'has_duration' => !empty($request->video_duration),
            ]);

            // Validate JSON before sending
            $jsonData = json_encode($workflowData);
            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('JSON encoding error', [
                    'error' => json_last_error_msg(),
                    'data_keys' => array_keys($workflowData)
                ]);
                throw new \Exception('Invalid data format: ' . json_last_error_msg());
            }

            Log::info('JSON validation passed', ['json_length' => strlen($jsonData)]);

            // Trigger n8n workflow with extended timeout for AI processing
            $response = Http::timeout(300)->post($n8nWebhookUrl, $workflowData);

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Course generation started successfully! The AI is analyzing the video and creating content. This may take a few minutes.',
                    'request_id' => $workflowData['request_id'],
                    'status' => 'processing'
                ]);
            } else {
                Log::error('N8N workflow trigger failed', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                    'data' => $workflowData
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to trigger course generation',
                    'error' => $response->body()
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Course generation error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Internal server error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check course generation status
     */
    public function checkStatus(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'request_id' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Request ID is required'
            ], 422);
        }

        // TODO: Implement status checking logic
        // This could involve checking a database table for workflow status
        // or implementing a callback mechanism from n8n

        return response()->json([
            'success' => true,
            'status' => 'processing', // or 'completed', 'failed'
            'message' => 'Status check endpoint - implement based on your needs'
        ]);
    }

    /**
     * Get admin token for n8n workflow
     */
    public function getAdminToken(Request $request): JsonResponse
    {
        try {
            // Create a token for admin user (you might want to use a specific admin user ID)
            $adminUser = \App\Models\User::where('role', 'admin')->first();

            if (!$adminUser) {
                return response()->json([
                    'success' => false,
                    'message' => 'No admin user found'
                ], 404);
            }

            // Create a new token
            $token = $adminUser->createToken('n8n-workflow-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'token' => $token,
                'message' => 'Admin token generated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Admin token generation error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate admin token',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get generated course data
     */
    public function getGeneratedCourse(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'request_id' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Request ID is required'
            ], 422);
        }

        try {
            // For now, we'll return the most recently created course
            // In a production system, you'd want to track the request_id and return the specific course
            $latestCourse = \App\Models\Playlist::with('tasks')
                ->orderBy('created_at', 'desc')
                ->first();

            if (!$latestCourse) {
                return response()->json([
                    'success' => false,
                    'message' => 'No generated course found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Generated course data retrieved successfully',
                'course' => [
                    'name' => $latestCourse->name,
                    'description' => $latestCourse->description,
                    'video_id' => $latestCourse->video_id,
                    'video_duration' => $latestCourse->video_duration,
                    'year' => $latestCourse->year,
                    'semester' => $latestCourse->semester,
                    'paid' => $latestCourse->paid,
                    'tasks' => $latestCourse->tasks
                ],
                'courseAnalysis' => [
                    'difficulty' => 'intermediate', // This would come from AI analysis
                    'mainTopics' => ['Computer Science', 'Programming'],
                    'prerequisites' => ['Basic programming knowledge'],
                    'learningObjectives' => ['Understand core concepts', 'Apply practical skills']
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Get generated course error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve generated course data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
