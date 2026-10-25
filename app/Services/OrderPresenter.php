<?php

namespace App\Services;

use App\Models\Merchant;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use Carbon\CarbonInterface;

class OrderPresenter
{
    public function __construct(private readonly ImageUploadService $uploads) {}

    /**
     * Build the compact order payload used by both order lists.
     *
     * @return array<string, mixed>
     */
    public function summary(Order $order): array
    {
        return [
            'id' => $order->id,
            'order_no' => $order->order_no,
            'invoice_no' => $order->invoice_no,
            'status' => $order->status->value,
            'status_label' => $order->status->label(),
            'qty_porsi' => $order->qty_porsi,
            'total' => $order->total,
            'delivery_date' => $this->date($order->delivery_date),
            'created_at' => $this->dateTime($order->created_at),
            'merchant' => $order->merchant->only(['id', 'name', 'slug']),
            'customer_name' => $order->customer->name,
            'payment_status' => $order->payment?->status->value,
            'payment_status_label' => $order->payment?->status->label(),
            'items' => $order->items
                ->map(fn (OrderItem $item): array => [
                    'name' => $item->menu_name_snapshot,
                    'qty' => $item->qty,
                ])
                ->values()
                ->all(),
        ];
    }

    /**
     * Build the full order payload used by the customer detail page.
     *
     * @return array<string, mixed>
     */
    public function detail(Order $order): array
    {
        return [
            ...$this->summary($order),
            'delivery_address' => $order->delivery_address,
            'notes' => $order->notes,
            'subtotal' => $order->subtotal,
            'unique_code' => $order->unique_code,
            'items' => $this->items($order),
            'payment' => $this->payment($order->payment),
            'merchant' => $this->merchant($order->merchant),
            'invoice_url' => route('orders.invoice', $order->order_no),
        ];
    }

    /**
     * Build the invoice payload rendered identically for both parties.
     *
     * @return array<string, mixed>
     */
    public function invoice(Order $order): array
    {
        return [
            'order_no' => $order->order_no,
            'invoice_no' => $order->invoice_no,
            'issued_at' => $this->dateTime($order->created_at),
            'delivery_date' => $this->date($order->delivery_date),
            'status' => $order->status->value,
            'status_label' => $order->status->label(),
            'qty_porsi' => $order->qty_porsi,
            'delivery_address' => $order->delivery_address,
            'notes' => $order->notes,
            'subtotal' => $order->subtotal,
            'unique_code' => $order->unique_code,
            'total' => $order->total,
            'items' => $this->items($order),
            'payment' => $this->payment($order->payment),
            'merchant' => $this->merchant($order->merchant),
            'customer' => [
                'name' => $order->customer->name,
                'email' => $order->customer->email,
            ],
        ];
    }

    /**
     * Format the order line items with their checkout snapshots.
     *
     * @return array<int, array<string, mixed>>
     */
    private function items(Order $order): array
    {
        return $order->items
            ->map(fn (OrderItem $item): array => [
                'name' => $item->menu_name_snapshot,
                'price' => $item->price_snapshot,
                'qty' => $item->qty,
                'subtotal' => $item->subtotal,
            ])
            ->values()
            ->all();
    }

    /**
     * Build the merchant identity used on the invoice and payment instructions.
     *
     * @return array<string, mixed>
     */
    private function merchant(Merchant $merchant): array
    {
        return [
            'name' => $merchant->name,
            'city' => $merchant->city,
            'address' => $merchant->address,
            'phone' => $merchant->phone,
            'email' => $merchant->email_contact,
            'logo_url' => $this->uploads->url($merchant->logo_path),
            'bank_name' => $merchant->bank_name,
            'bank_account_number' => $merchant->bank_account_number,
            'bank_account_name' => $merchant->bank_account_name,
            'qris_url' => $this->uploads->url($merchant->qris_image_path),
        ];
    }

    /**
     * Build the payment payload including the proof preview URL.
     *
     * @return array<string, mixed>|null
     */
    private function payment(?Payment $payment): ?array
    {
        if ($payment === null) {
            return null;
        }

        return [
            'method' => $payment->method->value,
            'method_label' => $payment->method->label(),
            'status' => $payment->status->value,
            'status_label' => $payment->status->label(),
            'note' => $payment->note,
            'proof_url' => $this->uploads->url($payment->proof_path),
            'verified_at' => $payment->verified_at?->toIso8601String(),
        ];
    }

    /**
     * Format a date value as Y-m-d.
     */
    private function date(?CarbonInterface $date): ?string
    {
        return $date?->format('Y-m-d');
    }

    /**
     * Format a timestamp for display.
     */
    private function dateTime(?CarbonInterface $date): ?string
    {
        return $date?->toIso8601String();
    }
}
