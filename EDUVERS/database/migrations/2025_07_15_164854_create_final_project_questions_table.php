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
            $table->unsignedBigInteger('final_project_id');
            $table->text('question')->nullable();
            $table->string('type')->nullable();
            $table->json('options')->nullable();
            $table->string('correct_answer')->nullable();
            $table->string('difficulty')->nullable();
            $table->text('code_template')->nullable();
            $table->json('test_cases')->nullable();
            $table->float('mark')->default(1);
            $table->timestamps();
            $table->foreign('final_project_id')->references('id')->on('final_projects')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('final_project_questions');
    }
};
