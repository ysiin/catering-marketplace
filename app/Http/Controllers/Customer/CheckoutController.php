<?php

namespace App\Http\Controllers\Customer;

use App\Enums\PaymentMethod;
use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\CheckoutRequest;
use App\Models\Menu;
use App\Models\User;
use App\Services\ImageUploadService;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly OrderService $orders,
        private readonly ImageUploadService $uploads,
    ) {}

    /**
     * Show the checkout form for the given menu.
     */
    public function create(Request $request, Menu $menu): Response|RedirectResponse
    {
        $menu->loadMissing(['merchant', 'category:id,name']);

        if (! $menu->is_available || ! $menu->merchant->is_active) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Menu ini sedang tidak tersedia untuk dipesan.',
            ]);

            return to_route('home');
        }

        return Inertia::render('customer/checkout', [
            'menu' => [
                'id' => $menu->id,
                'name' => $menu->name,
                'description' => $menu->description,
                'price' => $menu->price,
                'min_order' => $menu->min_order,
                'photo_url' => $this->uploads->url($menu->photo_path),
                'category' => $menu->category?->name,
            ],
            'merchant' => [
                'name' => $menu->merchant->name,
                'city' => $menu->merchant->city,
                'bank_name' => $menu->merchant->bank_name,
                'bank_account_number' => $menu->merchant->bank_account_number,
                'bank_account_name' => $menu->merchant->bank_account_name,
                'has_qris' => $menu->merchant->qris_image_path !== null,
            ],
            'defaults' => [
                'qty_porsi' => $menu->min_order,
                'delivery_date' => Carbon::tomorrow()->format('Y-m-d'),
                'earliest_date' => Carbon::tomorrow()->format('Y-m-d'),
                'latest_date' => Carbon::now()->addMonths(3)->format('Y-m-d'),
                'payment_method' => PaymentMethod::BankTransfer->value,
            ],
        ]);
    }

    /**
     * Store the checkout and redirect to the order detail page.
     */
    public function store(CheckoutRequest $request, Menu $menu): RedirectResponse
    {
        $menu->loadMissing('merchant');

        if (! $menu->is_available || ! $menu->merchant->is_active) {
            return back()->withErrors([
                'qty_porsi' => 'Menu ini sedang tidak tersedia untuk dipesan.',
            ]);
        }

        /** @var User $user */
        $user = $request->user();

        $validated = $request->validated();

        $order = $this->orders->create($user, $menu, [
            'qty_porsi' => (int) $validated['qty_porsi'],
            'delivery_date' => (string) $validated['delivery_date'],
            'delivery_address' => (string) $validated['delivery_address'],
            'notes' => isset($validated['notes']) ? (string) $validated['notes'] : null,
            'payment_method' => isset($validated['payment_method']) ? (string) $validated['payment_method'] : null,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Pesanan {$order->order_no} dibuat. Silakan lakukan pembayaran.",
        ]);

        return to_route('orders.show', $order->id);
    }
}
