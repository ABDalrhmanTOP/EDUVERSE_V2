<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;


class DatabaseSeeder extends Seeder
{

    public function run(): void
    {
        // First create users
        $this->call([
            PlaylistsSeeder::class,
            TasksSeeder::class,
            LevelSeeder::class,
            QuestionSeeder::class,
            PlacementQuestionsSeeder::class
            // UserCourseUnlockSeeder will be called after users are created
        ]);

        // Create admin user
        User::factory()->create([
            'name' => 'adminEdu',
            'username' => 'adminedu',
            'email' => 'ert44039@gmail.com',
            'password' => '$2y$12$azrTFlr8dHKvxWLy5eiHTO7LTiTjE4dt2k/dXr3gF8oGdKBBbtuTm',
            'role' => 'admin'
        ]);

        // Create three additional users
        User::create([
            'name' => 'Ahmed Hassan',
            'username' => 'ahmed_hassan',
            'email' => 'ahmed.hassan@example.com',
            'password' => bcrypt('password123'),
            'role' => 'user',
            'job' => 'Software Developer',
            'university' => 'Cairo University',
            'country' => 'Egypt',
            'experience' => 'Intermediate',
            'education_level' => 'Bachelor',
            'field_of_study' => 'Computer Science',
            'student_year' => '3rd Year',
            'semester' => 1,
            'has_completed_general_form' => true,
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Sara Mohamed',
            'username' => 'sara_mohamed',
            'email' => 'sara.mohamed@example.com',
            'password' => bcrypt('password123'),
            'role' => 'user',
            'job' => 'Student',
            'university' => 'Alexandria University',
            'country' => 'Egypt',
            'experience' => 'Beginner',
            'education_level' => 'Bachelor',
            'field_of_study' => 'Information Technology',
            'student_year' => '2nd Year',
            'semester' => 2,
            'has_completed_general_form' => true,
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Omar Ali',
            'username' => 'omar_ali',
            'email' => 'omar.ali@example.com',
            'password' => bcrypt('password123'),
            'role' => 'user',
            'job' => 'Web Developer',
            'university' => 'Ain Shams University',
            'country' => 'Egypt',
            'experience' => 'Advanced',
            'education_level' => 'Master',
            'field_of_study' => 'Software Engineering',
            'student_year' => 'Graduate',
            'semester' => 1,
            'has_completed_general_form' => true,
            'email_verified_at' => now(),
        ]);

        // Now run UserCourseUnlockSeeder after users are created
        $this->call([
            UserCourseUnlockSeeder::class
        ]);
    }
}
