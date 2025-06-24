<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEduBotTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        // Drop the old table if it exists
        Schema::dropIfExists('conversations');
        // Create the new table named 'EduBot'
        Schema::create('EduBot', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id');
            $table->text('query');      // Stores the user's query
            $table->text('response');   // Stores the assistant's response
            $table->timestamps();       // created_at and updated_at

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('EduBot');
    }
}
