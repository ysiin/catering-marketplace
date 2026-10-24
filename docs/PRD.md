# PRD — Marketplace Katering

> **Status:** Disetujui untuk implementasi (MVP v0.1)
> **Terakhir diperbarui:** 24 Oktober 2026
> **Pemilik produk:** ysiin
> **Pelaksana:** solo engineer end-to-end (OpenCode agent)

---

## 1. Ringkasan Produk

**Marketplace Katering** adalah aplikasi web berbasis **Laravel 13** yang menjadi platform
kerja sama antara **perusahaan katering (Merchant)** dan **kantor (Kantor/Customer)** yang
karyawannya membutuhkan makan siang.

Masalah yang diselesaikan:

- Kantor kesulitan mencari vendor katering yang kredibel, membandingkan menu/harga, dan
  memesan makan siang kantor secara terjadwal.
- Katering kecil-menengah sulit mendapat kanal pemasaran dan kelola pesanan berulang dari
  kantor secara rapi.

Nilai utama: **satu kanal** tempat kantor menemukan, memesan, dan melacak invoice katering,
dan tempat katering mengelola profil, menu, serta pesanan.

### 1.1 Tujuan MVP

| # | Tujuan | Ukuran keberhasilan |
|---|---|---|
| G1 | Kantor bisa menemukan katering lewat pencarian & filter | Ada ≥1 jalur: keyword + filter lokasi + filter jenis makanan, hasil relevan & terpaginasi |
| G2 | Kantor bisa memesan dengan jumlah porsi & tanggal pengiriman | Checkout menyimpan porsi + tanggal, validasi tanggal tidak boleh lampau |
| G3 | Invoice otomatis & bisa diakses kedua pihak | Setiap order menghasilkan nomor invoice; merchant & kantor punya akses terkontrol |
| G4 | Merchant bisa kelola menu lengkap (deskripsi, foto, harga) | CRUD menu dengan foto wajib, tervalidasi server-side |
| G5 | Kedua portal aman | Otorisasi per-resource (Policy), route terproteksi role, tidak ada akses lintas akun |

### 1.2 Non-Tujuan MVP (Backlog v0.2+)

- Panel admin terpisah & verifikasi merchant manual (MVP: merchant langsung aktif)
- Payment gateway online (Midtrans/Xendit) — MVP pakai transfer manual
- Rating & ulasan, chat, notifikasi real-time/email otomatis
- Kurir/driver, langganan recurring, multi-currency, multi-bahasa
- Peta/radius km (MVP: filter berbasis kota & teks)

---

## 2. Aktor & Peran

| Aktor | Deskripsi | Cara masuk |
|---|---|---|
| **Kantor (Customer)** | Perwakilan perusahaan kantor yang memesan makan siang karyawan | Registrasi/Login, role `customer` (default) |
| **Merchant** | Perusahaan katering yang menyediakan menu | Registrasi/Login, role `merchant` |
| **Tamu (Guest)** | Pengunjung belum login | Bisa lihat landing & katalog, tidak bisa checkout |

> **Keputusan:** sesuai arahan user, MVP hanya punya **2 aktor** (Customer + Merchant),
> **tanpa admin**. Merchant mendaftar bebas dan langsung aktif. Mitigasi penyalahgunaan:
> flag `is_active` pada merchant (bisa dimatikan manual) + aksi "Laporkan Merchant"
> (backlog v0.2 bila belum masuk MVP).

---

## 3. Alur Utama (User Journey)

### 3.1 Merchant

```
Register (pilih peran merchant)
  → Lengkapi profil perusahaan (nama, alamat, kontak, deskripsi, kota)
    → Tambah menu (nama, deskripsi, foto, harga/porsi, min. order)
      → Terima order masuk  → Lihat invoice  → Proses & tandai selesai
```

### 3.2 Kantor

```
Register / Login
  → Cari katering (keyword, lokasi, jenis makanan)
    → Lihat etalase merchant + menu
      → Checkout: pilih menu → jumlah porsi → tanggal pengiriman → alamat kantor
        → Invoice dibuat otomatis  → Pantau status di Riwayat Pesanan
```

### 3.3 Lifecycle Order

```
[Kantor checkout]
      │
      ▼
pending_payment ──(upload bukti transfer)──► pending_confirmation
      ▲                                            │
      │                                     [Merchant verifikasi]
      │                                            │
      │                              ┌─────────────┴─────────────┐
      │                              ▼                           ▼
      │                          confirmed                    rejected
      │                              │
      │                     [tanggal kirim tiba]
      │                              ▼
      │                         in_progress
      │                              │
      │                              ▼
      └────────────────────────  completed
              (kantor batal) ──► cancelled
```

**Status:** `pending_payment`, `pending_confirmation`, `confirmed`, `rejected`,
`in_progress`, `completed`, `cancelled`.

**Status pembayaran (terpisah dari status order):** `unpaid`, `waiting_verification`,
`verified`, `rejected`.

---

## 4. Kebutuhan Fungsional

### 4.1 Portal Merchant

| ID | Kebutuhan | Prioritas |
|---|---|---|
| M-01 | Registrasi & login sebagai merchant | Must |
| M-02 | Kelola profil: nama perusahaan, alamat, kontak, deskripsi, kota, logo | Must |
| M-03 | Tambah menu (deskripsi + foto + harga **wajib**) | Must |
| M-04 | Edit & hapus menu | Must |
| M-05 | Atur ketersediaan menu (`is_available`) | Should |
| M-06 | Daftar semua order masuk + akses invoice | Must |
| M-07 | Konfirmasi/tolak order, verifikasi bukti bayar, tandai selesai | Must |
| M-08 | Data rekening/QRIS statis untuk instruksi pembayaran | Should |

### 4.2 Portal Kantor (Customer)

| ID | Kebutuhan | Prioritas |
|---|---|---|
| C-01 | Registrasi & login sebagai kantor | Must |
| C-02 | Cari katering: keyword + filter lokasi + filter jenis makanan | Must |
| C-03 | Lihat etalase merchant & detail menu | Must |
| C-04 | Pembelian: pilih menu, jumlah porsi, tanggal pengiriman | Must |
| C-05 | Invoice otomatis dapat diakses kantor & merchant | Must |
| C-06 | Riwayat pesanan + detail status | Must |
| C-07 | Upload bukti transfer | Should |

### 4.3 Publik

| ID | Kebutuhan | Prioritas |
|---|---|---|
| P-01 | Landing page dengan pencarian | Must |
| P-02 | Halaman katalog publik (tanpa login) | Must |
| P-03 | Halaman 404/403/500 ramah | Should |

### 4.4 Invoice (Kebutuhan Lintas Portal — dikonfirmasi user)

Invoice adalah **satu record** (`orders.invoice_no` + `order_items` + `payments`) yang
diakses oleh **dua pihak lewat dua pintu**, bukan dua dokumen terpisah.

| ID | Kebutuhan | Prioritas |
|---|---|---|
| I-01 | Setiap order menghasilkan nomor invoice otomatis (`INV-YYYYMMDD-XXXX`) | Must |
| I-02 | Satu halaman invoice (`GET /orders/{order_no}/invoice`) dirender identik untuk kedua pihak | Must |
| I-03 | Kantor masuk dari `/orders`, merchant dari `/merchant/orders` | Must |
| I-04 | Akses dibatasi **hanya** pemilik order (kantor) + merchant pemilik pesanan → pihak lain 403 | Must |
| I-05 | Invoice menampilkan: identitas merchant & kantor, tanggal pengiriman, rincian item (menu/harga/porsi/subtotal), subtotal, kode unik, total, status, instruksi pembayaran | Must |
| I-06 | Angka invoice diambil dari snapshot saat checkout, tidak dihitung ulang dari `menus.price` | Must |
| I-07 | Tombol **Cetak** via print CSS (tanpa dependency baru, tanpa PDF server-side) | Must |
| I-08 | Tidak ada link berbagi publik/bertoken — hanya 2 pihak (keputusan user 24 Okt 2026) | Must |

**Rincian tampilan invoice (dikonfirmasi user):**

```
Header    : logo merchant, nama merchant, nomor invoice, tanggal terbit
Pihak     : "Ditagihkan ke" (kantor) | "Dari" (merchant: alamat, telepon)
Info      : tanggal pengiriman, status pesanan
Tabel     : Menu | Harga/porsi | Porsi | Subtotal
Ringkasan : Subtotal, Kode Unik, TOTAL BAYAR
Pembayaran: bank + no. rekening + nama pemilik (+ QRIS statis bila ada)
Footer    : tombol Cetak (print CSS, layout A4 rapi)
```

---

## 5. Model Data (Rencana Skema)

Migrasi baru (semua additive, tidak mengubah migrasi bawaan selain `users`):

```
users
  + role: enum [customer, merchant] (default customer)

merchants
  id, user_id (FK→users, unique), name, slug (unique), description,
  city, address, phone, email_contact, logo_path,
  bank_name, bank_account_number, bank_account_name, qris_image_path,
  is_active (bool, default true), created_at, updated_at
  INDEX(city), INDEX(is_active)

categories                      # "jenis makanan"
  id, name, slug (unique), created_at, updated_at

menus
  id, merchant_id (FK→merchants), category_id (FK→categories, nullable),
  name, slug, description, price (per porsi),
  min_order (int, default 1), photo_path, is_available (bool, default true),
  created_at, updated_at
  INDEX(merchant_id), INDEX(category_id), INDEX(is_available)

orders
  id, order_no (unique), invoice_no (unique),
  customer_id (FK→users), merchant_id (FK→merchants),
  delivery_date (date), qty_porsi (int), delivery_address (text), notes (text, nullable),
  subtotal (int), unique_code (int), total (int),
  status (enum, default pending_payment),
  created_at, updated_at
  INDEX(merchant_id), INDEX(customer_id), INDEX(status), INDEX(delivery_date)

order_items                     # snapshot harga saat checkout
  id, order_id (FK→orders), menu_id (FK→menus, nullable onDelete set null),
  menu_name_snapshot, price_snapshot (int), qty (int), subtotal (int),
  created_at, updated_at

payments
  id, order_id (FK→orders), method (enum [bank_transfer, qris_static]),
  proof_path (nullable), status (enum [unpaid, waiting_verification, verified, rejected]),
  note (nullable), verified_at (nullable), created_at, updated_at
```

**Prinsip data:**

1. **Snapshot harga** — `order_items.price_snapshot` & `menu_name_snapshot` menyalin nilai
   saat checkout, agar riwayat invoice tidak berubah bila merchant mengubah/menghapus menu.
2. **Nomor unik** — `order_no` = `ORD-YYYYMMDD-XXXX`, `invoice_no` = `INV-YYYYMMDD-XXXX`.
3. **Kode unik bayar** — `unique_code` (3 digit) ditambahkan ke total untuk membantu
   rekonsiliasi transfer manual antar-order.
4. **Uang disimpan sebagai integer** (rupiah, tanpa sen) untuk menghindari galat float.
5. **Soft delete** tidak dipakai di MVP; `menu_id` pada `order_items` `nullOnDelete` supaya
   invoice lama tetap utuh.

---

## 6. Manajemen Kesalahan & Validasi

Sesuai permintaan spec ("gunakan manajemen kesalahan untuk menangani eror"):

| Area | Penanganan |
|---|---|
| Input katalog/filter | `array_filter` + validasi tipe query; nilai filter tak dikenal diabaikan, tidak error |
| Upload foto menu | Validasi `image|mimes:jpg,jpeg,png,webp|max:2048`; gagal → pesan error, file lama dipertahankan |
| Upload bukti bayar | Validasi gambar + ukuran; gagal → toast error, status order tidak berubah |
| Checkout | Validasi: tanggal tidak boleh < **H+1** (besok) dan tidak melewati batas wajar, porsi ≥ `min_order`, menu wajib tersedia & milik merchant yang sama |
| Race condition nomor order | Generate di dalam transaksi DB, kolom `unique` sebagai pengaman akhir; retry bila bentrok |
| Harga diubah lewat request | Harga **tidak** diterima dari request; selalu dihitung ulang di server dari `menus.price` |
| Akses lintas akun | Policy: merchant hanya order/menu miliknya, kantor hanya order miliknya → 403 ramah |
| Invoice diakses pihak ketiga | `OrderPolicy::view()` → 403 (bukan 404), tanpa kebocoran keberadaan data |
| Invoice/order tak ditemukan | Route model binding + halaman 404 kustom |
| Exception tak terduga | Laravel handler + render halaman error Inertia; log terstruktur |
| Feedback UI | `alert-error.tsx` + `input-error.tsx` untuk error form; `sonner` untuk toast |

---

## 7. Keamanan

- **Password**: hashing bawaan Laravel (`'password' => 'hashed'`), kebijakan via
  `app/Concerns/PasswordValidationRules.php`.
- **Login**: throttling Fortify, verifikasi email, session regeneration, 2FA & passkey sudah
  tersedia dan dipertahankan.
- **Otorisasi**: `role` middleware untuk area merchant; **Policy** per model
  (`MenuPolicy`, `OrderPolicy`) untuk kepemilikan resource. Server selalu validasi ulang,
  tidak percaya data dari klien.
- **CSRF**: aktif bawaan Inertia.
- **Upload**: file disimpan di disk `public` dengan nama generated (bukan nama asli),
  validasi mime/ukuran, eksekusi non-PHP (blokir `.php`).
- **SQL injection**: hanya Query Builder/Eloquent terparameter, tanpa raw string concat.

---

## 8. Arsitektur & Konvensi Implementasi

| Aspek | Keputusan |
|---|---|
| Gaya API | **Inertia (bukan REST API terpisah)** — mengikuti konvensi starter-kit |
| Halaman | 1 route = 1 file di `resources/js/pages`, Blade hanya root `app.blade.php` |
| Logic bisnis | Controller ramping → `app/Services/` (folder baru, didukung skill architecture) |
| Validasi | Form Request + trait di `app/Concerns/` |
| Status/Role | PHP Enum (`UserRole`, `OrderStatus`, `PaymentStatus`) dengan key TitleCase |
| Relasi & query | Eloquent + eager loading (`with()`) untuk cegah N+1; `orderBy` deterministik |
| Route FE | Wayfinder (`@/actions`, `@/routes`), bukan URL hardcode |
| UI | Tailwind v4 + shadcn components existing, wajib responsif (mobile-first) |
| Test | Pest feature test per kebutuhan fungsional + failure mode |

**Struktur baru yang direncanakan** (perlu approval sesuai batasan AGENTS.md):
`app/Services/`, `app/Enums/`, `app/Policies/`, `app/Http/Controllers/Merchant/`,
`app/Http/Controllers/Catalog/`, `app/Http/Requests/Merchant/`, `resources/js/pages/merchant/`,
`resources/js/pages/catalog/`.

---

## 9. Rencana Milestone

Setiap milestone: implementasi vertikal (backend + frontend + test) → Pint + PHPStan +
`npm run build` lolos → commit + push ke `main`.

| Milestone | Deliverable | Definisi Selesai |
|---|---|---|
| **M0 — Fondasi** | Set DB lokal ke SQLite (PHP lokal tanpa `pdo_pgsql`); enum `UserRole`; kolom `role`; layout & navigasi publik; factory/seeder | Test role & guard hijau; app jalan di SQLite |
| **M1 — Merchant & Menu** | Profil merchant, CRUD menu + upload foto, kategori | M-02..M-05 lolos; Policy kepemilikan menu teruji |
| **M2 — Pencarian** | Landing + `/catering` + etalase merchant; filter kota/kategori/harga + sort + paginasi | C-02, C-03, P-01, P-02 lolos; filter kombinasi teruji |
| **M3 — Checkout** | Keranjang → porsi + tanggal kirim + alamat; snapshot harga; generate nomor | C-04 lolos; validasi tanggal/porsi/harga teruji |
| **M4 — Order, Pembayaran & Invoice** | Daftar order 2 sisi, upload bukti, verifikasi merchant, **satu halaman invoice** yang diakses kedua pihak + cetak (print CSS) | M-06, M-07, C-05, C-06, C-07, **I-01..I-08** lolos; otorisasi invoice teruji (pihak ketiga 403); angka invoice identik di kedua sisi |
| **M5 — Hardening** | Error pages, lapor merchant, polish responsif, README setup, suite penuh hijau | Semua test hijau; `composer run ci:check` bersih |

---

## 10. Keputusan Final (sudah dikonfirmasi user)

| # | Pertanyaan | Keputusan |
|---|---|---|
| O1 | Rekening merchant | **Manual per merchant** + QRIS statis opsional |
| O2 | Cakupan kota | **Teks bebas multi-kota** + filter kota |
| O3 | Batas minimal H pemesanan | **H+1** (bisa pesan untuk besok) |
| O4 | Kuota harian merchant | **Tanpa batas** di MVP |
| O5 | Database | **SQLite** untuk lokal (PHP lokal tanpa `pdo_pgsql`); PostgreSQL/MySQL jadi target produksi |
| O6 | Folder baru | **Disetujui:** `app/Services/`, `app/Enums/`, `app/Policies/`, controller `Merchant/` & `Catalog/` |
| O7 | Lokasi dokumen | `docs/` |
| O8 | Format cetak invoice | **Print CSS** (tanpa package baru) |
| O9 | Hak akses invoice | **Hanya 2 pihak** (kantor pemesan + merchant pemilik); tanpa link berbagi publik |

---

## 11. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Bukti transfer palsu (tanpa gateway) | Sedang | Verifikasi manual merchant + kode unik + transparansi status |
| Merchant abal-abal (tanpa admin) | Sedang | Flag `is_active` + lapor merchant + review manual DB |
| Bentrok nomor order saat trafik tinggi | Rendah | Generate dalam transaksi + unique constraint + retry |
| N+1 pada katalog & order list | Sedang | Eager loading wajib + test query count bila perlu |
| File upload menumpuk di hosting gratis | Rendah | Batas ukuran 2MB, kompresi gambar, monitor kuota |
| DB produksi berbeda dari SQLite lokal | Sedang | Hindari fitur spesifik driver; siapkan migrasi Postgres/MySQL |
---

## 12. Cara Menjalankan Proyek (Developer)

```bash
composer install
copy .env.example .env      # Windows
php artisan key:generate
php artisan migrate --seed
php artisan storage:link    # agar foto menu/bukti bisa diakses
npm install
npm run dev                 # terminal 1
php artisan serve           # terminal 2
```

Pemeriksaan kualitas:

```bash
vendor/bin/pint --dirty --format agent   # format PHP
php artisan test --compact               # test
composer run ci:check                    # npm check + tsc + lint + test
```

---

## 13. Referensi

- `AGENTS.md` — aturan wajib AI agent di proyek ini
- `docs/struktur-folder.md` — peta folder, batasan, best practice
- `.agents/skills/` — skills domain (laravel-best-practices, inertia-react-development, dst.)
- Repo: https://github.com/ysiin/catering-marketplace