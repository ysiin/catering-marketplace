<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Merchant\StoreMenuRequest;
use App\Http\Requests\Merchant\UpdateMenuRequest;
use App\Models\Category;
use App\Models\Menu;
use App\Models\Merchant;
use App\Models\User;
use App\Services\ImageUploadService;
use App\Services\MenuCatalogService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class MenuController extends Controller
{
    public function __construct(
        private readonly MenuCatalogService $menus,
        private readonly ImageUploadService $uploads,
    ) {}

    /**
     * List the authenticated merchant's menus.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        $merchant = $this->merchant($request);

        if ($merchant === null) {
            return $this->missingProfile();
        }

        $menus = $merchant->menus()
            ->with('category:id,name,slug')
            ->orderBy('name')
            ->orderBy('id')
            ->get()
            ->map(fn (Menu $menu): array => [
                'id' => $menu->id,
                'name' => $menu->name,
                'description' => $menu->description,
                'price' => $menu->price,
                'min_order' => $menu->min_order,
                'is_available' => $menu->is_available,
                'photo_url' => $this->uploads->url($menu->photo_path),
                'category' => $menu->category?->only(['id', 'name', 'slug']),
            ]);

        return Inertia::render('merchant/menus/index', [
            'menus' => $menus,
            'profileMissing' => $merchant->name === '' || $merchant->city === null,
        ]);
    }

    /**
     * Show the form for creating a new menu.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        if ($this->merchant($request) === null) {
            return $this->missingProfile();
        }

        return Inertia::render('merchant/menus/create', [
            'categories' => $this->categories(),
        ]);
    }

    /**
     * Store a newly created menu.
     */
    public function store(StoreMenuRequest $request): RedirectResponse
    {
        $merchant = $this->merchant($request);

        if ($merchant === null) {
            return $this->missingProfile();
        }

        $menu = $this->menus->create($merchant, [
            ...$request->safe()->except(['photo']),
            'photo' => $request->file('photo'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => "Menu {$menu->name} ditambahkan."]);

        return to_route('merchant.menus.index');
    }

    /**
     * Show the form for editing the given menu.
     */
    public function edit(Request $request, Menu $menu): Response
    {
        Gate::authorize('update', $menu);

        return Inertia::render('merchant/menus/edit', [
            'menu' => [
                'id' => $menu->id,
                'name' => $menu->name,
                'description' => $menu->description,
                'price' => $menu->price,
                'min_order' => $menu->min_order,
                'category_id' => $menu->category_id,
                'is_available' => $menu->is_available,
                'photo_url' => $this->uploads->url($menu->photo_path),
            ],
            'categories' => $this->categories(),
        ]);
    }

    /**
     * Update the given menu.
     */
    public function update(UpdateMenuRequest $request, Menu $menu): RedirectResponse
    {
        $this->menus->update($menu, [
            ...$request->safe()->except(['photo']),
            ...($request->hasFile('photo') ? ['photo' => $request->file('photo')] : []),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => "Menu {$menu->name} diperbarui."]);

        return to_route('merchant.menus.index');
    }

    /**
     * Delete the given menu.
     */
    public function destroy(Menu $menu): RedirectResponse
    {
        Gate::authorize('delete', $menu);

        $name = $menu->name;

        $this->menus->delete($menu);

        Inertia::flash('toast', ['type' => 'success', 'message' => "Menu {$name} dihapus."]);

        return to_route('merchant.menus.index');
    }

    /**
     * Toggle the availability of the given menu.
     */
    public function toggleAvailability(Menu $menu): RedirectResponse
    {
        Gate::authorize('toggleAvailability', $menu);

        $menu->update(['is_available' => ! $menu->is_available]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $menu->is_available
                ? "Menu {$menu->name} ditandai tersedia."
                : "Menu {$menu->name} ditandai habis.",
        ]);

        return back();
    }

    /**
     * Get the authenticated merchant's profile, if it exists.
     */
    private function merchant(Request $request): ?Merchant
    {
        /** @var User $user */
        $user = $request->user();

        return $user->merchant;
    }

    /**
     * Redirect to the profile page when the merchant profile is missing.
     */
    private function missingProfile(): RedirectResponse
    {
        Inertia::flash('toast', [
            'type' => 'info',
            'message' => 'Lengkapi profil katering terlebih dahulu.',
        ]);

        return to_route('merchant.profile.edit');
    }

    /**
     * Get all categories available for menu assignment.
     *
     * @return Collection<int, Category>
     */
    private function categories(): Collection
    {
        return Category::query()->orderBy('name')->get(['id', 'name', 'slug']);
    }
}
