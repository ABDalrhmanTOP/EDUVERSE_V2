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
        Schema::create('results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('level_id')->nullable()->constrained()->onDelete('cascade');
            $table->integer('score');
            // Add columns for test results
            $table->foreignId('test_id')->nullable()->constrained('placement_tests')->onDelete('cascade');
            $table->integer('total_questions')->nullable();
            $table->decimal('percentage', 5, 2)->nullable();
            $table->string('test_type')->nullable(); // 'placement' or 'final'
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('results');
    }
};
