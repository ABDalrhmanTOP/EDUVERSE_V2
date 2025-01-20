// database/migrations/2025_02_01_000000_create_email_verification_codes_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('email_verification_codes', function (Blueprint $table) {
            $table->id();
            $table->string('email')->index();
            $table->string('code'); // e.g., 6-digit or random string
            $table->dateTime('created_at'); // or use timestamps
        });
    }

    public function down()
    {
        Schema::dropIfExists('email_verification_codes');
    }
};
