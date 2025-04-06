<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class DropEmailVerificationCodesTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::dropIfExists('email_verification_codes');
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        // Optionally, if you want to recreate the table on rollback, define its schema here.
        Schema::create('email_verification_codes', function (Blueprint $table) {
            $table->id();
            $table->string('email');
            $table->string('code');
            $table->timestamp('created_at')->useCurrent();
        });
    }
}
