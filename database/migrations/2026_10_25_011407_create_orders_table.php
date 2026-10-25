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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_no')->unique();
            $table->string('invoice_no')->unique();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('merchant_id')->constrained()->cascadeOnDelete();
            $table->date('delivery_date');
            $table->unsignedInteger('qty_porsi');
            $table->text('delivery_address');
            $table->text('notes')->nullable();
            $table->unsignedInteger('subtotal');
            $table->unsignedInteger('unique_code');
            $table->unsignedInteger('total');
            $table->string('status')->default('pending_payment');
            $table->timestamps();

            $table->index('customer_id');
            $table->index('merchant_id');
            $table->index('status');
            $table->index('delivery_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
