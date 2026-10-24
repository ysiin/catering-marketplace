<?php

namespace App\Concerns;

use App\Models\Category;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait MenuValidationRules
{
    /**
     * Get the validation rules shared by menu create and update requests.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function menuRules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'category_id' => [
                'required',
                Rule::exists(Category::class, 'id'),
            ],
            'description' => ['required', 'string', 'max:2000'],
            'price' => ['required', 'integer', 'min:1000', 'max:10000000'],
            'min_order' => ['required', 'integer', 'min:1', 'max:10000'],
        ];
    }

    /**
     * Get the image rules for the menu photo.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function menuPhotoRules(bool $isRequired): array
    {
        return [
            $isRequired ? 'required' : 'nullable',
            'image',
            'mimes:jpg,jpeg,png,webp',
            'max:2048',
        ];
    }

    /**
     * Get custom messages for menu validation errors.
     *
     * @return array<string, string>
     */
    protected function menuMessages(): array
    {
        return [
            'name.required' => 'Nama menu wajib diisi.',
            'category_id.required' => 'Kategori wajib dipilih.',
            'category_id.exists' => 'Kategori yang dipilih tidak ditemukan.',
            'description.required' => 'Deskripsi menu wajib diisi.',
            'price.required' => 'Harga per porsi wajib diisi.',
            'price.integer' => 'Harga harus berupa angka tanpa titik atau koma.',
            'price.min' => 'Harga minimal Rp1.000 per porsi.',
            'min_order.required' => 'Minimal pesanan wajib diisi.',
            'min_order.min' => 'Minimal pesanan sekurang-kurangnya 1 porsi.',
            'photo.required' => 'Foto menu wajib diunggah.',
            'photo.image' => 'Foto menu harus berupa gambar.',
            'photo.mimes' => 'Foto menu harus berformat JPG, JPEG, PNG, atau WEBP.',
            'photo.max' => 'Ukuran foto menu maksimal 2MB.',
        ];
    }
}
