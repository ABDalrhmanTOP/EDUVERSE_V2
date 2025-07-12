<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('playlists', function (Blueprint $table) {
            $table->id();
            $table->string('video_id')->nullable();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('year')->default(1);
            $table->integer('semester')->default(1);
            $table->boolean('paid')->default(false);
            $table->integer('video_duration')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('playlists');
    }
};
