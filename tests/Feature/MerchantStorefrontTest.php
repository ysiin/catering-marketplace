<?php

use App\Models\Category;
use App\Models\Menu;
use App\Models\Merchant;

test('the merchant storefront is publicly accessible', function () {
    $merchant = Merchant::factory()->create(['name' => 'Katering Sehat']);

    $this->get(route('catering.show', $merchant))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('catalog/merchant')
            ->where('merchant.name', 'Katering Sehat')
            ->where('merchant.slug', $merchant->slug)
            ->has('menus')
            ->has('categories')
        );
});

test('the storefront only lists the available menus of that merchant', function () {
    $merchant = Merchant::factory()->create();
    Menu::factory()->create([
        'merchant_id' => $merchant->id,
        'name' => 'Menu Tersedia',
        'is_available' => true,
    ]);
    Menu::factory()->unavailable()->create([
        'merchant_id' => $merchant->id,
        'name' => 'Menu Habis',
    ]);
    Menu::factory()->create([
        'merchant_id' => Merchant::factory()->create()->id,
        'name' => 'Menu Katering Lain',
    ]);

    $this->get(route('catering.show', $merchant))
        ->assertInertia(fn ($page) => $page
            ->has('menus', 1)
            ->where('menus.0.name', 'Menu Tersedia')
        );
});

test('the storefront lists menus ordered by the cheapest price', function () {
    $merchant = Merchant::factory()->create();
    Menu::factory()->create([
        'merchant_id' => $merchant->id,
        'name' => 'Menu Mahal',
        'price' => 45000,
    ]);
    Menu::factory()->create([
        'merchant_id' => $merchant->id,
        'name' => 'Menu Murah',
        'price' => 20000,
    ]);

    $this->get(route('catering.show', $merchant))
        ->assertInertia(fn ($page) => $page
            ->where('menus.0.name', 'Menu Murah')
            ->where('menus.1.name', 'Menu Mahal')
        );
});

test('the storefront exposes the menu count and cheapest price', function () {
    $merchant = Merchant::factory()->create();
    Menu::factory()->create(['merchant_id' => $merchant->id, 'price' => 30000]);
    Menu::factory()->create(['merchant_id' => $merchant->id, 'price' => 18000]);
    Menu::factory()->unavailable()->create(['merchant_id' => $merchant->id]);

    $this->get(route('catering.show', $merchant))
        ->assertInertia(fn ($page) => $page
            ->where('merchant.menu_count', 2)
            ->where('merchant.min_price', 18000)
        );
});

test('a merchant without available menus exposes a null minimum price', function () {
    $merchant = Merchant::factory()->create();

    $this->get(route('catering.show', $merchant))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('merchant.menu_count', 0)
            ->where('merchant.min_price', null)
            ->has('menus', 0)
        );
});

test('an inactive merchant storefront returns a 404', function () {
    $merchant = Merchant::factory()->inactive()->create();

    $this->get(route('catering.show', $merchant))->assertNotFound();
});

test('an unknown merchant slug returns a 404', function () {
    $this->get(route('catering.show', ['merchant' => 'tidak-ada']))->assertNotFound();
});

test('the storefront includes every category for navigation', function () {
    Category::factory()->create(['name' => 'Ayam', 'slug' => 'ayam']);
    Category::factory()->create(['name' => 'Ikan', 'slug' => 'ikan']);

    $merchant = Merchant::factory()->create();

    $this->get(route('catering.show', $merchant))
        ->assertInertia(fn ($page) => $page->has('categories', 2));
});
