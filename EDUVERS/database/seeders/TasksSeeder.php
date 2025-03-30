<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TasksSeeder extends Seeder
{
    public function run()
    {
        DB::table('tasks')->insert([
            // =====================
            // == ORIGINAL TASKS ===
            // =====================
            // Chapter 2: Diving in
            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '01:13:00',
                'title'           => 'C++ Include Syntax (MCQ)',
                'prompt'          => 'Which of the following is the correct syntax to include the iostream library?',
                'expected_output' => 'A', // correct answer (used for checking only)
                'syntax_hint'     => 'Hint: Use #include <iostream> in modern C++.',
                'type'            => 'mcq',
                'options'         => json_encode([
                    'A' => '#include <iostream>',
                    'B' => '#include <iostream.h>',
                    'C' => 'import <iostream>;',
                    'D' => 'include <iostream>'
                ]),
            ],

            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '1:43:01',
                'title'           => 'Your First C++ Program',
                'prompt'          => "Write a C++ program that outputs 'Hello, World!' using cout.",
                'expected_output' => 'Hello, World!',
                'syntax_hint'     => "Use <code>cout << \"Hello, World!\";</code> to print the message.",
                'type'            => 'code',
                'options'         => null,
            ],
            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '1:50:00',
                'title'           => 'Adding Comments',
                'prompt'          => 'Write a program that declares an integer variable and uses comments to explain its purpose.',
                'expected_output' => '',
                'syntax_hint'     => "Try:\n// Declare a variable\nint x = 10; // x holds the value 10",
                'type'            => 'code',
                'options'         => null,
            ],

            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '1:55:00',
                'title'           => 'Handling Errors',
                'prompt'          => 'Write a program that tries to divide by zero and uses a try-catch block to handle the exception.',
                'expected_output' => 'Error: Division by zero',
                'syntax_hint'     => "Wrap the division in a try block and catch std::exception to print the error message.",
                'type'            => 'code',
                'options'         => null,
            ],
            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '1:55:30',
                'title'           => 'Using Namespace std (T/F)',
                'prompt'          => "True or False: 'using namespace std;' is always recommended in large C++ projects.",
                'expected_output' => 'false',
                'syntax_hint'     => "It's generally better to use explicit std:: prefixes in large codebases.",
                'type'            => 'truefalse',
                'options'         => null,
            ],
            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '02:11:27',
                'title'           => 'Local Variables Auto-Init (T/F)',
                'prompt'          => 'True or False: In C++, local variables are automatically initialized to 0.',
                'expected_output' => 'false', // used for checking only; not displayed
                'syntax_hint'     => 'Correct Answer: False. Local variables are not automatically initialized.',
                'type'            => 'truefalse',
                'options'         => null,
            ],
            // Chapter 3: Variables and Data Types
            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '3:00:47',
                'title'           => 'Working with Variables',
                'prompt'          => 'Declare two integer variables a = 5 and b = 10, compute their sum, and print it.',
                'expected_output' => '15',
                'syntax_hint'     => "int a = 5;\nint b = 10;\ncout << (a + b);",
                'type'            => 'code',
                'options'         => null,
            ],
            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '3:20:00',
                'title'           => 'Exploring Booleans',
                'prompt'          => 'Write a program that declares a boolean variable, assigns it a value, and prints it.',
                'expected_output' => '1',
                'syntax_hint'     => "bool flag = true;\ncout << flag;",
                'type'            => 'code',
                'options'         => null,
            ],
            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '3:40:00',
                'title'           => 'Character Manipulation',
                'prompt'          => 'Write a program that declares a char variable, assigns it a character, and prints it.',
                'expected_output' => 'A',
                'syntax_hint'     => "char letter = 'A';\ncout << letter;",
                'type'            => 'code',
                'options'         => null,
            ],
            // Chapter 4: Operations on Data
            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '4:46:46',
                'title'           => 'Performing Basic Operations',
                'prompt'          => 'Write a program that multiplies 7 by 6 using variables and prints the result.',
                'expected_output' => '42',
                'syntax_hint'     => "int x = 7, y = 6;\ncout << (x * y);",
                'type'            => 'code',
                'options'         => null,
            ],
            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '5:10:00',
                'title'           => 'Using Logical Operators',
                'prompt'          => 'Write a program that checks if a number is greater than 5 and less than 15.',
                'expected_output' => 'True',
                'syntax_hint'     => "if(num > 5 && num < 15) {\n    cout << \"True\";\n}",
                'type'            => 'code',
                'options'         => null,
            ],
            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '5:50:00',
                'title'           => 'Math Functions',
                'prompt'          => 'Write a program that calculates the square root of 25 and prints the result.',
                'expected_output' => '5',
                'syntax_hint'     => "Include <cmath> and use sqrt(25).",
                'type'            => 'code',
                'options'         => null,
            ],
            // Chapter 5: Flow Control
            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '7:01:58',
                'title'           => 'Using If-Else Statements',
                'prompt'          => 'Write a program that checks if a number is positive, negative, or zero and prints the result.',
                'expected_output' => 'Positive',
                'syntax_hint'     => "if(num > 0) {\n    cout << \"Positive\";\n} else if(num < 0) {\n    cout << \"Negative\";\n} else {\n    cout << \"Zero\";\n}",
                'type'            => 'code',
                'options'         => null,
            ],
            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '7:20:00',
                'title'           => 'Switch Case Example',
                'prompt'          => "Write a program that takes an integer input and uses a switch statement to print 'One', 'Two', or 'Other'.",
                'expected_output' => 'One',
                'syntax_hint'     => "switch(num) {\n  case 1:\n    cout << \"One\";\n    break;\n  case 2:\n    cout << \"Two\";\n    break;\n  default:\n    cout << \"Other\";\n}",
                'type'            => 'code',
                'options'         => null,
            ],
            // Chapter 6: Loops
            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '7:53:49',
                'title'           => 'Using For Loops',
                'prompt'          => 'Write a for loop to print numbers from 1 to 5.',
                'expected_output' => "1\n2\n3\n4\n5",
                'syntax_hint'     => "for(int i=1; i<=5; i++) {\n    cout << i << \"\\n\";\n}",
                'type'            => 'code',
                'options'         => null,
            ],
            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '8:10:00',
                'title'           => 'Using While Loops',
                'prompt'          => 'Write a while loop to print numbers from 1 to 3.',
                'expected_output' => "1\n2\n3",
                'syntax_hint'     => "int i = 1;\nwhile(i <= 3) {\n    cout << i++ << \"\\n\";\n}",
                'type'            => 'code',
                'options'         => null,
            ],
            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '8:47:08',
                'title'           => 'Array Basics',
                'prompt'          => 'Declare an array arr = {10, 20, 30, 40, 50} and print the third element.',
                'expected_output' => '30',
                'syntax_hint'     => "int arr[] = {10,20,30,40,50};\ncout << arr[2];",
                'type'            => 'code',
                'options'         => null,
            ],
            // Chapter 8: Pointers
            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '9:53:23',
                'title'           => 'Using Pointers',
                'prompt'          => 'Declare a pointer to an integer x = 42 and print its dereferenced value.',
                'expected_output' => '42',
                'syntax_hint'     => "int x = 42;\nint *ptr = &x;\ncout << *ptr;",
                'type'            => 'code',
                'options'         => null,
            ],
            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '12:00:00',
                'title'           => 'STL Container Type (MCQ)',
                'prompt'          => 'Which STL container is typically implemented as a self-balancing binary search tree?',
                'expected_output' => 'C',
                'syntax_hint'     => 'Hint: std::set is usually implemented as a red-black tree.',
                'type'            => 'mcq',
                'options'         => json_encode([
                    'A' => 'std::vector',
                    'B' => 'std::unordered_map',
                    'C' => 'std::set',
                    'D' => 'std::array'
                ]),
            ],
            // Chapter 11: Functions
            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '14:12:47',
                'title'           => 'Creating Functions',
                'prompt'          => 'Write a function int add(int a, int b) that returns the sum of two numbers.',
                'expected_output' => 'Sum is 15',
                'syntax_hint'     => "int add(int a, int b) {\n    return a + b;\n}\n// In main: cout << \"Sum is \" << add(5,10);",
                'type'            => 'code',
                'options'         => null,
            ],
            // Chapter 17: Classes
            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '20:15:40',
                'title'           => 'Basic Class Implementation',
                'prompt'          => 'Define a class Rectangle with attributes length and width. Add a method to compute the area.',
                'expected_output' => 'Area: 50',
                'syntax_hint'     => "class Rectangle {\nprivate:\n    int length, width;\npublic:\n    Rectangle(int l, int w): length(l), width(w) {}\n    int area() { return length * width; }\n};",
                'type'            => 'code',
                'options'         => null,
            ],
            // Chapter 18: Inheritance
            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '22:52:43',
                'title'           => 'Using Inheritance',
                'prompt'          => "Create a base class Animal with a method speak. Derive a class Dog and override speak to print 'Woof!'.",
                'expected_output' => 'Woof!',
                'syntax_hint'     => "class Animal {\npublic:\n    virtual void speak() = 0;\n};\nclass Dog : public Animal {\npublic:\n    void speak() override { cout << \"Woof!\"; }\n};",
                'type'            => 'code',
                'options'         => null,
            ],
            // New OOP Task 1: Polymorphism with Virtual Functions
            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '23:10:00',
                'title'           => 'Polymorphism Example',
                'prompt'          => "Write a program that demonstrates polymorphism using virtual functions. Create a base class 'Shape' with a virtual function 'area', and derive two classes 'Circle' and 'Rectangle' that override 'area'. Print the areas.",
                'expected_output' => 'Area of Circle: <value>, Area of Rectangle: <value>',
                'syntax_hint'     => "class Shape {\npublic:\n    virtual double area() = 0;\n};\nclass Circle : public Shape {\n    double r;\npublic:\n    Circle(double radius): r(radius) {}\n    double area() override { return 3.14 * r * r; }\n};\nclass Rectangle : public Shape {\n    double l, w;\npublic:\n    Rectangle(double length, double width): l(length), w(width) {}\n    double area() override { return l * w; }\n};",
                'type'            => 'code',
                'options'         => null,
            ],
            // New OOP Task 2: Encapsulation and Access Specifiers
            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '23:25:00',
                'title'           => 'Encapsulation in Classes',
                'prompt'          => "Write a program that defines a class 'Person' with private properties 'name' and 'age'. Provide public getter and setter methods to access these properties and print them.",
                'expected_output' => 'Name: John, Age: 30',
                'syntax_hint'     => "class Person {\nprivate:\n    string name;\n    int age;\npublic:\n    void setName(string n) { name = n; }\n    void setAge(int a) { age = a; }\n    string getName() { return name; }\n    int getAge() { return age; }\n};\n// In main: create a Person, set values, and print them.",
                'type'            => 'code',
                'options'         => null,
            ],
            // New OOP Task 3: Operator Overloading
            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '23:40:00',
                'title'           => 'Operator Overloading',
                'prompt'          => "Write a program that defines a class 'Complex' for complex numbers and overloads the '+' operator to add two complex numbers. Print the result of the addition.",
                'expected_output' => 'Result: 3+4i',
                'syntax_hint'     => "class Complex {\npublic:\n    int real, imag;\n    Complex(int r = 0, int i = 0) : real(r), imag(i) {}\n    Complex operator+(const Complex &c) {\n        return Complex(real + c.real, imag + c.imag);\n    }\n};\n// In main: Complex c1(1,2), c2(2,2); cout << \"Result: \" << (c1 + c2).real << \"+\" << (c1 + c2).imag << \"i\";",
                'type'            => 'code',
                'options'         => null,
            ],
            // New OOP Task 4: Abstract Classes and Pure Virtual Functions
            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '23:55:00',
                'title'           => 'Abstract Classes',
                'prompt'          => "Write a program that defines an abstract class 'Animal' with a pure virtual function 'makeSound'. Derive two classes, 'Cat' and 'Dog', from Animal and implement 'makeSound'. Print the sound of each animal.",
                'expected_output' => 'Cat: Meow, Dog: Woof',
                'syntax_hint'     => "class Animal {\npublic:\n    virtual void makeSound() = 0;\n};\nclass Cat : public Animal {\npublic:\n    void makeSound() override { cout << \"Meow\"; }\n};\nclass Dog : public Animal {\npublic:\n    void makeSound() override { cout << \"Woof\"; }\n};",
                'type'            => 'code',
                'options'         => null,
            ],


            // T/F: Local variable init

            // MCQ: 'final' keyword
            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '24:10:00',
                'title'           => 'Prevent Overriding (MCQ)',
                'prompt'          => "Which C++ keyword can be used to prevent a derived class from overriding a virtual function?",
                'expected_output' => 'C',
                'syntax_hint'     => 'Introduced in C++11.',
                'type'            => 'mcq',
                'options'         => json_encode([
                    'A' => 'override',
                    'B' => 'sealed',
                    'C' => 'final',
                    'D' => 'static'
                ]),
            ],
            // T/F: Static members
            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '24:15:00',
                'title'           => 'Static Members Access (T/F)',
                'prompt'          => 'True or False: Static members of a class must be accessed using the class name and scope resolution operator.',
                'expected_output' => 'true',
                'syntax_hint'     => 'Static members are associated with the class, not instances.',
                'type'            => 'truefalse',
                'options'         => null,
            ],
            // MCQ: Multiple Inheritance Constructors
            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '24:20:00',
                'title'           => 'Multiple Inheritance Order (MCQ)',
                'prompt'          => "In C++ multiple inheritance, which constructor(s) are called first?",
                'expected_output' => 'B',
                'syntax_hint'     => 'Construction starts from base classes in the order they appear.',
                'type'            => 'mcq',
                'options'         => json_encode([
                    'A' => 'Derived class constructor first',
                    'B' => 'Base class constructors in declaration order, then derived',
                    'C' => 'Random order of base classes, then derived',
                    'D' => 'None of the above'
                ]),
            ],
            // T/F: "using namespace std;"

            // MCQ: Which STL container is typically a balanced BST?
            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '24:30:00',
                'title'           => 'STL Container Type (MCQ)',
                'prompt'          => "Which STL container is usually implemented as a self-balancing binary search tree?",
                'expected_output' => 'C',
                'syntax_hint'     => 'The typical implementation of certain ordered containers uses red-black trees.',
                'type'            => 'mcq',
                'options'         => json_encode([
                    'A' => 'std::vector',
                    'B' => 'std::unordered_map',
                    'C' => 'std::set',
                    'D' => 'std::array'
                ]),
            ],
            // T/F: Destructor Parameters
            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '24:35:00',
                'title'           => 'Destructor with Parameters (T/F)',
                'prompt'          => 'True or False: A destructor in C++ can have parameters if they are defaulted.',
                'expected_output' => 'false',
                'syntax_hint'     => 'C++ destructors cannot have parameters, even default ones.',
                'type'            => 'truefalse',
                'options'         => null,
            ],
            // MCQ: Invalid Memory Operator
            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '24:40:00',
                'title'           => 'Memory Management (MCQ)',
                'prompt'          => "Which of these is NOT a valid memory management operator or function in standard C++?",
                'expected_output' => 'D',
                'syntax_hint'     => 'Operators new/delete, new[]/delete[], and functions like malloc/free are valid in C++.',
                'type'            => 'mcq',
                'options'         => json_encode([
                    'A' => 'new',
                    'B' => 'delete[]',
                    'C' => 'malloc',
                    'D' => 'destroy_ptr'
                ]),
            ],
            // T/F: Mixing delete and malloc
            [
                'playlist_id'     => 1,
                'video_id'        => null,
                'timestamp'       => '24:45:00',
                'title'           => 'Delete with malloc (T/F)',
                'prompt'          => 'True or False: In C++, you can safely use "delete" on a pointer allocated by "malloc()".',
                'expected_output' => 'false',
                'syntax_hint'     => 'You must match "malloc" with "free" and "new" with "delete".',
                'type'            => 'truefalse',
                'options'         => null,
            ],
        ]);
    }
}
