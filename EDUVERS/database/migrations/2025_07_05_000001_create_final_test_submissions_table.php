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
        Schema::create('final_test_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_progress_id')->constrained('user_progress')->onDelete('cascade');
            $table->foreignId('final_test_id')->constrained('final_tests')->onDelete('cascade');
            $table->json('mcq_answers');
            $table->json('tf_answers');
            $table->json('code_solutions');
            $table->decimal('coding_marks', 5, 2);
            $table->decimal('mcq_marks', 5, 2);
            $table->decimal('tf_marks', 5, 2);
            $table->decimal('final_mark', 5, 2);
            $table->string('grade');
            $table->unsignedTinyInteger('rating')->nullable();
            $table->text('feedback')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('final_test_submissions');
    }
};
