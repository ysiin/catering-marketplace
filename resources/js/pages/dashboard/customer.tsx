import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, ClipboardList, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { home } from '@/routes';
import { invoice, index as ordersIndex, show } from '@/routes/orders';
import type { Auth } from '@/types';

type OrderSummary = {
    id: number;
    order_no: string;
    status: string;
    status_label: string;
    qty_porsi: number;
    total: number;
    delivery_date: string | null;
    created_at: string | null;
    merchant: { id: number; name: string; slug: string };
    payment_status_label: string | null;
    items: Array<{ name: string; qty: number }>;
};

type Props = {
    stats: {
        aktif: number;
        menunggu_bayar: number;
        selesai: number;
    };
    orders: OrderSummary[];
};

const rupiah = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

export default function CustomerDashboard({ stats, orders }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;

    return (
        <>
            <Head title="Dashboard" />

            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4">
                <header>
                    <h1 className="text-xl font-semibold tracking-tight">
                        Halo, {auth.user?.name ?? 'Kantor'}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Ringkasan pesanan makan siang kantor Anda.
                    </p>
                </header>

                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard
                        value={stats.aktif}
                        label="Pesanan aktif"
                        hint="Belum selesai"
                    />
                    <StatCard
                        value={stats.menunggu_bayar}
                        label="Menunggu bayar"
                        hint="Perlu transfer"
                        accent
                    />
                    <StatCard
                        value={stats.selesai}
                        label="Selesai"
                        hint="Total pesanan"
                    />
                </div>

                <section className="rounded-xl border border-border/70 bg-card p-5 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-base font-semibold">
                            Pesanan terakhir
                        </h2>
                        <Link
                            href={ordersIndex()}
                            className="flex items-center gap-1 text-sm font-medium text-brand hover:underline"
                        >
                            Lihat semua
                            <ArrowRight className="size-3.5" />
                        </Link>
                    </div>

                    {orders.length === 0 ? (
                        <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-brand-soft/30 px-6 py-12 text-center">
                            <span className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
                                <ClipboardList className="size-6" />
                            </span>
                            <h3 className="mt-3 text-sm font-semibold">
                                Belum ada pesanan
                            </h3>
                            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                                Pilih menu di katalog untuk membuat pesanan
                                pertama Anda.
                            </p>
                            <Link
                                href={home()}
                                className="mt-4 inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
                            >
                                <Package className="mr-2 size-4" />
                                Jelajahi katalog
                            </Link>
                        </div>
                    ) : (
                        <ul className="mt-4 space-y-3">
                            {orders.map((order) => (
                                <li
                                    key={order.id}
                                    className="rounded-lg border border-border/70 p-4"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold">
                                                {order.order_no}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {order.merchant.name} ·{' '}
                                                {order.qty_porsi} porsi · kirim{' '}
                                                {formatDate(
                                                    order.delivery_date,
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                                            <Badge variant="outline">
                                                {order.status_label}
                                            </Badge>
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
                </section>
            </div>
        </>
    );
}

function StatCard({
    value,
    label,
    hint,
    accent = false,
}: {
    value: number;
    label: string;
    hint: string;
    accent?: boolean;
}) {
    return (
        <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs">
            <p className="text-2xl font-extrabold tracking-tight">
                {value.toLocaleString('id-ID')}
            </p>
            <p className="mt-1 text-sm font-semibold">{label}</p>
            <p
                className={
                    accent
                        ? 'mt-0.5 text-xs text-sale-dark'
                        : 'mt-0.5 text-xs text-muted-foreground'
                }
            >
                {hint}
            </p>
        </div>
    );
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
