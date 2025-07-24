<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlaylistsSeeder extends Seeder
{
    public function run()
    {
        DB::table('playlists')->insert([
            [
                'id' => 1,
                'name' => 'C++ Programming',
                'description' => 'Beginner to Advanced course',
                'video_id' => '8jLOx1hD3_o', // Add video_id here
            ],
            [
                'id' => 2,
                'name' => 'Python for Beginners',
                'description' => 'Learn Python from scratch',
                'video_id' => 'hEgO047GxaQ', // Another video_id example
            ],
            [
                'id' => 3,
                'name' => 'JavaScript Essentials',
                'description' => 'Core JavaScript concepts',
                'video_id' => 'dQw4w9WgXcQ',
            ],
            [
                'id' => 4,
                'name' => 'Data Structures',
                'description' => 'Learn about data structures',
                'video_id' => 'DsVxgOjTL7A',
            ],
        ]);
    }
}
