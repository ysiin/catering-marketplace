<?php

use App\Models\Category;
use App\Models\Menu;
use App\Models\Merchant;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('guests cannot reach the merchant profile page', function () {
    $this->get(route('merchant.profile.edit'))
        ->assertRedirect(route('login'));
});

test('customers are forbidden from the merchant area', function () {
    $customer = User::factory()->create();

    $this->actingAs($customer)
        ->get(route('merchant.profile.edit'))
        ->assertForbidden();
});

test('a merchant without a profile gets one created when opening the profile page', function () {
    $user = User::factory()->merchant()->create(['name' => 'Dapur Bu Siti']);

    expect(Merchant::count())->toBe(0);

    $this->actingAs($user)
        ->get(route('merchant.profile.edit'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('merchant/profile')
            ->where('merchant.name', 'Dapur Bu Siti')
        );

    $merchant = Merchant::firstOrFail();

    expect($merchant->user_id)->toBe($user->id);
});

test('a merchant can update the profile and payment details', function () {
    $user = User::factory()->merchant()->create();
    $merchant = Merchant::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->patch(route('merchant.profile.update'), [
            'name' => 'Katering Sari Rasa',
            'description' => 'Nasi box harian untuk kantor.',
            'city' => 'Jakarta Selatan',
            'address' => 'Jl. Melati No. 10',
            'phone' => '081210001001',
            'email_contact' => 'sari@example.com',
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_name' => 'Katering Sari Rasa',
        ])
        ->assertRedirect(route('merchant.profile.edit'));

    $merchant->refresh();

    expect($merchant->name)->toBe('Katering Sari Rasa')
        ->and($merchant->city)->toBe('Jakarta Selatan')
        ->and($merchant->bank_name)->toBe('BCA');
});

test('the profile update validates required fields and the phone format', function () {
    $user = User::factory()->merchant()->create();
    Merchant::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->patch(route('merchant.profile.update'), [
            'name' => '',
            'city' => '',
            'address' => '',
            'phone' => 'bukan-nomor',
        ])
        ->assertSessionHasErrors(['name', 'city', 'address', 'phone']);
});

test('a merchant can upload a logo and a QRIS image', function () {
    Storage::fake('public');

    $user = User::factory()->merchant()->create();
    $merchant = Merchant::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->patch(route('merchant.profile.update'), [
            'name' => 'Katering Sari Rasa',
            'city' => 'Bandung',
            'address' => 'Jl. Merdeka No. 1',
            'phone' => '081200000000',
            'logo' => UploadedFile::fake()->image('logo.png', 200, 200),
            'qris_image' => UploadedFile::fake()->image('qris.png', 300, 300),
        ])
        ->assertRedirect(route('merchant.profile.edit'));

    $merchant->refresh();

    expect($merchant->logo_path)->not->toBeNull()
        ->and($merchant->qris_image_path)->not->toBeNull();

    Storage::disk('public')->assertExists($merchant->logo_path);
    Storage::disk('public')->assertExists($merchant->qris_image_path);
});

test('an oversized logo is rejected', function () {
    Storage::fake('public');

    $user = User::factory()->merchant()->create();
    Merchant::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->patch(route('merchant.profile.update'), [
            'name' => 'Katering Sari Rasa',
            'city' => 'Bandung',
            'address' => 'Jl. Merdeka No. 1',
            'phone' => '081200000000',
            'logo' => UploadedFile::fake()->image('logo.png')->size(3000),
        ])
        ->assertSessionHasErrors('logo');
});

test('a merchant sees only its own menus', function () {
    $user = User::factory()->merchant()->create();
    $merchant = Merchant::factory()->create(['user_id' => $user->id]);
    $other = Merchant::factory()->create();

    Menu::factory()->create(['merchant_id' => $merchant->id, 'name' => 'Menu Saya']);
    Menu::factory()->create(['merchant_id' => $other->id, 'name' => 'Menu Orang']);

    $this->actingAs($user)
        ->get(route('merchant.menus.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('merchant/menus/index')
            ->has('menus', 1)
            ->where('menus.0.name', 'Menu Saya')
        );
});

test('a merchant can create a menu with a photo', function () {
    Storage::fake('public');

    $user = User::factory()->merchant()->create();
    $merchant = Merchant::factory()->create(['user_id' => $user->id]);
    $category = Category::factory()->create();

    $this->actingAs($user)
        ->post(route('merchant.menus.store'), [
            'name' => 'Nasi Ayam Bakar Sambal Matah',
            'category_id' => $category->id,
            'description' => 'Ayam bakar bumbu Bali dengan sambal matah segar.',
            'price' => 25000,
            'min_order' => 10,
            'photo' => UploadedFile::fake()->image('menu.png', 600, 400),
        ])
        ->assertRedirect(route('merchant.menus.index'));

    $menu = Menu::firstOrFail();

    expect($menu->merchant_id)->toBe($merchant->id)
        ->and($menu->name)->toBe('Nasi Ayam Bakar Sambal Matah')
        ->and($menu->price)->toBe(25000)
        ->and($menu->slug)->toBe('nasi-ayam-bakar-sambal-matah')
        ->and($menu->photo_path)->not->toBeNull();

    Storage::disk('public')->assertExists($menu->photo_path);
});

test('creating a menu requires a description and a photo', function () {
    Storage::fake('public');

    $user = User::factory()->merchant()->create();
    Merchant::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->post(route('merchant.menus.store'), [
            'name' => 'Menu Tanpa Foto',
            'category_id' => Category::factory()->create()->id,
            'price' => 20000,
            'min_order' => 5,
        ])
        ->assertSessionHasErrors(['description', 'photo']);

    expect(Menu::count())->toBe(0);
});

test('the menu slug stays unique within a merchant', function () {
    Storage::fake('public');

    $user = User::factory()->merchant()->create();
    $merchant = Merchant::factory()->create(['user_id' => $user->id]);
    $category = Category::factory()->create();

    Menu::factory()->create([
        'merchant_id' => $merchant->id,
        'name' => 'Nasi Goreng',
        'slug' => 'nasi-goreng',
    ]);

    $this->actingAs($user)
        ->post(route('merchant.menus.store'), [
            'name' => 'Nasi Goreng',
            'category_id' => $category->id,
            'description' => 'Nasi goreng spesial.',
            'price' => 18000,
            'min_order' => 1,
            'photo' => UploadedFile::fake()->image('menu.png'),
        ])
        ->assertRedirect(route('merchant.menus.index'));

    expect(Menu::where('merchant_id', $merchant->id)->pluck('slug')->all())
        ->toBe(['nasi-goreng', 'nasi-goreng-2']);
});

test('a merchant can update its own menu and replace the photo', function () {
    Storage::fake('public');

    $user = User::factory()->merchant()->create();
    $merchant = Merchant::factory()->create(['user_id' => $user->id]);
    $menu = Menu::factory()->create([
        'merchant_id' => $merchant->id,
        'photo_path' => 'menus/lama.jpg',
    ]);
    $oldPath = $menu->photo_path;

    $this->actingAs($user)
        ->patch(route('merchant.menus.update', $menu), [
            'name' => 'Nasi Uduk Komplit',
            'category_id' => Category::factory()->create()->id,
            'description' => 'Nasi uduk dengan bihun dan tempe.',
            'price' => 22000,
            'min_order' => 5,
            'photo' => UploadedFile::fake()->image('baru.png'),
        ])
        ->assertRedirect(route('merchant.menus.index'));

    $menu->refresh();

    expect($menu->name)->toBe('Nasi Uduk Komplit')
        ->and($menu->price)->toBe(22000)
        ->and($menu->photo_path)->not->toBe($oldPath);

    Storage::disk('public')->assertMissing($oldPath);
});

test('a merchant cannot update or delete another merchant menu', function () {
    $user = User::factory()->merchant()->create();
    Merchant::factory()->create(['user_id' => $user->id]);
    $otherMenu = Menu::factory()->create();

    $this->actingAs($user)
        ->get(route('merchant.menus.edit', $otherMenu))
        ->assertForbidden();

    $this->actingAs($user)
        ->delete(route('merchant.menus.destroy', $otherMenu))
        ->assertForbidden();

    $this->assertModelExists($otherMenu);
});

test('a merchant can delete its own menu and the stored photo', function () {
    Storage::fake('public');

    $user = User::factory()->merchant()->create();
    $merchant = Merchant::factory()->create(['user_id' => $user->id]);
    $menu = Menu::factory()->create([
        'merchant_id' => $merchant->id,
        'photo_path' => 'menus/hapus.jpg',
    ]);

    Storage::disk('public')->put('menus/hapus.jpg', 'isi');

    $this->actingAs($user)
        ->delete(route('merchant.menus.destroy', $menu))
        ->assertRedirect(route('merchant.menus.index'));

    $this->assertModelMissing($menu);
    Storage::disk('public')->assertMissing('menus/hapus.jpg');
});

test('a merchant can toggle menu availability', function () {
    $user = User::factory()->merchant()->create();
    $merchant = Merchant::factory()->create(['user_id' => $user->id]);
    $menu = Menu::factory()->create([
        'merchant_id' => $merchant->id,
        'is_available' => true,
    ]);

    $this->actingAs($user)
        ->patch(route('merchant.menus.availability', $menu))
        ->assertRedirect();

    expect($menu->refresh()->is_available)->toBeFalse();
});

test('a customer cannot toggle menu availability', function () {
    $customer = User::factory()->create();
    $menu = Menu::factory()->create();

    $this->actingAs($customer)
        ->patch(route('merchant.menus.availability', $menu))
        ->assertForbidden();
});
