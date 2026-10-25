<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Menu;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

function makeMenu(int $price = 25000, int $minOrder = 10): Menu
{
    $merchant = Merchant::factory()->create();
    $menu = Menu::factory()->create([
        'merchant_id' => $merchant->id,
        'price' => $price,
        'min_order' => $minOrder,
        'is_available' => true,
    ]);

    return $menu;
}

function checkoutPayload(array $overrides = []): array
{
    return [
        'qty_porsi' => 10,
        'delivery_date' => Carbon::tomorrow()->format('Y-m-d'),
        'delivery_address' => 'Gedung Menara, Lantai 8, Jakarta Selatan.',
        'notes' => 'Tanpa sambal.',
        'payment_method' => 'bank_transfer',
        ...$overrides,
    ];
}

test('a customer can open checkout for an available menu', function () {
    $customer = User::factory()->create();
    $menu = makeMenu();

    $this->actingAs($customer)
        ->get(route('checkout.create', $menu))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('customer/checkout')
            ->where('menu.id', $menu->id)
            ->where('defaults.qty_porsi', $menu->min_order)
            ->where('defaults.delivery_date', Carbon::tomorrow()->format('Y-m-d'))
        );
});

test('checkout is blocked for an unavailable menu', function () {
    $customer = User::factory()->create();
    $menu = makeMenu();
    $menu->update(['is_available' => false]);

    $this->actingAs($customer)
        ->get(route('checkout.create', $menu))
        ->assertRedirect(route('home'));

    $this->actingAs($customer)
        ->post(route('checkout.store', $menu), checkoutPayload())
        ->assertSessionHasErrors('qty_porsi');

    expect(Order::count())->toBe(0);
});

test('merchants cannot use the customer checkout', function () {
    $merchantUser = User::factory()->merchant()->create();
    $menu = makeMenu();

    $this->actingAs($merchantUser)
        ->get(route('checkout.create', $menu))
        ->assertForbidden();
});

test('a customer creates an order with price snapshots and a unique code', function () {
    $customer = User::factory()->create();
    $menu = makeMenu(price: 25000, minOrder: 10);

    $this->actingAs($customer)
        ->post(route('checkout.store', $menu), checkoutPayload([
            'qty_porsi' => 12,
            'price' => 1,
        ]))
        ->assertRedirect();

    $order = Order::with('items', 'payment')->firstOrFail();

    expect($order->customer_id)->toBe($customer->id)
        ->and($order->merchant_id)->toBe($menu->merchant_id)
        ->and($order->qty_porsi)->toBe(12)
        ->and($order->subtotal)->toBe(300000)
        ->and($order->unique_code)->toBeGreaterThanOrEqual(1)
        ->and($order->unique_code)->toBeLessThanOrEqual(999)
        ->and($order->total)->toBe(300000 + $order->unique_code)
        ->and($order->status)->toBe(OrderStatus::PendingPayment)
        ->and($order->order_no)->toStartWith('ORD-')
        ->and($order->invoice_no)->toStartWith('INV-')
        ->and($order->items)->toHaveCount(1)
        ->and($order->items->first()->price_snapshot)->toBe(25000)
        ->and($order->items->first()->menu_name_snapshot)->toBe($menu->name)
        ->and($order->payment)->not->toBeNull()
        ->and($order->payment->status)->toBe(PaymentStatus::Unpaid);
});

test('the checkout rejects dates before tomorrow', function () {
    $customer = User::factory()->create();
    $menu = makeMenu();

    $this->actingAs($customer)
        ->post(route('checkout.store', $menu), checkoutPayload([
            'delivery_date' => Carbon::today()->format('Y-m-d'),
        ]))
        ->assertSessionHasErrors('delivery_date');

    expect(Order::count())->toBe(0);
});

test('the checkout enforces the menu minimum order', function () {
    $customer = User::factory()->create();
    $menu = makeMenu(minOrder: 20);

    $this->actingAs($customer)
        ->post(route('checkout.store', $menu), checkoutPayload(['qty_porsi' => 19]))
        ->assertSessionHasErrors('qty_porsi');

    expect(Order::count())->toBe(0);
});

test('order numbers stay unique when two orders are created', function () {
    $customer = User::factory()->create();
    $menu = makeMenu();

    $this->actingAs($customer)->post(route('checkout.store', $menu), checkoutPayload());
    $this->actingAs($customer)->post(route('checkout.store', $menu), checkoutPayload());

    $numbers = Order::pluck('order_no');

    expect($numbers)->toHaveCount(2)
        ->and($numbers->unique())->toHaveCount(2);
});

test('a customer sees only their own orders', function () {
    $customer = User::factory()->create();
    $other = User::factory()->create();
    $menu = makeMenu();

    $own = Order::factory()->create([
        'customer_id' => $customer->id,
        'order_no' => 'ORD-20261025-0001',
        'invoice_no' => 'INV-20261025-0001',
    ]);
    $mine = Order::factory()->create([
        'customer_id' => $customer->id,
        'order_no' => 'ORD-20261025-0002',
        'invoice_no' => 'INV-20261025-0002',
    ]);
    Order::factory()->create(['customer_id' => $other->id]);

    $this->actingAs($customer)
        ->get(route('orders.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('customer/orders/index')
            ->has('orders', 2)
        );

    expect($menu->id)->toBeInt()
        ->and($own->id)->not->toBe($mine->id);
});

test('a customer cannot open another customer order', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $order = Order::factory()->create(['customer_id' => $owner->id]);

    $this->actingAs($intruder)
        ->get(route('orders.show', $order))
        ->assertForbidden();
});

test('a customer uploads a payment proof and the order waits for verification', function () {
    Storage::fake('public');

    $customer = User::factory()->create();
    $order = Order::factory()->create([
        'customer_id' => $customer->id,
        'status' => OrderStatus::PendingPayment,
    ]);

    $this->actingAs($customer)
        ->post(route('orders.payment', $order), [
            'proof' => UploadedFile::fake()->image('bukti.png'),
        ])
        ->assertRedirect(route('orders.show', $order->id));

    $order->refresh();

    expect($order->status)->toBe(OrderStatus::PendingConfirmation)
        ->and($order->payment->status)->toBe(PaymentStatus::WaitingVerification)
        ->and($order->payment->proof_path)->not->toBeNull();

    Storage::disk('public')->assertExists($order->payment->proof_path);
});

test('the payment proof must be a valid image', function () {
    $customer = User::factory()->create();
    $order = Order::factory()->create(['customer_id' => $customer->id]);

    $this->actingAs($customer)
        ->post(route('orders.payment', $order), [
            'proof' => UploadedFile::fake()->create('bukti.pdf', 100, 'application/pdf'),
        ])
        ->assertSessionHasErrors('proof');

    expect($order->refresh()->status)->toBe(OrderStatus::PendingPayment);
});

test('another customer cannot upload a proof to someone else order', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $order = Order::factory()->create(['customer_id' => $owner->id]);

    $this->actingAs($intruder)
        ->post(route('orders.payment', $order), [
            'proof' => UploadedFile::fake()->image('bukti.png'),
        ])
        ->assertForbidden();
});

test('a customer can cancel an unpaid order only', function () {
    $customer = User::factory()->create();
    $order = Order::factory()->create([
        'customer_id' => $customer->id,
        'status' => OrderStatus::PendingPayment,
    ]);

    $this->actingAs($customer)
        ->post(route('orders.cancel', $order))
        ->assertRedirect(route('orders.show', $order->id));

    expect($order->refresh()->status)->toBe(OrderStatus::Cancelled);

    $this->actingAs($customer)
        ->post(route('orders.cancel', $order))
        ->assertForbidden();
});

test('the merchant verifies a payment proof and confirms the order', function () {
    $merchantUser = User::factory()->merchant()->create();
    $merchant = Merchant::factory()->create(['user_id' => $merchantUser->id]);
    $order = Order::factory()->create([
        'merchant_id' => $merchant->id,
        'status' => OrderStatus::PendingConfirmation,
    ]);
    $order->payment()->create([
        'method' => 'bank_transfer',
        'status' => PaymentStatus::WaitingVerification,
    ]);

    $this->actingAs($merchantUser)
        ->post(route('merchant.orders.payment.verify', $order))
        ->assertRedirect();

    expect($order->refresh()->status)->toBe(OrderStatus::Confirmed)
        ->and($order->payment->status)->toBe(PaymentStatus::Verified)
        ->and($order->payment->verified_at)->not->toBeNull();
});

test('a merchant cannot verify another merchant order', function () {
    $merchantUser = User::factory()->merchant()->create();
    Merchant::factory()->create(['user_id' => $merchantUser->id]);

    $other = Order::factory()->create(['status' => OrderStatus::PendingConfirmation]);

    $this->actingAs($merchantUser)
        ->post(route('merchant.orders.payment.verify', $other))
        ->assertForbidden();
});

test('a customer cannot verify payments', function () {
    $customer = User::factory()->create();
    $order = Order::factory()->create([
        'customer_id' => $customer->id,
        'status' => OrderStatus::PendingConfirmation,
    ]);

    $this->actingAs($customer)
        ->post(route('merchant.orders.payment.verify', $order))
        ->assertForbidden();
});

test('merchant moves a confirmed order to in progress and completed', function () {
    $merchantUser = User::factory()->merchant()->create();
    $merchant = Merchant::factory()->create(['user_id' => $merchantUser->id]);
    $order = Order::factory()->create([
        'merchant_id' => $merchant->id,
        'status' => OrderStatus::Confirmed,
    ]);

    $this->actingAs($merchantUser)
        ->patch(route('merchant.orders.status', $order), ['status' => 'in_progress'])
        ->assertRedirect();

    expect($order->refresh()->status)->toBe(OrderStatus::InProgress);

    $this->actingAs($merchantUser)
        ->patch(route('merchant.orders.status', $order), ['status' => 'completed'])
        ->assertRedirect();

    expect($order->refresh()->status)->toBe(OrderStatus::Completed);
});

test('the merchant order list only shows its own orders', function () {
    $merchantUser = User::factory()->merchant()->create();
    $merchant = Merchant::factory()->create(['user_id' => $merchantUser->id]);

    Order::factory()->create(['merchant_id' => $merchant->id]);
    Order::factory()->create();

    $this->actingAs($merchantUser)
        ->get(route('merchant.orders.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('merchant/orders/index')
            ->has('orders', 1)
        );
});

test('the invoice is visible to both parties with identical numbers', function () {
    $customer = User::factory()->create();
    $merchantUser = User::factory()->merchant()->create();
    $merchant = Merchant::factory()->create(['user_id' => $merchantUser->id]);

    $order = Order::factory()->create([
        'customer_id' => $customer->id,
        'merchant_id' => $merchant->id,
        'subtotal' => 250000,
        'unique_code' => 321,
        'total' => 250321,
    ]);
    $order->items()->create([
        'menu_id' => null,
        'menu_name_snapshot' => 'Nasi Ayam Bakar',
        'price_snapshot' => 25000,
        'qty' => 10,
        'subtotal' => 250000,
    ]);

    $this->actingAs($customer)
        ->get(route('orders.invoice', $order->order_no))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('invoice/show')
            ->where('invoice.invoice_no', $order->invoice_no)
            ->where('invoice.total', 250321)
        );

    $this->actingAs($merchantUser)
        ->get(route('orders.invoice', $order->order_no))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('invoice/show')
            ->where('invoice.invoice_no', $order->invoice_no)
            ->where('invoice.total', 250321)
        );
});

test('third parties cannot open the invoice', function () {
    $order = Order::factory()->create();
    $stranger = User::factory()->create();

    $this->actingAs($stranger)
        ->get(route('orders.invoice', $order->order_no))
        ->assertForbidden();

    $otherMerchant = User::factory()->merchant()->create();
    Merchant::factory()->create(['user_id' => $otherMerchant->id]);

    $this->actingAs($otherMerchant)
        ->get(route('orders.invoice', $order->order_no))
        ->assertForbidden();
});

test('guests are redirected to login from the invoice', function () {
    $order = Order::factory()->create();

    $this->get(route('orders.invoice', $order->order_no))
        ->assertRedirect(route('login'));
});
