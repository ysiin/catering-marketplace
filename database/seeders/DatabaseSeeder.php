<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Kantor Demo',
            'email' => 'kantor@example.com',
            'role' => UserRole::Customer->value,
        ]);

        User::factory()->merchant()->create([
            'name' => 'Katering Demo',
            'email' => 'merchant@example.com',
        ]);
    }
}
