<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ImageUploadService
{
    /**
     * Store an uploaded image on the public disk.
     *
     * @return string The stored path relative to the public disk.
     */
    public function store(UploadedFile $image, string $directory): string
    {
        $path = $image->store($directory, 'public');

        if ($path === false) {
            throw new \RuntimeException('Gagal menyimpan gambar yang diunggah.');
        }

        return $path;
    }

    /**
     * Replace a previously stored image, deleting the old file.
     */
    public function replace(UploadedFile $image, string $directory, ?string $oldPath): string
    {
        $path = $this->store($image, $directory);

        $this->delete($oldPath);

        return $path;
    }

    /**
     * Delete a stored image when it exists.
     */
    public function delete(?string $path): void
    {
        if ($path === null || $path === '') {
            return;
        }

        Storage::disk('public')->delete($path);
    }

    /**
     * Resolve a stored path into a publicly accessible URL.
     */
    public function url(?string $path): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        return Storage::disk('public')->url($path);
    }
}
