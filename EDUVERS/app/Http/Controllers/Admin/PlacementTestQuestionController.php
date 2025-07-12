<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PlacementTestQuestion;

class PlacementTestQuestionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = PlacementTestQuestion::query();
        if ($request->has('placement_test_id')) {
            $query->where('placement_test_id', $request->placement_test_id);
        }
        return response()->json($query->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'placement_test_id' => 'required|exists:placement_tests,id',
            'question' => 'required|string',
            'type' => 'required|string|in:mcq,true_false,code',
            'options' => 'nullable|array',
            'correct_answer' => 'required|string',
            'difficulty' => 'nullable|string|in:easy,medium,hard',
            'code_template' => 'nullable|string',
            'test_cases' => 'nullable|array',
        ]);
        // Convert options and test_cases to JSON if present
        if (isset($validated['options'])) {
            $validated['options'] = json_encode($validated['options']);
        }
        if (isset($validated['test_cases'])) {
            $validated['test_cases'] = json_encode($validated['test_cases']);
        }
        $question = PlacementTestQuestion::create($validated);
        return response()->json($question, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $question = PlacementTestQuestion::findOrFail($id);
        return response()->json($question);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $question = PlacementTestQuestion::findOrFail($id);
        $validated = $request->validate([
            'question' => 'sometimes|required|string',
            'type' => 'sometimes|required|string|in:mcq,true_false,code',
            'options' => 'nullable|array',
            'correct_answer' => 'sometimes|required|string',
            'difficulty' => 'nullable|string|in:easy,medium,hard',
            'code_template' => 'nullable|string',
            'test_cases' => 'nullable|array',
        ]);
        if (isset($validated['options'])) {
            $validated['options'] = json_encode($validated['options']);
        }
        if (isset($validated['test_cases'])) {
            $validated['test_cases'] = json_encode($validated['test_cases']);
        }
        $question->update($validated);
        return response()->json($question);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $question = PlacementTestQuestion::findOrFail($id);
        $question->delete();
        return response()->json(['message' => 'Question deleted']);
    }
}
