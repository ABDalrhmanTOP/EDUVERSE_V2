<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserCourseUnlock;
use App\Models\Playlist;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RecommendationController extends Controller
{
    public function exportUserCourses()
    {
        try {
            $data = UserCourseUnlock::select('user_id', 'course_id')->get();

            $transactions = [];
            foreach ($data as $row) {
                $transactions[$row->user_id][] = $row->course_id;
            }

            // حفظ كـ JSON في storage/app/transactions.json
            Storage::disk('local')->put('transactions.json', json_encode(array_values($transactions)));

            return response()->json(['status' => 'done', 'message' => 'Data exported successfully']);
        } catch (\Exception $e) {
            Log::error('Error exporting user courses: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => 'Failed to export data'], 500);
        }
    }

    public function getRecommendations($userId)
    {
        try {
            // Get courses unlocked by the user
            $userCourses = UserCourseUnlock::where('user_id', $userId)->pluck('course_id')->toArray();

            if (empty($userCourses)) {
                return response()->json(['recommendations' => [], 'message' => 'No courses found for user']);
            }

            // Get all association rules
            $rules = DB::table('recommendation_rules')->get();

            if ($rules->isEmpty()) {
                return response()->json(['recommendations' => [], 'message' => 'No recommendation rules found']);
            }

            $recommendations = [];
            foreach ($rules as $rule) {
                $antecedents = explode(',', $rule->antecedents);
                $consequents = explode(',', $rule->consequents);

                // If user has all antecedents
                if (count(array_intersect($antecedents, $userCourses)) == count($antecedents)) {
                    foreach ($consequents as $c) {
                        if (!in_array($c, $userCourses) && !in_array($c, $recommendations)) {
                            $recommendations[] = $c;
                        }
                    }
                }
            }

            // Get course details for recommendations
            $courseDetails = [];
            if (!empty($recommendations)) {
                $courses = Playlist::whereIn('id', $recommendations)->get(['id', 'name', 'description']);
                $courseDetails = $courses->toArray();
            }

            return response()->json([
                'recommendations' => $recommendations,
                'course_details' => $courseDetails,
                'count' => count($recommendations)
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting recommendations: ' . $e->getMessage());
            return response()->json(['recommendations' => [], 'error' => 'Failed to get recommendations'], 500);
        }
    }
}
