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
        Schema::table('user_course_unlocks', function (Blueprint $table) {
            $table->decimal('placement_score', 5, 2)->nullable()->after('unlocked_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_course_unlocks', function (Blueprint $table) {
            $table->dropColumn('placement_score');
        });
    }
};
