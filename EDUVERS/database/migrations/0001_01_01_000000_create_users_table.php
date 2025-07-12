<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('username')->unique()->nullable();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->text('two_factor_secret')->nullable();
            $table->text('two_factor_recovery_codes')->nullable();
            $table->timestamp('two_factor_confirmed_at')->nullable();
            $table->rememberToken();
            $table->string('profile_photo_path', 2048)->nullable();

            // Profile fields
            $table->string('role')->default('user');
            $table->boolean('test_taken')->default(false);
            $table->integer('placement_score')->nullable();
            $table->string('placement_level')->nullable();
            $table->string('job')->nullable();
            $table->string('university')->nullable();
            $table->string('country')->nullable();
            $table->text('experience')->nullable();
            $table->text('career_goals')->nullable();
            $table->text('hobbies')->nullable();
            $table->text('expectations')->nullable();
            $table->string('education_level')->nullable();
            $table->string('field_of_study')->nullable();
            $table->string('student_year')->nullable();
            $table->string('years_of_experience')->nullable();
            $table->string('specialization')->nullable();
            $table->string('teaching_subject')->nullable();
            $table->string('research_field')->nullable();
            $table->string('company_size')->nullable();
            $table->string('industry')->nullable();
            $table->string('semester')->nullable();
            $table->boolean('has_completed_general_form')->default(false);

            // Additional placement fields
            $table->string('faculty')->nullable();
            $table->boolean('cs_field')->default(false);
            $table->unsignedTinyInteger('current_year')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
