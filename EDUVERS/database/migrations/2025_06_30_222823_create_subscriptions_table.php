<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('playlist_id')->nullable();
            $table->foreign('playlist_id')->references('id')->on('playlists')->onDelete('cascade');
            $table->string('plan_id'); // basic, premium, enterprise
            $table->string('plan_name');
            $table->string('plan_description')->nullable();
            $table->integer('amount'); // Amount in cents
            $table->string('currency', 3)->default('USD');
            $table->string('status')->default('pending'); // pending, active, cancelled, expired
            $table->string('payment_intent_id')->nullable();
            $table->string('payment_method')->nullable();
            $table->string('transaction_id')->nullable();
            $table->timestamp('start_date')->nullable();
            $table->timestamp('end_date')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancellation_reason')->nullable();
            $table->json('features')->nullable(); // Store plan features as JSON
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
            $table->index('payment_intent_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
