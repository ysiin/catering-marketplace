import { Head, Link, router } from '@inertiajs/react';
import {
    EyeOff,
    ImagePlus,
    Pencil,
    Plus,
    Trash2,
    UtensilsCrossed,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    availability,
    create,
    destroy,
    edit as editMenu,
    index as menuIndex,
} from '@/routes/merchant/menus';

type Category = {
    id: number;
    name: string;
    slug: string;
};

type MenuRow = {
    id: number;
    name: string;
    description: string;
    price: number;
    min_order: number;
    is_available: boolean;
    photo_url: string | null;
    category: Category | null;
};

type Props = {
    menus: MenuRow[];
    profileMissing: boolean;
};

const rupiah = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

export default function MenuIndex({ menus, profileMissing }: Props) {
    const toggle = (menu: MenuRow) => {
        router.patch(availability.url(menu.id), {}, { preserveScroll: true });
    };

    const remove = (menu: MenuRow) => {
        if (!confirm(`Hapus menu "${menu.name}"? Tindakan ini permanen.`)) {
            return;
        }

        router.delete(destroy.url(menu.id), { preserveScroll: true });
    };

    return (
        <>
            <Head title="Menu Saya" />

            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-base font-semibold">
                        Menu yang Anda jual
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Setiap menu wajib memiliki deskripsi, foto, dan harga
                        per porsi.
                    </p>
                </div>

                <Button asChild className="bg-brand hover:bg-brand-dark">
                    <Link href={create()}>
                        <Plus className="size-4" />
                        Tambah menu
                    </Link>
                </Button>
            </div>

            {profileMissing ? (
                <div className="mt-5 flex flex-wrap items-center gap-2 rounded-lg border border-sale/40 bg-sale-soft px-4 py-3 text-sm text-sale-dark">
                    <span className="font-semibold">
                        Profil katering belum lengkap.
                    </span>
                    <span>Menu belum tampil di katalog sampai data diisi.</span>
                    <Link
                        href="/merchant/profile"
                        className="font-semibold underline underline-offset-2"
                    >
                        Lengkapi profil
                    </Link>
                </div>
            ) : null}

            {menus.length === 0 ? (
                <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-brand-soft/30 px-6 py-16 text-center">
                    <span className="flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand">
                        <UtensilsCrossed className="size-7" />
                    </span>
                    <h3 className="mt-4 text-base font-semibold">
                        Belum ada menu
                    </h3>
                    <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                        Tambahkan menu pertama Anda agar kantor dapat mulai
                        memesan.
                    </p>
                    <Button
                        asChild
                        className="mt-5 bg-brand hover:bg-brand-dark"
                    >
                        <Link href={create()}>
                            <Plus className="size-4" />
                            Tambah menu
                        </Link>
                    </Button>
                </div>
            ) : (
                <ul className="mt-6 space-y-3">
                    {menus.map((menu) => (
                        <li
                            key={menu.id}
                            className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card p-3 shadow-xs sm:flex-row sm:items-center sm:p-4"
                        >
                            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-soft">
                                {menu.photo_url ? (
                                    <img
                                        src={menu.photo_url}
                                        alt={menu.name}
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <ImagePlus className="size-6 text-brand/50" />
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="truncate text-sm font-semibold">
                                        {menu.name}
                                    </h3>
                                    {menu.is_available ? (
                                        <Badge className="border-transparent bg-success-soft text-success">
                                            Tersedia
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="outline"
                                            className="text-muted-foreground"
                                        >
                                            Habis
                                        </Badge>
                                    )}
                                </div>

                                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                    {menu.description}
                                </p>

                                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                                    <span className="font-semibold text-sale-dark">
                                        {rupiah.format(menu.price)} /porsi
                                    </span>
                                    <span className="text-muted-foreground">
                                        Min. {menu.min_order} porsi
                                    </span>
                                    {menu.category ? (
                                        <span className="text-muted-foreground">
                                            {menu.category.name}
                                        </span>
                                    ) : null}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 sm:shrink-0">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => toggle(menu)}
                                >
                                    <EyeOff className="size-3.5" />
                                    {menu.is_available
                                        ? 'Set habis'
                                        : 'Set tersedia'}
                                </Button>
                                <Button asChild size="sm" variant="outline">
                                    <Link href={editMenu(menu.id)}>
                                        <Pencil className="size-3.5" />
                                        Ubah
                                    </Link>
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => remove(menu)}
                                    aria-label={`Hapus ${menu.name}`}
                                >
                                    <Trash2 className="size-3.5" />
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <p className="mt-6 text-xs text-muted-foreground">
                {menus.length} menu ·{' '}
                <Link href={menuIndex()} className="text-brand hover:underline">
                    Muat ulang daftar
                </Link>
            </p>
        </>
    );
}
