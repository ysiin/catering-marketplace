import { Link, router, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    LayoutGrid,
    LogOut,
    MapPin,
    Menu,
    Search,
    Store,
    UserRound,
    UtensilsCrossed,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { dashboard, home, login, logout, register } from '@/routes';
import type { Auth } from '@/types';

type CategoryOption = {
    name: string;
    slug: string;
};

type CatalogFilters = {
    search?: string;
    city?: string;
    category?: string;
};

type MarketplacePageProps = {
    auth?: Auth;
    categories?: CategoryOption[];
    cities?: string[];
    filters?: CatalogFilters;
};

const footerGroups = [
    {
        title: 'Sekotak',
        links: [
            { label: 'Tentang Kami', href: '/#tentang' },
            { label: 'Cara Kerja', href: '/#cara-kerja' },
            { label: 'Karier', href: '/#karier' },
        ],
    },
    {
        title: 'Untuk Kantor',
        links: [
            { label: 'Cara Pesan', href: '/#cara-pesan' },
            { label: 'Metode Pembayaran', href: '/#pembayaran' },
            { label: 'Pertanyaan Umum', href: '/#faq' },
        ],
    },
    {
        title: 'Untuk Katering',
        links: [
            { label: 'Jualan di Sekotak', href: '/#jualan' },
            { label: 'Panduan Merchant', href: '/#merchant' },
            { label: 'Ketentuan Layanan', href: '/#ketentuan' },
        ],
    },
    {
        title: 'Bantuan',
        links: [
            { label: 'Hubungi Kami', href: '/#kontak' },
            { label: 'WhatsApp', href: '/#whatsapp' },
            { label: 'Kebijakan Privasi', href: '/#privasi' },
        ],
    },
];

export default function MarketplaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const page = usePage<MarketplacePageProps>();
    const { auth, categories = [], filters } = page.props;

    const [term, setTerm] = useState(filters?.search ?? '');
    const [mobileOpen, setMobileOpen] = useState(false);

    const submitSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get(
            home.url({
                query: {
                    search: term.trim() === '' ? undefined : term.trim(),
                    city: filters?.city || undefined,
                    category: filters?.category || undefined,
                },
            }),
            {},
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <div className="flex min-h-svh flex-col bg-background">
            <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 print:hidden">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3 lg:gap-6">
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="lg:hidden"
                                    aria-label="Buka menu"
                                >
                                    <Menu />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="flex w-[300px] flex-col gap-0 p-0"
                            >
                                <SheetHeader className="border-b px-5 py-4">
                                    <SheetTitle className="flex items-center gap-2 text-base">
                                        <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-white">
                                            <UtensilsCrossed className="size-4" />
                                        </span>
                                        Sekotak
                                    </SheetTitle>
                                </SheetHeader>
                                <nav className="flex-1 overflow-y-auto px-3 py-4">
                                    <p className="px-2 pb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Kategori
                                    </p>
                                    <Link
                                        href={home()}
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium hover:bg-accent"
                                    >
                                        <LayoutGrid className="size-4 text-brand" />
                                        Semua Katering
                                    </Link>
                                    {categories.map((category) => (
                                        <Link
                                            key={category.slug}
                                            href={home.url({
                                                query: {
                                                    category: category.slug,
                                                },
                                            })}
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
                                        >
                                            <UtensilsCrossed className="size-4 text-muted-foreground" />
                                            {category.name}
                                        </Link>
                                    ))}

                                    <div className="my-4 h-px bg-border" />

                                    {auth?.user ? (
                                        <>
                                            <Link
                                                href={dashboard()}
                                                onClick={() =>
                                                    setMobileOpen(false)
                                                }
                                                className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
                                            >
                                                <LayoutGrid className="size-4 text-muted-foreground" />
                                                Dasbor
                                            </Link>
                                            <Link
                                                href={logout()}
                                                as="button"
                                                onClick={() =>
                                                    setMobileOpen(false)
                                                }
                                                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-accent"
                                            >
                                                <LogOut className="size-4 text-muted-foreground" />
                                                Keluar
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                href={login()}
                                                onClick={() =>
                                                    setMobileOpen(false)
                                                }
                                                className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
                                            >
                                                <UserRound className="size-4 text-muted-foreground" />
                                                Masuk
                                            </Link>
                                            <Link
                                                href={register()}
                                                onClick={() =>
                                                    setMobileOpen(false)
                                                }
                                                className="mt-1 flex items-center justify-center rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white"
                                            >
                                                Daftar
                                            </Link>
                                        </>
                                    )}
                                </nav>
                            </SheetContent>
                        </Sheet>

                        <Link
                            href={home()}
                            className="flex shrink-0 items-center gap-2.5"
                        >
                            <span className="flex size-10 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
                                <UtensilsCrossed className="size-5" />
                            </span>
                            <span className="flex flex-col leading-none">
                                <span className="text-xl font-extrabold tracking-tight text-brand-dark">
                                    Sekotak
                                </span>
                                <span className="mt-0.5 hidden text-[11px] font-medium text-muted-foreground sm:block">
                                    makan siang kantor, beres.
                                </span>
                            </span>
                        </Link>

                        <form
                            onSubmit={submitSearch}
                            className="ml-auto hidden max-w-2xl flex-1 items-center md:flex"
                            role="search"
                        >
                            <div className="flex h-11 w-full items-center overflow-hidden rounded-lg border-2 border-brand/25 bg-background transition-colors focus-within:border-brand">
                                <span className="pl-3 text-muted-foreground">
                                    <Search className="size-4" />
                                </span>
                                <input
                                    name="search"
                                    value={term}
                                    onChange={(event) =>
                                        setTerm(event.target.value)
                                    }
                                    placeholder="Cari katering, menu, atau kota..."
                                    className="h-full flex-1 bg-transparent px-2.5 text-sm outline-none placeholder:text-muted-foreground"
                                    aria-label="Cari katering"
                                />
                                <button
                                    type="submit"
                                    className="h-full shrink-0 bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                                >
                                    Cari
                                </button>
                            </div>
                        </form>

                        <div className="ml-auto flex items-center gap-2 md:ml-0">
                            <Button
                                asChild
                                className="hidden bg-sale font-semibold text-white shadow-sm hover:bg-sale-dark sm:inline-flex"
                            >
                                <Link href={register()}>
                                    <Store className="size-4" />
                                    Jualan di Sekotak
                                </Link>
                            </Button>

                            {auth?.user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="hidden md:inline-flex"
                                        >
                                            <UserRound className="size-4" />
                                            <span className="max-w-[9rem] truncate">
                                                {auth.user.name}
                                            </span>
                                            <ChevronDown className="size-4 opacity-60" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-56"
                                    >
                                        <DropdownMenuLabel>
                                            <div className="flex flex-col">
                                                <span className="truncate text-sm font-medium">
                                                    {auth.user.name}
                                                </span>
                                                <span className="truncate text-xs font-normal text-muted-foreground">
                                                    {auth.user.email}
                                                </span>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href={dashboard()}>
                                                <LayoutGrid className="mr-2 size-4" />
                                                Dasbor
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href={logout()} as="button">
                                                <LogOut className="mr-2 size-4" />
                                                Keluar
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <div className="hidden items-center gap-1 md:flex">
                                    <Button asChild variant="ghost">
                                        <Link href={login()}>Masuk</Link>
                                    </Button>
                                    <Button asChild variant="outline">
                                        <Link href={register()}>Daftar</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <form
                        onSubmit={submitSearch}
                        className="flex items-center md:hidden"
                        role="search"
                    >
                        <div className="flex h-11 w-full items-center overflow-hidden rounded-lg border-2 border-brand/25 bg-background focus-within:border-brand">
                            <span className="pl-3 text-muted-foreground">
                                <Search className="size-4" />
                            </span>
                            <input
                                value={term}
                                onChange={(event) =>
                                    setTerm(event.target.value)
                                }
                                placeholder="Cari katering atau menu..."
                                className="h-full flex-1 bg-transparent px-2.5 text-sm outline-none placeholder:text-muted-foreground"
                                aria-label="Cari katering"
                            />
                            <button
                                type="submit"
                                className="h-full shrink-0 bg-brand px-4 text-sm font-semibold text-white"
                            >
                                Cari
                            </button>
                        </div>
                    </form>
                </div>

                <div className="hidden border-t border-border/60 bg-brand-soft/40 lg:block print:hidden">
                    <div className="mx-auto flex h-11 w-full max-w-7xl items-center gap-1 px-4 sm:px-6 lg:px-8">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="flex items-center gap-2 rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white"
                                >
                                    <LayoutGrid className="size-4" />
                                    Kategori
                                    <ChevronDown className="size-3.5 opacity-80" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="start"
                                className="grid w-[420px] grid-cols-2 gap-1 p-2"
                            >
                                {categories.length === 0 ? (
                                    <p className="col-span-2 px-2 py-3 text-sm text-muted-foreground">
                                        Belum ada kategori.
                                    </p>
                                ) : (
                                    categories.map((category) => (
                                        <DropdownMenuItem
                                            key={category.slug}
                                            asChild
                                        >
                                            <Link
                                                href={home.url({
                                                    query: {
                                                        category: category.slug,
                                                    },
                                                })}
                                                className="flex w-full items-center gap-2"
                                            >
                                                <UtensilsCrossed className="size-4 text-brand" />
                                                <span className="text-sm">
                                                    {category.name}
                                                </span>
                                            </Link>
                                        </DropdownMenuItem>
                                    ))
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <nav className="ml-2 scrollbar-none flex items-center gap-1 overflow-x-auto">
                            <Link
                                href={home()}
                                className="rounded-md px-2.5 py-1.5 text-sm font-medium text-brand-dark transition-colors hover:bg-white"
                            >
                                Semua Katering
                            </Link>
                            {categories.slice(0, 6).map((category) => (
                                <Link
                                    key={category.slug}
                                    href={home.url({
                                        query: { category: category.slug },
                                    })}
                                    className={
                                        filters?.category === category.slug
                                            ? 'rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-brand'
                                            : 'rounded-md px-2.5 py-1.5 text-sm font-medium text-brand-dark/80 transition-colors hover:bg-white'
                                    }
                                >
                                    {category.name}
                                </Link>
                            ))}
                        </nav>

                        <div className="ml-auto flex items-center gap-1.5 text-sm text-brand-dark/80">
                            <MapPin className="size-4 text-sale" />
                            <span className="font-medium">
                                {filters?.city ? filters.city : 'Semua Lokasi'}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1">{children}</main>

            <footer className="mt-16 border-t border-border/70 bg-brand-soft/50 print:hidden">
                <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
                        <div className="lg:col-span-1">
                            <Link
                                href={home()}
                                className="flex items-center gap-2.5"
                            >
                                <span className="flex size-10 items-center justify-center rounded-xl bg-brand text-white">
                                    <UtensilsCrossed className="size-5" />
                                </span>
                                <span className="text-xl font-extrabold tracking-tight text-brand-dark">
                                    Sekotak
                                </span>
                            </Link>
                            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                                Marketplace katering untuk kebutuhan makan siang
                                kantor. Pesan dari katering terverifikasi di
                                kotamu, antar sesuai jadwal.
                            </p>
                            <Badge className="mt-4 border-transparent bg-success-soft text-success">
                                Katering terverifikasi
                            </Badge>
                        </div>

                        {footerGroups.map((group) => (
                            <div key={group.title}>
                                <h3 className="text-sm font-semibold text-brand-dark">
                                    {group.title}
                                </h3>
                                <ul className="mt-3 space-y-2">
                                    {group.links.map((link) => (
                                        <li key={link.label}>
                                            <a
                                                href={link.href}
                                                className="text-sm text-muted-foreground transition-colors hover:text-brand"
                                            >
                                                {link.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 flex flex-col gap-2 border-t border-border/70 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                        <p>
                            &copy; {new Date().getFullYear()} Sekotak.
                            Menghubungkan kantor dengan katering terpercaya.
                        </p>
                        <p>Makan siang kantor, beres.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
