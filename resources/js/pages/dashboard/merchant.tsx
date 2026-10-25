import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, ClipboardList } from 'lucide-react';
import { index as ordersIndex } from '@/routes/merchant/orders';
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
    customer_name: string;
    payment_status_label: string | null;
    items: Array<{ name: string; qty: number }>;
};

type Props = {
    stats: {
        omzet_bulan_ini: number;
        omzet_total: number;
        pesanan_masuk: number;
        perlu_verifikasi: number;
    };
    orders: OrderSummary[];
};

const rupiah = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

export default function MerchantDashboard({ stats, orders }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;

    return (
        <>
            <Head title="Dashboard" />

            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4">
                <header>
                    <h1 className="text-xl font-semibold tracking-tight">
                        Halo, {auth.user?.name ?? 'Katering'}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Ringkasan omzet dan pesanan masuk katering Anda.
                    </p>
                </header>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        value={rupiah.format(stats.omzet_bulan_ini)}
                        label="Omzet bulan ini"
                        hint="Pembayaran terverifikasi"
                    />
                    <StatCard
                        value={rupiah.format(stats.omzet_total)}
                        label="Total omzet"
                        hint="Pembayaran terverifikasi"
                    />
                    <StatCard
                        value={stats.pesanan_masuk.toLocaleString('id-ID')}
                        label="Pesanan masuk"
                        hint="Semua pesanan"
                    />
                    <StatCard
                        value={stats.perlu_verifikasi.toLocaleString('id-ID')}
                        label="Perlu verifikasi"
                        hint="Bukti bayar menunggu"
                        accent
                    />
                </div>

                <section className="rounded-xl border border-border/70 bg-card p-5 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-base font-semibold">
                            Pesanan terbaru
                        </h2>
                        <Link
                            href={ordersIndex()}
                            className="flex items-center gap-1 text-sm font-medium text-brand hover:underline"
                        >
                            Lihat pesanan masuk
                            <ArrowRight className="size-3.5" />
                        </Link>
                    </div>

                    {orders.length === 0 ? (
                        <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-brand-soft/30 px-6 py-12 text-center">
                            <span className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
                                <ClipboardList className="size-6" />
                            </span>
                            <h3 className="mt-3 text-sm font-semibold">
                                Belum ada pesanan masuk
                            </h3>
                            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                                Pesanan dari kantor akan muncul di sini setelah
                                mereka memesan menu Anda.
                            </p>
                        </div>
                    ) : (
                        <ul className="mt-4 space-y-3">
                            {orders.map((order) => (
                                <li
                                    key={order.id}
                                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 p-4"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold">
                                            {order.order_no}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {order.customer_name} ·{' '}
                                            {order.qty_porsi} porsi ·{' '}
                                            {order.payment_status_label ??
                                                order.status_label}
                                        </p>
                                    </div>
                                    <p className="text-sm font-extrabold text-sale-dark">
                                        {rupiah.format(order.total)}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {stats.perlu_verifikasi > 0 ? (
                    <Link
                        href={ordersIndex()}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
                    >
                        <BadgeCheck className="size-4" />
                        Verifikasi {stats.perlu_verifikasi} pembayaran sekarang
                    </Link>
                ) : null}
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
    value: string;
    label: string;
    hint: string;
    accent?: boolean;
}) {
    return (
        <div className="rounded-xl border border-border/70 bg-card p-5 shadow-xs">
            <p className="truncate text-xl font-extrabold tracking-tight">
                {value}
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
