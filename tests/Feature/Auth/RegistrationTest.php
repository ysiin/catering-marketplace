<?php

use App\Enums\UserRole;
use App\Models\User;

test('new users default to the customer role', function () {
    $user = User::factory()->create();

    expect($user->role)->toBe(UserRole::Customer)
        ->and($user->isCustomer())->toBeTrue()
        ->and($user->isMerchant())->toBeFalse();
});

test('a merchant factory state assigns the merchant role', function () {
    $user = User::factory()->merchant()->create();

    expect($user->role)->toBe(UserRole::Merchant)
        ->and($user->isMerchant())->toBeTrue()
        ->and($user->isCustomer())->toBeFalse();
});

test('a user can register as a customer', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'PT Maju Jaya',
        'email' => 'kantor@example.com',
        'role' => UserRole::Customer->value,
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertRedirect();

    $this->assertAuthenticated();

    expect(User::where('email', 'kantor@example.com')->first())
        ->not->toBeNull()
        ->role->toBe(UserRole::Customer);
});

test('a user can register as a merchant', function () {
    $this->post(route('register.store'), [
        'name' => 'Catering Sehat Bunda',
        'email' => 'merchant@example.com',
        'role' => UserRole::Merchant->value,
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertRedirect();

    expect(User::where('email', 'merchant@example.com')->first())
        ->not->toBeNull()
        ->role->toBe(UserRole::Merchant);
});

test('registration requires a valid role', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Anonim',
        'email' => 'anonim@example.com',
        'role' => 'admin',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionHasErrors('role');

    $this->assertGuest();
    expect(User::where('email', 'anonim@example.com')->exists())->toBeFalse();
});
