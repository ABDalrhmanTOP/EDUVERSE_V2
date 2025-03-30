<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('playlist_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('video_id')->nullable();
            $table->string('title');
            $table->text('prompt'); // if prompt may also be large
            $table->string('expected_output')->nullable();
            $table->text('syntax_hint')->nullable();
            $table->string('timestamp');
            $table->string('type')->nullable();
            $table->json('options')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
