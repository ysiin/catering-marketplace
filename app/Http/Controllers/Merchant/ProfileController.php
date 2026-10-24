<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Merchant\MerchantProfileUpdateRequest;
use App\Models\Merchant;
use App\Models\User;
use App\Services\ImageUploadService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __construct(private readonly ImageUploadService $uploads) {}

    /**
     * Show the merchant profile edit form, creating a blank profile on first visit.
     */
    public function edit(Request $request): Response
    {
        $merchant = $this->merchantFor($request);

        return Inertia::render('merchant/profile', [
            'merchant' => [
                'name' => $merchant->name,
                'description' => $merchant->description,
                'city' => $merchant->city,
                'address' => $merchant->address,
                'phone' => $merchant->phone,
                'email_contact' => $merchant->email_contact,
                'bank_name' => $merchant->bank_name,
                'bank_account_number' => $merchant->bank_account_number,
                'bank_account_name' => $merchant->bank_account_name,
                'logo_url' => $this->uploads->url($merchant->logo_path),
                'qris_url' => $this->uploads->url($merchant->qris_image_path),
                'is_active' => $merchant->is_active,
            ],
        ]);
    }

    /**
     * Update the merchant profile and payment details.
     */
    public function update(MerchantProfileUpdateRequest $request): RedirectResponse
    {
        $merchant = $this->merchantFor($request);
        $data = $request->safe()->except(['logo', 'qris_image']);

        if ($request->hasFile('logo')) {
            $data['logo_path'] = $this->uploads->replace(
                $request->file('logo'),
                'merchants/logos',
                $merchant->logo_path,
            );
        }

        if ($request->hasFile('qris_image')) {
            $data['qris_image_path'] = $this->uploads->replace(
                $request->file('qris_image'),
                'merchants/qris',
                $merchant->qris_image_path,
            );
        }

        $merchant->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Profil katering diperbarui.']);

        return to_route('merchant.profile.edit');
    }

    /**
     * Get the authenticated merchant's profile, creating it when missing.
     */
    private function merchantFor(Request $request): Merchant
    {
        /** @var User $user */
        $user = $request->user();

        $merchant = $user->merchant;

        if ($merchant !== null) {
            return $merchant;
        }

        return Merchant::create([
            'user_id' => $user->id,
            'name' => $user->name,
            'slug' => $this->uniqueSlug($user->name, $user->id),
            'is_active' => true,
        ]);
    }

    /**
     * Build a merchant slug that does not collide with existing merchants.
     */
    private function uniqueSlug(string $name, int $userId): string
    {
        $base = Str::slug($name);

        if ($base === '') {
            $base = 'katering';
        }

        return $base.'-'.$userId;
    }
}
