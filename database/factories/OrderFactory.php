<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $date = now()->format('Ymd');
        $suffix = str_pad((string) fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT);
        $qty = fake()->numberBetween(10, 50);
        $price = fake()->numberBetween(18, 65) * 1000;
        $subtotal = $price * $qty;
        $uniqueCode = fake()->numberBetween(1, 999);

        return [
            'order_no' => "ORD-{$date}-{$suffix}",
            'invoice_no' => "INV-{$date}-{$suffix}",
            'customer_id' => User::factory(),
            'merchant_id' => Merchant::factory(),
            'delivery_date' => fake()->dateTimeBetween('+1 day', '+14 days')->format('Y-m-d'),
            'qty_porsi' => $qty,
            'delivery_address' => fake()->address(),
            'notes' => fake()->optional()->sentence(),
            'subtotal' => $subtotal,
            'unique_code' => $uniqueCode,
            'total' => $subtotal + $uniqueCode,
            'status' => OrderStatus::PendingPayment->value,
        ];
    }
}
