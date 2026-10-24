<?php

namespace App\Services;

use App\Models\Menu;
use App\Models\Merchant;
use Illuminate\Support\Str;

class MenuCatalogService
{
    public function __construct(private readonly ImageUploadService $uploads) {}

    /**
     * Create a menu owned by the given merchant.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(Merchant $merchant, array $data): Menu
    {
        $payload = $data;
        unset($payload['photo']);

        $payload['merchant_id'] = $merchant->id;
        $payload['slug'] = $this->uniqueMenuSlug($merchant, (string) ($payload['name'] ?? ''));

        if (isset($data['photo'])) {
            $payload['photo_path'] = $this->uploads->store($data['photo'], 'menus');
        }

        return Menu::create($payload);
    }

    /**
     * Update a menu, replacing its photo when a new one is uploaded.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(Menu $menu, array $data): Menu
    {
        $payload = $data;
        unset($payload['photo']);

        $newName = (string) ($payload['name'] ?? $menu->name);
        if ($newName !== $menu->name) {
            $payload['slug'] = $this->uniqueMenuSlug(
                $menu->merchant,
                $newName,
                $menu->id,
            );
        }

        if (isset($data['photo'])) {
            $payload['photo_path'] = $this->uploads->replace(
                $data['photo'],
                'menus',
                $menu->photo_path,
            );
        }

        $menu->update($payload);

        return $menu->refresh();
    }

    /**
     * Delete a menu and its stored photo.
     */
    public function delete(Menu $menu): void
    {
        $photoPath = $menu->photo_path;

        $menu->delete();

        $this->uploads->delete($photoPath);
    }

    /**
     * Build a unique slug for a menu within its merchant.
     */
    private function uniqueMenuSlug(Merchant $merchant, string $name, ?int $exceptId = null): string
    {
        $base = Str::slug($name, '-', 'en', ['@' => 'at', '&' => 'and']);

        if ($base === '') {
            $base = 'menu';
        }

        $slug = mb_substr($base, 0, 80);
        $counter = 1;

        while (
            Menu::where('merchant_id', $merchant->id)
                ->where('slug', $slug)
                ->when($exceptId !== null, fn ($query) => $query->where('id', '!=', $exceptId))
                ->exists()
        ) {
            $counter++;
            $suffix = '-'.$counter;
            $slug = mb_substr($base, 0, 80 - mb_strlen($suffix)).$suffix;
        }

        return $slug;
    }
}
