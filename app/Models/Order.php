<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Policies\OrderPolicy;
use Carbon\CarbonInterface;
use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property int $id
 * @property string $order_no
 * @property string $invoice_no
 * @property int $customer_id
 * @property int $merchant_id
 * @property CarbonInterface $delivery_date
 * @property int $qty_porsi
 * @property string $delivery_address
 * @property string|null $notes
 * @property int $subtotal
 * @property int $unique_code
 * @property int $total
 * @property OrderStatus $status
 * @property CarbonInterface|null $created_at
 * @property CarbonInterface|null $updated_at
 * @property-read User $customer
 * @property-read Merchant $merchant
 * @property-read Collection<int, OrderItem> $items
 * @property-read Payment|null $payment
 */
#[Fillable([
    'order_no',
    'invoice_no',
    'customer_id',
    'merchant_id',
    'delivery_date',
    'qty_porsi',
    'delivery_address',
    'notes',
    'subtotal',
    'unique_code',
    'total',
    'status',
])]
#[UsePolicy(OrderPolicy::class)]
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'delivery_date' => 'date',
            'qty_porsi' => 'integer',
            'subtotal' => 'integer',
            'unique_code' => 'integer',
            'total' => 'integer',
            'status' => OrderStatus::class,
        ];
    }

    /**
     * Get the office user that placed the order.
     *
     * @return BelongsTo<User, $this>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    /**
     * Get the merchant that receives the order.
     *
     * @return BelongsTo<Merchant, $this>
     */
    public function merchant(): BelongsTo
    {
        return $this->belongsTo(Merchant::class);
    }

    /**
     * Get the snapshot line items of the order.
     *
     * @return HasMany<OrderItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the single payment record attached to the order.
     *
     * @return HasOne<Payment, $this>
     */
    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    /**
     * Limit the query to orders that belong to the given customer.
     *
     * @param  Builder<Order>  $query
     */
    #[Scope]
    protected function forCustomer(Builder $query, int $customerId): void
    {
        $query->where('customer_id', $customerId);
    }

    /**
     * Limit the query to orders that belong to the given merchant.
     *
     * @param  Builder<Order>  $query
     */
    #[Scope]
    protected function forMerchant(Builder $query, int $merchantId): void
    {
        $query->where('merchant_id', $merchantId);
    }
}
