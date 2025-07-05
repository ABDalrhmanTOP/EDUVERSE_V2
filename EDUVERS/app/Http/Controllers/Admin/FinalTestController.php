<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\FinalTest;

class FinalTestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = FinalTest::query();
        if ($request->has('course_id')) {
            $query->where('course_id', $request->course_id);
        }
        return response()->json($query->with('course')->get());
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
        // Enforce one final test per course
        if (FinalTest::where('course_id', $validated['course_id'])->exists()) {
            return response()->json(['error' => 'A final test already exists for this course.'], 422);
        }
        $test = FinalTest::create($validated);
        return response()->json($test, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $test = FinalTest::with('questions')->findOrFail($id);
        return response()->json($test);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $test = FinalTest::findOrFail($id);
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
        ]);
        $test->update($validated);
        return response()->json($test);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $test = FinalTest::findOrFail($id);
        $test->delete();
        return response()->json(['message' => 'Final test deleted']);
    }
}
