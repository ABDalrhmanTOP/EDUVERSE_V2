<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePlaylistsTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('playlists', function (Blueprint $table) {
            $table->id();
            $table->string('video_id')->nullable(); // Corrected syntax for adding `video_id`
            $table->string('name');
            $table->string('description')->nullable();
            $table->integer('year')->default(1); // Year of the course
            $table->integer('semester')->default(1); // Semester of the course
            $table->boolean('paid')->default(false); // false = free, true = paid
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('playlists');
    }
}
