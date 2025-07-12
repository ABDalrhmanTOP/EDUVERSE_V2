<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop the old table if it exists
        Schema::dropIfExists('conversations');

        // Create the new table named 'edu_bot'
        Schema::create('edu_bot', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('query'); // Stores the user's query
            $table->text('response'); // Stores the assistant's response
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('edu_bot');
    }
};
