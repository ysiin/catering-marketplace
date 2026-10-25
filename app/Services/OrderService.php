<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Menu;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(private readonly ImageUploadService $uploads) {}

    /**
     * Create an order with price snapshots and a matching unpaid payment record.
     *
     * @param  array{qty_porsi: int, delivery_date: string, delivery_address: string, notes?: string|null, payment_method?: string|null}  $data
     */
    public function create(User $customer, Menu $menu, array $data): Order
    {
        return DB::transaction(function () use ($customer, $menu, $data): Order {
            $quantity = (int) $data['qty_porsi'];
            $subtotal = $menu->price * $quantity;
            $uniqueCode = $this->uniqueCode();

            [$orderNo, $invoiceNo] = $this->orderNumbers();

            $order = Order::create([
                'order_no' => $orderNo,
                'invoice_no' => $invoiceNo,
                'customer_id' => $customer->id,
                'merchant_id' => $menu->merchant_id,
                'delivery_date' => Carbon::parse((string) $data['delivery_date'])->startOfDay(),
                'qty_porsi' => $quantity,
                'delivery_address' => (string) $data['delivery_address'],
                'notes' => $data['notes'] ?? null,
                'subtotal' => $subtotal,
                'unique_code' => $uniqueCode,
                'total' => $subtotal + $uniqueCode,
                'status' => OrderStatus::PendingPayment,
            ]);

            $order->items()->create([
                'menu_id' => $menu->id,
                'menu_name_snapshot' => $menu->name,
                'price_snapshot' => $menu->price,
                'qty' => $quantity,
                'subtotal' => $subtotal,
            ]);

            $order->payment()->create([
                'method' => $this->paymentMethod($data['payment_method'] ?? null),
                'status' => PaymentStatus::Unpaid,
            ]);

            return $order;
        });
    }

    /**
     * Store a new payment proof and mark the payment as waiting for verification.
     */
    public function uploadPaymentProof(Order $order, UploadedFile $proof): Order
    {
        $payment = $order->payment()->firstOrCreate([], [
            'method' => PaymentMethod::BankTransfer,
            'status' => PaymentStatus::Unpaid,
        ]);

        $payment->update([
            'proof_path' => $this->uploads->replace($proof, 'payments', $payment->proof_path),
            'status' => PaymentStatus::WaitingVerification,
            'note' => null,
            'verified_at' => null,
        ]);

        $order->update(['status' => OrderStatus::PendingConfirmation]);

        return $order->refresh();
    }

    /**
     * Verify the payment proof and confirm the order.
     */
    public function verifyPayment(Order $order): Order
    {
        $order->payment()->update([
            'status' => PaymentStatus::Verified,
            'verified_at' => now(),
            'note' => null,
        ]);

        $order->update(['status' => OrderStatus::Confirmed]);

        return $order->refresh();
    }

    /**
     * Reject the payment proof and return the order to the payment step.
     *
     * @param  string|null  $note  The reason shown to the customer.
     */
    public function rejectPayment(Order $order, ?string $note = null): Order
    {
        $order->payment()->update([
            'status' => PaymentStatus::Rejected,
            'verified_at' => null,
            'note' => $note,
        ]);

        $order->update(['status' => OrderStatus::PendingPayment]);

        return $order->refresh();
    }

    /**
     * Move the order to the given status.
     */
    public function updateStatus(Order $order, OrderStatus $status): Order
    {
        $order->update(['status' => $status]);

        return $order->refresh();
    }

    /**
     * Cancel an unpaid order.
     */
    public function cancel(Order $order): Order
    {
        $order->update(['status' => OrderStatus::Cancelled]);

        return $order->refresh();
    }

    /**
     * Generate a unique order and invoice number pair for today.
     *
     * @return array{0: string, 1: string}
     */
    private function orderNumbers(): array
    {
        $date = now()->format('Ymd');
        $sequence = Order::query()->whereDate('created_at', today())->count() + 1;

        for ($attempt = 0; $attempt < 100; $attempt++) {
            $suffix = str_pad((string) ($sequence + $attempt), 4, '0', STR_PAD_LEFT);
            $orderNo = "ORD-{$date}-{$suffix}";
            $invoiceNo = "INV-{$date}-{$suffix}";

            if (! Order::query()->where('order_no', $orderNo)->orWhere('invoice_no', $invoiceNo)->exists()) {
                return [$orderNo, $invoiceNo];
            }
        }

        throw new \RuntimeException('Gagal membuat nomor pesanan unik.');
    }

    /**
     * Generate a 3 digit payment reconciliation code.
     */
    private function uniqueCode(): int
    {
        return random_int(1, 999);
    }

    /**
     * Resolve the payment method requested at checkout.
     */
    private function paymentMethod(?string $method): PaymentMethod
    {
        return $method === PaymentMethod::QrisStatic->value
            ? PaymentMethod::QrisStatic
            : PaymentMethod::BankTransfer;
    }
}
