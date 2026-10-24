import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, ImagePlus } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index as menuIndex, update } from '@/routes/merchant/menus';

type Category = {
    id: number;
    name: string;
    slug: string;
};

type MenuDetail = {
    id: number;
    name: string;
    description: string;
    price: number;
    min_order: number;
    category_id: number | null;
    is_available: boolean;
    photo_url: string | null;
};

type Props = {
    menu: MenuDetail;
    categories: Category[];
};

export default function MenuEdit({ menu, categories }: Props) {
    const [preview, setPreview] = useState<string | null>(menu.photo_url);

    return (
        <>
            <Head title={`Ubah ${menu.name}`} />

            <Link
                href={menuIndex()}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="size-4" />
                Kembali ke daftar menu
            </Link>

            <h2 className="mt-4 text-base font-semibold">Ubah menu</h2>
            <p className="mt-1 text-sm text-muted-foreground">
                Kosongkan pilihan foto bila tidak ingin mengganti gambar.
            </p>

            <Form
                {...update.form(menu.id)}
                options={{ preserveScroll: true, forceFormData: true }}
                className="mt-6 max-w-2xl space-y-5 rounded-xl border border-border/70 bg-card p-5 shadow-xs sm:p-6"
            >
                {({ processing, errors, progress }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama menu</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={menu.name}
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="category_id">Kategori</Label>
                            <select
                                id="category_id"
                                name="category_id"
                                required
                                defaultValue={menu.category_id ?? ''}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                                <option value="" disabled>
                                    Pilih kategori
                                </option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.category_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <textarea
                                id="description"
                                name="description"
                                required
                                rows={4}
                                defaultValue={menu.description}
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            />
                            <InputError message={errors.description} />
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="price">
                                    Harga per porsi (Rp)
                                </Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    min={1000}
                                    step={500}
                                    defaultValue={menu.price}
                                    required
                                />
                                <InputError message={errors.price} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="min_order">
                                    Minimal pesanan (porsi)
                                </Label>
                                <Input
                                    id="min_order"
                                    name="min_order"
                                    type="number"
                                    min={1}
                                    defaultValue={menu.min_order}
                                    required
                                />
                                <InputError message={errors.min_order} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="photo">Ganti foto menu</Label>
                            <div className="flex items-center gap-3">
                                <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/40">
                                    {preview ? (
                                        <img
                                            src={preview}
                                            alt="Pratinjau foto menu"
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <ImagePlus className="size-6 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="grid gap-1.5">
                                    <Input
                                        id="photo"
                                        name="photo"
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        className="h-auto cursor-pointer py-1.5 text-xs file:mr-2 file:text-xs"
                                        onChange={(event) => {
                                            const file =
                                                event.target.files?.[0];
                                            setPreview(
                                                file
                                                    ? URL.createObjectURL(file)
                                                    : menu.photo_url,
                                            );
                                        }}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Biarkan kosong untuk mempertahankan foto
                                        saat ini.
                                    </p>
                                </div>
                            </div>
                            <InputError message={errors.photo} />
                        </div>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                name="is_available"
                                value="1"
                                defaultChecked={menu.is_available}
                                className="size-4 rounded border-input"
                            />
                            Tampilkan menu sebagai tersedia
                        </label>

                        {progress && (
                            <p className="text-xs text-muted-foreground">
                                Mengunggah… {progress.percentage}%
                            </p>
                        )}

                        <div className="flex items-center gap-2 pt-1">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-brand hover:bg-brand-dark"
                            >
                                {processing ? 'Menyimpan…' : 'Simpan perubahan'}
                            </Button>
                            <Button asChild variant="ghost" type="button">
                                <Link href={menuIndex()}>Batal</Link>
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}
