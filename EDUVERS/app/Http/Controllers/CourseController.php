<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Playlist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Services\NotificationService;
use App\Models\UserCourseUnlock;
use App\Models\Subscription;
use Illuminate\Support\Facades\Auth;


class CourseController extends Controller
{
    // Fetch all courses
    public function index()
    {
        $user = Auth::user();
        $courses = Playlist::with('tasks')->get();
        $courses = $courses->map(function ($course) use ($user) {
            $is_unlocked = false;
            if ($user) {
                $is_unlocked = $user->unlockedCourses()->where('playlists.id', $course->id)->exists();
            }
            $courseArray = $course->toArray();
            $courseArray['is_unlocked'] = $is_unlocked;

            // إضافة معلومات إضافية للكورسات المدفوعة
            if ($course->paid) {
                $courseArray['requires_subscription'] = true;
                $courseArray['subscription_required'] = true;
            } else {
                $courseArray['requires_subscription'] = false;
                $courseArray['subscription_required'] = false;
            }

            return $courseArray;
        });
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

        $is_unlocked = false;
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user) {
            $is_unlocked = $user->unlockedCourses()->where('playlists.id', $playlist->id)->exists();
        }

        $playlistData = $playlist->toArray();
        $playlistData['is_unlocked'] = $is_unlocked;

        // إضافة معلومات إضافية للكورسات المدفوعة
        if ($playlist->paid) {
            $playlistData['requires_subscription'] = true;
            $playlistData['subscription_required'] = true;
        } else {
            $playlistData['requires_subscription'] = false;
            $playlistData['subscription_required'] = false;
        }

        return response()->json($playlistData);
    }

    // Unlock a paid course for the user
    public function unlockCourse(Request $request, $courseId)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $playlist = Playlist::find($courseId);
        if (!$playlist) {
            return response()->json(['error' => 'Course not found'], 404);
        }

        if (!$playlist->paid) {
            return response()->json(['message' => 'This course is free.'], 200);
        }

        // تحسين فحص الاشتراك
        $subscription = \App\Models\Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->where('end_date', '>', now())
            ->first();

        if (!$subscription) {
            return response()->json(['error' => 'No active subscription found.'], 403);
        }

        if ($subscription->allowed_courses <= 0) {
            return response()->json(['error' => 'No course credits available.'], 403);
        }

        if ($user->unlockedCourses()->where('playlists.id', $courseId)->exists()) {
            return response()->json(['message' => 'Course already unlocked.']);
        }

        $used = $user->unlockedCourses()->count();
        if ($used >= $subscription->allowed_courses) {
            return response()->json(['error' => 'You have used all your course credits.'], 403);
        }

        // فتح الكورس وتقليل عدد الكورسات المسموحة
        $user->unlockedCourses()->attach($courseId, ['unlocked_at' => now()]);
        $subscription->decrement('allowed_courses');

        return response()->json(['message' => 'Course unlocked successfully!']);
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
}
