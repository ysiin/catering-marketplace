# Sekotak — Marketplace Katering Makan Siang Kantor

> **makan siang kantor, beres.**

Sekotak menghubungkan **kantor** yang butuh makan siang karyawan dengan **katering** yang menyediakan
menu. Kantor bisa cari katering, pesan dengan jumlah porsi + tanggal kirim, transfer manual, lalu
melacak satu invoice yang bisa dibuka **kedua pihak**. Katering bisa kelola profil, menu, dan
verifikasi pembayaran.

Dibangun dengan **Laravel 13 + Inertia v3 + React 19 + Tailwind CSS 4**.

---

## 1. Akun Demo

Database (`database/database.sqlite`) sudah terisi data contoh dan ikut di-commit, jadi **tidak perlu
seeding** untuk mencoba. Password semua akun: `password`

| Peran       | Email                     | Password   |
| ----------- | ------------------------- | ---------- |
| **Katering** | `indahkatering@mail.com`  | `password` |
| **Kantor**   | `yasin@mail.com`          | `password` |

`indahkatering@mail.com` → punya 1 merchant (**Indah Katering**, Jakarta Barat) dengan 2 menu
(*Ayam Gulai* Rp25.000 & *Snack Box* Rp15.000).
`yasin@mail.com` → punya 1 pesanan yang sudah dibayar dan terverifikasi.

> Mau mulai dari nol? Jalankan `php artisan migrate:fresh --seed` — seeder membuat **akun yang sama**
> seperti tabel di atas plus katalog 6 katering & 17 menu.

---

## 2. Cara Menjalankan

**Kebutuhan:** PHP 8.3+, Composer, Node.js 20+, dan ekstensi `pdo_sqlite`.

```bash
# 1. Dependensi
composer install
npm install

# 2. Environment
cp .env.example .env        # Windows: copy .env.example .env
php artisan key:generate

# 3. Database sudah berisi data demo.
#    Lewati langkah ini kalau ingin langsung pakai data yang ada.
#    Jalankan kalau ingin menyegarkan dari awal:
php artisan migrate:fresh --seed

# 4. Symlink storage (agar foto menu tampil)
php artisan storage:link

# 5. Jalankan
composer run dev            # menjalankan server + queue + vite sekaligus
```

Buka **http://localhost:8000**.

<details>
<summary>Kalau <code>composer run dev</code> bermasalah</summary>

Jalankan dua terminal terpisah:

```bash
php artisan serve
npm run dev
```
</details>

---

## 3. Alur Uji Coba

### Sebagai Kantor (`yasin@mail.com`)

1. **Katalog** — halaman publik `/`. Cari menu lewat kolom pencarian, filter kategori lewat dropdown
   **Kategori**, dan filter kota lewat dropdown **Semua Lokasi**.
2. Buka kartu menu → **Pesan sekarang** → isi jumlah porsi + tanggal kirim (minimal **H+1**).
3. Setelah pesanan dibuat, halaman detail menampilkan instruksi transfer + nomor rekening katering.
4. **Unggah bukti bayar** (JPG/PNG). Status berubah jadi *Menunggu verifikasi*.
5. **Lihat invoice** — satu halaman invoice yang bisa di-print (Ctrl+P).

### Sebagai Katering (`indahkatering@mail.com`)

1. **Dashboard** — ringkasan omzet (bulan ini & total), jumlah pesanan masuk, dan berapa yang perlu
   diverifikasi.
2. **Pesanan Masuk** — lihat bukti bayar lalu **Verifikasi** atau **Tolak** (dengan alasan). Setelah
   terverifikasi, tandai pesanan *Sedang diproses* → *Selesai*.
3. **Menu Saya** — CRUD menu: nama, deskripsi, harga, minimum porsi, dan foto.
4. **Profil Katering** — nama katering, kota, kontak, rekening bank, dan gambar QRIS opsional.

### Yang bisa dicoba sebagai tamu

Buka `/` atau `/katering/{slug}` tanpa login — katalog & etalase katering bisa dilihat publik.
Checkout dan dashboard butuh login.

---

## 4. Fitur

**Publik / Tamu**
- Katalog menu dengan pencarian, filter kategori, filter kota, dan paginasi
- Halaman etalase per katering (`/katering/{slug}`)

**Kantor**
- Checkout dengan jumlah porsi & tanggal kirim (validasi H+1)
- Pembayaran transfer manual + unggah bukti bayar
- Pelacakan status pesanan & pembatalan selama belum dibayar
- Satu invoice yang bisa dibuka katering maupun kantor, siap cetak

**Katering**
- Dashboard omzet & antrian pesanan
- CRUD menu lengkap dengan unggah foto
- Profil katering + rekening bank + QRIS opsional
- Verifikasi / penolakan bukti bayar, pembaruan status pesanan

**Yang sengaja tidak ada di MVP:** panel admin, payment gateway, rating/ulasan, chat, kurir,
langganan berulang. Detail lengkap ada di [`docs/PRD.md`](docs/PRD.md).

---

## 5. Catatan Teknis

**Aturan bisnis penting**
- Harga **di-snapshot** saat checkout; harga tidak pernah dibaca dari request.
- Semua nominal uang disimpan sebagai **bilangan bulat rupiah** (tanpa sen).
- Setiap pesanan punya satu record pembayaran.
- Otorisasi per-resource lewat Policy: invoice hanya bisa dibuka dua pihak, pihak ketiga → 403.
  Tidak ada tautan invoice publik.

**Struktur ringkas**
```
app/
├── Enums/                  # OrderStatus, PaymentStatus, PaymentMethod, UserRole
├── Http/Controllers/
│   ├── Catalog/            # katalog publik + etalase katering
│   ├── Customer/           # checkout & pesanan kantor
│   ├── Merchant/           # profil, menu, pesanan katering
│   ├── DashboardController.php
│   └── InvoiceController.php
├── Policies/               # OrderPolicy, MenuPolicy
├── Services/               # OrderService, OrderPresenter, ImageUploadService
resources/js/
├── pages/                  # catalog, customer, merchant, dashboard, invoice
└── layouts/                # marketplace, merchant, app
```

Penjelasan lebih lengkap: [`docs/struktur-folder.md`](docs/struktur-folder.md).

**Menjalankan pemeriksaan**

```bash
vendor/bin/pint --dirty        # format kode
vendor/bin/phpstan analyse     # analisis statis (level 7)
php artisan test --compact     # tes Pest
npm run check                  # lint + format frontend
npm run build                  # build aset produksi
```

---

## 6. Teknologi

| Lapisan       | Dipakai                                                     |
| ------------- | ----------------------------------------------------------- |
| Backend       | Laravel 13, PHP 8.3+                                        |
| Frontend      | Inertia v3, React 19, TypeScript, Tailwind CSS 4            |
| Database      | SQLite (pengembangan) — PostgreSQL siap untuk produksi      |
| Auth          | Laravel Fortify (login, registrasi pilih peran, 2FA, passkey) |
| Routing FE    | Laravel Wayfinder (route TypeScript otomatis)               |
| Kualitas kode | Pest, Larastan (level 7), Pint                             |