<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class PlacementQuestionsSeeder extends Seeder
{
    public function run()
    {
        $now = Carbon::now();
        $questions = [
            // C++ Year 1 Semester 1 (6 easy, 6 medium, 6 hard)
            [
                'year' => 1,
                'semester' => 1,
                'subject' => 'C++',
                'type' => 'mcq',
                'difficulty' => 'easy',
                'question' => 'Which of the following is a valid C++ variable name?',
                'options' => json_encode(['1var', 'var_1', 'var-1', 'var 1']),
                'correct_answer' => 'var_1',
                'code_template' => null,
                'test_cases' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'year' => 1,
                'semester' => 1,
                'subject' => 'C++',
                'type' => 'true_false',
                'difficulty' => 'easy',
                'question' => 'The statement cout << "Hello"; prints Hello to the screen.',
                'options' => json_encode(['True', 'False']),
                'correct_answer' => 'True',
                'code_template' => null,
                'test_cases' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'year' => 1,
                'semester' => 1,
                'subject' => 'C++',
                'type' => 'coding',
                'difficulty' => 'easy',
                'question' => 'Write a C++ program to print the sum of two numbers.',
                'options' => null,
                'correct_answer' => null,
                'code_template' => '#include <iostream>\nusing namespace std;\nint main() { int a, b; // your code here return 0; }',
                'test_cases' => json_encode([
                    ['input' => '2 3', 'output' => '5'],
                    ['input' => '10 20', 'output' => '30'],
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            // ... (repeat for 6 easy, 6 medium, 6 hard for C++ Y1S1)
            // Math Year 1 Semester 1 (6 easy, 6 medium, 6 hard)
            [
                'year' => 1,
                'semester' => 1,
                'subject' => 'Math',
                'type' => 'mcq',
                'difficulty' => 'easy',
                'question' => 'What is the value of the integral ∫0^1 x dx?',
                'options' => json_encode(['0.5', '1', '0', '2']),
                'correct_answer' => '0.5',
                'code_template' => null,
                'test_cases' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'year' => 1,
                'semester' => 1,
                'subject' => 'Math',
                'type' => 'true_false',
                'difficulty' => 'easy',
                'question' => 'The Boolean expression (A + 0) equals A.',
                'options' => json_encode(['True', 'False']),
                'correct_answer' => 'True',
                'code_template' => null,
                'test_cases' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            // ... (repeat for 6 easy, 6 medium, 6 hard for Math Y1S1)
            // Physics, Logic Circuits, and other subjects/semesters...
        ];
        // For demo, only a few questions are shown. In production, expand to 18 per subject as described.
        DB::table('placement_questions')->insert($questions);
    }
}
