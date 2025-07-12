<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB; // Added this import for DB facade

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('playlists', function (Blueprint $table) {
            // Drop the existing column and recreate it with proper size
            $table->dropColumn('video_duration');
        });

        Schema::table('playlists', function (Blueprint $table) {
            $table->string('video_duration', 10)->nullable()->after('semester');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('playlists', function (Blueprint $table) {
            $table->dropColumn('video_duration');
        });

        Schema::table('playlists', function (Blueprint $table) {
            $table->string('video_duration', 8)->nullable()->after('semester');
        });
    }
};
