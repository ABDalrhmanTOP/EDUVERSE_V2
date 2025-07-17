<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CommunityPost;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class CommunityPostSeeder extends Seeder
{
    public function run()
    {
        // تأكد من وجود مستخدم واحد على الأقل
        $user = User::first();
        if (!$user) {
            $user = User::create([
                'name' => 'Demo User',
                'email' => 'demo@example.com',
                'password' => bcrypt('password'),
            ]);
        }
        $userId = $user->id;
        // بيانات تجريبية مع صور افتراضية
        CommunityPost::query()->delete();
        CommunityPost::create([
            'user_id' => $userId,
            'title' => 'Welcome to the Community!',
            'content' => 'This is the first post with an image.',
            'image_path' => 'community_posts/sample1.jpg',
        ]);
        CommunityPost::create([
            'user_id' => $userId,
            'title' => 'Second Post',
            'content' => 'Post without image.',
            'image_path' => null,
        ]);
        CommunityPost::create([
            'user_id' => $userId,
            'title' => 'Another Post with Image',
            'content' => 'Here is another post with a different image.',
            'image_path' => 'community_posts/sample2.png',
        ]);
    }
}
