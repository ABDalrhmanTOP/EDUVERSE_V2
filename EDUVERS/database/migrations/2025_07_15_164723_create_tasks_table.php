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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('playlist_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('video_id')->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->text('prompt');
            $table->string('expected_output')->nullable();
            $table->text('syntax_hint')->nullable();
            $table->string('timestamp');
            $table->string('type')->nullable();
            $table->json('options')->nullable();
            $table->text('question')->nullable();
            $table->integer('correct_answer')->nullable();
            $table->text('tf_question')->nullable();
            $table->boolean('tf_answer')->nullable();
            $table->text('coding_question')->nullable();
            $table->json('coding_test_cases')->nullable();
            $table->text('coding_solution')->nullable();
            $table->string('coding_language')->default('javascript');
            $table->integer('points')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
