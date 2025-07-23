<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class DropOldChatTables extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        // Drop table if named 'conversation'
        Schema::dropIfExists('conversation');
        // Drop table if named 'converstation'
        Schema::dropIfExists('conversations');
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        // Optionally, you can leave this empty or recreate one of them if needed.
    }
}
