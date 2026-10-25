<?php

use App\Http\Controllers\Catalog\CatalogController;
use App\Http\Controllers\Customer\CheckoutController;
use App\Http\Controllers\Customer\OrderController as CustomerOrderController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\Merchant\MenuController;
use App\Http\Controllers\Merchant\OrderController as MerchantOrderController;
use App\Http\Controllers\Merchant\ProfileController as MerchantProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', [CatalogController::class, 'index'])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get('orders/{order:order_no}/invoice', [InvoiceController::class, 'show'])
        ->name('orders.invoice');
});

Route::middleware(['auth', 'verified', 'role:customer'])->group(function () {
    Route::get('checkout/{menu}', [CheckoutController::class, 'create'])->name('checkout.create');
    Route::post('checkout/{menu}', [CheckoutController::class, 'store'])->name('checkout.store');

    Route::get('orders', [CustomerOrderController::class, 'index'])->name('orders.index');
    Route::get('orders/{order}', [CustomerOrderController::class, 'show'])->name('orders.show');
    Route::post('orders/{order}/payment', [CustomerOrderController::class, 'uploadPayment'])
        ->name('orders.payment');
    Route::post('orders/{order}/cancel', [CustomerOrderController::class, 'cancel'])
        ->name('orders.cancel');
});

Route::middleware(['auth', 'verified', 'role:merchant'])
    ->prefix('merchant')
    ->name('merchant.')
    ->group(function () {
        Route::get('profile', [MerchantProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('profile', [MerchantProfileController::class, 'update'])->name('profile.update');

        Route::get('menus', [MenuController::class, 'index'])->name('menus.index');
        Route::get('menus/create', [MenuController::class, 'create'])->name('menus.create');
        Route::post('menus', [MenuController::class, 'store'])->name('menus.store');
        Route::get('menus/{menu}/edit', [MenuController::class, 'edit'])->name('menus.edit');
        Route::patch('menus/{menu}', [MenuController::class, 'update'])->name('menus.update');
        Route::delete('menus/{menu}', [MenuController::class, 'destroy'])->name('menus.destroy');
        Route::patch('menus/{menu}/availability', [MenuController::class, 'toggleAvailability'])
            ->name('menus.availability');

        Route::get('orders', [MerchantOrderController::class, 'index'])->name('orders.index');
        Route::post('orders/{order}/payment/verify', [MerchantOrderController::class, 'verifyPayment'])
            ->name('orders.payment.verify');
        Route::post('orders/{order}/payment/reject', [MerchantOrderController::class, 'rejectPayment'])
            ->name('orders.payment.reject');
        Route::patch('orders/{order}/status', [MerchantOrderController::class, 'updateStatus'])
            ->name('orders.status');
    });

require __DIR__.'/settings.php';
