<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Link to users table
            $table->foreignId('playlist_id')->nullable()->constrained()->onDelete('cascade'); // Changed from task_id to playlist_id
            $table->string('video_id'); // Assuming this remains relevant
            $table->string('last_timestamp')->default('00:00:00');
            $table->json('completed_tasks')->nullable(); // If tasks are tracked, store them here
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_progress');
    }
};
