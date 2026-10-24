<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Menu;
use App\Models\Merchant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CatalogSeeder extends Seeder
{
    /**
     * Seed demo accounts plus a catalogue of merchants and menus.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Kantor Demo',
            'email' => 'kantor@example.com',
            'role' => UserRole::Customer->value,
        ]);

        $categories = collect([
            'Nasi Box',
            'Snack Box',
            'Tumpeng',
            'Prasmanan',
            'Vegetarian',
            'Minuman',
            'Kue & Dessert',
        ])->mapWithKeys(fn (string $name): array => [
            $name => Category::factory()->create([
                'name' => $name,
                'slug' => Str::slug($name),
            ]),
        ]);

        foreach ($this->merchants() as $data) {
            $menus = $data['menus'];
            unset($data['menus']);

            $merchant = Merchant::factory()->create($data);

            foreach ($menus as [$name, $category, $price, $minOrder, $description]) {
                Menu::factory()->create([
                    'merchant_id' => $merchant->id,
                    'category_id' => $categories[$category]->id,
                    'name' => $name,
                    'slug' => Str::slug($name).'-'.$merchant->id,
                    'description' => $description,
                    'price' => $price,
                    'min_order' => $minOrder,
                ]);
            }
        }
    }

    /**
     * Build the demo merchant catalogue for the listing page.
     *
     * @return array<int, array<string, mixed>>
     */
    private function merchants(): array
    {
        $demoUser = User::factory()->merchant()->create([
            'name' => 'Katering Demo',
            'email' => 'merchant@example.com',
        ]);

        return [
            [
                'user_id' => $demoUser->id,
                'name' => 'Katering Sari Rasa',
                'city' => 'Jakarta Selatan',
                'description' => 'Katering rumahan sejak 2014. Spesialis nasi box harian untuk kantor dengan cita rasa masakan rumah.',
                'phone' => '081210001001',
                'email_contact' => 'merchant@example.com',
                'bank_name' => 'BCA',
                'bank_account_number' => '1234567890',
                'bank_account_name' => 'Katering Sari Rasa',
                'menus' => [
                    ['Nasi Ayam Bakar Sambal Matah', 'Nasi Box', 25000, 10, 'Ayam bakar bumbu Bali, sambal matah segar, nasi putih, plecing kangkung, dan kerupuk.'],
                    ['Nasi Rendang Daging Sapi', 'Nasi Box', 32000, 10, 'Rendang empuk dimasak 6 jam, nasi putih, daun singkong, dan sambal ijo.'],
                    ['Nasi Ayam Geprek Mozzarella', 'Nasi Box', 28000, 10, 'Ayam geprek crispy dengan lelehan mozzarella, nasi putih, dan tumis sayur.'],
                    ['Snack Box Risoles & Pastel', 'Snack Box', 15000, 20, 'Isi 4: risoles mayo, pastel, lumpia, dan kue sus. Cocok untuk rapat pagi.'],
                ],
            ],
            [
                'name' => 'Dapur Bunda Catering',
                'city' => 'Bandung',
                'description' => 'Masakan Sunda segar dengan bahan dari pasar lokal. Melayani pesanan harian dan acara kantor.',
                'phone' => '081220002002',
                'email_contact' => 'bunda@example.com',
                'bank_name' => 'Mandiri',
                'bank_account_number' => '2233445566',
                'bank_account_name' => 'Dapur Bunda Catering',
                'menus' => [
                    ['Nasi Ikan Dori Saus Tartar', 'Nasi Box', 30000, 10, 'Dori fillet goreng tepung, saus tartar, nasi putih, wortel buncis, dan salad.'],
                    ['Nasi Telur Balado & Tempe Orek', 'Nasi Box', 20000, 15, 'Telur balado pedas manis, tempe orek, nasi putih, dan tumis kangkung.'],
                    ['Paket Vegetarian Tempe Bacem', 'Vegetarian', 23000, 10, 'Tempe bacem, tahu bumbu kuning, urap sayur, nasi merah, dan sambal tomat.'],
                ],
            ],
            [
                'name' => 'Gurih Nusantara',
                'city' => 'Surabaya',
                'description' => 'Katering skala besar dengan dapur sentral. Fokus pada konsistensi rasa dan ketepatan waktu kirim.',
                'phone' => '081230003003',
                'email_contact' => 'gurih@example.com',
                'bank_name' => 'BNI',
                'bank_account_number' => '3344556677',
                'bank_account_name' => 'Gurih Nusantara',
                'menus' => [
                    ['Nasi Bebek Betutu', 'Nasi Box', 45000, 10, 'Bebek betutu bumbu Bali, nasi putih, kacang panjang, dan sambal matah.'],
                    ['Nasi Udang Saus Padang', 'Nasi Box', 38000, 10, 'Udang segar saus padang, nasi putih, tumis buncis jagung, dan kerupuk.'],
                    ['Nasi Sapi Lada Hitam', 'Nasi Box', 35000, 10, 'Sapi slice lada hitam, nasi putih, brokoli saus tiram, dan kentang goreng.'],
                ],
            ],
            [
                'name' => 'Sekotak Katering Jogja',
                'city' => 'Yogyakarta',
                'description' => 'Spesialis tumpeng dan prasmanan acara kantor. Bisa custom menu sesuai permintaan.',
                'phone' => '081240004004',
                'email_contact' => 'jogja@example.com',
                'bank_name' => 'BRI',
                'bank_account_number' => '4455667788',
                'bank_account_name' => 'Sekotak Katering Jogja',
                'menus' => [
                    ['Tumpeng Mini Nasi Kuning', 'Tumpeng', 65000, 5, 'Nasi kuning, ayam goreng, telur balado, mie goreng, dan sambal goreng ati.'],
                    ['Prasmanan Nusantara 6 Lauk', 'Prasmanan', 55000, 30, 'Enam lauk pilihan, nasi putih, sayur, kerupuk, dan buah potong.'],
                ],
            ],
            [
                'name' => 'Sehat Selalu Katering',
                'city' => 'Jakarta Pusat',
                'description' => 'Menu sehat rendah kalori dengan informasi gizi. Cocok untuk kantor dengan program wellness.',
                'phone' => '081250005005',
                'email_contact' => 'sehat@example.com',
                'bank_name' => 'BCA',
                'bank_account_number' => '5566778899',
                'bank_account_name' => 'Sehat Selalu Katering',
                'menus' => [
                    ['Nasi Merah Ayam Panggang Herbal', 'Nasi Box', 33000, 10, 'Ayam panggang bumbu herbal, nasi merah, brokoli kukus, dan saus yogurt.'],
                    ['Bowl Sayur Quinoa', 'Vegetarian', 40000, 10, 'Quinoa, edamame, jagung, tomat cherry, dan dressing wijen.'],
                ],
            ],
            [
                'name' => 'Manis Manja Bakery',
                'city' => 'Tangerang',
                'description' => 'Snack box, kue, dan dessert untuk rapat serta acara kantor. Dipanggang setiap pagi.',
                'phone' => '081260006006',
                'email_contact' => 'manis@example.com',
                'bank_name' => 'Mandiri',
                'bank_account_number' => '6677889900',
                'bank_account_name' => 'Manis Manja Bakery',
                'menus' => [
                    ['Snack Box Signature 5 Macam', 'Snack Box', 18000, 20, 'Lima macam kue: brownies, lapis legit, risoles, sus, dan bolu pandan.'],
                    ['Kotak Dessert Puding & Fruit', 'Kue & Dessert', 22000, 20, 'Puding silky, potongan buah segar, dan krim lembut dalam satu kotak.'],
                    ['Paket Kopi & Teh Kantor', 'Minuman', 12000, 25, 'Kopi tubruk, teh manis, dan air mineral untuk 1 orang.'],
                ],
            ],
        ];
    }
}
