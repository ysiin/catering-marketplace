<?php

use App\Models\Category;
use App\Models\Menu;
use App\Models\Merchant;

test('the catalogue page is publicly accessible', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('catalog/index')
            ->has('menus.data')
            ->has('categories')
            ->has('cities')
            ->where('filters.search', '')
            ->where('filters.city', '')
            ->where('filters.category', '')
        );
});

test('the catalogue lists menus ordered by the cheapest price', function () {
    $merchant = Merchant::factory()->create(['city' => 'Bandung']);
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

    $this->get(route('home'))
        ->assertInertia(fn ($page) => $page
            ->has('menus.data', 2)
            ->where('menus.data.0.name', 'Menu Murah')
            ->where('menus.data.1.name', 'Menu Mahal')
        );
});

test('the catalogue hides menus from inactive merchants and unavailable menus', function () {
    $active = Merchant::factory()->create();
    $inactive = Merchant::factory()->inactive()->create();

    Menu::factory()->create([
        'merchant_id' => $active->id,
        'name' => 'Menu Aktif',
    ]);
    Menu::factory()->unavailable()->create([
        'merchant_id' => $active->id,
        'name' => 'Menu Habis',
    ]);
    Menu::factory()->create([
        'merchant_id' => $inactive->id,
        'name' => 'Menu Toko Tutup',
    ]);

    $this->get(route('home'))
        ->assertInertia(fn ($page) => $page
            ->has('menus.data', 1)
            ->where('menus.data.0.name', 'Menu Aktif')
        );
});

test('the catalogue can be searched by menu name, description, and merchant name', function () {
    $merchant = Merchant::factory()->create(['name' => 'Katering Bebek Spesial']);

    Menu::factory()->create([
        'merchant_id' => $merchant->id,
        'name' => 'Nasi Bebek Betutu',
        'description' => 'Bebek bumbu Bali dengan sambal matah.',
    ]);
    Menu::factory()->create([
        'merchant_id' => $merchant->id,
        'name' => 'Nasi Ayam Kari',
        'description' => 'Ayam kari santan gurih.',
    ]);

    $this->get(route('home', ['search' => 'betutu']))
        ->assertInertia(fn ($page) => $page
            ->has('menus.data', 1)
            ->where('menus.data.0.name', 'Nasi Bebek Betutu')
            ->where('filters.search', 'betutu')
        );

    $this->get(route('home', ['search' => 'santan']))
        ->assertInertia(fn ($page) => $page
            ->has('menus.data', 1)
            ->where('menus.data.0.name', 'Nasi Ayam Kari')
        );

    $this->get(route('home', ['search' => 'Bebek Spesial']))
        ->assertInertia(fn ($page) => $page->has('menus.data', 2));
});

test('the catalogue can be filtered by city', function () {
    $jakarta = Merchant::factory()->create(['city' => 'Jakarta Selatan']);
    $bandung = Merchant::factory()->create(['city' => 'Bandung']);

    Menu::factory()->create([
        'merchant_id' => $jakarta->id,
        'name' => 'Menu Jakarta',
    ]);
    Menu::factory()->create([
        'merchant_id' => $bandung->id,
        'name' => 'Menu Bandung',
    ]);

    $this->get(route('home', ['city' => 'Bandung']))
        ->assertInertia(fn ($page) => $page
            ->has('menus.data', 1)
            ->where('menus.data.0.name', 'Menu Bandung')
            ->where('filters.city', 'Bandung')
        );
});

test('the catalogue can be filtered by category slug', function () {
    $nasiBox = Category::factory()->create([
        'name' => 'Nasi Box',
        'slug' => 'nasi-box',
    ]);
    $snackBox = Category::factory()->create([
        'name' => 'Snack Box',
        'slug' => 'snack-box',
    ]);

    Menu::factory()->create([
        'category_id' => $nasiBox->id,
        'name' => 'Menu Nasi',
    ]);
    Menu::factory()->create([
        'category_id' => $snackBox->id,
        'name' => 'Menu Snack',
    ]);

    $this->get(route('home', ['category' => 'snack-box']))
        ->assertInertia(fn ($page) => $page
            ->has('menus.data', 1)
            ->where('menus.data.0.name', 'Menu Snack')
            ->where('filters.category', 'snack-box')
        );
});

test('the catalogue only offers cities that have an active merchant', function () {
    Merchant::factory()->create(['city' => 'Surabaya']);
    Merchant::factory()->inactive()->create(['city' => 'Medan']);

    $this->get(route('home'))
        ->assertInertia(fn ($page) => $page->where('cities', ['Surabaya']));
});

test('invalid query parameters are ignored instead of causing an error', function () {
    $merchant = Merchant::factory()->create();
    Menu::factory()->create(['merchant_id' => $merchant->id]);

    $this->get(route('home', [
        'search' => ['tidak', 'valid'],
        'city' => ['Jakarta'],
        'category' => 'kategori-yang-tidak-ada',
    ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('filters.search', '')
            ->where('filters.city', '')
            ->where('filters.category', 'kategori-yang-tidak-ada')
        );
});

test('the catalogue paginates twelve menus per page while keeping the filters', function () {
    $merchant = Merchant::factory()->create();

    Menu::factory()->count(13)->create(['merchant_id' => $merchant->id]);

    $this->get(route('home', ['search' => '']))
        ->assertInertia(fn ($page) => $page
            ->has('menus.data', 12)
            ->where('menus.total', 13)
            ->where('menus.current_page', 1)
            ->where('menus.last_page', 2)
        );

    $this->get(route('home', ['page' => 2]))
        ->assertInertia(fn ($page) => $page
            ->has('menus.data', 1)
            ->where('menus.current_page', 2)
        );
});
