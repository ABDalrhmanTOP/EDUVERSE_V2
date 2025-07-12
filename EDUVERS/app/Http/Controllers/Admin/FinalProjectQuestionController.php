<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FinalProjectQuestionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = DB::table('final_project_questions');
        if ($request->has('final_project_id')) {
            $query->where('final_project_id', $request->final_project_id);
        }
        return response()->json($query->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'final_project_id' => 'required|exists:final_projects,id',
            'question' => 'required|string',
            'type' => 'required|string|in:mcq,true_false,code',
            'options' => 'nullable', // Accept any format, we'll handle conversion
            'correct_answer' => 'required|string',
            'difficulty' => 'nullable|string',
            'code_template' => 'nullable|string',
            'test_cases' => 'nullable', // Accept any format, we'll handle conversion
            'mark' => 'required|numeric|min:0.5|max:10',
        ]);

        // Handle options conversion
        $options = null;
        if (isset($validated['options'])) {
            if (is_array($validated['options'])) {
                $options = json_encode($validated['options']);
            } elseif (is_string($validated['options'])) {
                // If it's already a JSON string, validate it
                $decoded = json_decode($validated['options'], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $options = $validated['options']; // Keep as is
                } else {
                    $options = json_encode([]); // Invalid JSON, use empty array
                }
            } else {
                $options = json_encode([]);
            }
        }

        // Handle test_cases conversion
        $testCases = null;
        if (isset($validated['test_cases'])) {
            if (is_array($validated['test_cases'])) {
                $testCases = json_encode($validated['test_cases']);
            } elseif (is_string($validated['test_cases'])) {
                // If it's already a JSON string, validate it
                $decoded = json_decode($validated['test_cases'], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $testCases = $validated['test_cases']; // Keep as is
                } else {
                    $testCases = json_encode([]); // Invalid JSON, use empty array
                }
            } else {
                $testCases = json_encode([]);
            }
        }

        $data = [
            'final_project_id' => $validated['final_project_id'],
            'question' => $validated['question'],
            'type' => $validated['type'],
            'options' => $options,
            'correct_answer' => $validated['correct_answer'],
            'difficulty' => $validated['difficulty'] ?? 'medium',
            'code_template' => $validated['code_template'] ?? null,
            'test_cases' => $testCases,
            'mark' => $validated['mark'],
        ];
        $id = DB::table('final_project_questions')->insertGetId($data);
        $question = DB::table('final_project_questions')->find($id);
        return response()->json($question, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $question = DB::table('final_project_questions')->where('id', $id)->first();
        if (!$question) return response()->json(['error' => 'Not found'], 404);
        return response()->json($question);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $question = DB::table('final_project_questions')->where('id', $id)->first();
        if (!$question) return response()->json(['error' => 'Not found'], 404);
        $validated = $request->validate([
            'question' => 'sometimes|required|string',
            'type' => 'sometimes|required|string|in:mcq,true_false,code',
            'options' => 'nullable', // Accept any format, we'll handle conversion
            'correct_answer' => 'sometimes|required|string',
            'difficulty' => 'nullable|string',
            'code_template' => 'nullable|string',
            'test_cases' => 'nullable', // Accept any format, we'll handle conversion
            'mark' => 'sometimes|required|numeric|min:0.5|max:10',
        ]);

        $data = [];
        foreach ($validated as $key => $value) {
            if ($key === 'options') {
                // Handle options conversion
                if (is_array($value)) {
                    $data[$key] = json_encode($value);
                } elseif (is_string($value)) {
                    // If it's already a JSON string, validate it
                    $decoded = json_decode($value, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $data[$key] = $value; // Keep as is
                    } else {
                        $data[$key] = json_encode([]); // Invalid JSON, use empty array
                    }
                } else {
                    $data[$key] = json_encode([]);
                }
            } elseif ($key === 'test_cases') {
                // Handle test_cases conversion
                if (is_array($value)) {
                    $data[$key] = json_encode($value);
                } elseif (is_string($value)) {
                    // If it's already a JSON string, validate it
                    $decoded = json_decode($value, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $data[$key] = $value; // Keep as is
                    } else {
                        $data[$key] = json_encode([]); // Invalid JSON, use empty array
                    }
                } else {
                    $data[$key] = json_encode([]);
                }
            } else {
                $data[$key] = $value;
            }
        }
        DB::table('final_project_questions')->where('id', $id)->update($data);
        $updated = DB::table('final_project_questions')->where('id', $id)->first();
        return response()->json($updated);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        DB::table('final_project_questions')->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }
}
