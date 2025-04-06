<?php

namespace App\Http\Controllers;

use App\Models\EduBot;
use Illuminate\Http\Request;

class EduBotController extends Controller
{
    /**
     * Display a listing of all EduBot records.
     */
    public function index()
    {
        $chats = EduBot::all();
        return response()->json($chats);
    }

    /**
     * Store a new EduBot record.
     *
     * Expected request payload:
     * {
     *   "user_id": 1,
     *   "query": "User's query here",
     *   "response": "Assistant's response here"
     * }
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id'  => 'required|exists:users,id',
            'query'    => 'required|string',
            'response' => 'required|string',
        ]);

        $chat = EduBot::create($validated);
        return response()->json($chat, 201);
    }

    /**
     * Display a specific EduBot record.
     */
    public function show($id)
    {
        $chat = EduBot::findOrFail($id);
        return response()->json($chat);
    }

    /**
     * Update a specific EduBot record.
     */
    public function update(Request $request, $id)
    {
        $chat = EduBot::findOrFail($id);

        $validated = $request->validate([
            'query'    => 'sometimes|required|string',
            'response' => 'sometimes|required|string',
        ]);

        $chat->update($validated);
        return response()->json($chat);
    }

    /**
     * Remove a specific EduBot record.
     */
    public function destroy($id)
    {
        $chat = EduBot::findOrFail($id);
        $chat->delete();

        return response()->json(['message' => 'EduBot record deleted successfully']);
    }
}
