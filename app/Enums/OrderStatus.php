<?php

namespace App\Enums;

enum OrderStatus: string
{
    case PendingPayment = 'pending_payment';
    case PendingConfirmation = 'pending_confirmation';
    case Confirmed = 'confirmed';
    case Rejected = 'rejected';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    /**
     * Get the human readable label for the status.
     */
    public function label(): string
    {
        return match ($this) {
            self::PendingPayment => 'Menunggu pembayaran',
            self::PendingConfirmation => 'Menunggu verifikasi',
            self::Confirmed => 'Dikonfirmasi',
            self::Rejected => 'Ditolak',
            self::InProgress => 'Sedang diproses',
            self::Completed => 'Selesai',
            self::Cancelled => 'Dibatalkan',
        };
    }
}
