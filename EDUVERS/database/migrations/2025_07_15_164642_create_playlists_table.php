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
        Schema::create('playlists', function (Blueprint $table) {
            $table->id();
            $table->string('video_id')->nullable();
            $table->string('name');
            $table->string('description')->nullable();
            $table->integer('year')->default(1);
            $table->integer('semester')->default(1);
            $table->string('video_duration')->nullable();
            $table->boolean('paid')->default(false)->nullable(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('playlists');
    }
};
