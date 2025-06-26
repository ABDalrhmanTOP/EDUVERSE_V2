<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Set all NULL paid values to false
        DB::table('playlists')->whereNull('paid')->update(['paid' => false]);
        // Alter the column to be NOT NULL and default false
        Schema::table('playlists', function (Blueprint $table) {
            $table->boolean('paid')->default(false)->nullable(false)->change();
        });
    }

    public function down(): void
    {
        // Allow NULL again if rolled back
        Schema::table('playlists', function (Blueprint $table) {
            $table->boolean('paid')->nullable()->default(false)->change();
        });
    }
};
