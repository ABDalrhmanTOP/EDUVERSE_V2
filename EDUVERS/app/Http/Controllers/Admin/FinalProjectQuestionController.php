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
            'options' => 'nullable|array',
            'correct_answer' => 'required|string',
            'difficulty' => 'nullable|string',
            'code_template' => 'nullable|string',
            'test_cases' => 'nullable|array',
            'mark' => 'required|numeric|min:0.5|max:10',
        ]);
        $data = [
            'final_project_id' => $validated['final_project_id'],
            'question' => $validated['question'],
            'type' => $validated['type'],
            'options' => isset($validated['options']) ? json_encode($validated['options']) : null,
            'correct_answer' => $validated['correct_answer'],
            'difficulty' => $validated['difficulty'] ?? 1,
            'code_template' => $validated['code_template'] ?? null,
            'test_cases' => isset($validated['test_cases']) ? json_encode($validated['test_cases']) : null,
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
            'options' => 'nullable|array',
            'correct_answer' => 'sometimes|required|string',
            'difficulty' => 'nullable|string',
            'code_template' => 'nullable|string',
            'test_cases' => 'nullable|array',
            'mark' => 'sometimes|required|numeric|min:0.5|max:10',
        ]);
        $data = [];
        foreach ($validated as $key => $value) {
            if ($key === 'options' || $key === 'test_cases') {
                $data[$key] = json_encode($value);
            } else if ($key === 'final_project_id') {
                $data['final_project_id'] = $value;
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
