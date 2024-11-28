<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TasksSeeder extends Seeder
{
    public function run()
    {
        DB::table('tasks')->insert([
            // Chapter 2: Diving in
            [
                'playlist_id' => 1,
                'timestamp' => '1:43:01',
                'title' => 'Your First C++ Program',
                'prompt' => "Write a C++ program that outputs 'Hello, World!' using cout.",
                'expected_output' => 'Hello, World!',
                'syntax_hint' => "Ensure you use cout to output 'Hello, World!'.",
            ],
            [
                'playlist_id' => 1,
                'timestamp' => '1:50:00',
                'title' => 'Adding Comments',
                'prompt' => 'Write a program that declares an integer variable and uses comments to explain its purpose.',
                'expected_output' => '',
                'syntax_hint' => 'Include both // single-line comments and /* */ multi-line comments.',
            ],
            [
                'playlist_id' => 1,
                'timestamp' => '1:55:00',
                'title' => 'Handling Errors',
                'prompt' => 'Write a program that tries to divide by zero and uses a try-catch block to handle the exception.',
                'expected_output' => 'Error: Division by zero',
                'syntax_hint' => 'Use a try block for division and a catch block for error handling.',
            ],

            // Chapter 3: Variables and Data Types
            [
                'playlist_id' => 1,
                'timestamp' => '3:00:47',
                'title' => 'Working with Variables',
                'prompt' => 'Declare two integer variables a = 5 and b = 10, compute their sum, and print it.',
                'expected_output' => '15',
                'syntax_hint' => 'Declare two integer variables a and b with appropriate values and print their sum using cout.',
            ],
            [
                'playlist_id' => 1,
                'timestamp' => '3:20:00',
                'title' => 'Exploring Booleans',
                'prompt' => 'Write a program that declares a boolean variable, assigns it a value, and prints it.',
                'expected_output' => '1',
                'syntax_hint' => 'Declare a boolean variable, assign it true, and use cout to print its value.',
            ],
            [
                'playlist_id' => 1,
                'timestamp' => '3:40:00',
                'title' => 'Character Manipulation',
                'prompt' => 'Write a program that declares a char variable, assigns it a character, and prints it.',
                'expected_output' => 'A',
                'syntax_hint' => 'Use char to declare a variable and cout to print it.',
            ],

            // Chapter 4: Operations on Data
            [
                'playlist_id' => 1,
                'timestamp' => '4:46:46',
                'title' => 'Performing Basic Operations',
                'prompt' => 'Write a program that multiplies 7 by 6 using variables and prints the result.',
                'expected_output' => '42',
                'syntax_hint' => 'Define variables x and y with values 7 and 6, multiply them, and print the result using cout.',
            ],
            [
                'playlist_id' => 1,
                'timestamp' => '5:10:00',
                'title' => 'Using Logical Operators',
                'prompt' => 'Write a program that checks if a number is greater than 5 and less than 15.',
                'expected_output' => 'True',
                'syntax_hint' => 'Use logical operators && to combine conditions and cout to print the result.',
            ],
            [
                'playlist_id' => 1,
                'timestamp' => '5:50:00',
                'title' => 'Math Functions',
                'prompt' => 'Write a program that calculates the square root of 25 and prints the result.',
                'expected_output' => '5',
                'syntax_hint' => 'Use sqrt from the cmath library and cout to print the result.',
            ],

            // Chapter 5: Flow Control
            [
                'playlist_id' => 1,
                'timestamp' => '7:01:58',
                'title' => 'Using If-Else Statements',
                'prompt' => 'Write a program that checks if a number is positive, negative, or zero and prints the result.',
                'expected_output' => 'Positive',
                'syntax_hint' => 'Use an if-else block to check whether a number is positive, negative, or zero and print the result using cout.',
            ],
            [
                'playlist_id' => 1,
                'timestamp' => '7:20:00',
                'title' => 'Switch Case Example',
                'prompt' => "Write a program that takes an integer input and uses a switch statement to print 'One', 'Two', or 'Other'.",
                'expected_output' => 'One',
                'syntax_hint' => 'Use a switch statement to check for cases 1, 2, and default.',
            ],

            // Chapter 6: Loops
            [
                'playlist_id' => 1,
                'timestamp' => '7:53:49',
                'title' => 'Using For Loops',
                'prompt' => 'Write a for loop to print numbers from 1 to 5.',
                'expected_output' => "1\n2\n3\n4\n5",
                'syntax_hint' => 'Use a for loop to iterate from 1 to 5 and print each number using cout.',
            ],
            [
                'playlist_id' => 1,
                'timestamp' => '8:10:00',
                'title' => 'Using While Loops',
                'prompt' => 'Write a while loop to print numbers from 1 to 3.',
                'expected_output' => "1\n2\n3",
                'syntax_hint' => 'Use a while loop to iterate and print numbers.',
            ],

            [
                'playlist_id' => 1,
                'timestamp' => '8:47:08',
                'title' => 'Array Basics',
                'prompt' => 'Declare an array arr = {10, 20, 30, 40, 50} and print the third element.',
                'expected_output' => '30',
                'syntax_hint' => 'Define an array arr with elements {10, 20, 30, 40, 50} and use cout to print the third element.',
            ],

            // Chapter 8: Pointers
            [
                'playlist_id' => 1,
                'timestamp' => '9:53:23',
                'title' => 'Using Pointers',
                'prompt' => 'Declare a pointer to an integer x = 42 and print its dereferenced value.',
                'expected_output' => '42',
                'syntax_hint' => 'Declare an integer variable x and a pointer *ptr, assign x to *ptr, and print its dereferenced value using cout.',
            ],

            // Chapter 11: Functions
            [
                'playlist_id' => 1,
                'timestamp' => '14:12:47',
                'title' => 'Creating Functions',
                'prompt' => 'Write a function int add(int a, int b) that returns the sum of two numbers.',
                'expected_output' => 'Sum is 15',
                'syntax_hint' => 'Define a function add that takes two integers as parameters, returns their sum, and call this function in main.',
            ],

            // Chapter 17: Classes
            [
                'playlist_id' => 1,
                'timestamp' => '20:15:40',
                'title' => 'Basic Class Implementation',
                'prompt' => 'Define a class Rectangle with attributes length and width. Add a method to compute the area.',
                'expected_output' => 'Area: 50',
                'syntax_hint' => 'Define a class Rectangle with attributes length and width, and a method to compute and return the area.',
            ],

            // Chapter 18: Inheritance
            [
                'playlist_id' => 1,
                'timestamp' => '22:52:43',
                'title' => 'Using Inheritance',
                'prompt' => "Create a base class Animal with a method speak. Derive a class Dog and override speak to print 'Woof!'.",
                'expected_output' => 'Woof!',
                'syntax_hint' => 'Define a base class with a virtual method, derive a class, and override the method.',
            ],
        ]);
    }
}