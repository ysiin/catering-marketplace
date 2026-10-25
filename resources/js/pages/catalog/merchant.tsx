import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    ChevronRight,
    Mail,
    MapPin,
    Package,
    Phone,
    UtensilsCrossed,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { home } from '@/routes';
import { create as checkoutCreate } from '@/routes/checkout';

type Category = {
    name: string;
    slug: string;
};

type MerchantDetail = {
    name: string;
    slug: string;
    description: string | null;
    city: string | null;
    address: string | null;
    phone: string | null;
    email_contact: string | null;
    logo_url: string | null;
    menu_count: number;
    min_price: number | null;
};

type MenuCard = {
    id: number;
    name: string;
    description: string;
    price: number;
    min_order: number;
    photo_url: string | null;
    category: Category | null;
};

type Props = {
    merchant: MerchantDetail;
    menus: MenuCard[];
    categories: Category[];
};

const rupiah = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

export default function MerchantStorefront({ merchant, menus }: Props) {
    return (
        <>
            <Head title={merchant.name} />

            <section className="border-b border-border/60 bg-linear-to-br from-brand-darker via-brand-dark to-brand text-white">
                <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                    <nav
                        aria-label="Breadcrumb"
                        className="flex flex-wrap items-center gap-1.5 text-xs text-white/70"
                    >
                        <Link href={home()} className="hover:text-white">
                            Beranda
                        </Link>
                        <ChevronRight className="size-3" />
                        <span className="text-white">{merchant.name}</span>
                    </nav>

                    <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
                        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/15 ring-1 ring-white/25 sm:size-20">
                            {merchant.logo_url ? (
                                <img
                                    src={merchant.logo_url}
                                    alt={merchant.name}
                                    className="size-full object-cover"
                                />
                            ) : (
                                <UtensilsCrossed className="size-7 text-white/80" />
                            )}
                        </div>

                        <div className="min-w-0">
                            <h1 className="flex flex-wrap items-center gap-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                                {merchant.name}
                                <Badge className="border-transparent bg-white/15 text-white ring-1 ring-white/25">
                                    <BadgeCheck className="mr-1 size-3.5 text-sale" />
                                    Terverifikasi
                                </Badge>
                            </h1>

                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/80">
                                {merchant.city ? (
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="size-3.5" />
                                        {merchant.city}
                                    </span>
                                ) : null}
                                <span className="flex items-center gap-1.5">
                                    <Package className="size-3.5" />
                                    {merchant.menu_count} menu tersedia
                                </span>
                                {merchant.min_price !== null ? (
                                    <span>
                                        Mulai dari{' '}
                                        <span className="font-semibold text-white">
                                            {rupiah.format(merchant.min_price)}
                                        </span>{' '}
                                        /porsi
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
                <div>
                    <h2 className="text-base font-semibold">
                        Menu yang dijual
                    </h2>

                    {menus.length === 0 ? (
                        <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-brand-soft/30 px-6 py-14 text-center">
                            <span className="flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand">
                                <UtensilsCrossed className="size-7" />
                            </span>
                            <h3 className="mt-4 text-base font-semibold">
                                Belum ada menu tersedia
                            </h3>
                            <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                                Katering ini belum menampilkan menu yang bisa
                                dipesan saat ini.
                            </p>
                            <Button
                                asChild
                                className="mt-5 bg-brand hover:bg-brand-dark"
                            >
                                <Link href={home()}>Kembali ke katalog</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {menus.map((menu) => (
                                <article
                                    key={menu.id}
                                    className="group flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
                                >
                                    <div className="relative aspect-4/3 overflow-hidden bg-brand-soft">
                                        {menu.photo_url ? (
                                            <img
                                                src={menu.photo_url}
                                                alt={menu.name}
                                                loading="lazy"
                                                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex size-full items-center justify-center bg-linear-to-br from-brand-soft to-brand-border/60 text-brand/50">
                                                <UtensilsCrossed className="size-9" />
                                            </div>
                                        )}

                                        {menu.category ? (
                                            <Badge className="absolute top-2.5 left-2.5 border-transparent bg-white/95 text-brand-dark shadow-sm backdrop-blur">
                                                {menu.category.name}
                                            </Badge>
                                        ) : null}
                                    </div>

                                    <div className="flex flex-1 flex-col gap-2 p-4">
                                        <h3 className="line-clamp-2 text-sm leading-snug font-semibold group-hover:text-brand">
                                            {menu.name}
                                        </h3>
                                        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                            {menu.description}
                                        </p>

                                        <p className="mt-1 text-lg font-extrabold text-sale-dark">
                                            {rupiah.format(menu.price)}
                                            <span className="ml-1 text-xs font-medium text-muted-foreground">
                                                /porsi
                                            </span>
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            Min. {menu.min_order} porsi
                                        </p>

                                        <Button
                                            asChild
                                            size="sm"
                                            className="mt-auto w-full bg-brand hover:bg-brand-dark"
                                        >
                                            <Link
                                                href={checkoutCreate(menu.id)}
                                            >
                                                Pesan sekarang
                                                <ArrowRight className="size-3.5" />
                                            </Link>
                                        </Button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>

                <aside className="h-fit space-y-4">
                    <section className="rounded-xl border border-border/70 bg-card p-5 shadow-xs">
                        <h2 className="text-sm font-semibold">
                            Tentang katering
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            {merchant.description ??
                                'Katering ini belum menuliskan deskripsi.'}
                        </p>

                        <dl className="mt-4 space-y-3 border-t border-border/60 pt-4 text-sm">
                            {merchant.address ? (
                                <div className="flex items-start gap-2">
                                    <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                    <div>
                                        <dt className="text-xs text-muted-foreground">
                                            Alamat
                                        </dt>
                                        <dd>{merchant.address}</dd>
                                    </div>
                                </div>
                            ) : null}

                            {merchant.phone ? (
                                <div className="flex items-start gap-2">
                                    <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                    <div>
                                        <dt className="text-xs text-muted-foreground">
                                            Telepon
                                        </dt>
                                        <dd>
                                            <a
                                                href={`tel:${merchant.phone}`}
                                                className="hover:text-brand hover:underline"
                                            >
                                                {merchant.phone}
                                            </a>
                                        </dd>
                                    </div>
                                </div>
                            ) : null}

                            {merchant.email_contact ? (
                                <div className="flex items-start gap-2">
                                    <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                    <div>
                                        <dt className="text-xs text-muted-foreground">
                                            Email
                                        </dt>
                                        <dd>
                                            <a
                                                href={`mailto:${merchant.email_contact}`}
                                                className="break-all hover:text-brand hover:underline"
                                            >
                                                {merchant.email_contact}
                                            </a>
                                        </dd>
                                    </div>
                                </div>
                            ) : null}
                        </dl>
                    </section>

                    <section className="rounded-xl border border-border/70 bg-brand-soft/40 p-5">
                        <p className="text-sm font-semibold">Cara memesan</p>
                        <ol className="mt-2 list-inside list-decimal space-y-1 text-xs text-muted-foreground">
                            <li>Pilih menu dan jumlah porsi.</li>
                            <li>
                                Tentukan tanggal kirim (paling cepat besok,
                                H+1).
                            </li>
                            <li>
                                Transfer sesuai total, lalu unggah bukti bayar.
                            </li>
                            <li>
                                Katering memverifikasi dan mengirim pesanan.
                            </li>
                        </ol>
                        <Button
                            asChild
                            variant="outline"
                            className="mt-4 w-full bg-background"
                        >
                            <Link href={home()}>Lihat katering lain</Link>
                        </Button>
                    </section>
                </aside>
            </div>
        </>
    );
}
