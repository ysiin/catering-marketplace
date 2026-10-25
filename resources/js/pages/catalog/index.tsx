import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Package,
    SearchX,
    UtensilsCrossed,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { home } from '@/routes';
import { create as checkoutCreate } from '@/routes/checkout';
import { show as cateringShow } from '@/routes/catering';

type Category = {
    name: string;
    slug: string;
};

type MerchantSummary = {
    name: string;
    slug: string;
    city: string | null;
};

type MenuCard = {
    id: number;
    name: string;
    description: string;
    price: number;
    min_order: number;
    photo_url: string | null;
    category: Category | null;
    merchant: MerchantSummary;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Paginator<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: PaginationLink[];
};

type Props = {
    menus: Paginator<MenuCard>;
    categories: Category[];
    cities: string[];
    filters: {
        search: string;
        city: string;
        category: string;
    };
};

const rupiah = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

export default function CatalogIndex({ menus, categories, filters }: Props) {
    const activeCategory = categories.find(
        (category) => category.slug === filters.category,
    );

    const heading = activeCategory
        ? `Katering ${activeCategory.name}`
        : filters.search !== ''
          ? `Hasil untuk “${filters.search}”`
          : 'Katering Makan Siang Kantor';

    return (
        <>
            <Head title="Katalog Katering" />

            <section className="border-b border-border/60 bg-linear-to-br from-brand-darker via-brand-dark to-brand text-white">
                <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
                    <div className="max-w-2xl">
                        <h1 className="text-2xl font-extrabold tracking-tight text-balance sm:text-3xl lg:text-4xl">
                            {heading}
                        </h1>
                        <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
                            Pilih menu dari katering terverifikasi. Pesan
                            minimal H+1, bayar via transfer, dan pantau invoice
                            bersama merchant.
                        </p>
                    </div>
                </div>
            </section>

            <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
                    <p className="text-sm text-muted-foreground">
                        {menus.total === 0 ? (
                            'Tidak ada menu yang cocok'
                        ) : (
                            <>
                                Menampilkan{' '}
                                <span className="font-semibold text-foreground">
                                    {menus.from}–{menus.to}
                                </span>{' '}
                                dari{' '}
                                <span className="font-semibold text-foreground">
                                    {menus.total}
                                </span>{' '}
                                menu
                            </>
                        )}
                    </p>

                    {filters.search !== '' ||
                    filters.city !== '' ||
                    filters.category !== '' ? (
                        <Link
                            href={home()}
                            className="text-sm font-medium text-brand hover:underline"
                        >
                            Reset filter
                        </Link>
                    ) : null}
                </div>

                {menus.data.length === 0 ? (
                    <EmptyState
                        search={filters.search}
                        city={filters.city}
                        onReset={home.url()}
                    />
                ) : (
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {menus.data.map((menu) => (
                            <MenuTile key={menu.id} menu={menu} />
                        ))}
                    </div>
                )}

                {menus.last_page > 1 ? <Pagination menus={menus} /> : null}
            </div>
        </>
    );
}

function MenuTile({ menu }: { menu: MenuCard }) {
    return (
        <article className="group flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md">
            <div className="relative aspect-4/3 overflow-hidden bg-brand-soft">
                {menu.photo_url ? (
                    <img
                        src={menu.photo_url}
                        alt={menu.name}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex size-full flex-col items-center justify-center gap-2 bg-linear-to-br from-brand-soft to-brand-border/60 text-brand/50">
                        <UtensilsCrossed className="size-9" />
                        <span className="text-[11px] font-medium">
                            Foto belum tersedia
                        </span>
                    </div>
                )}

                {menu.category ? (
                    <Badge className="absolute top-2.5 left-2.5 border-transparent bg-white/95 text-brand-dark shadow-sm backdrop-blur">
                        {menu.category.name}
                    </Badge>
                ) : null}
            </div>

            <div className="flex flex-1 flex-col gap-2 p-4">
                <h2 className="line-clamp-2 text-sm leading-snug font-semibold text-foreground group-hover:text-brand">
                    {menu.name}
                </h2>

                <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {menu.description}
                </p>

                <p className="mt-1 text-[11px] text-muted-foreground">
                    Mulai dari
                </p>
                <p className="text-lg font-extrabold text-sale-dark">
                    {rupiah.format(menu.price)}
                    <span className="ml-1 text-xs font-medium text-muted-foreground">
                        /porsi
                    </span>
                </p>

                <div className="mt-auto space-y-1.5 border-t border-border/60 pt-3">
                    <Link
                        href={cateringShow(menu.merchant.slug)}
                        prefetch
                        className="flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-brand"
                    >
                        <BadgeCheck className="size-3.5 shrink-0 text-success" />
                        <span className="line-clamp-1">
                            {menu.merchant.name}
                        </span>
                    </Link>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                        {menu.merchant.city ? (
                            <span className="flex items-center gap-1">
                                <MapPin className="size-3" />
                                {menu.merchant.city}
                            </span>
                        ) : null}
                        <span className="flex items-center gap-1">
                            <Package className="size-3" />
                            Min. {menu.min_order} porsi
                        </span>
                    </div>

                    <Button
                        asChild
                        size="sm"
                        className="mt-1 w-full bg-brand hover:bg-brand-dark"
                    >
                        <Link href={checkoutCreate(menu.id)}>
                            Pesan sekarang
                            <ArrowRight className="size-3.5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </article>
    );
}

function Pagination({ menus }: { menus: Paginator<MenuCard> }) {
    return (
        <nav
            aria-label="Navigasi halaman"
            className="mt-10 flex flex-wrap items-center justify-center gap-1.5"
        >
            <PaginationArrow
                href={menus.links[0]?.url ?? null}
                label="Sebelumnya"
                direction="prev"
            />

            {menus.links.slice(1, -1).map((link, index) =>
                link.url === null ? (
                    <span
                        key={`${link.label}-${index}`}
                        className="px-2 text-sm text-muted-foreground"
                    >
                        &hellip;
                    </span>
                ) : (
                    <Link
                        key={`${link.label}-${index}`}
                        href={link.url}
                        preserveScroll
                        className={
                            link.active
                                ? 'inline-flex size-9 items-center justify-center rounded-md bg-brand text-sm font-semibold text-white'
                                : 'inline-flex size-9 items-center justify-center rounded-md border border-border text-sm font-medium transition-colors hover:bg-accent'
                        }
                        aria-current={link.active ? 'page' : undefined}
                    >
                        {link.label}
                    </Link>
                ),
            )}

            <PaginationArrow
                href={menus.links[menus.links.length - 1]?.url ?? null}
                label="Berikutnya"
                direction="next"
            />
        </nav>
    );
}

function PaginationArrow({
    href,
    label,
    direction,
}: {
    href: string | null;
    label: string;
    direction: 'prev' | 'next';
}) {
    const icon =
        direction === 'prev' ? (
            <ChevronLeft className="size-4" />
        ) : (
            <ChevronRight className="size-4" />
        );

    const content = (
        <>
            {direction === 'prev' ? icon : null}
            <span className="hidden sm:inline">{label}</span>
            {direction === 'next' ? icon : null}
        </>
    );

    const className =
        'inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-sm font-medium transition-colors';

    if (href === null) {
        return (
            <span className={`${className} cursor-not-allowed opacity-40`}>
                {content}
            </span>
        );
    }

    return (
        <Link
            href={href}
            preserveScroll
            className={`${className} hover:bg-accent`}
        >
            {content}
        </Link>
    );
}

function EmptyState({
    search,
    city,
    onReset,
}: {
    search: string;
    city: string;
    onReset: string;
}) {
    const detail = [search !== '' ? `“${search}”` : null, city || null]
        .filter(Boolean)
        .join(' di ');

    return (
        <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-brand-soft/30 px-6 py-16 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand">
                <SearchX className="size-7" />
            </span>
            <h2 className="mt-4 text-base font-semibold">
                Menu tidak ditemukan
            </h2>
            <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
                {detail === ''
                    ? 'Belum ada menu yang tersedia saat ini. Coba lagi nanti.'
                    : `Tidak ada menu yang cocok untuk ${detail}. Coba kata kunci atau lokasi lain.`}
            </p>
            <Button asChild className="mt-5 bg-brand hover:bg-brand-dark">
                <Link href={onReset}>
                    Lihat semua katering
                    <ArrowRight className="size-4" />
                </Link>
            </Button>
        </div>
    );
}
