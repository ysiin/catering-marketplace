<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Menu;
use App\Models\Merchant;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    /**
     * Display the public menu catalogue with search and location filters.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'search' => $this->stringFilter($request, 'search'),
            'city' => $this->stringFilter($request, 'city'),
            'category' => $this->stringFilter($request, 'category'),
        ];

        $menus = Menu::query()
            ->available()
            ->with([
                'merchant:id,name,slug,city',
                'category:id,name,slug',
            ])
            ->whereHas('merchant', fn (Builder $query) => $query
                ->where('is_active', true)
                ->when(
                    $filters['city'] !== '',
                    fn (Builder $query) => $query->where('city', $filters['city']),
                ),
            )
            ->when(
                $filters['category'] !== '',
                fn (Builder $query) => $query->whereHas(
                    'category',
                    fn (Builder $query) => $query->where('slug', $filters['category']),
                ),
            )
            ->when(
                $filters['search'] !== '',
                fn (Builder $query) => $query->where(
                    fn (Builder $query) => $query
                        ->where('name', 'like', "%{$filters['search']}%")
                        ->orWhere('description', 'like', "%{$filters['search']}%")
                        ->orWhereHas(
                            'merchant',
                            fn (Builder $query) => $query->where('name', 'like', "%{$filters['search']}%"),
                        ),
                ),
            )
            ->orderBy('price')
            ->orderBy('id')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Menu $menu): array => [
                'id' => $menu->id,
                'name' => $menu->name,
                'description' => $menu->description,
                'price' => $menu->price,
                'min_order' => $menu->min_order,
                'photo_url' => $menu->photo_path !== null
                    ? Storage::disk('public')->url($menu->photo_path)
                    : null,
                'category' => $menu->category?->only(['name', 'slug']),
                'merchant' => [
                    'name' => $menu->merchant->name,
                    'slug' => $menu->merchant->slug,
                    'city' => $menu->merchant->city,
                ],
            ]);

        return Inertia::render('catalog/index', [
            'menus' => $menus,
            'categories' => Category::query()->orderBy('name')->get(['name', 'slug']),
            'cities' => $this->cities(),
            'filters' => $filters,
        ]);
    }

    /**
     * Read a single string query parameter, ignoring invalid values.
     */
    private function stringFilter(Request $request, string $key): string
    {
        $value = $request->query($key);

        return is_string($value) ? trim($value) : '';
    }

    /**
     * Get the distinct cities that currently have an active merchant.
     *
     * @return Collection<int, string>
     */
    private function cities(): Collection
    {
        return Merchant::query()
            ->active()
            ->whereNotNull('city')
            ->distinct()
            ->orderBy('city')
            ->pluck('city');
    }
}
