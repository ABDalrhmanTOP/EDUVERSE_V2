<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFinalProjectSubmissionsTable extends Migration
{
    public function up()
    {
        Schema::create('final_project_submissions', function (Blueprint $table) {
            $table->id();
            // Link with the user progress record:
            $table->unsignedBigInteger('user_progress_id');
            $table->text('code_solution');
            $table->json('mcq_answers');
            $table->json('tf_answers');
            $table->integer('coding_marks');
            $table->integer('mcq_marks');
            $table->integer('tf_marks');
            $table->integer('final_mark');
            $table->string('grade');
            $table->unsignedTinyInteger('rating')->nullable();
            $table->text('feedback')->nullable();
            $table->timestamps();

            $table->foreign('user_progress_id')
                ->references('id')->on('user_progress')
                ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('final_project_submissions');
    }
}
