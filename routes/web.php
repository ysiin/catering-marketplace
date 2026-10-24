<?php

use App\Http\Controllers\Catalog\CatalogController;
use App\Http\Controllers\Merchant\MenuController;
use App\Http\Controllers\Merchant\ProfileController as MerchantProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', [CatalogController::class, 'index'])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
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
    });

require __DIR__.'/settings.php';
