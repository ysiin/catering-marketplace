<?php

namespace Database\Factories;

use App\Models\Merchant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Merchant>
 */
class MerchantFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->company();

        return [
            'user_id' => User::factory()->merchant(),
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::lower(Str::random(5)),
            'description' => fake()->paragraph(),
            'city' => fake()->randomElement([
                'Jakarta Selatan',
                'Jakarta Pusat',
                'Bandung',
                'Surabaya',
                'Yogyakarta',
                'Tangerang',
            ]),
            'address' => fake()->address(),
            'phone' => fake()->numerify('08##########'),
            'email_contact' => fake()->unique()->companyEmail(),
            'bank_name' => fake()->randomElement(['BCA', 'Mandiri', 'BNI', 'BRI']),
            'bank_account_number' => fake()->numerify('##########'),
            'bank_account_name' => $name,
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the merchant is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
