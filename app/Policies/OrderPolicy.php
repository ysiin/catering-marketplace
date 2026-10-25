<?php

namespace App\Policies;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    /**
     * Determine whether the user can view any orders.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the order.
     */
    public function view(User $user, Order $order): bool
    {
        return $this->isCustomerOwner($user, $order)
            || $this->isMerchantOwner($user, $order);
    }

    /**
     * Determine whether the user can place an order.
     */
    public function create(User $user): bool
    {
        return $user->isCustomer();
    }

    /**
     * Determine whether the customer can cancel the order.
     */
    public function cancel(User $user, Order $order): bool
    {
        return $this->isCustomerOwner($user, $order)
            && $order->status === OrderStatus::PendingPayment;
    }

    /**
     * Determine whether the customer can upload a payment proof.
     */
    public function uploadPayment(User $user, Order $order): bool
    {
        return $this->isCustomerOwner($user, $order)
            && in_array($order->status, [
                OrderStatus::PendingPayment,
                OrderStatus::PendingConfirmation,
            ], true);
    }

    /**
     * Determine whether the owning merchant can verify the payment.
     */
    public function verifyPayment(User $user, Order $order): bool
    {
        return $this->isMerchantOwner($user, $order)
            && $order->status === OrderStatus::PendingConfirmation;
    }

    /**
     * Determine whether the owning merchant can change the order status.
     */
    public function updateStatus(User $user, Order $order): bool
    {
        return $this->isMerchantOwner($user, $order)
            && ! in_array($order->status, [
                OrderStatus::Completed,
                OrderStatus::Cancelled,
                OrderStatus::Rejected,
            ], true);
    }

    /**
     * Determine whether the order belongs to the given customer.
     */
    private function isCustomerOwner(User $user, Order $order): bool
    {
        return $user->isCustomer() && $order->customer_id === $user->id;
    }

    /**
     * Determine whether the order belongs to the user's merchant profile.
     */
    private function isMerchantOwner(User $user, Order $order): bool
    {
        return $user->isMerchant()
            && $user->merchant !== null
            && $order->merchant_id === $user->merchant->id;
    }
}
