<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('placement_questions', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('year');
            $table->unsignedTinyInteger('semester');
            $table->string('subject');
            $table->enum('type', ['mcq', 'true_false', 'coding']);
            $table->enum('difficulty', ['easy', 'medium', 'hard'])->default('easy');
            $table->text('question');
            $table->json('options')->nullable();
            $table->string('correct_answer')->nullable();
            $table->text('code_template')->nullable();
            $table->json('test_cases')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('placement_questions');
    }
};
