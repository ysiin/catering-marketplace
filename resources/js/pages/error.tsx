import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { home } from '@/routes';

const statusMeta: Record<number, { title: string; description: string }> = {
    403: {
        title: 'Akses ditolak',
        description:
            'Anda tidak memiliki izin untuk membuka halaman ini. Pastikan Anda masuk dengan akun yang tepat.',
    },
    404: {
        title: 'Halaman tidak ditemukan',
        description: 'Halaman yang Anda cari tidak ada atau sudah dipindahkan.',
    },
    500: {
        title: 'Terjadi kesalahan',
        description:
            'Ada masalah di sisi server kami. Silakan coba beberapa saat lagi.',
    },
    503: {
        title: 'Sedang pemeliharaan',
        description:
            'Kami sedang melakukan pemeliharaan. Silakan kembali lagi nanti.',
    },
};

export default function ErrorPage({ status }: { status: number }) {
    const meta = statusMeta[status] ?? {
        title: 'Terjadi kesalahan',
        description: 'Permintaan Anda tidak dapat diproses saat ini.',
    };

    return (
        <>
            <Head title={meta.title} />

            <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-4 text-center">
                <p className="text-6xl font-semibold tracking-tight text-muted-foreground sm:text-7xl">
                    {status}
                </p>

                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {meta.title}
                    </h1>
                    <p className="max-w-md text-sm text-pretty text-muted-foreground">
                        {meta.description}
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <Button asChild>
                        <Link href={home()}>
                            <Home className="size-4" />
                            Ke halaman utama
                        </Link>
                    </Button>
                    <Button variant="outline" onClick={() => history.back()}>
                        <ArrowLeft className="size-4" />
                        Kembali
                    </Button>
                </div>
            </div>
        </>
    );
}
