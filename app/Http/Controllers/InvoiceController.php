<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\OrderPresenter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function __construct(private readonly OrderPresenter $presenter) {}

    /**
     * Render the single invoice page shared by the office and the merchant.
     */
    public function show(Request $request, Order $order): Response
    {
        Gate::authorize('view', $order);

        $order->load([
            'merchant',
            'customer:id,name,email',
            'items',
            'payment',
        ]);

        return Inertia::render('invoice/show', [
            'invoice' => $this->presenter->invoice($order),
            'backUrl' => $this->backUrl($request, $order),
        ]);
    }

    /**
     * Resolve the page the current user returns to.
     */
    private function backUrl(Request $request, Order $order): string
    {
        if ($request->user()?->isMerchant()) {
            return route('merchant.orders.index');
        }

        return route('orders.show', $order->id);
    }
}
