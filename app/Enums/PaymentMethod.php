<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case BankTransfer = 'bank_transfer';
    case QrisStatic = 'qris_static';

    /**
     * Get the human readable label for the payment method.
     */
    public function label(): string
    {
        return match ($this) {
            self::BankTransfer => 'Transfer bank',
            self::QrisStatic => 'QRIS statis',
        };
    }
}
