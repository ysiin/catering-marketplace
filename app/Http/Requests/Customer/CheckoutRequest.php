<?php

namespace App\Http\Requests\Customer;

use App\Enums\PaymentMethod;
use App\Models\Menu;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CheckoutRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->isCustomer() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'qty_porsi' => [
                'required',
                'integer',
                'min:'.$this->menu()->min_order,
                'max:10000',
            ],
            'delivery_date' => [
                'required',
                'date_format:Y-m-d',
                'after_or_equal:'.now()->addDay()->toDateString(),
                'before_or_equal:'.now()->addMonths(3)->toDateString(),
            ],
            'delivery_address' => ['required', 'string', 'min:10', 'max:500'],
            'notes' => ['nullable', 'string', 'max:500'],
            'payment_method' => [
                'nullable',
                Rule::enum(PaymentMethod::class),
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'qty_porsi.min' => 'Jumlah porsi minimal :min untuk menu ini.',
            'delivery_date.after_or_equal' => 'Tanggal pengiriman paling cepat besok (H+1).',
            'delivery_date.before_or_equal' => 'Tanggal pengiriman maksimal 3 bulan ke depan.',
            'delivery_address.min' => 'Alamat pengiriman terlalu singkat.',
        ];
    }

    /**
     * Get the menu being checked out from the route.
     */
    public function menu(): Menu
    {
        $menu = $this->route('menu');

        abort_unless($menu instanceof Menu, 404);

        return $menu;
    }
}
