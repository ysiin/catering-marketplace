import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type RoleOption = {
    value: 'customer' | 'merchant';
    label: string;
    description: string;
};

const roles: RoleOption[] = [
    {
        value: 'customer',
        label: 'Kantor',
        description: 'Saya ingin memesan makan siang untuk karyawan kantor.',
    },
    {
        value: 'merchant',
        label: 'Katering',
        description:
            'Saya menyediakan layanan katering dan ingin menerima pesanan.',
    },
];

export default function Register() {
    return (
        <>
            <Head title="Daftar" />

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama</Label>
                            <Input
                                id="name"
                                type="text"
                                name="name"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="name"
                                placeholder="Nama lengkap atau nama perusahaan"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                required
                                tabIndex={2}
                                autoComplete="email"
                                placeholder="email@example.com"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <fieldset className="grid gap-3">
                            <legend className="mb-1 text-sm font-medium">
                                Daftar sebagai
                            </legend>
                            {roles.map((role) => (
                                <label
                                    key={role.value}
                                    htmlFor={`role-${role.value}`}
                                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-input p-3 transition-colors hover:bg-accent/50 has-checked:border-primary has-checked:bg-accent"
                                >
                                    <input
                                        id={`role-${role.value}`}
                                        type="radio"
                                        name="role"
                                        value={role.value}
                                        defaultChecked={
                                            role.value === 'customer'
                                        }
                                        className="mt-1 size-4 accent-primary"
                                    />
                                    <span className="grid gap-0.5">
                                        <span className="text-sm font-medium">
                                            {role.label}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {role.description}
                                        </span>
                                    </span>
                                </label>
                            ))}
                            <InputError message={errors.role} />
                        </fieldset>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Kata sandi</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                tabIndex={3}
                                autoComplete="new-password"
                                placeholder="Kata sandi"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">
                                Konfirmasi kata sandi
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                required
                                tabIndex={4}
                                autoComplete="new-password"
                                placeholder="Ulangi kata sandi"
                            />
                            <InputError
                                message={errors.password_confirmation}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="mt-2 w-full"
                            tabIndex={5}
                            disabled={processing}
                            data-test="register-button"
                        >
                            {processing && <Spinner />}
                            Daftar
                        </Button>
                    </div>
                )}
            </Form>

            <div className="text-center text-sm text-muted-foreground">
                <span>Sudah punya akun? </span>
                <TextLink href={login()}>Masuk</TextLink>
            </div>
        </>
    );
}

Register.layout = {
    title: 'Buat akun',
    description: 'Daftar untuk mulai memesan atau menerima pesanan katering',
};
