import { Head, Link, usePage } from '@inertiajs/react';
import {
    CalendarCheck,
    Search,
    ShieldCheck,
    Store,
    UtensilsCrossed,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dashboard, login, register } from '@/routes';
import type { Auth } from '@/types';

const features = [
    {
        icon: Search,
        title: 'Temukan katering',
        description:
            'Cari katering berdasarkan kota dan jenis makanan, lalu bandingkan menu serta harganya.',
    },
    {
        icon: CalendarCheck,
        title: 'Pesan sesuai jadwal',
        description:
            'Tentukan tanggal pengiriman dan jumlah porsi. Cocok untuk makan siang harian kantor.',
    },
    {
        icon: ShieldCheck,
        title: 'Invoice transparan',
        description:
            'Setiap pesanan menghasilkan invoice yang bisa diakses kantor maupun katering.',
    },
    {
        icon: Store,
        title: 'Portal untuk katering',
        description:
            'Katering mengelola profil, menu, dan pesanan masuk dalam satu dasbor.',
    },
];

export default function Welcome() {
    const { auth } = usePage<{ auth: Auth }>().props;

    return (
        <>
            <Head title="Marketplace Katering" />

            <section className="relative overflow-hidden border-b border-border/60">
                <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
                    <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                        <UtensilsCrossed className="size-3.5" />
                        Platform katering untuk kantor
                    </span>

                    <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                        Makan siang kantor, dipesan sekali, beres.
                    </h1>

                    <p className="max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
                        Marketplace Katering menghubungkan perusahaan katering
                        dengan kantor yang membutuhkan makan siang karyawan.
                        Cari katering, pesan sesuai jadwal, dan kelola invoice
                        dalam satu tempat.
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        {auth?.user ? (
                            <Button asChild size="lg">
                                <Link href={dashboard()}>Buka dasbor</Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild size="lg">
                                    <Link href={register()}>
                                        Daftar sekarang
                                    </Link>
                                </Button>
                                <Button asChild size="lg" variant="outline">
                                    <Link href={login()}>Masuk</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-6"
                        >
                            <span className="flex size-10 items-center justify-center rounded-lg bg-muted">
                                <feature.icon className="size-5" />
                            </span>
                            <h2 className="font-medium">{feature.title}</h2>
                            <p className="text-sm text-pretty text-muted-foreground">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="border-t border-border/60 bg-muted/40">
                <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
                    <div className="flex flex-col gap-3">
                        <h2 className="text-2xl font-semibold tracking-tight">
                            Untuk kantor
                        </h2>
                        <p className="text-sm text-pretty text-muted-foreground">
                            Daftar sebagai kantor, cari katering sesuai lokasi
                            dan jenis makanan, lalu pesan untuk tanggal yang
                            dibutuhkan. Invoice otomatis tersimpan di riwayat
                            pesanan.
                        </p>
                        <Button asChild variant="outline" className="w-fit">
                            <Link href={register()}>Daftar sebagai kantor</Link>
                        </Button>
                    </div>

                    <div className="flex flex-col gap-3">
                        <h2 className="text-2xl font-semibold tracking-tight">
                            Untuk katering
                        </h2>
                        <p className="text-sm text-pretty text-muted-foreground">
                            Daftar sebagai katering, lengkapi profil perusahaan,
                            unggah menu beserta foto dan harga, lalu terima
                            pesanan dari kantor langsung di dasbor.
                        </p>
                        <Button asChild variant="outline" className="w-fit">
                            <Link href={register()}>
                                Daftar sebagai katering
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}
