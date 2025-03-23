<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Level;
class LevelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Level::create(['level_name' => 'level 1']);
        Level::create(['level_name' => 'level 2']);
        Level::create(['level_name' => 'level 3']);
        Level::create(['level_name' => 'level 4']);
    }
}
