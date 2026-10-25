<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Database\Factories\OrderItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $order_id
 * @property int|null $menu_id
 * @property string $menu_name_snapshot
 * @property int $price_snapshot
 * @property int $qty
 * @property int $subtotal
 * @property CarbonInterface|null $created_at
 * @property CarbonInterface|null $updated_at
 * @property-read Order $order
 * @property-read Menu|null $menu
 */
#[Fillable([
    'order_id',
    'menu_id',
    'menu_name_snapshot',
    'price_snapshot',
    'qty',
    'subtotal',
])]
class OrderItem extends Model
{
    /** @use HasFactory<OrderItemFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price_snapshot' => 'integer',
            'qty' => 'integer',
            'subtotal' => 'integer',
        ];
    }

    /**
     * Get the order that owns the line item.
     *
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the original menu, when it still exists.
     *
     * @return BelongsTo<Menu, $this>
     */
    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class);
    }
}
