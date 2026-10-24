<?php

use App\Models\User;

test('the catalogue is the public entry point', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('catalog/index'));
});

test('guests cannot reach the dashboard', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authenticated users can reach the dashboard', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('dashboard'))->assertOk();
});

test('the shared auth props expose the user role', function () {
    $user = User::factory()->merchant()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('auth.role', 'merchant')
            ->where('auth.user.id', $user->id)
        );
});

test('guests receive a null role in the shared auth props', function () {
    $this->get(route('home'))
        ->assertInertia(fn ($page) => $page->where('auth.role', null));
});
