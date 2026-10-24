import { Link, usePage } from '@inertiajs/react';
import { UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dashboard, home, login, register } from '@/routes';
import type { Auth } from '@/types';

export default function MarketplaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { auth } = usePage<{ auth: Auth }>().props;

    return (
        <div className="flex min-h-svh flex-col bg-background">
            <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
                    <Link
                        href={home()}
                        className="flex items-center gap-2 font-semibold"
                    >
                        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <UtensilsCrossed className="size-5" />
                        </span>
                        <span className="hidden sm:inline-block">
                            Marketplace Katering
                        </span>
                    </Link>

                    <nav className="ml-auto flex items-center gap-2">
                        {auth?.user ? (
                            <Button asChild size="sm">
                                <Link href={dashboard()}>Dasbor</Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild variant="ghost" size="sm">
                                    <Link href={login()}>Masuk</Link>
                                </Button>
                                <Button asChild size="sm">
                                    <Link href={register()}>Daftar</Link>
                                </Button>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <main className="flex-1">{children}</main>

            <footer className="border-t border-border/60">
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                    <p>
                        &copy; {new Date().getFullYear()} Marketplace Katering.
                        Menghubungkan kantor dengan katering terpercaya.
                    </p>
                    <p>Makan siang kantor, tanpa repot.</p>
                </div>
            </footer>
        </div>
    );
}
