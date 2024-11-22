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
            ],
        ]);
    }
}
