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
        Schema::create('placement_test_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('placement_test_id')->constrained('placement_tests')->onDelete('cascade');
            $table->text('question');
            $table->string('type'); // 'mcq', 'true_false', 'code'
            $table->json('options')->nullable();
            $table->string('correct_answer');
            $table->integer('difficulty')->default(1);
            $table->text('code_template')->nullable();
            $table->json('test_cases')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('placement_test_questions');
    }
};
