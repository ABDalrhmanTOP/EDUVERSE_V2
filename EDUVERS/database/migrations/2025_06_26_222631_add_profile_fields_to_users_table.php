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
        Schema::table('users', function (Blueprint $table) {
            // Profile information fields
            $table->string('job')->nullable();
            $table->string('university')->nullable();
            $table->string('country')->nullable();
            $table->string('experience')->nullable();
            $table->string('career_goals')->nullable();
            $table->string('hobbies')->nullable();
            $table->string('expectations')->nullable();

            // Dynamic fields based on job
            $table->string('education_level')->nullable();
            $table->string('field_of_study')->nullable();
            $table->string('student_year')->nullable();
            $table->string('years_of_experience')->nullable();
            $table->string('specialization')->nullable();
            $table->string('teaching_subject')->nullable();
            $table->string('research_field')->nullable();
            $table->string('company_size')->nullable();
            $table->string('industry')->nullable();

            // Academic information
            $table->integer('semester')->default(1);

            // Flag to track if user has completed the general form
            $table->boolean('has_completed_general_form')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'job',
                'university',
                'country',
                'experience',
                'career_goals',
                'hobbies',
                'expectations',
                'education_level',
                'field_of_study',
                'student_year',
                'years_of_experience',
                'specialization',
                'teaching_subject',
                'research_field',
                'company_size',
                'industry',
                'semester',
                'has_completed_general_form'
            ]);
        });
    }
};
