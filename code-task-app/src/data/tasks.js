export const tasks = [
  // Chapter 2: Diving in
  {
    title: "Your First C++ Program",
    timestamp: "1:43:01",
    prompt: "Write a C++ program that outputs 'Hello, World!' using `cout`.",
    expectedOutput: "Hello, World!",
    syntaxHint: "Ensure you use `cout` to output 'Hello, World!'.",
  },
  {
    title: "Adding Comments",
    timestamp: "1:50:00",
    prompt: "Write a program that declares an integer variable and uses comments to explain its purpose.",
    expectedOutput: "",
    syntaxHint: "Include both `//` single-line comments and `/* */` multi-line comments.",
  },
  {
    title: "Handling Errors",
    timestamp: "1:55:00",
    prompt: "Write a program that tries to divide by zero and uses a try-catch block to handle the exception.",
    expectedOutput: "Error: Division by zero",
    syntaxHint: "Use a `try` block for division and a `catch` block for error handling.",
  },
  // Chapter 3: Variables and Data Types
  {
    title: "Working with Variables",
    timestamp: "3:00:47",
    prompt: "Declare two integer variables `a = 5` and `b = 10`, compute their sum, and print it.",
    expectedOutput: "15",
    syntaxHint: "Declare two integer variables `a` and `b` with appropriate values and print their sum using `cout`.",
  },
  {
    title: "Exploring Booleans",
    timestamp: "3:20:00",
    prompt: "Write a program that declares a boolean variable, assigns it a value, and prints it.",
    expectedOutput: "1", // Assuming true
    syntaxHint: "Declare a boolean variable, assign it `true`, and use `cout` to print its value.",
  },
  {
    title: "Character Manipulation",
    timestamp: "3:40:00",
    prompt: "Write a program that declares a `char` variable, assigns it a character, and prints it.",
    expectedOutput: "A",
    syntaxHint: "Use `char` to declare a variable and `cout` to print it.",
  },
  // Chapter 4: Operations on Data
  {
    title: "Performing Basic Operations",
    timestamp: "4:46:46",
    prompt: "Write a program that multiplies `7` by `6` using variables and prints the result.",
    expectedOutput: "42",
    syntaxHint: "Define variables `x` and `y` with values `7` and `6`, multiply them, and print the result using `cout`.",
  },
  {
    title: "Using Logical Operators",
    timestamp: "5:10:00",
    prompt: "Write a program that checks if a number is greater than 5 and less than 15.",
    expectedOutput: "True",
    syntaxHint: "Use logical operators `&&` to combine conditions and `cout` to print the result.",
  },
  {
    title: "Math Functions",
    timestamp: "5:50:00",
    prompt: "Write a program that calculates the square root of 25 and prints the result.",
    expectedOutput: "5",
    syntaxHint: "Use `sqrt` from the `cmath` library and `cout` to print the result.",
  },
  // Chapter 5: Flow Control
  {
    title: "Using If-Else Statements",
    timestamp: "7:01:58",
    prompt: "Write a program that checks if a number is positive, negative, or zero and prints the result.",
    expectedOutput: "Positive",
    syntaxHint: "Use an `if-else` block to check whether a number is positive, negative, or zero and print the result using `cout`.",
  },
  {
    title: "Switch Case Example",
    timestamp: "7:20:00",
    prompt: "Write a program that takes an integer input and uses a `switch` statement to print 'One', 'Two', or 'Other'.",
    expectedOutput: "One",
    syntaxHint: "Use a `switch` statement to check for cases `1`, `2`, and `default`.",
  },
  // Chapter 6: Loops
  {
    title: "Using For Loops",
    timestamp: "7:53:49",
    prompt: "Write a `for` loop to print numbers from 1 to 5.",
    expectedOutput: "1\n2\n3\n4\n5",
    syntaxHint: "Use a `for` loop to iterate from 1 to 5 and print each number using `cout`.",
  },
  {
    title: "Using While Loops",
    timestamp: "8:10:00",
    prompt: "Write a `while` loop to print numbers from 1 to 3.",
    expectedOutput: "1\n2\n3",
    syntaxHint: "Use a `while` loop to iterate and print numbers.",
  },
  // Chapter 7: Arrays
  {
    title: "Array Basics",
    timestamp: "8:47:08",
    prompt: "Declare an array `arr = {10, 20, 30, 40, 50}` and print the third element.",
    expectedOutput: "30",
    syntaxHint: "Define an array `arr` with elements `{10, 20, 30, 40, 50}` and use `cout` to print the third element.",
  },
  // Chapter 8: Pointers
  {
    title: "Using Pointers",
    timestamp: "9:53:23",
    prompt: "Declare a pointer to an integer `x = 42` and print its dereferenced value.",
    expectedOutput: "42",
    syntaxHint: "Declare an integer variable `x` and a pointer `*ptr`, assign `x` to `*ptr`, and print its dereferenced value using `cout`.",
  },
  // Chapter 11: Functions
  {
    title: "Creating Functions",
    timestamp: "14:12:47",
    prompt: "Write a function `int add(int a, int b)` that returns the sum of two numbers.",
    expectedOutput: "Sum is 15",
    syntaxHint: "Define a function `add` that takes two integers as parameters, returns their sum, and call this function in `main`.",
  },
  // Chapter 17: Classes
  {
    title: "Basic Class Implementation",
    timestamp: "20:15:40",
    prompt: "Define a class `Rectangle` with attributes `length` and `width`. Add a method to compute the area.",
    expectedOutput: "Area: 50",
    syntaxHint: "Define a class `Rectangle` with attributes `length` and `width`, and a method to compute and return the area.",
  },
  // Chapter 18: Inheritance
  {
    title: "Using Inheritance",
    timestamp: "22:52:43",
    prompt: "Create a base class `Animal` with a method `speak`. Derive a class `Dog` and override `speak` to print 'Woof!'.",
    expectedOutput: "Woof!",
    syntaxHint: "Define a base class with a virtual method, derive a class, and override the method.",
  },
];
