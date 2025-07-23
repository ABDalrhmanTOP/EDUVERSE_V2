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
        Schema::table('final_project_questions', function (Blueprint $table) {
            if (!Schema::hasColumn('final_project_questions', 'mark')) {
                $table->float('mark')->default(1);
            }
            if (!Schema::hasColumn('final_project_questions', 'test_cases')) {
                $table->json('test_cases')->nullable();
            }
            if (!Schema::hasColumn('final_project_questions', 'code_template')) {
                $table->text('code_template')->nullable();
            }
            if (!Schema::hasColumn('final_project_questions', 'difficulty')) {
                $table->string('difficulty')->nullable();
            }
            if (!Schema::hasColumn('final_project_questions', 'options')) {
                $table->json('options')->nullable();
            }
            if (!Schema::hasColumn('final_project_questions', 'correct_answer')) {
                $table->string('correct_answer')->nullable();
            }
            if (!Schema::hasColumn('final_project_questions', 'type')) {
                $table->string('type')->nullable();
            }
            if (!Schema::hasColumn('final_project_questions', 'question')) {
                $table->text('question')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('final_project_questions', function (Blueprint $table) {
            if (Schema::hasColumn('final_project_questions', 'mark')) {
                $table->dropColumn('mark');
            }
            if (Schema::hasColumn('final_project_questions', 'test_cases')) {
                $table->dropColumn('test_cases');
            }
            if (Schema::hasColumn('final_project_questions', 'code_template')) {
                $table->dropColumn('code_template');
            }
            if (Schema::hasColumn('final_project_questions', 'difficulty')) {
                $table->dropColumn('difficulty');
            }
            if (Schema::hasColumn('final_project_questions', 'options')) {
                $table->dropColumn('options');
            }
            if (Schema::hasColumn('final_project_questions', 'correct_answer')) {
                $table->dropColumn('correct_answer');
            }
            if (Schema::hasColumn('final_project_questions', 'type')) {
                $table->dropColumn('type');
            }
            if (Schema::hasColumn('final_project_questions', 'question')) {
                $table->dropColumn('question');
            }
        });
    }
};
