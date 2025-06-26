<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('playlists', 'video_duration')) {
            Schema::table('playlists', function (Blueprint $table) {
                $table->string('video_duration')->nullable()->after('semester');
            });
        }
        if (!Schema::hasColumn('playlists', 'paid')) {
            Schema::table('playlists', function (Blueprint $table) {
                $table->boolean('paid')->default(false)->after('video_duration');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('playlists', 'video_duration')) {
            Schema::table('playlists', function (Blueprint $table) {
                $table->dropColumn('video_duration');
            });
        }
        if (Schema::hasColumn('playlists', 'paid')) {
            Schema::table('playlists', function (Blueprint $table) {
                $table->dropColumn('paid');
            });
        }
    }
};
