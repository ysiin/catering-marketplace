import { Head, Link } from '@inertiajs/react';
import { ClipboardList, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { invoice, show } from '@/routes/orders';
import { home } from '@/routes';

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

export default function OrderIndex({ orders }: Props) {
    return (
        <>
            <Head title="Pesanan Saya" />

            <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <h1 className="text-xl font-semibold tracking-tight">
                    Pesanan saya
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Pantau status pesanan, unggah bukti bayar, dan lihat
                    invoice.
                </p>

                {orders.length === 0 ? (
                    <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-brand-soft/30 px-6 py-16 text-center">
                        <span className="flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand">
                            <ClipboardList className="size-7" />
                        </span>
                        <h2 className="mt-4 text-base font-semibold">
                            Belum ada pesanan
                        </h2>
                        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                            Pilih menu di katalog untuk membuat pesanan pertama
                            Anda.
                        </p>
                        <Link
                            href={home()}
                            className="mt-5 inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
                        >
                            <Package className="mr-2 size-4" />
                            Jelajahi katalog
                        </Link>
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
                                        <p className="text-sm font-semibold">
                                            {order.order_no}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {order.merchant.name} ·{' '}
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
                                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                                        <StatusBadge
                                            label={order.status_label}
                                        />
                                        <p className="text-sm font-extrabold text-sale-dark">
                                            {rupiah.format(order.total)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                                    <Link
                                        href={show(order.id)}
                                        className="inline-flex items-center justify-center rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark"
                                    >
                                        Detail & bayar
                                    </Link>
                                    <Link
                                        href={invoice(order.order_no)}
                                        className="inline-flex items-center justify-center rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent"
                                    >
                                        Lihat invoice
                                    </Link>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}

function StatusBadge({ label }: { label: string }) {
    return <Badge variant="outline">{label}</Badge>;
}

function formatDate(value: string | null): string {
    if (!value) {
        return '-';
    }

    const date = new Date(value);

    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}
