<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

class DropCacheTables extends Migration
{
    public function up()
    {
        Schema::dropIfExists('cache');
        Schema::dropIfExists('cache_locks');
    }

    public function down()
    {
        // Optionally recreate the tables if needed in the future
        Schema::create('cache', function ($table) {
            $table->string('key')->primary();
            $table->text('value');
            $table->integer('expiration');
        });

        Schema::create('cache_locks', function ($table) {
            $table->string('key')->primary();
            $table->string('owner');
            $table->integer('expiration');
        });
    }
}

