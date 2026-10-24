<?php

use App\Models\User;

test('the landing page is publicly accessible', function () {
    $this->get(route('home'))->assertOk();
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
