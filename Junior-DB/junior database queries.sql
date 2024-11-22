create database junior;
use junior;

create table Users
select * from users

CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMP NULL DEFAULT NULL,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL DEFAULT NULL,
    profile_photo_path VARCHAR(2048) NULL DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
ALTER TABLE users
DROP COLUMN current_team_id;
CREATE TABLE playlists (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL, -- Name of the course/playlist
    description TEXT NULL, -- Optional description for the course
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    playlist_id BIGINT UNSIGNED NOT NULL, -- References the playlist
    video_id VARCHAR(255) NOT NULL, -- ID of the video in the playlist
    title VARCHAR(255) NOT NULL, -- Title of the task
    prompt TEXT NOT NULL, -- Task description
    expected_output TEXT NOT NULL, -- The expected output for the task
    syntax_hint TEXT NOT NULL, -- Syntax hint for the task
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
);
CREATE TABLE user_progress (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL, -- References the user
    playlist_id BIGINT UNSIGNED NOT NULL, -- References the playlist
    video_id VARCHAR(255) NOT NULL, -- ID of the video being tracked
    playback_time INT UNSIGNED DEFAULT 0, -- Time in seconds
    completed_tasks JSON, -- Stores completed task IDs for this video
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
);

INSERT INTO playlists (id, name, description) 
VALUES (1, 'C++ Programming', 'Beginner to Advanced course');

INSERT INTO tasks (playlist_id, video_id, timestamp, title, prompt, expected_output, syntax_hint)
VALUES
    -- Chapter 2: Diving in
    (1, '1:43:01', '01:43:01', 'Your First C++ Program', 'Write a C++ program that outputs ''Hello, World!'' using `cout`.', 'Hello, World!', 'Ensure you use `cout` to output ''Hello, World!''.'),
    (1, '1:50:00', '01:50:00', 'Adding Comments', 'Write a program that declares an integer variable and uses comments to explain its purpose.', '', 'Include both `//` single-line comments and `/* */` multi-line comments.'),
    (1, '1:55:00', '01:55:00', 'Handling Errors', 'Write a program that tries to divide by zero and uses a try-catch block to handle the exception.', 'Error: Division by zero', 'Use a `try` block for division and a `catch` block for error handling.'),

    -- Chapter 3: Variables and Data Types
    (1, '3:00:47', '03:00:47', 'Working with Variables', 'Declare two integer variables `a = 5` and `b = 10`, compute their sum, and print it.', '15', 'Declare two integer variables `a` and `b` with appropriate values and print their sum using `cout`.'),
    (1, '3:20:00', '03:20:00', 'Exploring Booleans', 'Write a program that declares a boolean variable, assigns it a value, and prints it.', '1', 'Declare a boolean variable, assign it `true`, and use `cout` to print its value.'),
    (1, '3:40:00', '03:40:00', 'Character Manipulation', 'Write a program that declares a `char` variable, assigns it a character, and prints it.', 'A', 'Use `char` to declare a variable and `cout` to print it.'),

    -- Chapter 4: Operations on Data
    (1, '4:46:46', '04:46:46', 'Performing Basic Operations', 'Write a program that multiplies `7` by `6` using variables and prints the result.', '42', 'Define variables `x` and `y` with values `7` and `6`, multiply them, and print the result using `cout`.'),
    (1, '5:10:00', '05:10:00', 'Using Logical Operators', 'Write a program that checks if a number is greater than 5 and less than 15.', 'True', 'Use logical operators `&&` to combine conditions and `cout` to print the result.'),
    (1, '5:50:00', '05:50:00', 'Math Functions', 'Write a program that calculates the square root of 25 and prints the result.', '5', 'Use `sqrt` from the `cmath` library and `cout` to print the result.'),

    -- Chapter 5: Flow Control
    (1, '7:01:58', '07:01:58', 'Using If-Else Statements', 'Write a program that checks if a number is positive, negative, or zero and prints the result.', 'Positive', 'Use an `if-else` block to check whether a number is positive, negative, or zero and print the result using `cout`.'),
    (1, '7:20:00', '07:20:00', 'Switch Case Example', 'Write a program that takes an integer input and uses a `switch` statement to print ''One'', ''Two'', or ''Other''.', 'One', 'Use a `switch` statement to check for cases `1`, `2`, and `default`.'),

    -- Chapter 6: Loops
    (1, '7:53:49', '07:53:49', 'Using For Loops', 'Write a `for` loop to print numbers from 1 to 5.', '1\n2\n3\n4\n5', 'Use a `for` loop to iterate from 1 to 5 and print each number using `cout`.'),
    (1, '8:10:00', '08:10:00', 'Using While Loops', 'Write a `while` loop to print numbers from 1 to 3.', '1\n2\n3', 'Use a `while` loop to iterate and print numbers.'),

    -- Chapter 7: Arrays
    (1, '8:47:08', '08:47:08', 'Array Basics', 'Declare an array `arr = {10, 20, 30, 40, 50}` and print the third element.', '30', 'Define an array `arr` with elements `{10, 20, 30, 40, 50}` and use `cout` to print the third element.'),

    -- Chapter 8: Pointers
    (1, '9:53:23', '09:53:23', 'Using Pointers', 'Declare a pointer to an integer `x = 42` and print its dereferenced value.', '42', 'Declare an integer variable `x` and a pointer `*ptr`, assign `x` to `*ptr`, and print its dereferenced value using `cout`.'),

    -- Chapter 11: Functions
    (1, '14:12:47', '14:12:47', 'Creating Functions', 'Write a function `int add(int a, int b)` that returns the sum of two numbers.', 'Sum is 15', 'Define a function `add` that takes two integers as parameters, returns their sum, and call this function in `main`.'),

    -- Chapter 17: Classes
    (1, '20:15:40', '20:15:40', 'Basic Class Implementation', 'Define a class `Rectangle` with attributes `length` and `width`. Add a method to compute the area.', 'Area: 50', 'Define a class `Rectangle` with attributes `length` and `width`, and a method to compute and return the area.'),

    -- Chapter 18: Inheritance
    (1, '22:52:43', '22:52:43', 'Using Inheritance', 'Create a base class `Animal` with a method `speak`. Derive a class `Dog` and override `speak` to print ''Woof!''.', 'Woof!', 'Define a base class with a virtual method, derive a class, and override the method.');

select * from tasks
select * from playlists
select * from user_progress
select * from users
SELECT * FROM tasks WHERE playlist_id = 1;
select * from personal_access_tokens