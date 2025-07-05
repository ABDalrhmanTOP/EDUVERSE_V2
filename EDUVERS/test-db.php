<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing Database Connection...\n";

try {
    // Test database connection
    DB::connection()->getPdo();
    echo "✅ Database connection successful\n";

    // Check if user_progress table exists
    if (Schema::hasTable('user_progress')) {
        echo "✅ user_progress table exists\n";

        // Check table structure
        $columns = Schema::getColumnListing('user_progress');
        echo "📋 Table columns: " . implode(', ', $columns) . "\n";

        // Check if there are any records
        $count = DB::table('user_progress')->count();
        echo "📊 Number of records in user_progress: $count\n";

        if ($count > 0) {
            $sample = DB::table('user_progress')->first();
            echo "📝 Sample record: " . json_encode($sample, JSON_PRETTY_PRINT) . "\n";
        }
    } else {
        echo "❌ user_progress table does not exist\n";
    }

    // Check if users table exists
    if (Schema::hasTable('users')) {
        echo "✅ users table exists\n";
        $userCount = DB::table('users')->count();
        echo "👥 Number of users: $userCount\n";
    } else {
        echo "❌ users table does not exist\n";
    }

    // Check if playlists table exists
    if (Schema::hasTable('playlists')) {
        echo "✅ playlists table exists\n";
        $playlistCount = DB::table('playlists')->count();
        echo "📚 Number of playlists: $playlistCount\n";
    } else {
        echo "❌ playlists table does not exist\n";
    }
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
}

echo "\nTest completed.\n";
