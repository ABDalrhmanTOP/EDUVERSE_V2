<?php

namespace App\Http\Controllers;

use App\Models\UserProgress;
use Illuminate\Http\Request;

class UserDetailController extends Controller
{
    public function getAllByUserId($user_id)
    {
        $userProgress = UserProgress::where('user_id', $user_id)->get();

        // Always return 200, even if empty
        return response()->json($userProgress, 200);
    }
}
