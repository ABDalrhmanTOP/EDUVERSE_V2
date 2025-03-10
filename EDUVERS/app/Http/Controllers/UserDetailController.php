<?php
namespace App\Http\Controllers;
use App\Models\UserProgress;
use Illuminate\Http\Request;

class UserDetailController extends Controller
{
    public function getAllByUserId($user_id)
    {
        $userProgress = UserProgress::where('user_id', $user_id)->get();

        if ($userProgress->isEmpty()) {
            return response()->json(['message' => 'No progress found for this user'], 404);
        }

        return response()->json($userProgress);
    }

}
