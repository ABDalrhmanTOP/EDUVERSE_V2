<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;


class DatabaseSeeder extends Seeder
{

    public function run(): void
    {
        $this->call([
            PlaylistsSeeder::class,
            TasksSeeder::class,
            LevelSeeder::class,
            QuestionSeeder::class,
            PlacementTestQuestionsSeeder::class
            // Add other seeders as required
        ]);

        User::factory()->create([
            'name' => 'adminEdu',
            'username' => 'adminedu',
            'email' => 'ert44039@gmail.com',
            'password' => '$2y$12$azrTFlr8dHKvxWLy5eiHTO7LTiTjE4dt2k/dXr3gF8oGdKBBbtuTm',
            'role' => 'admin'
        ]);
    }
}
