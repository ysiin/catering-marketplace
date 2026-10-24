import { Form, Head, Link } from '@inertiajs/react';
import { ImagePlus } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { update } from '@/actions/App/Http/Controllers/Merchant/ProfileController';
import { edit } from '@/routes/merchant/profile';

type MerchantProfile = {
    name: string;
    description: string | null;
    city: string | null;
    address: string | null;
    phone: string | null;
    email_contact: string | null;
    bank_name: string | null;
    bank_account_number: string | null;
    bank_account_name: string | null;
    logo_url: string | null;
    qris_url: string | null;
    is_active: boolean;
};

type Props = {
    merchant: MerchantProfile;
};

const banks = ['BCA', 'Mandiri', 'BNI', 'BRI', 'BSI', 'CIMB Niaga', 'Permata'];

export default function MerchantProfile({ merchant }: Props) {
    const [logoPreview, setLogoPreview] = useState<string | null>(
        merchant.logo_url,
    );
    const [qrisPreview, setQrisPreview] = useState<string | null>(
        merchant.qris_url,
    );

    return (
        <>
            <Head title="Profil Katering" />

            <Form
                {...update.form()}
                options={{ preserveScroll: true, forceFormData: true }}
                className="space-y-10"
            >
                {({ processing, errors, progress }) => (
                    <>
                        <section className="rounded-xl border border-border/70 bg-card p-5 shadow-xs sm:p-6">
                            <h2 className="text-base font-semibold">
                                Informasi Katering
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Data ini tampil di halaman katalog dan invoice.
                            </p>

                            <div className="mt-5 grid gap-5 md:grid-cols-2">
                                <div className="grid gap-2 md:col-span-2">
                                    <Label htmlFor="name">Nama katering</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={merchant.name}
                                        required
                                        placeholder="Contoh: Katering Sari Rasa"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="city">Kota</Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        defaultValue={merchant.city ?? ''}
                                        required
                                        placeholder="Contoh: Jakarta Selatan"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Kota dipakai kantor untuk memfilter
                                        katering.
                                    </p>
                                    <InputError message={errors.city} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Nomor telepon</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        defaultValue={merchant.phone ?? ''}
                                        required
                                        inputMode="tel"
                                        placeholder="0812xxxxxxx"
                                    />
                                    <InputError message={errors.phone} />
                                </div>

                                <div className="grid gap-2 md:col-span-2">
                                    <Label htmlFor="address">Alamat</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        defaultValue={merchant.address ?? ''}
                                        required
                                        placeholder="Jl. Melati No. 10, Kel. ..."
                                    />
                                    <InputError message={errors.address} />
                                </div>

                                <div className="grid gap-2 md:col-span-2">
                                    <Label htmlFor="email_contact">
                                        Email kontak (opsional)
                                    </Label>
                                    <Input
                                        id="email_contact"
                                        name="email_contact"
                                        type="email"
                                        defaultValue={
                                            merchant.email_contact ?? ''
                                        }
                                        placeholder="kontak@katering.com"
                                    />
                                    <InputError
                                        message={errors.email_contact}
                                    />
                                </div>

                                <div className="grid gap-2 md:col-span-2">
                                    <Label htmlFor="description">
                                        Deskripsi (opsional)
                                    </Label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        defaultValue={
                                            merchant.description ?? ''
                                        }
                                        rows={4}
                                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                        placeholder="Ceritakan keunggulan katering Anda."
                                    />
                                    <InputError message={errors.description} />
                                </div>
                            </div>

                            <div className="mt-6 grid gap-5 md:grid-cols-2">
                                <ImageField
                                    id="logo"
                                    label="Logo katering"
                                    preview={logoPreview}
                                    onPreview={setLogoPreview}
                                    error={errors.logo}
                                />
                                <ImageField
                                    id="qris_image"
                                    label="Gambar QRIS statis (opsional)"
                                    preview={qrisPreview}
                                    onPreview={setQrisPreview}
                                    error={errors.qris_image}
                                />
                            </div>

                            {progress && (
                                <p className="mt-4 text-xs text-muted-foreground">
                                    Mengunggah… {progress.percentage}%
                                </p>
                            )}
                        </section>

                        <section className="rounded-xl border border-border/70 bg-card p-5 shadow-xs sm:p-6">
                            <h2 className="text-base font-semibold">
                                Rekening Pembayaran
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Kantor akan melihat data ini pada invoice untuk
                                transfer manual.
                            </p>

                            <div className="mt-5 grid gap-5 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="bank_name">Nama bank</Label>
                                    <select
                                        id="bank_name"
                                        name="bank_name"
                                        defaultValue={merchant.bank_name ?? ''}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                    >
                                        <option value="">Pilih bank</option>
                                        {banks.map((bank) => (
                                            <option key={bank} value={bank}>
                                                {bank}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.bank_name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="bank_account_number">
                                        Nomor rekening
                                    </Label>
                                    <Input
                                        id="bank_account_number"
                                        name="bank_account_number"
                                        defaultValue={
                                            merchant.bank_account_number ?? ''
                                        }
                                        inputMode="numeric"
                                        placeholder="1234567890"
                                    />
                                    <InputError
                                        message={errors.bank_account_number}
                                    />
                                </div>

                                <div className="grid gap-2 md:col-span-2">
                                    <Label htmlFor="bank_account_name">
                                        Nama pemilik rekening
                                    </Label>
                                    <Input
                                        id="bank_account_name"
                                        name="bank_account_name"
                                        defaultValue={
                                            merchant.bank_account_name ?? ''
                                        }
                                        placeholder="Sesuai buku tabungan"
                                    />
                                    <InputError
                                        message={errors.bank_account_name}
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-xs text-muted-foreground">
                                Status katering:{' '}
                                <span className="font-semibold text-foreground">
                                    {merchant.is_active ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </p>

                            <div className="flex items-center gap-2">
                                <Button asChild variant="outline" type="button">
                                    <Link href={edit()}>Muat ulang</Link>
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-brand hover:bg-brand-dark"
                                >
                                    {processing
                                        ? 'Menyimpan…'
                                        : 'Simpan profil'}
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

function ImageField({
    id,
    label,
    preview,
    onPreview,
    error,
}: {
    id: string;
    label: string;
    preview: string | null;
    onPreview: (value: string | null) => void;
    error?: string;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>

            <div className="flex items-center gap-3">
                <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/40">
                    {preview ? (
                        <img
                            src={preview}
                            alt={label}
                            className="size-full object-cover"
                        />
                    ) : (
                        <ImagePlus className="size-6 text-muted-foreground" />
                    )}
                </div>

                <div className="grid gap-1.5">
                    <Input
                        id={id}
                        name={id}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="h-auto cursor-pointer py-1.5 text-xs file:mr-2 file:text-xs"
                        onChange={(event) => {
                            const file = event.target.files?.[0];

                            onPreview(file ? URL.createObjectURL(file) : null);
                        }}
                    />
                    <p className="text-xs text-muted-foreground">
                        JPG, PNG, atau WEBP. Maks 2MB.
                    </p>
                </div>
            </div>

            <InputError message={error} />
        </div>
    );
}
