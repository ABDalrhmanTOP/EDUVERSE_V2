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
        // Validate input
        $validator = Validator::make($request->all(), [
            'youtube_url' => 'required|url',
            'timestamp' => 'required|string|regex:/^\d{2}:\d{2}:\d{2}$/',
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

            // Prepare data for n8n workflow
            $workflowData = [
                'youtube_url' => $request->youtube_url,
                'timestamp' => $request->timestamp, // Course duration timestamp
                'request_id' => uniqid('course_gen_'),
                'request_timestamp' => now()->toISOString() // Request time
            ];

            // Trigger n8n workflow
            $response = Http::timeout(30)->post($n8nWebhookUrl, $workflowData);

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Course generation started successfully',
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

        // TODO: Implement logic to retrieve generated course data
        // This would fetch the course, placement test, tasks, etc. from database

        return response()->json([
            'success' => true,
            'message' => 'Course data retrieval endpoint - implement based on your needs'
        ]);
    }
}
