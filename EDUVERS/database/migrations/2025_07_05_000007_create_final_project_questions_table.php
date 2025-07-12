<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('final_project_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('final_project_id')->constrained('final_projects')->onDelete('cascade');
            $table->text('question');
            $table->string('type'); // 'mcq', 'true_false', 'code', 'text'
            $table->json('options')->nullable();
            $table->text('correct_answer');
            $table->string('difficulty')->default('easy');
            $table->text('code_template')->nullable();
            $table->json('test_cases')->nullable();
            $table->integer('points')->default(1);
            $table->text('explanation')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('final_project_questions');
    }
};
