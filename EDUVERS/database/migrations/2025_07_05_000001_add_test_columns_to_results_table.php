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
        Schema::table('results', function (Blueprint $table) {
            // Add columns for test results
            $table->foreignId('test_id')->nullable()->after('level_id')->constrained('placement_tests')->onDelete('cascade');
            $table->integer('total_questions')->nullable()->after('score');
            $table->decimal('percentage', 5, 2)->nullable()->after('total_questions');
            $table->string('test_type')->nullable()->after('percentage'); // 'placement' or 'final'
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('results', function (Blueprint $table) {
            $table->dropForeign(['test_id']);
            $table->dropColumn(['test_id', 'total_questions', 'percentage', 'test_type']);
        });
    }
};
