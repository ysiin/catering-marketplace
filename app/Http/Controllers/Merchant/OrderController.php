<?php

namespace App\Http\Controllers\Merchant;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\User;
use App\Services\OrderPresenter;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderPresenter $presenter,
        private readonly OrderService $orders,
    ) {}

    /**
     * List the orders received by the authenticated merchant.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        $merchant = $this->merchant($request);

        if ($merchant === null) {
            Inertia::flash('toast', [
                'type' => 'info',
                'message' => 'Lengkapi profil katering terlebih dahulu.',
            ]);

            return to_route('merchant.profile.edit');
        }

        $orders = Order::query()
            ->forMerchant($merchant->id)
            ->with([
                'merchant:id,name,slug',
                'customer:id,name',
                'items',
                'payment',
            ])
            ->orderByRaw("case when status = 'pending_confirmation' then 0 else 1 end")
            ->latest('created_at')
            ->latest('id')
            ->get()
            ->map(fn (Order $order): array => $this->presenter->summary($order))
            ->all();

        return Inertia::render('merchant/orders/index', [
            'orders' => $orders,
        ]);
    }

    /**
     * Verify the uploaded payment proof and confirm the order.
     */
    public function verifyPayment(Order $order): RedirectResponse
    {
        Gate::authorize('verifyPayment', $order);

        $this->orders->verifyPayment($order);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Pembayaran {$order->order_no} terverifikasi.",
        ]);

        return back();
    }

    /**
     * Reject the payment proof with an optional reason.
     */
    public function rejectPayment(Request $request, Order $order): RedirectResponse
    {
        Gate::authorize('verifyPayment', $order);

        $validated = $request->validate([
            'note' => ['nullable', 'string', 'max:300'],
        ]);

        $this->orders->rejectPayment($order, $validated['note'] ?? null);

        Inertia::flash('toast', [
            'type' => 'info',
            'message' => "Bukti pembayaran {$order->order_no} ditolak. Kantor dapat mengunggah ulang.",
        ]);

        return back();
    }

    /**
     * Move a confirmed order to in progress or completed.
     */
    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        Gate::authorize('updateStatus', $order);

        $validated = $request->validate([
            'status' => [
                'required',
                Rule::in([OrderStatus::InProgress->value, OrderStatus::Completed->value]),
            ],
        ]);

        $status = OrderStatus::from((string) $validated['status']);

        $this->orders->updateStatus($order, $status);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Pesanan {$order->order_no} ditandai {$status->label()}.",
        ]);

        return back();
    }

    /**
     * Get the authenticated merchant's profile, if it exists.
     */
    private function merchant(Request $request): ?Merchant
    {
        /** @var User $user */
        $user = $request->user();

        return $user->merchant;
    }
}
