<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FinalProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = DB::table('final_projects');
        if ($request->has('course_id')) {
            $query->where('course_id', $request->course_id);
        }
        return response()->json($query->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:playlists,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);
        // Enforce one final project per course
        if (DB::table('final_projects')->where('course_id', $validated['course_id'])->exists()) {
            return response()->json(['error' => 'A final project already exists for this course.'], 422);
        }
        $id = DB::table('final_projects')->insertGetId($validated);
        $test = DB::table('final_projects')->find($id);
        return response()->json($test, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $test = DB::table('final_projects')->where('id', $id)->first();
        if (!$test) return response()->json(['error' => 'Not found'], 404);
        $questions = DB::table('final_project_questions')->where('final_project_id', $id)->get();
        $test->questions = $questions;
        return response()->json($test);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $test = DB::table('final_projects')->where('id', $id)->first();
        if (!$test) return response()->json(['error' => 'Not found'], 404);
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
        ]);
        DB::table('final_projects')->where('id', $id)->update($validated);
        $updated = DB::table('final_projects')->where('id', $id)->first();
        return response()->json($updated);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        DB::table('final_projects')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }
}
