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
        Schema::table('tasks', function (Blueprint $table) {
            $table->text('description')->nullable()->after('title');
            $table->text('question')->nullable()->after('options');
            $table->integer('correct_answer')->nullable()->after('question');
            $table->text('tf_question')->nullable()->after('correct_answer');
            $table->boolean('tf_answer')->nullable()->after('tf_question');
            $table->text('coding_question')->nullable()->after('tf_answer');
            $table->json('coding_test_cases')->nullable()->after('coding_question');
            $table->text('coding_solution')->nullable()->after('coding_test_cases');
            $table->string('coding_language')->default('javascript')->after('coding_solution');
            $table->integer('points')->default(1)->after('coding_language');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn([
                'description',
                'question',
                'correct_answer',
                'tf_question',
                'tf_answer',
                'coding_question',
                'coding_test_cases',
                'coding_solution',
                'coding_language',
                'points'
            ]);
        });
    }
};
