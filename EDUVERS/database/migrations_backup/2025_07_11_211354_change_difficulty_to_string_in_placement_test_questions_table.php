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
        Schema::table('placement_test_questions', function (Blueprint $table) {
            $table->string('difficulty')->default('easy')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('placement_test_questions', function (Blueprint $table) {
            $table->integer('difficulty')->default(1)->change();
        });
    }
};
