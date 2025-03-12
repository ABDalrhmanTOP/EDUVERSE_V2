<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Question;


class QuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $questions = [
            // Level 1
            1 => [
                ['question' => 'C++ supports object-oriented programming.', 'correct_answer' => 'true'],
                ['question' => 'A pointer in C++ is a fixed data type.', 'correct_answer' => 'false'],
                ['question' => 'A Constructor in C++ can have a return value.', 'correct_answer' => 'false'],
                ['question' => 'A Destructor in C++ is called automatically when the object is destroyed.', 'correct_answer' => 'true'],
                ['question' => 'A header file in C++ has the extension ".cpp".', 'correct_answer' => 'false'],
                ['question' => 'In C++, a function can be defined outside the class using static.', 'correct_answer' => 'true'],
                ['question' => 'C++ uses only static memory without supporting dynamic memory.', 'correct_answer' => 'false'],
                ['question' => 'Pointers in C++ can only store temporary addresses of objects.', 'correct_answer' => 'false'],
                ['question' => 'A loop in C++ can contain a break statement to exit the loop.', 'correct_answer' => 'true'],
                ['question' => 'In C++, we can have more than one main function in the same file.', 'correct_answer' => 'false'],
                ['question' => 'In C++, a function cannot be defined with the same name as the class.', 'correct_answer' => 'true'],
                ['question' => 'C++ allows the use of function pointers.', 'correct_answer' => 'true'],
                ['question' => 'C++ supports multiple levels of inheritance.', 'correct_answer' => 'true'],
                ['question' => 'You cannot use templates with functions in C++.', 'correct_answer' => 'false'],
                ['question' => 'The size of an array in C++ must be known at compile time.', 'correct_answer' => 'true'],
                ['question' => 'In C++, you cannot change the value of a constant variable after initialization.', 'correct_answer' => 'true'],
                ['question' => 'C++ supports dynamic memory allocation using new and delete operators.', 'correct_answer' => 'true'],
                ['question' => 'A class can contain a member function with the same name as the class in C++.', 'correct_answer' => 'true'],
                ['question' => 'C++ does not support operator overloading.', 'correct_answer' => 'false'],
                ['question' => 'C++ supports inline functions for optimization.', 'correct_answer' => 'true'],
                ['question' => 'C++ supports exception handling using try, catch, and throw.', 'correct_answer' => 'true'],
                ['question' => 'You cannot define an array of pointers in C++.', 'correct_answer' => 'false'],
                ['question' => 'C++ uses pointers extensively to work with dynamic memory.', 'correct_answer' => 'true'],
                ['question' => 'In C++, a variable declared inside a loop retains its value after the loop ends.', 'correct_answer' => 'false'],
                ['question' => 'You can use C++ to create both desktop and mobile applications.', 'correct_answer' => 'true'],
                ['question' => 'C++ supports function overloading.', 'correct_answer' => 'true'],
                ['question' => 'In C++, arrays are always passed by value to functions.', 'correct_answer' => 'false'],
                ['question' => 'In C++, functions cannot return arrays.', 'correct_answer' => 'true'],
                ['question' => 'C++ does not allow anonymous classes.', 'correct_answer' => 'false'],
                ['question' => 'C++ allows you to implement interfaces using pure virtual functions.', 'correct_answer' => 'true'],
            ],
            // Level 2
            2 => [
                ['question' => 'Virtual functions in C++ allow changing the behavior of the function in derived classes.', 'correct_answer' => 'true'],
                ['question' => 'A recursive function can be defined in C++', 'correct_answer' => 'true'],
                ['question' => 'The namespace in C++ does not help avoid name conflicts.', 'correct_answer' => 'false'],
                ['question' => 'The null pointer in C++ means it points to an unknown value.', 'correct_answer' => 'false'],
                ['question' => 'In C++, exception handling uses try, catch, finally.', 'correct_answer' => 'false'],
                ['question' => 'A class in C++ can contain functions without definitions, known as pure virtual functions.', 'correct_answer' => 'true'],
                ['question' => 'C++ only uses fixed-size arrays.', 'correct_answer' => 'false'],
                ['question' => 'In C++, variables can be public, private, or protected.', 'correct_answer' => 'true'],
                ['question' => 'A constructor in C++ must have the same name as the class.', 'correct_answer' => 'true'],
                ['question' => 'Virtual destructors in C++ make dynamic object deletion safe.', 'correct_answer' => 'true'],
                ['question' => 'C++ allows operator overloading to redefine the behavior of operators.', 'correct_answer' => 'true'],
                ['question' => 'C++ allows the use of function pointers.', 'correct_answer' => 'true'],
                ['question' => 'The default constructor in C++ is automatically called when an object is created.', 'correct_answer' => 'true'],
                ['question' => 'In C++, a class can have multiple constructors.', 'correct_answer' => 'true'],
                ['question' => 'C++ uses the reference keyword to pass arguments by reference.', 'correct_answer' => 'true'],
                ['question' => 'C++ does not support multiple inheritance.', 'correct_answer' => 'false'],
                ['question' => 'A friend function in C++ can access the private and protected members of a class.', 'correct_answer' => 'true'],
                ['question' => 'C++ supports exceptions that can be thrown and caught in the same scope.', 'correct_answer' => 'true'],
                ['question' => 'You cannot define a function inside a class in C++.', 'correct_answer' => 'false'],
                ['question' => 'In C++, a function can be overloaded by changing its return type.', 'correct_answer' => 'false'],
                ['question' => 'C++ supports using static members that are shared among all objects of a class.', 'correct_answer' => 'true'],
                ['question' => 'In C++, multiple classes can inherit from a single base class.', 'correct_answer' => 'true'],
                ['question' => 'C++ supports operator overloading for both arithmetic and relational operators.', 'correct_answer' => 'true'],
                ['question' => 'You can use C++ to implement abstract classes.', 'correct_answer' => 'true'],
                ['question' => 'C++ allows classes to inherit from multiple base classes.', 'correct_answer' => 'true'],
                ['question' => 'C++ allows defining an array of structures.', 'correct_answer' => 'true'],
                ['question' => 'You cannot declare a static variable inside a function in C++.', 'correct_answer' => 'false'],
                ['question' => 'In C++, you can use the virtual keyword with member functions to enable runtime polymorphism.', 'correct_answer' => 'true'],
            ],
            // Level 3
            3 => [
                ['question' => 'Operator overloading in C++ allows changing the behavior of arithmetic operations.', 'correct_answer' => 'true'],
                ['question' => 'In C++, if a class has private members, they cannot be accessed directly.', 'correct_answer' => 'true'],
                ['question' => 'Pointer arithmetic in C++ allows performing mathematical operations on pointers.', 'correct_answer' => 'true'],
                ['question' => 'Friend functions in C++ can access private members within the class.', 'correct_answer' => 'true'],
                ['question' => 'C++ uses only automatic memory (stack memory) and does not support dynamic memory.', 'correct_answer' => 'false'],
                ['question' => 'Templates in C++ are used to generalize code to work with multiple data types.', 'correct_answer' => 'true'],
                ['question' => 'C++ supports multiple inheritance, meaning a class can inherit from multiple objects at the same time.', 'correct_answer' => 'true'],
                ['question' => 'In C++, public variables can be used to store sensitive data.', 'correct_answer' => 'false'],
                ['question' => 'Static variables in C++ can retain their value between function calls.', 'correct_answer' => 'true'],
                ['question' => 'In C++, we can use the goto statement to transfer the program control to any point in the code.', 'correct_answer' => 'true'],
                ['question' => 'C++ allows using the sizeof operator to determine the size of a data type or object.', 'correct_answer' => 'true'],
                ['question' => 'C++ supports dynamic memory allocation using malloc and free.', 'correct_answer' => 'false'],
                ['question' => 'In C++, it is possible to pass an object by reference to avoid making a copy.', 'correct_answer' => 'true'],
                ['question' => 'C++ supports recursive function calls to allow a function to call itself.', 'correct_answer' => 'true'],
                ['question' => 'C++ allows virtual inheritance to prevent ambiguity when using multiple inheritance.', 'correct_answer' => 'true'],
                ['question' => 'In C++, a pointer can point to a function or an array.', 'correct_answer' => 'true'],
                ['question' => 'C++ supports the concept of function templates for code reuse with different data types.', 'correct_answer' => 'true'],
                ['question' => 'C++ supports the use of exceptions to handle runtime errors.', 'correct_answer' => 'true'],
                ['question' => 'C++ allows direct memory access using pointers.', 'correct_answer' => 'true'],
                ['question' => 'C++ supports using multiple constructors to initialize objects in different ways.', 'correct_answer' => 'true'],
                ['question' => 'You can define a class inside another class in C++.', 'correct_answer' => 'true'],
                ['question' => 'C++ supports both manual and automatic memory management.', 'correct_answer' => 'true'],
                ['question' => 'C++ allows operators to be overloaded for custom types.', 'correct_answer' => 'true'],
                ['question' => 'C++ supports the use of namespaces to avoid name conflicts between libraries.', 'correct_answer' => 'true'],
                ['question' => 'In C++, static members are shared across all instances of a class.', 'correct_answer' => 'true'],
                ['question' => 'C++ allows using exception handling to deal with runtime errors effectively.', 'correct_answer' => 'true'],
                ['question' => 'C++ does not support nested classes.', 'correct_answer' => 'false'],
                ['question' => 'In C++, friend functions have access to private and protected members of a class.', 'correct_answer' => 'true'],
            ]
        ];


        // إدخال الأسئلة في قاعدة البيانات حسب المستويات
        foreach ($questions as $levelId => $levelQuestions) {
            foreach ($levelQuestions as $q) {
                Question::create([
                    'level_id' => $levelId, // تعيين الـ level_id بناءً على المستوى
                    'question' => $q['question'],
                    'correct_answer' => $q['correct_answer']
                ]);
            }
        }

    }
}
