import { Head, Link, router } from '@inertiajs/react';
import { Check, ClipboardList, FileText, Inbox, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { status } from '@/routes/merchant/orders';
import payment from '@/routes/merchant/orders/payment';
import { invoice } from '@/routes/orders';

type OrderSummary = {
    id: number;
    order_no: string;
    invoice_no: string;
    status: string;
    status_label: string;
    qty_porsi: number;
    total: number;
    delivery_date: string | null;
    created_at: string | null;
    merchant: { id: number; name: string; slug: string };
    customer_name: string;
    payment_status: string | null;
    payment_status_label: string | null;
    items: Array<{ name: string; qty: number }>;
};

type Props = {
    orders: OrderSummary[];
};

const rupiah = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

export default function MerchantOrdersIndex({ orders }: Props) {
    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const [note, setNote] = useState('');

    const verify = (order: OrderSummary) => {
        router.post(payment.verify.url(order.id), {}, { preserveScroll: true });
    };

    const reject = (order: OrderSummary) => {
        router.post(
            payment.reject.url(order.id),
            { note },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRejectingId(null);
                    setNote('');
                },
            },
        );
    };

    const mark = (order: OrderSummary, next: 'in_progress' | 'completed') => {
        router.patch(
            status.url(order.id),
            { status: next },
            { preserveScroll: true },
        );
    };

    const pending = orders.filter(
        (order) => order.status === 'pending_confirmation',
    );

    return (
        <>
            <Head title="Pesanan Masuk" />

            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-base font-semibold">Pesanan masuk</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Verifikasi bukti bayar, lalu proses pesanan sesuai
                        tanggal kirim.
                    </p>
                </div>
                {pending.length > 0 ? (
                    <Badge className="border-transparent bg-sale-soft text-sale-dark">
                        {pending.length} menunggu verifikasi
                    </Badge>
                ) : null}
            </div>

            {orders.length === 0 ? (
                <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-brand-soft/30 px-6 py-16 text-center">
                    <span className="flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand">
                        <Inbox className="size-7" />
                    </span>
                    <h3 className="mt-4 text-base font-semibold">
                        Belum ada pesanan
                    </h3>
                    <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                        Pesanan dari kantor akan muncul di sini setelah mereka
                        checkout.
                    </p>
                </div>
            ) : (
                <ul className="mt-6 space-y-3">
                    {orders.map((order) => (
                        <li
                            key={order.id}
                            className="rounded-xl border border-border/70 bg-card p-4 shadow-xs sm:p-5"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-sm font-semibold">
                                            {order.order_no}
                                        </p>
                                        <Badge variant="outline">
                                            {order.status_label}
                                        </Badge>
                                        {order.payment_status ===
                                        'waiting_verification' ? (
                                            <Badge className="border-transparent bg-sale-soft text-sale-dark">
                                                Bukti baru
                                            </Badge>
                                        ) : null}
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {order.customer_name} ·{' '}
                                        {order.qty_porsi} porsi · kirim{' '}
                                        {formatDate(order.delivery_date)}
                                    </p>
                                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                                        {order.items
                                            .map(
                                                (item) =>
                                                    `${item.name} (${item.qty})`,
                                            )
                                            .join(', ')}
                                    </p>
                                </div>
                                <p className="shrink-0 text-sm font-extrabold text-sale-dark">
                                    {rupiah.format(order.total)}
                                </p>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                                <Button asChild size="sm" variant="outline">
                                    <Link href={invoice(order.order_no)}>
                                        <FileText className="size-3.5" />
                                        Invoice
                                    </Link>
                                </Button>

                                {order.status === 'pending_confirmation' ? (
                                    <>
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => verify(order)}
                                            className="bg-success hover:bg-success/90"
                                        >
                                            <Check className="size-3.5" />
                                            Verifikasi bayar
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() => {
                                                setRejectingId(
                                                    rejectingId === order.id
                                                        ? null
                                                        : order.id,
                                                );
                                                setNote('');
                                            }}
                                        >
                                            <X className="size-3.5" />
                                            Tolak bukti
                                        </Button>
                                    </>
                                ) : null}

                                {order.status === 'confirmed' ? (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            mark(order, 'in_progress')
                                        }
                                    >
                                        <ClipboardList className="size-3.5" />
                                        Proses pesanan
                                    </Button>
                                ) : null}

                                {order.status === 'in_progress' ? (
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => mark(order, 'completed')}
                                        className="bg-brand hover:bg-brand-dark"
                                    >
                                        <Check className="size-3.5" />
                                        Tandai selesai
                                    </Button>
                                ) : null}
                            </div>

                            {rejectingId === order.id ? (
                                <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                                    <label
                                        htmlFor={`note-${order.id}`}
                                        className="text-xs font-medium"
                                    >
                                        Alasan penolakan (opsional)
                                    </label>
                                    <textarea
                                        id={`note-${order.id}`}
                                        rows={2}
                                        value={note}
                                        onChange={(event) =>
                                            setNote(event.target.value)
                                        }
                                        placeholder="Contoh: nominal transfer tidak sesuai."
                                        className="mt-1 flex w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm outline-none"
                                    />
                                    <div className="mt-2 flex gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => reject(order)}
                                        >
                                            Kirim penolakan
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setRejectingId(null)}
                                        >
                                            Batal
                                        </Button>
                                    </div>
                                </div>
                            ) : null}
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}

function formatDate(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Date(value).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}
