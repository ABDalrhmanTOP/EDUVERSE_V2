<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('user_course_unlocks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('course_id');
            $table->decimal('placement_score', 5, 2)->nullable();
            $table->string('unlock_reason')->nullable();
            $table->timestamp('unlocked_at')->nullable();
            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('course_id')->references('id')->on('playlists')->onDelete('cascade');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('user_course_unlocks');
    }
};
