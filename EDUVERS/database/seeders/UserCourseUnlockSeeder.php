<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserCourseUnlockSeeder extends Seeder
{
    public function run(): void
    {
        // بيانات تجريبية: 3 مستخدمين وكل واحد لديه عدة كورسات
        $data = [
            ['user_id' => 1, 'course_id' => 1],
            ['user_id' => 1, 'course_id' => 2],
            ['user_id' => 1, 'course_id' => 3],
            ['user_id' => 2, 'course_id' => 1],
            ['user_id' => 2, 'course_id' => 4],
            ['user_id' => 2, 'course_id' => 3],
            ['user_id' => 3, 'course_id' => 2],
            ['user_id' => 3, 'course_id' => 3],
            ['user_id' => 3, 'course_id' => 4],
        ];
        DB::table('user_course_unlocks')->insert($data);
    }
}
