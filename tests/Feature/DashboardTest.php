<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Carbon;

test('a customer dashboard shows their own order counters', function () {
    $customer = User::factory()->create();
    $otherCustomer = User::factory()->create();

    Order::factory()->create([
        'customer_id' => $customer->id,
        'status' => OrderStatus::Confirmed->value,
    ]);
    Payment::factory()->create([
        'order_id' => Order::factory()->create([
            'customer_id' => $customer->id,
            'status' => OrderStatus::PendingPayment->value,
        ])->id,
        'status' => PaymentStatus::Unpaid->value,
    ]);
    Order::factory()->create([
        'customer_id' => $customer->id,
        'status' => OrderStatus::Completed->value,
    ]);
    Order::factory()->create([
        'customer_id' => $otherCustomer->id,
        'status' => OrderStatus::PendingPayment->value,
    ]);

    $this->actingAs($customer)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/customer')
            ->where('stats.aktif', 2)
            ->where('stats.menunggu_bayar', 1)
            ->where('stats.selesai', 1)
            ->has('orders', 3)
        );
});

test('the customer dashboard omits other offices orders', function () {
    $customer = User::factory()->create();
    $otherCustomer = User::factory()->create();

    Order::factory()->create(['customer_id' => $otherCustomer->id]);

    $this->actingAs($customer)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page->has('orders', 0));
});

test('the customer dashboard renders an empty state without orders', function () {
    $customer = User::factory()->create();

    $this->actingAs($customer)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/customer')
            ->where('stats.aktif', 0)
            ->where('stats.menunggu_bayar', 0)
            ->where('stats.selesai', 0)
            ->has('orders', 0)
        );
});

test('a merchant dashboard shows revenue and incoming order counters', function () {
    $merchantUser = User::factory()->merchant()->create();
    $merchant = Merchant::factory()->create(['user_id' => $merchantUser->id]);

    $verifiedOrder = Order::factory()->create([
        'merchant_id' => $merchant->id,
        'total' => 500000,
        'created_at' => Carbon::now()->startOfMonth()->addDay(),
    ]);
    Payment::factory()->create([
        'order_id' => $verifiedOrder->id,
        'status' => PaymentStatus::Verified->value,
    ]);

    $lastMonthOrder = Order::factory()->create([
        'merchant_id' => $merchant->id,
        'total' => 300000,
        'created_at' => Carbon::now()->subMonthNoOverflow()->startOfMonth()->addDay(),
    ]);
    Payment::factory()->create([
        'order_id' => $lastMonthOrder->id,
        'status' => PaymentStatus::Verified->value,
    ]);

    $waitingOrder = Order::factory()->create([
        'merchant_id' => $merchant->id,
        'total' => 200000,
    ]);
    Payment::factory()->create([
        'order_id' => $waitingOrder->id,
        'status' => PaymentStatus::WaitingVerification->value,
    ]);

    $this->actingAs($merchantUser)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/merchant')
            ->where('stats.omzet_bulan_ini', 500000)
            ->where('stats.omzet_total', 800000)
            ->where('stats.pesanan_masuk', 3)
            ->where('stats.perlu_verifikasi', 1)
            ->has('orders', 3)
        );
});

test('the merchant dashboard ignores payments that are not verified', function () {
    $merchantUser = User::factory()->merchant()->create();
    $merchant = Merchant::factory()->create(['user_id' => $merchantUser->id]);

    $unverified = Order::factory()->create([
        'merchant_id' => $merchant->id,
        'total' => 400000,
    ]);
    Payment::factory()->create([
        'order_id' => $unverified->id,
        'status' => PaymentStatus::Unpaid->value,
    ]);

    Order::factory()->create([
        'merchant_id' => $merchant->id,
        'total' => 250000,
    ]);

    $this->actingAs($merchantUser)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('stats.omzet_bulan_ini', 0)
            ->where('stats.omzet_total', 0)
            ->where('stats.pesanan_masuk', 2)
            ->where('stats.perlu_verifikasi', 0)
        );
});

test('a merchant without a profile is sent to complete it', function () {
    $merchantUser = User::factory()->merchant()->create();

    $this->actingAs($merchantUser)
        ->get(route('dashboard'))
        ->assertRedirect(route('merchant.profile.edit'));
});

test('the dashboard requires authentication', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});
