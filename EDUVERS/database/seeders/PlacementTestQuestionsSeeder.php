<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PlacementTest;
use App\Models\PlacementTestQuestion;

class PlacementTestQuestionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find the placement test for course_id 1
        $placementTest = PlacementTest::where('course_id', 1)->first();

        if (!$placementTest) {
            // Create placement test for course_id 1 if it doesn't exist
            $placementTest = PlacementTest::create([
                'course_id' => 1,
                'title' => 'C++ Placement Test',
                'description' => 'Test your C++ knowledge'
            ]);
        }

        // Create questions for the placement test
        $questions = [
            [
                'question' => 'What is the output of cout << "Hello World"; in C++?',
                'type' => 'mcq',
                'options' => json_encode(['Hello World', 'Hello', 'World', 'Error']),
                'correct_answer' => 'Hello World',
                'difficulty' => 1
            ],
            [
                'question' => 'Which of the following is a valid C++ variable name?',
                'type' => 'mcq',
                'options' => json_encode(['123variable', 'my-variable', 'myVariable', '@variable']),
                'correct_answer' => 'myVariable',
                'difficulty' => 1
            ],
            [
                'question' => 'What is the correct way to declare a constant in C++?',
                'type' => 'mcq',
                'options' => json_encode(['const int x = 5;', 'constant int x = 5;', 'final int x = 5;', 'static int x = 5;']),
                'correct_answer' => 'const int x = 5;',
                'difficulty' => 2
            ],
            [
                'question' => 'C++ is an object-oriented programming language.',
                'type' => 'true_false',
                'options' => null,
                'correct_answer' => 'True',
                'difficulty' => 1
            ],
            [
                'question' => 'Write a C++ program to print "Hello World"',
                'type' => 'coding',
                'options' => null,
                'correct_answer' => '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello World";\n    return 0;\n}',
                'difficulty' => 1,
                'code_template' => '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    \n    return 0;\n}',
                'test_cases' => json_encode([])
            ]
        ];

        foreach ($questions as $questionData) {
            PlacementTestQuestion::create([
                'placement_test_id' => $placementTest->id,
                'question' => $questionData['question'],
                'type' => $questionData['type'],
                'options' => $questionData['options'],
                'correct_answer' => $questionData['correct_answer'],
                'difficulty' => $questionData['difficulty'],
                'code_template' => $questionData['code_template'] ?? null,
                'test_cases' => $questionData['test_cases'] ?? null
            ]);
        }
    }
}
