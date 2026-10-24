# Struktur Folder & Batasan Proyek — Marketplace Katering

Dokumen ini menjelaskan pemahaman struktur folder Laravel di proyek ini, batasan yang
berlaku, dan best practice penggunaannya. Ditulis agar sesi kerja berikutnya langsung
paham konvensi tanpa eksplorasi ulang.

## 1. Gambaran Umum Stack

| Lapisan      | Teknologi                           | Keterangan                                                                                                                                                                                                                                                                  |
| ------------ | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend      | Laravel 13, PHP ^8.3                | Pola MVC + Inertia, bukan REST API murni                                                                                                                                                                                                                                    |
| Auth         | Laravel Fortify                     | Login, register, reset password, 2FA, passkey                                                                                                                                                                                                                               |
| Frontend     | React 19 + Inertia v3 + TypeScript  | SPA tanpa API terpisah                                                                                                                                                                                                                                                      |
| Styling      | Tailwind CSS v4 + shadcn/ui         | Komponen di `resources/js/components/ui`                                                                                                                                                                                                                                    |
| Route typing | Laravel Wayfinder                   | Fungsi TS auto-generate di `resources/js/actions` & `resources/js/routes`                                                                                                                                                                                                   |
| Test         | Pest 5                              | `php artisan make:test --pest {Nama}`                                                                                                                                                                                                                                       |
| Quality      | Pint + PHPStan (Larastan 3)         | `vendor/bin/pint --dirty --format agent`, `phpstan analyse`                                                                                                                                                                                                                 |
| DB lokal     | SQLite (`database/database.sqlite`) | **Keputusan final.** PHP lokal (Herd Lite 8.5.12) dikompilasi `--disable-all` tanpa ekstensi `pdo_pgsql`, sehingga PostgreSQL tidak bisa dipakai. SQLite adalah default resmi Laravel, nol setup, dan sudah ter-migrate. PostgreSQL tetap jadi target produksi (lihat §11). |

## 2. Peta Folder

```
app/
├── Actions/Fortify/          # Action class Fortify (ex: ResetUserPassword)
├── Concerns/                 # Trait validasi reusable (PasswordValidationRules, ...)
├── Http/
│   ├── Controllers/          # Controller per domain; subfolder = subdomain
│   │   └── Settings/         # Contoh pola: ProfileController, SecurityController
│   ├── Middleware/           # HandleInertiaRequests (share props global), HandleAppearance
│   └── Requests/             # Form Request per fitur; subfolder = subdomain
│       └── Settings/         # Pola: XxxUpdateRequest, XxxDeleteRequest
├── Models/                   # Eloquent model + PHPDoc @property + casts()
├── Providers/                # AppServiceProvider, FortifyServiceProvider
└── Services/                 # (RENCANA) logic bisnis: OrderService, InvoiceService

bootstrap/
├── app.php                   # Registrasi middleware, exception, routing (tanpa Kernel.php)
└── providers.php             # Daftar provider

config/                       # Konfigurasi; baca via env(), jangan hardcode
database/
├── migrations/               # 4 migrasi bawaan (users, cache, jobs, passkeys)
├── factories/                # UserFactory (jadikan contoh untuk factory domain baru)
└── seeders/                  # DatabaseSeeder

routes/
├── web.php                   # Route Inertia + route domain (tambah di sini per subdomain)
├── settings.php              # Pola contoh route grup + middleware + name
└── console.php               # Closure/schedule Artisan

resources/
├── js/
│   ├── pages/                # SATU file = SATU halaman Inertia (dashboard.tsx, auth/*, settings/*)
│   ├── layouts/              # app-layout, auth-layout, settings/layout
│   ├── components/           # Komponen reusable; ui/ = shadcn (jangan edit manual)
│   ├── hooks/                # use-flash-toast, use-appearance, ... (reuse!)
│   ├── actions/ + routes/ + wayfinder/  # AUTO-GENERATE Wayfinder — JANGAN EDIT MANUAL
│   ├── lib/utils.ts          # Helper cn() dkk
│   └── types/                # Tipe TS global (auth.ts, index.ts, ...)
├── css/app.css               # Entry Tailwind
└── views/app.blade.php       # SATU blade root Inertia (bukan template per halaman!)

public/                       # Entry (index.php), favicon; build/ = output Vite (jangan edit)
storage/app/public/           # Upload foto menu/bukti bayar (disk `public`, symlink via storage:link)
tests/
├── Feature/                  # Test HTTP end-to-end (Auth/, Settings/ = contoh pola)
└── Unit/                     # Test unit murni
```

## 3. Best Practice per Folder (hasil baca skills + kode eksisting)

### `app/Http/Controllers/`

- Satu controller per resource/subdomain, method ramping: validasi → delegasi → respon.
- Logic bisnis > 1 langkah (hitung total, snapshot harga, generate nomor) → pindah ke
  `app/Services/` atau action class (lihat `architecture.md`: `CreateOrderAction`).
- Return: `Inertia::render('domain/page', [...])` untuk GET, `RedirectResponse` + flash
  toast untuk mutasi. Contoh pola flash: `Inertia::flash('toast', ['type' => 'success', ...])`
  lalu `to_route('...')` — hook `use-flash-toast.ts` otomatis menampilkannya via sonner.
- Dependency via method injection (`store(StoreOrderRequest $request, OrderService $service)`),
  jangan `app()`/`resolve()`.

### `app/Http/Requests/`

- Selalu pakai Form Request untuk input user (pola `ProfileUpdateRequest`).
- Rules komplek/shared → taruh di trait `app/Concerns/` (contoh `ProfileValidationRules`).
- Return type: `array<string, ValidationRule|array<mixed>|string>`.

### `app/Models/`

- PHPDoc `@property` lengkap + `$casts()` method (bukan property `$casts`).
- Pakai atribut `#[Fillable([...])]`, `#[Hidden([...])]` ala model `User` eksisting.
- Relasi pakai return type (`HasMany`, `BelongsTo`), nama deskriptif (`merchant()`, bukan `m()`).
- Enum PHP untuk status/role (`OrderStatus`, `UserRole`) — key TitleCase.

### `app/Services/` (folder baru yang akan dibuat)

- Diizinkan & dianjurkan skill `architecture.md` ("Extract Focused Business Operations").
- Contoh: `OrderService::createFromCheckout()`, `InvoiceService::generateNo()`.

### `app/Http/Middleware/`

- `HandleInertiaRequests`: tempat share props global (auth user, flash). Tambah prop global di sini.

### `routes/`

- Grup per subdomain + middleware: `Route::middleware(['auth','verified'])->group(...)`.
- Selalu `->name(...)`; generate URL pakai `route()` di PHP dan Wayfinder di TS.
- Setelah tambah route → `php artisan wayfinder:generate` agar fungsi TS ter-refresh.

### `resources/js/pages/`

- Satu route = satu file page. Form pakai `useForm`, navigasi pakai `<Link>` / `router`,
  JANGAN hardcode URL — import dari `@/actions` atau `@/routes` (Wayfinder).
- Daftar baru di katalog pakai deferred props Inertia v3 (`Inertia::defer()`) + skeleton
  `components/ui/skeleton.tsx` sebagai empty state. `Inertia::lazy()` sudah dihapus di v3.
- Error validasi tampil via `input-error.tsx` + `alert-error.tsx`; toast sukses via flash.

### `resources/js/components/`

- Cek komponen existing dulu sebelum bikin baru (ada 20+ termasuk dialog, sheet, select).
- `ui/` = shadcn murni, jangan modifikasi manual.

### `database/`

- Migrasi: FK `constrained()->cascadeOnDelete()` / `nullOnDelete()` sesuai domain,
  index untuk kolom filter (city, status, tanggal), unique untuk nomor order/invoice.
- Factory + seeder WAJIB untuk tiap model baru (aturan `laravel/core`).

### `tests/`

- Pest, gaya `test('...', function () {...})` + `expect()`. Feature test untuk HTTP,
  Unit untuk service murni.
- Baca skill `testing-best-practices` sebelum nulis test. Jalankan test tersempit dulu:
  `php artisan test --compact --filter=...`, lalu suite penuh di akhir milestone.

## 4. Batasan Keras (dari AGENTS.md — wajib dipatuhi)

1. **Jangan buat folder base baru tanpa approval** — `app/Services/` adalah satu-satunya
   pengecualian yang direncanakan (didukung skill architecture) dan akan dimintakan
   persetujuan eksplisit sebelum dibuat.
2. **Jangan ubah dependencies** (composer/npm) tanpa approval — stack saat ini cukup,
   tanpa payment gateway.
3. **Jangan buat file dokumentasi kecuali diminta** — PRD ini dibuat karena diminta user.
4. **Jangan buat verification script/tinker** untuk hal yang bisa dicover test.
5. **Ikuti konvensi sibling files** — sebelum bikin file baru, baca file tetangga.
6. **PHP**: curly braces selalu, constructor promotion, return type + type hint eksplisit,
   Enum key TitleCase, PHPDoc > inline comment.
7. **Pint wajib** tiap ubah PHP: `vendor/bin/pint --dirty --format agent`.
8. **Jangan hapus test tanpa approval.**
9. **Skill yang WAJIB diaktifkan per domain**: `laravel-best-practices` (semua backend),
   `inertia-react-development` (semua halaman React), `tailwindcss-development` (semua UI),
   `fortify-development` (semua auth), `wayfinder-development` (semua koneksi FE→BE),
   `testing-best-practices` (semua test).

## 5. Batasan Teknis Diketahui

- **Database: SQLite (keputusan final).** PHP lokal Herd Lite 8.5.12 di-build dengan
  `--disable-all` dan tidak menyertakan `pdo_pgsql`/`pgsql`, jadi PostgreSQL tidak dapat
  dipakai di mesin ini. SQLite adalah default resmi Laravel dan sudah ter-migrate.
  Konsekuensi: hindari SQL spesifik driver agar migrasi ke PostgreSQL/MySQL di produksi mulus.
  Container `postgres:16` tetap tersedia (user `zachbn`, db `catering`) bila suatu saat
  PHP diganti dengan build yang punya `pdo_pgsql`.
- Folder generated (`actions/`, `routes/`, `wayfinder/` di resources/js) ter-ignore dari git
  (`.gitignore`) — selalu regenerate via `wayfinder:generate` setelah pull/clone.
- `public/build/` dan `storage/framework/views/*` adalah artefak — jangan edit/commit manual.
- Tidak ada `.ai/rules/` di proyek ini → aturan path-scoped tidak berlaku, AGENTS.md + skills
  adalah sumber kebenaran.
