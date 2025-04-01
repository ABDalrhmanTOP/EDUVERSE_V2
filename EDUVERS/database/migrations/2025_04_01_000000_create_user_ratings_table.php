<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUserRatingsTable extends Migration
{
    public function up()
    {
        Schema::create('user_ratings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_progress_id');
            $table->foreign('user_progress_id')
                ->references('id')->on('user_progress')
                ->onDelete('cascade');

            $table->integer('rating'); // 1-5
            $table->text('feedback')->nullable();  // store user’s feedback
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_ratings');
    }
}
