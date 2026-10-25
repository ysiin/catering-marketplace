<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\PaymentProofRequest;
use App\Models\Order;
use App\Models\User;
use App\Services\OrderPresenter;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderPresenter $presenter,
        private readonly OrderService $orders,
    ) {}

    /**
     * List the orders placed by the authenticated office.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $orders = Order::query()
            ->forCustomer($user->id)
            ->with([
                'merchant:id,name,slug',
                'customer:id,name',
                'items',
                'payment',
            ])
            ->latest('created_at')
            ->latest('id')
            ->get()
            ->map(fn (Order $order): array => $this->presenter->summary($order))
            ->all();

        return Inertia::render('customer/orders/index', [
            'orders' => $orders,
        ]);
    }

    /**
     * Show a single order with its payment instructions.
     */
    public function show(Order $order): Response
    {
        Gate::authorize('view', $order);

        $order->load([
            'merchant',
            'customer:id,name,email',
            'items',
            'payment',
        ]);

        return Inertia::render('customer/orders/show', [
            'order' => $this->presenter->detail($order),
            'can' => [
                'cancel' => Gate::allows('cancel', $order),
                'uploadPayment' => Gate::allows('uploadPayment', $order),
            ],
        ]);
    }

    /**
     * Upload the transfer proof for the given order.
     */
    public function uploadPayment(PaymentProofRequest $request, Order $order): RedirectResponse
    {
        Gate::authorize('uploadPayment', $order);

        $this->orders->uploadPaymentProof($order, $request->file('proof'));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Bukti transfer terkirim. Menunggu verifikasi katering.',
        ]);

        return to_route('orders.show', $order->id);
    }

    /**
     * Cancel an unpaid order.
     */
    public function cancel(Order $order): RedirectResponse
    {
        Gate::authorize('cancel', $order);

        $this->orders->cancel($order);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Pesanan {$order->order_no} dibatalkan.",
        ]);

        return to_route('orders.show', $order->id);
    }
}
