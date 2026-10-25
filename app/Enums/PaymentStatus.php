<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Unpaid = 'unpaid';
    case WaitingVerification = 'waiting_verification';
    case Verified = 'verified';
    case Rejected = 'rejected';

    /**
     * Get the human readable label for the status.
     */
    public function label(): string
    {
        return match ($this) {
            self::Unpaid => 'Belum dibayar',
            self::WaitingVerification => 'Menunggu verifikasi',
            self::Verified => 'Terverifikasi',
            self::Rejected => 'Bukti ditolak',
        };
    }
}
