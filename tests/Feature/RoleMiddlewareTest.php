<?php

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Route;

beforeEach(function () {
    Route::middleware(['web', 'auth', 'role:merchant'])
        ->get('/_test/merchant-only', fn () => 'ok')
        ->name('test.merchant-only');
});

test('merchants may access merchant-only routes', function () {
    $merchant = User::factory()->merchant()->create();

    $this->actingAs($merchant)
        ->get('/_test/merchant-only')
        ->assertOk();
});

test('customers are forbidden from merchant-only routes', function () {
    $customer = User::factory()->create();

    $this->actingAs($customer)
        ->get('/_test/merchant-only')
        ->assertForbidden();
});

test('guests are redirected away from merchant-only routes', function () {
    $this->get('/_test/merchant-only')
        ->assertRedirect(route('login'));
});

test('user role helpers reflect the stored role', function () {
    $customer = User::factory()->create();
    $merchant = User::factory()->create(['role' => UserRole::Merchant->value]);

    expect($customer->isCustomer())->toBeTrue()
        ->and($customer->isMerchant())->toBeFalse()
        ->and($merchant->isMerchant())->toBeTrue()
        ->and($merchant->isCustomer())->toBeFalse();
});
