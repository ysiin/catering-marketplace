import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';

type InvoiceItem = {
    name: string;
    price: number;
    qty: number;
    subtotal: number;
};

type InvoiceMerchant = {
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

type InvoicePayment = {
    method: string;
    method_label: string;
    status: string;
    status_label: string;
    note: string | null;
    proof_url: string | null;
    verified_at: string | null;
};

type Invoice = {
    order_no: string;
    invoice_no: string;
    issued_at: string | null;
    delivery_date: string | null;
    status: string;
    status_label: string;
    qty_porsi: number;
    delivery_address: string;
    notes: string | null;
    subtotal: number;
    unique_code: number;
    total: number;
    items: InvoiceItem[];
    payment: InvoicePayment | null;
    merchant: InvoiceMerchant;
    customer: {
        name: string;
        email: string;
    };
};

type Props = {
    invoice: Invoice;
    backUrl: string;
};

const rupiah = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

export default function InvoiceShow({ invoice, backUrl }: Props) {
    return (
        <>
            <Head title={`Invoice ${invoice.invoice_no}`} />

            <div className="invoice-page mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
                <div className="invoice-actions mb-5 flex flex-wrap items-center justify-between gap-2">
                    <Link
                        href={backUrl}
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        Kembali
                    </Link>

                    <Button
                        type="button"
                        onClick={() => window.print()}
                        className="bg-brand hover:bg-brand-dark"
                    >
                        <Printer className="size-4" />
                        Cetak invoice
                    </Button>
                </div>

                <article className="invoice-sheet mx-auto w-full rounded-xl border border-border/70 bg-white p-6 text-neutral-900 shadow-xs sm:p-10 print:rounded-none print:border-0 print:p-0 print:shadow-none">
                    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-200 pb-5">
                        <div className="flex items-start gap-3">
                            {invoice.merchant.logo_url ? (
                                <img
                                    src={invoice.merchant.logo_url}
                                    alt={invoice.merchant.name}
                                    className="size-12 rounded-lg border border-neutral-200 object-contain"
                                />
                            ) : null}
                            <div>
                                <h1 className="text-lg font-bold">
                                    {invoice.merchant.name}
                                </h1>
                                {invoice.merchant.address ? (
                                    <p className="mt-0.5 max-w-xs text-xs text-neutral-600">
                                        {invoice.merchant.address}
                                    </p>
                                ) : null}
                                <p className="mt-0.5 text-xs text-neutral-600">
                                    {[
                                        invoice.merchant.phone,
                                        invoice.merchant.email,
                                    ]
                                        .filter(Boolean)
                                        .join(' · ')}
                                </p>
                            </div>
                        </div>

                        <div className="text-left sm:text-right">
                            <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                                Invoice
                            </p>
                            <p className="font-mono text-base font-bold">
                                {invoice.invoice_no}
                            </p>
                            <p className="mt-1 text-xs text-neutral-600">
                                No. pesanan: {invoice.order_no}
                            </p>
                            <p className="text-xs text-neutral-600">
                                Terbit: {formatDateTime(invoice.issued_at)}
                            </p>
                        </div>
                    </header>

                    <section className="grid gap-5 border-b border-neutral-200 py-5 sm:grid-cols-2">
                        <div>
                            <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                                Ditagihkan ke
                            </p>
                            <p className="mt-1 text-sm font-semibold">
                                {invoice.customer.name}
                            </p>
                            <p className="text-xs text-neutral-600">
                                {invoice.customer.email}
                            </p>
                            <p className="mt-1 max-w-xs text-xs whitespace-pre-line text-neutral-600">
                                {invoice.delivery_address}
                            </p>
                        </div>

                        <div className="sm:text-right">
                            <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                                Dari
                            </p>
                            <p className="mt-1 text-sm font-semibold">
                                {invoice.merchant.name}
                            </p>
                            <p className="text-xs text-neutral-600">
                                {invoice.merchant.city}
                            </p>

                            <dl className="mt-3 space-y-1 text-xs">
                                <div className="flex justify-between gap-3 sm:justify-end sm:gap-2">
                                    <dt className="text-neutral-500">
                                        Tanggal kirim
                                    </dt>
                                    <dd className="font-medium">
                                        {formatDate(invoice.delivery_date)}
                                    </dd>
                                </div>
                                <div className="flex justify-between gap-3 sm:justify-end sm:gap-2">
                                    <dt className="text-neutral-500">Status</dt>
                                    <dd className="font-medium">
                                        {invoice.status_label}
                                    </dd>
                                </div>
                                <div className="flex justify-between gap-3 sm:justify-end sm:gap-2">
                                    <dt className="text-neutral-500">
                                        Pembayaran
                                    </dt>
                                    <dd className="font-medium">
                                        {invoice.payment?.status_label ??
                                            'Belum dibayar'}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </section>

                    <section className="py-5">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-neutral-200 text-xs tracking-wide text-neutral-500 uppercase">
                                    <th className="py-2 pr-2 font-semibold">
                                        Menu
                                    </th>
                                    <th className="px-2 py-2 text-right font-semibold">
                                        Harga/porsi
                                    </th>
                                    <th className="px-2 py-2 text-right font-semibold">
                                        Porsi
                                    </th>
                                    <th className="py-2 pl-2 text-right font-semibold">
                                        Subtotal
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map((item) => (
                                    <tr
                                        key={item.name}
                                        className="border-b border-neutral-100"
                                    >
                                        <td className="py-2.5 pr-2 font-medium">
                                            {item.name}
                                        </td>
                                        <td className="px-2 py-2.5 text-right whitespace-nowrap">
                                            {rupiah.format(item.price)}
                                        </td>
                                        <td className="px-2 py-2.5 text-right">
                                            {item.qty}
                                        </td>
                                        <td className="py-2.5 pl-2 text-right font-medium whitespace-nowrap">
                                            {rupiah.format(item.subtotal)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="mt-4 flex justify-end">
                            <dl className="w-full max-w-xs space-y-1.5 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-neutral-600">
                                        Subtotal
                                    </dt>
                                    <dd>{rupiah.format(invoice.subtotal)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-neutral-600">
                                        Kode unik
                                    </dt>
                                    <dd>
                                        {rupiah.format(invoice.unique_code)}
                                    </dd>
                                </div>
                                <div className="flex justify-between border-t border-neutral-300 pt-1.5 text-base font-bold">
                                    <dt>Total bayar</dt>
                                    <dd>{rupiah.format(invoice.total)}</dd>
                                </div>
                            </dl>
                        </div>

                        {invoice.notes ? (
                            <p className="mt-4 rounded-md bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
                                Catatan: {invoice.notes}
                            </p>
                        ) : null}
                    </section>

                    <section className="grid gap-5 border-t border-neutral-200 pt-5 sm:grid-cols-2">
                        <div>
                            <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                                Instruksi pembayaran
                            </p>
                            {invoice.merchant.bank_name &&
                            invoice.merchant.bank_account_number ? (
                                <div className="mt-1.5 text-sm">
                                    <p className="font-semibold">
                                        {invoice.merchant.bank_name}
                                    </p>
                                    <p className="font-mono">
                                        {invoice.merchant.bank_account_number}
                                    </p>
                                    <p className="text-xs text-neutral-600">
                                        a.n.{' '}
                                        {invoice.merchant.bank_account_name}
                                    </p>
                                </div>
                            ) : (
                                <p className="mt-1.5 text-xs text-neutral-600">
                                    Hubungi katering untuk detail rekening.
                                </p>
                            )}

                            <p className="mt-2 text-xs text-neutral-600">
                                Transfer tepat {rupiah.format(invoice.total)}{' '}
                                termasuk kode unik, lalu unggah bukti pada
                                halaman pesanan.
                            </p>
                        </div>

                        {invoice.merchant.qris_url ? (
                            <div className="flex items-start gap-3 sm:justify-end">
                                <img
                                    src={invoice.merchant.qris_url}
                                    alt="QRIS katering"
                                    className="size-24 rounded border border-neutral-200 object-contain"
                                />
                                <p className="flex items-center gap-1 text-xs text-neutral-600">
                                    <QrCode className="size-3.5" />
                                    QRIS statis
                                </p>
                            </div>
                        ) : null}
                    </section>

                    <footer className="mt-6 border-t border-neutral-200 pt-4 text-[11px] text-neutral-500">
                        <p>
                            Invoice ini dibuat otomatis oleh Sekotak dan sah
                            tanpa tanda tangan basah. Satu invoice dipakai
                            bersama oleh kantor dan katering.
                        </p>
                        {invoice.payment?.proof_url ? (
                            <p className="mt-1">
                                Bukti transfer terlampir pada halaman pesanan.
                            </p>
                        ) : null}
                    </footer>
                </article>
            </div>
        </>
    );
}

function formatDate(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Date(value).toLocaleDateString('id-ID', {
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
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
