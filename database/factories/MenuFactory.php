<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Menu;
use App\Models\Merchant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Menu>
 */
class MenuFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->randomElement([
            'Nasi Ayam Bakar Sambal Matah',
            'Nasi Rendang Daging Sapi',
            'Nasi Ayam Geprek Mozzarella',
            'Nasi Ikan Dori Saus Tartar',
            'Nasi Telur Balado & Tempe Orek',
            'Nasi Bebek Betutu',
            'Nasi Ayam Teriyaki',
            'Nasi Udang Saus Padang',
            'Nasi Sapi Lada Hitam',
            'Snack Box Risoles & Pastel',
            'Tumpeng Mini Nasi Kuning',
            'Paket Vegetarian Tempe Bacem',
        ]);

        return [
            'merchant_id' => Merchant::factory(),
            'category_id' => Category::factory(),
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::lower(Str::random(5)),
            'description' => fake()->sentence(12),
            'price' => fake()->numberBetween(18, 65) * 1000,
            'min_order' => fake()->randomElement([1, 5, 10, 20]),
            'is_available' => true,
        ];
    }

    /**
     * Indicate that the menu is unavailable.
     */
    public function unavailable(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_available' => false,
        ]);
    }
}
