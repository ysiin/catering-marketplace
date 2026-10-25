<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Menu;
use App\Models\Merchant;
use App\Services\ImageUploadService;
use Inertia\Inertia;
use Inertia\Response;

class MerchantController extends Controller
{
    public function __construct(private readonly ImageUploadService $uploads) {}

    /**
     * Display the public storefront of a single active merchant.
     */
    public function show(Merchant $merchant): Response
    {
        abort_unless($merchant->is_active, 404);

        $menus = $merchant->menus()
            ->available()
            ->with('category:id,name,slug')
            ->orderBy('price')
            ->orderBy('id')
            ->get()
            ->map(fn (Menu $menu): array => [
                'id' => $menu->id,
                'name' => $menu->name,
                'description' => $menu->description,
                'price' => $menu->price,
                'min_order' => $menu->min_order,
                'photo_url' => $this->uploads->url($menu->photo_path),
                'category' => $menu->category?->only(['name', 'slug']),
            ])
            ->all();

        return Inertia::render('catalog/merchant', [
            'merchant' => [
                'name' => $merchant->name,
                'slug' => $merchant->slug,
                'description' => $merchant->description,
                'city' => $merchant->city,
                'address' => $merchant->address,
                'phone' => $merchant->phone,
                'email_contact' => $merchant->email_contact,
                'logo_url' => $this->uploads->url($merchant->logo_path),
                'menu_count' => count($menus),
                'min_price' => $menus === [] ? null : min(array_column($menus, 'price')),
            ],
            'menus' => $menus,
            'categories' => Category::query()
                ->orderBy('name')
                ->get(['name', 'slug']),
        ]);
    }
}
