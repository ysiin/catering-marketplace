<?php

namespace App\Enums;

enum UserRole: string
{
    case Customer = 'customer';
    case Merchant = 'merchant';

    /**
     * Get the human readable label for the role.
     */
    public function label(): string
    {
        return match ($this) {
            self::Customer => 'Kantor',
            self::Merchant => 'Katering',
        };
    }
}
