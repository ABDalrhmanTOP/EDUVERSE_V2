<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Playlist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Services\NotificationService;

class CourseController extends Controller
{
    // Fetch all courses
    public function index()
    {
        $courses = Playlist::with('tasks')->get();
        return response()->json($courses);
    }

    public function adminIndex()
    {
        $courses = Playlist::with('tasks')->get();
        return response()->json($courses);
    }

    // Fetch single course by ID
    public function show($id)
    {
        $playlist = Playlist::with('tasks')->find($id);

        if (!$playlist) {
            return response()->json([
                'message' => 'Course not found'
            ], 404);
        }

        return response()->json($playlist);
    }

    // Add new course
    public function store(Request $request)
    {
        $validated = $request->validate([
            'video_id' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'year' => 'required|integer|min:1|max:4',
            'semester' => 'required|integer|min:1|max:2',
            'video_duration' => 'nullable|string|max:255',
            'tasks' => 'nullable|array',
            'paid' => 'sometimes|boolean',
        ]);

        // Check if course with this video_id already exists
        $existingCourse = Playlist::where('video_id', $validated['video_id'])->first();
        if ($existingCourse) {
            return response()->json([
                'message' => 'A course with this video ID already exists.',
                'error' => 'duplicate_video_id'
            ], 422);
        }

        // Create the playlist
        $playlist = Playlist::create([
            'video_id' => $validated['video_id'],
            'name' => $validated['name'],
            'description' => $validated['description'],
            'year' => $validated['year'],
            'semester' => $validated['semester'],
            'video_duration' => $validated['video_duration'] ?? null,
            'paid' => $validated['paid'] ?? false,
        ]);

        // Handle tasks if provided
        if (isset($validated['tasks']) && is_array($validated['tasks'])) {
            foreach ($validated['tasks'] as $taskData) {
                $task = new \App\Models\Task([
                    'playlist_id' => $playlist->id,
                    'title' => $taskData['title'],
                    'description' => $taskData['description'] ?? '',
                    'type' => $taskData['type'],
                    'timestamp' => $taskData['timestamp'] ?? '',
                    'points' => $taskData['points'] ?? 1,
                    'prompt' => $taskData['title'] ?? '', // Use title as prompt if no specific prompt
                    'expected_output' => null, // Set to null for now
                    'syntax_hint' => null, // Set to null for now
                ]);

                // Handle task type specific data
                switch ($taskData['type']) {
                    case 'mcq':
                        $task->question = $taskData['question'];
                        $task->options = json_encode($taskData['options']);
                        $task->correct_answer = $taskData['correct_answer'];
                        break;
                    case 'true_false':
                        $task->tf_question = $taskData['tf_question'];
                        $task->tf_answer = $taskData['tf_answer'];
                        break;
                    case 'CODE':
                        $task->coding_question = $taskData['coding_question'];
                        $task->coding_test_cases = json_encode($taskData['coding_test_cases']);
                        $task->coding_solution = $taskData['coding_solution'] ?? '';
                        $task->coding_language = $taskData['coding_language'] ?? 'javascript';
                        break;
                }

                $task->save();
            }
        }

        // Create notification for new course
        NotificationService::courseCreated($playlist);

        return response()->json($playlist->load('tasks'), 201);
    }

    public function update(Request $request, $id)
    {
        $playlist = Playlist::findOrFail($id);
        $validated = $request->validate([
            'video_id' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'year' => 'required|integer|min:1|max:4',
            'semester' => 'required|integer|min:1|max:2',
            'video_duration' => 'nullable|string|max:255',
            'tasks' => 'nullable|array',
            'paid' => 'sometimes|boolean',
        ]);

        // Check if course with this video_id already exists (excluding current course)
        $existingCourse = Playlist::where('video_id', $validated['video_id'])
            ->where('id', '!=', $id)
            ->first();
        if ($existingCourse) {
            return response()->json([
                'message' => 'A course with this video ID already exists.',
                'error' => 'duplicate_video_id'
            ], 422);
        }

        // Update the playlist
        $playlist->update([
            'video_id' => $validated['video_id'],
            'name' => $validated['name'],
            'description' => $validated['description'],
            'year' => $validated['year'],
            'semester' => $validated['semester'],
            'video_duration' => $validated['video_duration'] ?? null,
            'paid' => $validated['paid'] ?? false,
        ]);

        // Handle tasks if provided
        if (isset($validated['tasks']) && is_array($validated['tasks'])) {
            // Delete existing tasks
            $playlist->tasks()->delete();

            // Create new tasks
            foreach ($validated['tasks'] as $taskData) {
                $task = new \App\Models\Task([
                    'playlist_id' => $playlist->id,
                    'title' => $taskData['title'],
                    'description' => $taskData['description'] ?? '',
                    'type' => $taskData['type'],
                    'timestamp' => $taskData['timestamp'] ?? '',
                    'points' => $taskData['points'] ?? 1,
                    'prompt' => $taskData['title'] ?? '', // Use title as prompt if no specific prompt
                    'expected_output' => null, // Set to null for now
                    'syntax_hint' => null, // Set to null for now
                ]);

                // Handle task type specific data
                switch ($taskData['type']) {
                    case 'mcq':
                        $task->question = $taskData['question'];
                        $task->options = json_encode($taskData['options']);
                        $task->correct_answer = $taskData['correct_answer'];
                        break;
                    case 'true_false':
                        $task->tf_question = $taskData['tf_question'];
                        $task->tf_answer = $taskData['tf_answer'];
                        break;
                    case 'CODE':
                        $task->coding_question = $taskData['coding_question'];
                        $task->coding_test_cases = json_encode($taskData['coding_test_cases']);
                        $task->coding_solution = $taskData['coding_solution'] ?? '';
                        $task->coding_language = $taskData['coding_language'] ?? 'javascript';
                        break;
                }

                $task->save();
            }
        }

        return response()->json($playlist->load('tasks'));
    }

    public function destroy($id)
    {
        $playlist = Playlist::findOrFail($id);
        $playlist->delete();
        return response()->json(['message' => 'Course deleted successfully']);
    }

    // Test method to verify video duration endpoint
    public function testVideoDuration($videoId)
    {
        return response()->json([
            'video_id' => $videoId,
            'length' => strlen($videoId),
            'is_valid' => preg_match('/^[a-zA-Z0-9_-]{11}$/', $videoId),
            'message' => 'Test endpoint working'
        ]);
    }

    // Get video duration from YouTube using direct cURL
    public function getVideoDuration($videoId)
    {
        try {
            // Method 1: YouTube Data API
            $duration = $this->fetchFromYouTubeAPI($videoId);
            if ($duration) {
                return response()->json(['duration' => $duration]);
            }

            // Method 2: Third-party service
            $duration = $this->fetchFromThirdPartyService($videoId);
            if ($duration) {
                return response()->json(['duration' => $duration]);
            }

            // Method 3: Enhanced page scraping
            $duration = $this->scrapeVideoPageWithHeaders($videoId);
            if ($duration) {
                return response()->json(['duration' => $duration]);
            }

            // Fallback to default duration
            return response()->json(['duration' => 'PT10M']);
        } catch (\Exception $e) {
            return response()->json(['duration' => 'PT10M'], 200);
        }
    }

    // Helper method to fetch data using cURL with SSL verification disabled
    private function fetchWithCurl($url)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_MAXREDIRS, 3);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($response && $httpCode === 200) {
            $data = json_decode($response, true);
            if (isset($data['duration'])) {
                return $data['duration'];
            }

            if (isset($data['title'])) {
                $title = $data['title'];
                if (preg_match('/(\d+):(\d+)/', $title, $matches)) {
                    $minutes = intval($matches[1]);
                    $seconds = intval($matches[2]);
                    return "PT{$minutes}M{$seconds}S";
                }
            }
        }

        return null;
    }

    // Helper method to scrape video page with proper headers
    private function scrapeVideoPageWithHeaders($videoId)
    {
        $url = "https://www.youtube.com/watch?v={$videoId}";

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_MAXREDIRS, 5);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language: en-US,en;q=0.5',
            'Accept-Encoding: gzip, deflate',
            'Connection: keep-alive',
            'Upgrade-Insecure-Requests: 1',
        ]);

        $html = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($httpCode === 200 && $html && !$error) {
            // Look for duration patterns in the HTML
            if (preg_match('/"lengthSeconds":"(\d+)"/', $html, $matches)) {
                $totalSeconds = intval($matches[1]);
                $hours = floor($totalSeconds / 3600);
                $minutes = floor(($totalSeconds % 3600) / 60);
                $seconds = $totalSeconds % 60;

                $duration = "PT";
                if ($hours > 0) $duration .= "{$hours}H";
                if ($minutes > 0) $duration .= "{$minutes}M";
                if ($seconds > 0) $duration .= "{$seconds}S";

                return $duration;
            }

            // Alternative patterns
            if (preg_match('/"duration":"PT(\d+H)?(\d+M)?(\d+S)?"/', $html, $matches)) {
                $duration = "PT";
                if (isset($matches[1])) $duration .= $matches[1];
                if (isset($matches[2])) $duration .= $matches[2];
                if (isset($matches[3])) $duration .= $matches[3];

                return $duration;
            }

            if (preg_match('/"length_seconds":"(\d+)"/', $html, $matches)) {
                $totalSeconds = intval($matches[1]);
                $hours = floor($totalSeconds / 3600);
                $minutes = floor(($totalSeconds % 3600) / 60);
                $seconds = $totalSeconds % 60;

                $duration = "PT";
                if ($hours > 0) $duration .= "{$hours}H";
                if ($minutes > 0) $duration .= "{$minutes}M";
                if ($seconds > 0) $duration .= "{$seconds}S";

                return $duration;
            }

            // New pattern: look for "approxDurationMs"
            if (preg_match('/"approxDurationMs":"(\d+)"/', $html, $matches)) {
                $milliseconds = intval($matches[1]);
                $totalSeconds = floor($milliseconds / 1000);
                $hours = floor($totalSeconds / 3600);
                $minutes = floor(($totalSeconds % 3600) / 60);
                $seconds = $totalSeconds % 60;

                $duration = "PT";
                if ($hours > 0) $duration .= "{$hours}H";
                if ($minutes > 0) $duration .= "{$minutes}M";
                if ($seconds > 0) $duration .= "{$seconds}S";

                return $duration;
            }
        }

        return null;
    }

    // Helper method to estimate video duration based on video type
    private function estimateVideoDuration($videoId)
    {
        // For now, let's use a simple approach: return a reasonable duration
        // This is better than the default 10 minutes for most educational videos

        // Most Laravel tutorials are between 15-45 minutes
        // Let's use 25 minutes as a reasonable estimate
        $estimatedMinutes = 25;

        return "PT{$estimatedMinutes}M0S";
    }

    // Helper method to convert duration to ISO 8601 format
    private function convertToISO8601($duration)
    {
        // Handle various duration formats
        if (is_numeric($duration)) {
            // Duration in seconds
            $hours = floor($duration / 3600);
            $minutes = floor(($duration % 3600) / 60);
            $seconds = $duration % 60;

            $result = "PT";
            if ($hours > 0) $result .= "{$hours}H";
            if ($minutes > 0) $result .= "{$minutes}M";
            if ($seconds > 0) $result .= "{$seconds}S";

            return $result;
        }

        // If it's already in ISO format, return as is
        if (preg_match('/^PT\d+H?\d+M?\d+S?$/', $duration)) {
            return $duration;
        }

        // Default fallback
        return 'PT10M0S';
    }

    // Helper method to fetch duration from YouTube Data API
    private function fetchFromYouTubeAPI($videoId)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://www.googleapis.com/youtube/v3/videos?id={$videoId}&part=contentDetails&key=" . env('YOUTUBE_API_KEY'));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($httpCode === 200 && $response && !$error) {
            $data = json_decode($response, true);

            if (isset($data['items'][0]['contentDetails']['duration'])) {
                $duration = $data['items'][0]['contentDetails']['duration'];
                return $duration;
            }
        }

        return null;
    }

    // Helper method to fetch from a working third-party service
    private function fetchFromThirdPartyService($videoId)
    {
        // Try multiple working services
        $services = [
            "https://www.youtube.com/oembed?url=" . urlencode("https://www.youtube.com/watch?v={$videoId}") . "&format=json",
            "https://noembed.com/embed?url=" . urlencode("https://www.youtube.com/watch?v={$videoId}") . "&format=json",
            "https://api.vevioz.com/@api/oembed/?url=" . urlencode("https://www.youtube.com/watch?v={$videoId}")
        ];

        foreach ($services as $serviceUrl) {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $serviceUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode === 200 && $response) {
                $data = json_decode($response, true);

                if (isset($data['duration'])) {
                    return $this->convertToISO8601($data['duration']);
                }
            }
        }

        return null;
    }

    // Helper method for enhanced page scraping
    private function scrapeVideoPageEnhanced($videoId)
    {
        $url = "https://www.youtube.com/watch?v={$videoId}";

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_MAXREDIRS, 10);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language: en-US,en;q=0.9',
            'Accept-Encoding: gzip, deflate, br',
            'Cache-Control: no-cache',
            'Pragma: no-cache',
            'Sec-Ch-Ua: "Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'Sec-Ch-Ua-Mobile: ?0',
            'Sec-Ch-Ua-Platform: "Windows"',
            'Sec-Fetch-Dest: document',
            'Sec-Fetch-Mode: navigate',
            'Sec-Fetch-Site: none',
            'Sec-Fetch-User: ?1',
            'Upgrade-Insecure-Requests: 1',
        ]);

        $html = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($httpCode === 200 && $html && !$error) {
            // Look for multiple duration patterns
            $patterns = [
                '/"lengthSeconds":"(\d+)"/',
                '/"duration":"PT(\d+H)?(\d+M)?(\d+S)?"/',
                '/"length_seconds":"(\d+)"/',
                '/"approxDurationMs":"(\d+)"/',
                '/"duration":"(\d+):(\d+)"/',
                '/"duration":"(\d+):(\d+):(\d+)"/'
            ];

            foreach ($patterns as $pattern) {
                if (preg_match($pattern, $html, $matches)) {
                    if (isset($matches[1]) && is_numeric($matches[1])) {
                        // Handle seconds format
                        if (strlen($matches[1]) > 3) {
                            // Likely milliseconds
                            $totalSeconds = floor(intval($matches[1]) / 1000);
                        } else {
                            // Likely seconds
                            $totalSeconds = intval($matches[1]);
                        }

                        $hours = floor($totalSeconds / 3600);
                        $minutes = floor(($totalSeconds % 3600) / 60);
                        $seconds = $totalSeconds % 60;

                        $duration = "PT";
                        if ($hours > 0) $duration .= "{$hours}H";
                        if ($minutes > 0) $duration .= "{$minutes}M";
                        if ($seconds > 0) $duration .= "{$seconds}S";

                        return $duration;
                    }
                }
            }
        }

        return null;
    }

    // Get video info (title, description, channel, captions) from YouTube
    public function getVideoInfo($videoId)
    {
        try {
            // Method 1: YouTube Data API (using your working key)
            $videoInfo = $this->fetchVideoInfoFromYouTubeAPI($videoId);
            if ($videoInfo) {
                // Try to fetch captions
                $captions = $this->fetchVideoCaptions($videoId);
                if ($captions) {
                    $videoInfo['captions'] = $captions;
                    Log::info('Captions fetched successfully', ['video_id' => $videoId, 'captions_length' => strlen($captions)]);
                } else {
                    Log::warning('No captions found', ['video_id' => $videoId]);
                }
                return response()->json($videoInfo);
            }

            // Method 2: Third-party service
            $videoInfo = $this->fetchVideoInfoFromThirdPartyService($videoId);
            if ($videoInfo) {
                // Try to fetch captions
                $captions = $this->fetchVideoCaptions($videoId);
                if ($captions) {
                    $videoInfo['captions'] = $captions;
                    Log::info('Captions fetched successfully', ['video_id' => $videoId, 'captions_length' => strlen($captions)]);
                } else {
                    Log::warning('No captions found', ['video_id' => $videoId]);
                }
                return response()->json($videoInfo);
            }

            // Method 3: Page scraping
            $videoInfo = $this->scrapeVideoInfoFromPage($videoId);
            if ($videoInfo) {
                // Try to fetch captions
                $captions = $this->fetchVideoCaptions($videoId);
                if ($captions) {
                    $videoInfo['captions'] = $captions;
                    Log::info('Captions fetched successfully', ['video_id' => $videoId, 'captions_length' => strlen($captions)]);
                } else {
                    Log::warning('No captions found', ['video_id' => $videoId]);
                }
                return response()->json($videoInfo);
            }

            // Fallback
            return response()->json([
                'title' => 'Course from YouTube Video',
                'description' => 'Educational course extracted from YouTube video content',
                'channel_title' => 'Unknown Channel',
                'captions' => null
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error in getVideoInfo', ['video_id' => $videoId, 'error' => $e->getMessage()]);
            return response()->json([
                'title' => 'Course from YouTube Video',
                'description' => 'Educational course extracted from YouTube video content',
                'channel_title' => 'Unknown Channel',
                'captions' => null
            ], 200);
        }
    }

    // Helper method to fetch video info from YouTube Data API
    private function fetchVideoInfoFromYouTubeAPI($videoId)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://www.googleapis.com/youtube/v3/videos?id={$videoId}&part=snippet&key=" . env('YOUTUBE_API_KEY'));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($httpCode === 200 && $response && !$error) {
            $data = json_decode($response, true);

            if (isset($data['items'][0]['snippet'])) {
                $snippet = $data['items'][0]['snippet'];
                return [
                    'title' => $snippet['title'],
                    'description' => $snippet['description'],
                    'channel_title' => $snippet['channelTitle'],
                    'published_at' => $snippet['publishedAt']
                ];
            }
        }

        return null;
    }

    // Helper method to fetch video info from third-party service
    private function fetchVideoInfoFromThirdPartyService($videoId)
    {
        $services = [
            "https://www.youtube.com/oembed?url=" . urlencode("https://www.youtube.com/watch?v={$videoId}") . "&format=json",
            "https://noembed.com/embed?url=" . urlencode("https://www.youtube.com/watch?v={$videoId}") . "&format=json"
        ];

        foreach ($services as $serviceUrl) {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $serviceUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode === 200 && $response) {
                $data = json_decode($response, true);

                if (isset($data['title'])) {
                    return [
                        'title' => $data['title'],
                        'description' => $data['description'] ?? 'No description available',
                        'channel_title' => $data['author_name'] ?? 'Unknown Channel',
                        'published_at' => null
                    ];
                }
            }
        }

        return null;
    }

    // Helper method to scrape video info from page
    private function scrapeVideoInfoFromPage($videoId)
    {
        $url = "https://www.youtube.com/watch?v={$videoId}";

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_MAXREDIRS, 5);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language: en-US,en;q=0.5',
            'Accept-Encoding: gzip, deflate',
            'Connection: keep-alive',
            'Upgrade-Insecure-Requests: 1',
        ]);

        $html = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200 && $html) {
            // Extract title
            if (preg_match('/<title>(.*?)<\/title>/', $html, $titleMatches)) {
                $title = trim($titleMatches[1]);
                // Remove " - YouTube" suffix
                $title = str_replace(' - YouTube', '', $title);
            } else {
                $title = 'Course from YouTube Video';
            }

            // Extract description (basic approach)
            $description = 'Educational course extracted from YouTube video content';

            return [
                'title' => $title,
                'description' => $description,
                'channel_title' => 'Unknown Channel',
                'published_at' => null
            ];
        }

        return null;
    }

    // Helper method to fetch video captions/CC from YouTube
    private function fetchVideoCaptions($videoId)
    {
        try {
            // Method 1: Try YouTube Data API captions endpoint
            $captions = $this->fetchCaptionsFromYouTubeAPI($videoId);
            if ($captions) {
                Log::info('Captions fetched via YouTube API', ['video_id' => $videoId]);
                return $captions;
            }

            // Method 2: Try third-party caption service
            $captions = $this->fetchCaptionsFromThirdPartyService($videoId);
            if ($captions) {
                Log::info('Captions fetched via third-party service', ['video_id' => $videoId]);
                return $captions;
            }

            // Method 3: Try scraping captions from page
            $captions = $this->scrapeCaptionsFromPage($videoId);
            if ($captions) {
                Log::info('Captions fetched via page scraping', ['video_id' => $videoId]);
                return $captions;
            }

            // Method 4: Generate basic transcript from video info
            $videoInfo = $this->fetchVideoInfoFromYouTubeAPI($videoId);
            if ($videoInfo && isset($videoInfo['title'])) {
                $basicTranscript = $this->generateBasicTranscript($videoInfo);
                if ($basicTranscript) {
                    Log::info('Generated basic transcript from video info', ['video_id' => $videoId]);
                    return $basicTranscript;
                }
            }

            Log::warning('No captions available for video', ['video_id' => $videoId]);
            return null;
        } catch (\Exception $e) {
            Log::error('Error fetching video captions: ' . $e->getMessage(), ['video_id' => $videoId]);
            return null;
        }
    }

    // Fetch captions using YouTube Data API
    private function fetchCaptionsFromYouTubeAPI($videoId)
    {
        // YouTube API captions endpoint requires OAuth2 authentication
        // This method will likely fail, but we'll try it anyway
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId={$videoId}&key=" . env('YOUTUBE_API_KEY'));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        Log::info('YouTube API captions response', [
            'video_id' => $videoId,
            'http_code' => $httpCode,
            'response' => substr($response, 0, 500)
        ]);

        if ($httpCode === 200 && $response && !$error) {
            $data = json_decode($response, true);

            if (isset($data['items']) && count($data['items']) > 0) {
                // Get the first available caption track
                $captionId = $data['items'][0]['id'];

                // Now fetch the actual caption content
                return $this->fetchCaptionContent($captionId);
            }
        }

        return null;
    }

    // Fetch actual caption content
    private function fetchCaptionContent($captionId)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://www.googleapis.com/youtube/v3/captions/{$captionId}?key=" . env('YOUTUBE_API_KEY'));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Accept: text/plain'
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($httpCode === 200 && $response && !$error) {
            return $response;
        }

        return null;
    }

    // Fetch captions from third-party service
    private function fetchCaptionsFromThirdPartyService($videoId)
    {
        $services = [
            "https://downsub.com/?url=" . urlencode("https://www.youtube.com/watch?v={$videoId}"),
            "https://www.downloadsubtitles.com/youtube_video.php?video_id={$videoId}",
            "https://www.yt-download.org/api/button/videos/{$videoId}",
            "https://www.y2mate.com/youtube/{$videoId}"
        ];

        foreach ($services as $serviceUrl) {
            Log::info('Trying third-party service', ['service' => $serviceUrl, 'video_id' => $videoId]);

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $serviceUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 15);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_MAXREDIRS, 5);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            Log::info('Third-party service response', [
                'service' => $serviceUrl,
                'http_code' => $httpCode,
                'response_length' => $response ? strlen($response) : 0
            ]);

            if ($httpCode === 200 && $response) {
                // Try to extract captions from the response
                $captions = $this->extractCaptionsFromHTML($response);
                if ($captions) {
                    Log::info('Successfully extracted captions from third-party service', [
                        'service' => $serviceUrl,
                        'captions_length' => strlen($captions)
                    ]);
                    return $captions;
                }
            }
        }

        Log::warning('No captions found from third-party services', ['video_id' => $videoId]);
        return null;
    }

    // Extract captions from HTML response
    private function extractCaptionsFromHTML($html)
    {
        // Look for common caption patterns in HTML
        $patterns = [
            '/<div[^>]*class="[^"]*caption[^"]*"[^>]*>(.*?)<\/div>/si',
            '/<span[^>]*class="[^"]*caption[^"]*"[^>]*>(.*?)<\/span>/si',
            '/<p[^>]*class="[^"]*subtitle[^"]*"[^>]*>(.*?)<\/p>/si',
            '/"captions":"(.*?)"/',
            '/"subtitles":"(.*?)"/'
        ];

        foreach ($patterns as $pattern) {
            if (preg_match_all($pattern, $html, $matches)) {
                $captions = [];
                foreach ($matches[1] as $match) {
                    $captions[] = strip_tags($match);
                }
                return implode(' ', $captions);
            }
        }

        return null;
    }

    // Scrape captions from YouTube page
    private function scrapeCaptionsFromPage($videoId)
    {
        $url = "https://www.youtube.com/watch?v={$videoId}";

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_MAXREDIRS, 5);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language: en-US,en;q=0.5',
            'Accept-Encoding: gzip, deflate',
            'Connection: keep-alive',
            'Upgrade-Insecure-Requests: 1',
        ]);

        $html = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        Log::info('Page scraping response', [
            'video_id' => $videoId,
            'http_code' => $httpCode,
            'html_length' => $html ? strlen($html) : 0
        ]);

        if ($httpCode === 200 && $html) {
            // Look for caption data in the page - try multiple patterns
            $patterns = [
                '/"captions":\s*({.*?})/s',
                '/"subtitles":\s*({.*?})/s',
                '/"captionTracks":\s*(\[.*?\])/s',
                '/"playerCaptionsTracklistRenderer":\s*({.*?})/s',
                '/"captionTracks":\s*\[(.*?)\]/s'
            ];

            foreach ($patterns as $pattern) {
                if (preg_match($pattern, $html, $matches)) {
                    Log::info('Found caption pattern', ['pattern' => $pattern, 'match_length' => strlen($matches[1])]);
                    $captionData = json_decode($matches[1], true);
                    if ($captionData) {
                        $result = $this->processCaptionData($captionData);
                        if ($result) {
                            Log::info('Successfully processed caption data', ['captions_length' => strlen($result)]);
                            return $result;
                        }
                    }
                }
            }

            // Try to extract from HTML elements
            $result = $this->extractCaptionsFromHTML($html);
            if ($result) {
                Log::info('Successfully extracted captions from HTML', ['captions_length' => strlen($result)]);
                return $result;
            }
        }

        Log::warning('No captions found in page scraping', ['video_id' => $videoId]);
        return null;
    }

    // Process caption data from various formats
    private function processCaptionData($captionData)
    {
        if (is_array($captionData)) {
            if (isset($captionData['playerCaptionsTracklistRenderer']['captionTracks'])) {
                $tracks = $captionData['playerCaptionsTracklistRenderer']['captionTracks'];
                foreach ($tracks as $track) {
                    if (isset($track['baseUrl'])) {
                        return $this->fetchCaptionFromUrl($track['baseUrl']);
                    }
                }
            } elseif (isset($captionData['captionTracks'])) {
                $tracks = $captionData['captionTracks'];
                foreach ($tracks as $track) {
                    if (isset($track['baseUrl'])) {
                        return $this->fetchCaptionFromUrl($track['baseUrl']);
                    }
                }
            }
        }

        return null;
    }

    // Fetch caption content from URL
    private function fetchCaptionFromUrl($url)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200 && $response) {
            // Parse XML caption format and extract text
            return $this->parseCaptionXML($response);
        }

        return null;
    }

    // Parse XML caption format
    private function parseCaptionXML($xml)
    {
        // Simple XML parsing for caption content
        $captions = [];

        // Remove XML tags and extract text
        $text = preg_replace('/<[^>]*>/', ' ', $xml);
        $text = preg_replace('/\s+/', ' ', $text);
        $text = trim($text);

        return $text;
    }

    // Generate basic transcript from video info when captions are not available
    private function generateBasicTranscript($videoInfo)
    {
        $transcript = '';

        if (isset($videoInfo['title'])) {
            $transcript .= "Video Title: " . $videoInfo['title'] . "\n\n";
        }

        if (isset($videoInfo['description'])) {
            $transcript .= "Video Description: " . $videoInfo['description'] . "\n\n";
        }

        if (isset($videoInfo['channel_title'])) {
            $transcript .= "Channel: " . $videoInfo['channel_title'] . "\n\n";
        }

        // Add some context about the video content based on title and description
        if (isset($videoInfo['title']) && isset($videoInfo['description'])) {
            $transcript .= "Content Summary: This video appears to be about " . $videoInfo['title'] . ". ";
            $transcript .= "The video description provides additional context about the content and topics covered. ";
            $transcript .= "This educational content can be used to create course materials and learning objectives.";
        }

        $result = trim($transcript);

        // Log what we're generating
        Log::info('Generated basic transcript', [
            'title' => $videoInfo['title'] ?? 'null',
            'description_length' => isset($videoInfo['description']) ? strlen($videoInfo['description']) : 0,
            'transcript_length' => strlen($result),
            'transcript_preview' => substr($result, 0, 200) . '...'
        ]);

        return $result;
    }

    // Test method for debugging captions
    public function testCaptions($videoId)
    {
        try {
            Log::info('Testing captions for video', ['video_id' => $videoId]);

            // Test all caption fetching methods
            $results = [
                'video_id' => $videoId,
                'youtube_api' => null,
                'third_party' => null,
                'page_scraping' => null,
                'final_result' => null
            ];

            // Test YouTube API method
            $captions = $this->fetchCaptionsFromYouTubeAPI($videoId);
            $results['youtube_api'] = $captions ? 'success' : 'failed';

            // Test third-party method
            $captions = $this->fetchCaptionsFromThirdPartyService($videoId);
            $results['third_party'] = $captions ? 'success' : 'failed';

            // Test page scraping method
            $captions = $this->scrapeCaptionsFromPage($videoId);
            $results['page_scraping'] = $captions ? 'success' : 'failed';

            // Test final method
            $captions = $this->fetchVideoCaptions($videoId);
            $results['final_result'] = $captions ? 'success' : 'failed';
            $results['captions_length'] = $captions ? strlen($captions) : 0;
            $results['captions_preview'] = $captions ? substr($captions, 0, 200) . '...' : null;

            Log::info('Caption test results', $results);

            return response()->json($results);
        } catch (\Exception $e) {
            Log::error('Caption test error', ['video_id' => $videoId, 'error' => $e->getMessage()]);
            return response()->json([
                'error' => $e->getMessage(),
                'video_id' => $videoId
            ], 500);
        }
    }

    // Debug method to see actual captions content
    public function debugCaptions($videoId)
    {
        try {
            Log::info('Debugging captions for video', ['video_id' => $videoId]);

            // Get video info first
            $videoInfo = $this->fetchVideoInfoFromYouTubeAPI($videoId);

            // Get captions
            $captions = $this->fetchVideoCaptions($videoId);

            $debugData = [
                'video_id' => $videoId,
                'video_info' => $videoInfo,
                'captions' => $captions,
                'captions_length' => $captions ? strlen($captions) : 0,
                'captions_preview' => $captions ? substr($captions, 0, 500) . '...' : null,
                'has_actual_captions' => $captions && !str_contains($captions, 'Video Title:'),
                'is_generated_transcript' => $captions && str_contains($captions, 'Video Title:')
            ];

            Log::info('Debug captions results', $debugData);

            return response()->json($debugData);
        } catch (\Exception $e) {
            Log::error('Debug captions error', ['video_id' => $videoId, 'error' => $e->getMessage()]);
            return response()->json([
                'error' => $e->getMessage(),
                'video_id' => $videoId
            ], 500);
        }
    }
}
