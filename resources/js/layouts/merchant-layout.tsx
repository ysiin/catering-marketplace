import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editProfile } from '@/routes/merchant/profile';
import { index as menuIndex } from '@/routes/merchant/menus';
import { index as orderIndex } from '@/routes/merchant/orders';
import type { NavItem } from '@/types';

const navItems: NavItem[] = [
    {
        title: 'Profil Katering',
        href: editProfile(),
        icon: null,
    },
    {
        title: 'Menu Saya',
        href: menuIndex(),
        icon: null,
    },
    {
        title: 'Pesanan Masuk',
        href: orderIndex(),
        icon: null,
    },
];

export default function MerchantLayout({ children }: PropsWithChildren) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <header className="flex flex-col gap-1">
                <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-brand uppercase">
                    <UtensilsCrossed className="size-3.5" />
                    Area Katering
                </p>
                <h1 className="text-xl font-semibold tracking-tight">
                    Kelola Katering Anda
                </h1>
                <p className="text-sm text-muted-foreground">
                    Lengkapi profil dan menu agar kantor dapat menemukan serta
                    memesan katering Anda.
                </p>
            </header>

            <nav
                aria-label="Navigasi katering"
                className="mt-5 flex gap-1 border-b border-border/70"
            >
                {navItems.map((item) => {
                    const active = isCurrentUrl(item.href);

                    return (
                        <Link
                            key={`${toUrl(item.href)}`}
                            href={item.href}
                            prefetch
                            className={cn(
                                '-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                                active
                                    ? 'border-brand text-brand'
                                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
                            )}
                            aria-current={active ? 'page' : undefined}
                        >
                            {item.title}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-8">{children}</div>
        </div>
    );
}
