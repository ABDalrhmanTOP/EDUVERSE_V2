<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserCourseUnlock;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class RecommendationController extends Controller
{
    public function exportUserCourses()
    {
        $data = UserCourseUnlock::select('user_id', 'course_id')->get();

        $transactions = [];
        foreach ($data as $row) {
            $transactions[$row->user_id][] = $row->course_id;
        }

        // حفظ كـ JSON في storage/app/transactions.json
        Storage::disk('local')->put('transactions.json', json_encode(array_values($transactions)));

        return response()->json(['status' => 'done']);
    }

    public function getRecommendations($userId)
    {
        // Get courses unlocked by the user
        $userCourses = \App\Models\UserCourseUnlock::where('user_id', $userId)->pluck('course_id')->toArray();

        // Get all association rules
        $rules = DB::table('recommendation_rules')->get();

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
        return response()->json(['recommendations' => $recommendations]);
    }
}
