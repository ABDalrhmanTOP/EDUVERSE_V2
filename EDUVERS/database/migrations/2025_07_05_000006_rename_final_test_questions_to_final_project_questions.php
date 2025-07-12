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
        if (Schema::hasTable('final_test_questions')) {
            Schema::rename('final_test_questions', 'final_project_questions');

            Schema::table('final_project_questions', function (Blueprint $table) {
                if (Schema::hasColumn('final_project_questions', 'final_test_id')) {
                    $table->renameColumn('final_test_id', 'final_project_id');
                }
            });
    }
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Rename column back
        Schema::table('final_project_questions', function (Blueprint $table) {
            $table->renameColumn('final_project_id', 'final_test_id');
        });
        // Rename table back
        Schema::rename('final_project_questions', 'final_test_questions');
    }
};
