<?php

namespace Database\Factories;

use App\Models\Menu;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $qty = fake()->numberBetween(10, 50);
        $price = fake()->numberBetween(18, 65) * 1000;

        return [
            'order_id' => Order::factory(),
            'menu_id' => Menu::factory(),
            'menu_name_snapshot' => fake()->sentence(3),
            'price_snapshot' => $price,
            'qty' => $qty,
            'subtotal' => $price * $qty,
        ];
    }
}
