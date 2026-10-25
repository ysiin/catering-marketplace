import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Banknote,
    CheckCircle2,
    Clock3,
    FileText,
    MapPin,
    QrCode,
    Upload,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cancel, invoice, payment } from '@/routes/orders';

type OrderItem = {
    name: string;
    price: number;
    qty: number;
    subtotal: number;
};

type MerchantInfo = {
    name: string;
    city: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    logo_url: string | null;
    bank_name: string | null;
    bank_account_number: string | null;
    bank_account_name: string | null;
    qris_url: string | null;
};

type PaymentInfo = {
    method: string;
    method_label: string;
    status: string;
    status_label: string;
    note: string | null;
    proof_url: string | null;
    verified_at: string | null;
};

type OrderDetail = {
    id: number;
    order_no: string;
    invoice_no: string;
    status: string;
    status_label: string;
    qty_porsi: number;
    total: number;
    subtotal: number;
    unique_code: number;
    delivery_date: string | null;
    delivery_address: string;
    notes: string | null;
    created_at: string | null;
    customer_name: string;
    merchant: MerchantInfo;
    items: OrderItem[];
    payment: PaymentInfo | null;
    invoice_url: string;
};

type Props = {
    order: OrderDetail;
    can: {
        cancel: boolean;
        uploadPayment: boolean;
    };
};

const rupiah = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

export default function OrderShow({ order, can }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        proof: null as File | null,
    });
    const [preview, setPreview] = useState<string | null>(null);

    const uploadProof = () => {
        post(payment.url(order.id), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const cancelOrder = () => {
        if (!confirm(`Batalkan pesanan ${order.order_no}?`)) {
            return;
        }

        post(cancel.url(order.id), { preserveScroll: true });
    };

    return (
        <>
            <Head title={`Pesanan ${order.order_no}`} />

            <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <Link
                    href="/orders"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Semua pesanan
                </Link>

                <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Pesanan {order.order_no}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {order.merchant.name} · dibuat{' '}
                            {formatDateTime(order.created_at)}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{order.status_label}</Badge>
                        <Button asChild size="sm" variant="outline">
                            <Link href={invoice(order.order_no)}>
                                <FileText className="size-4" />
                                Invoice
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_340px]">
                    <div className="space-y-5">
                        <section className="rounded-xl border border-border/70 bg-card p-5 shadow-xs">
                            <h2 className="text-sm font-semibold">
                                Rincian pesanan
                            </h2>

                            <ul className="mt-3 divide-y divide-border/60 text-sm">
                                {order.items.map((item) => (
                                    <li
                                        key={item.name}
                                        className="flex items-start justify-between gap-3 py-2.5"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {item.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {rupiah.format(item.price)} ×{' '}
                                                {item.qty} porsi
                                            </p>
                                        </div>
                                        <span className="shrink-0 font-medium">
                                            {rupiah.format(item.subtotal)}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <dl className="mt-3 space-y-1.5 border-t border-border/60 pt-3 text-sm">
                                <div className="flex justify-between text-muted-foreground">
                                    <dt>Subtotal</dt>
                                    <dd>{rupiah.format(order.subtotal)}</dd>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <dt>Kode unik</dt>
                                    <dd>{rupiah.format(order.unique_code)}</dd>
                                </div>
                                <div className="flex justify-between text-base font-bold">
                                    <dt>Total bayar</dt>
                                    <dd className="text-sale-dark">
                                        {rupiah.format(order.total)}
                                    </dd>
                                </div>
                            </dl>
                        </section>

                        <section className="rounded-xl border border-border/70 bg-card p-5 shadow-xs">
                            <h2 className="text-sm font-semibold">
                                Pengiriman
                            </h2>
                            <dl className="mt-3 space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                    <Clock3 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                    <div>
                                        <dt className="text-muted-foreground">
                                            Tanggal kirim
                                        </dt>
                                        <dd className="font-medium">
                                            {formatDate(order.delivery_date)} ·{' '}
                                            {order.qty_porsi} porsi
                                        </dd>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                    <div>
                                        <dt className="text-muted-foreground">
                                            Alamat
                                        </dt>
                                        <dd className="font-medium whitespace-pre-line">
                                            {order.delivery_address}
                                        </dd>
                                    </div>
                                </div>
                            </dl>

                            {order.notes ? (
                                <p className="mt-3 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                                    Catatan: {order.notes}
                                </p>
                            ) : null}
                        </section>

                        <section className="rounded-xl border border-border/70 bg-card p-5 shadow-xs">
                            <h2 className="text-sm font-semibold">
                                Instruksi pembayaran
                            </h2>

                            {order.merchant.bank_name &&
                            order.merchant.bank_account_number ? (
                                <div className="mt-3 flex items-start gap-2 rounded-lg bg-brand-soft/50 px-3 py-2.5 text-sm">
                                    <Banknote className="mt-0.5 size-4 shrink-0 text-brand" />
                                    <div>
                                        <p className="font-semibold">
                                            {order.merchant.bank_name}
                                        </p>
                                        <p className="font-mono">
                                            {order.merchant.bank_account_number}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            a.n.{' '}
                                            {order.merchant.bank_account_name}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="mt-3 text-sm text-muted-foreground">
                                    Katering belum mengisi rekening. Hubungi
                                    mereka lewat kontak di invoice.
                                </p>
                            )}

                            <p className="mt-3 text-xs text-muted-foreground">
                                Transfer tepat sebesar{' '}
                                <span className="font-semibold text-foreground">
                                    {rupiah.format(order.total)}
                                </span>{' '}
                                (termasuk kode unik) agar pesanan mudah
                                diverifikasi.
                            </p>

                            {order.merchant.qris_url ? (
                                <div className="mt-4 flex items-start gap-3 rounded-lg border border-border/60 p-3">
                                    <img
                                        src={order.merchant.qris_url}
                                        alt="QRIS katering"
                                        className="size-24 rounded-md border object-contain"
                                    />
                                    <div className="text-xs">
                                        <p className="flex items-center gap-1.5 font-semibold">
                                            <QrCode className="size-3.5" />
                                            QRIS statis
                                        </p>
                                        <p className="mt-1 text-muted-foreground">
                                            Pindai dengan aplikasi
                                            bank/e-wallet, lalu unggah bukti di
                                            bawah.
                                        </p>
                                    </div>
                                </div>
                            ) : null}
                        </section>
                    </div>

                    <aside className="h-fit space-y-4">
                        <section className="rounded-xl border border-border/70 bg-card p-5 shadow-xs">
                            <h2 className="text-sm font-semibold">
                                Status pembayaran
                            </h2>

                            <div className="mt-3 flex items-center gap-2">
                                {order.payment?.status === 'verified' ? (
                                    <CheckCircle2 className="size-4 text-success" />
                                ) : order.payment?.status === 'rejected' ? (
                                    <XCircle className="size-4 text-destructive" />
                                ) : (
                                    <Clock3 className="size-4 text-sale" />
                                )}
                                <span className="text-sm font-medium">
                                    {order.payment?.status_label ??
                                        'Belum dibayar'}
                                </span>
                            </div>

                            {order.payment?.note ? (
                                <p className="mt-2 rounded-md bg-destructive/10 px-2.5 py-2 text-xs text-destructive">
                                    Catatan katering: {order.payment.note}
                                </p>
                            ) : null}

                            {order.payment?.proof_url ? (
                                <a
                                    href={order.payment.proof_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-3 block"
                                >
                                    <img
                                        src={order.payment.proof_url}
                                        alt="Bukti transfer"
                                        className="max-h-48 w-full rounded-lg border object-contain"
                                    />
                                    <span className="mt-1 block text-xs text-brand hover:underline">
                                        Buka bukti ukuran penuh
                                    </span>
                                </a>
                            ) : null}

                            {can.uploadPayment ? (
                                <div className="mt-4 border-t border-border/60 pt-4">
                                    <Label htmlFor="proof">
                                        Unggah bukti transfer
                                    </Label>
                                    <Input
                                        id="proof"
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        className="mt-2 h-auto cursor-pointer py-1.5 text-xs file:mr-2 file:text-xs"
                                        onChange={(event) => {
                                            const file =
                                                event.target.files?.[0] ?? null;
                                            setData('proof', file);
                                            setPreview(
                                                file
                                                    ? URL.createObjectURL(file)
                                                    : null,
                                            );
                                        }}
                                    />
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        JPG, PNG, atau WEBP. Maks 2MB.
                                    </p>
                                    <InputError message={errors.proof} />

                                    {preview ? (
                                        <img
                                            src={preview}
                                            alt="Pratinjau bukti"
                                            className="mt-2 max-h-32 rounded-md border object-contain"
                                        />
                                    ) : null}

                                    <Button
                                        type="button"
                                        onClick={uploadProof}
                                        disabled={processing || !data.proof}
                                        className="mt-3 w-full bg-brand hover:bg-brand-dark"
                                    >
                                        <Upload className="size-4" />
                                        {processing
                                            ? 'Mengunggah…'
                                            : 'Kirim bukti bayar'}
                                    </Button>
                                </div>
                            ) : null}
                        </section>

                        {can.cancel ? (
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={cancelOrder}
                                disabled={processing}
                            >
                                Batalkan pesanan
                            </Button>
                        ) : null}
                    </aside>
                </div>
            </div>
        </>
    );
}

function formatDate(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Date(value).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatDateTime(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Date(value).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
