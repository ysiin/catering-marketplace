import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, BadgeCheck, MapPin, UtensilsCrossed } from 'lucide-react';
import { useMemo } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store } from '@/routes/checkout';
import { home } from '@/routes';

type MenuInfo = {
    id: number;
    name: string;
    description: string;
    price: number;
    min_order: number;
    photo_url: string | null;
    category: string | null;
};

type MerchantInfo = {
    name: string;
    city: string | null;
    bank_name: string | null;
    bank_account_number: string | null;
    bank_account_name: string | null;
    has_qris: boolean;
};

type Props = {
    menu: MenuInfo;
    merchant: MerchantInfo;
    defaults: {
        qty_porsi: number;
        delivery_date: string;
        earliest_date: string;
        latest_date: string;
        payment_method: string;
    };
};

const rupiah = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

export default function Checkout({ menu, merchant, defaults }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        qty_porsi: defaults.qty_porsi,
        delivery_date: defaults.delivery_date,
        delivery_address: '',
        notes: '',
        payment_method: defaults.payment_method,
    });

    const subtotal = useMemo(
        () => menu.price * (Number(data.qty_porsi) || 0),
        [menu.price, data.qty_porsi],
    );

    const submit = () => {
        post(store.url(menu.id), { preserveScroll: true });
    };

    return (
        <>
            <Head title={`Pesan ${menu.name}`} />

            <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <Link
                    href={home()}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Kembali ke katalog
                </Link>

                <h1 className="mt-4 text-xl font-semibold tracking-tight">
                    Selesaikan pesanan
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Pesanan dikirim paling cepat besok. Pembayaran diverifikasi
                    manual oleh katering.
                </p>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        submit();
                    }}
                    className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]"
                >
                    <div className="space-y-5">
                        <section className="rounded-xl border border-border/70 bg-card p-5 shadow-xs">
                            <h2 className="text-sm font-semibold">
                                Detail pengiriman
                            </h2>

                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="qty_porsi">
                                        Jumlah porsi
                                    </Label>
                                    <Input
                                        id="qty_porsi"
                                        type="number"
                                        min={menu.min_order}
                                        value={data.qty_porsi}
                                        onChange={(event) =>
                                            setData(
                                                'qty_porsi',
                                                Number(event.target.value),
                                            )
                                        }
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Minimal {menu.min_order} porsi
                                    </p>
                                    <InputError message={errors.qty_porsi} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="delivery_date">
                                        Tanggal pengiriman
                                    </Label>
                                    <Input
                                        id="delivery_date"
                                        type="date"
                                        min={defaults.earliest_date}
                                        max={defaults.latest_date}
                                        value={data.delivery_date}
                                        onChange={(event) =>
                                            setData(
                                                'delivery_date',
                                                event.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Paling cepat besok (H+1)
                                    </p>
                                    <InputError
                                        message={errors.delivery_date}
                                    />
                                </div>
                            </div>

                            <div className="mt-4 grid gap-2">
                                <Label htmlFor="delivery_address">
                                    Alamat pengiriman
                                </Label>
                                <textarea
                                    id="delivery_address"
                                    rows={3}
                                    value={data.delivery_address}
                                    onChange={(event) =>
                                        setData(
                                            'delivery_address',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Nama gedung, lantai, nama penerima, dan nomor telepon."
                                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                    required
                                />
                                <InputError message={errors.delivery_address} />
                            </div>

                            <div className="mt-4 grid gap-2">
                                <Label htmlFor="notes">
                                    Catatan (opsional)
                                </Label>
                                <textarea
                                    id="notes"
                                    rows={2}
                                    value={data.notes}
                                    onChange={(event) =>
                                        setData('notes', event.target.value)
                                    }
                                    placeholder="Contoh: tanpa sambal, tambah nasi."
                                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                />
                                <InputError message={errors.notes} />
                            </div>
                        </section>

                        <section className="rounded-xl border border-border/70 bg-card p-5 shadow-xs">
                            <h2 className="text-sm font-semibold">
                                Metode pembayaran
                            </h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Transfer manual ke rekening katering, lalu
                                unggah bukti bayar.
                            </p>

                            <div className="mt-3 space-y-2">
                                <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-border p-3 text-sm has-checked:border-brand has-checked:bg-brand-soft/40">
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value="bank_transfer"
                                        checked={
                                            data.payment_method ===
                                            'bank_transfer'
                                        }
                                        onChange={() =>
                                            setData(
                                                'payment_method',
                                                'bank_transfer',
                                            )
                                        }
                                        className="mt-0.5"
                                    />
                                    <span>
                                        <span className="font-medium">
                                            Transfer bank
                                        </span>
                                        <span className="mt-0.5 block text-xs text-muted-foreground">
                                            {merchant.bank_name &&
                                            merchant.bank_account_number
                                                ? `${merchant.bank_name} · ${merchant.bank_account_number} a.n. ${merchant.bank_account_name}`
                                                : 'Rekening belum diisi merchant. Konfirmasi lewat invoice.'}
                                        </span>
                                    </span>
                                </label>

                                {merchant.has_qris ? (
                                    <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-border p-3 text-sm has-checked:border-brand has-checked:bg-brand-soft/40">
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="qris_static"
                                            checked={
                                                data.payment_method ===
                                                'qris_static'
                                            }
                                            onChange={() =>
                                                setData(
                                                    'payment_method',
                                                    'qris_static',
                                                )
                                            }
                                            className="mt-0.5"
                                        />
                                        <span>
                                            <span className="font-medium">
                                                QRIS statis
                                            </span>
                                            <span className="mt-0.5 block text-xs text-muted-foreground">
                                                Pindai QRIS katering, lalu
                                                unggah bukti.
                                            </span>
                                        </span>
                                    </label>
                                ) : null}
                                <InputError message={errors.payment_method} />
                            </div>
                        </section>
                    </div>

                    <aside className="h-fit space-y-4 rounded-xl border border-border/70 bg-card p-5 shadow-xs lg:sticky lg:top-24">
                        <div className="flex gap-3">
                            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-soft">
                                {menu.photo_url ? (
                                    <img
                                        src={menu.photo_url}
                                        alt={menu.name}
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <UtensilsCrossed className="size-5 text-brand/50" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="line-clamp-2 text-sm font-semibold">
                                    {menu.name}
                                </p>
                                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                    <BadgeCheck className="size-3.5 text-success" />
                                    {merchant.name}
                                </p>
                                {merchant.city ? (
                                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                        <MapPin className="size-3" />
                                        {merchant.city}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <div className="space-y-1.5 border-t border-border/60 pt-4 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                                <span>
                                    {rupiah.format(menu.price)} ×{' '}
                                    {data.qty_porsi || 0} porsi
                                </span>
                                <span>{rupiah.format(subtotal)}</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                                <span>Total</span>
                                <span className="text-sale-dark">
                                    {rupiah.format(subtotal)}
                                </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                Kode unik 3 digit ditambahkan pada invoice untuk
                                rekonsiliasi transfer.
                            </p>
                        </div>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-brand hover:bg-brand-dark"
                        >
                            {processing ? 'Memproses…' : 'Buat pesanan'}
                        </Button>
                    </aside>
                </form>
            </div>
        </>
    );
}
