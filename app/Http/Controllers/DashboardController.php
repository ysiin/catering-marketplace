<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Models\Order;
use App\Models\User;
use App\Services\OrderPresenter;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private readonly OrderPresenter $presenter) {}

    /**
     * Show the role aware dashboard summary.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->role === UserRole::Merchant) {
            return $this->merchantDashboard($user);
        }

        return $this->customerDashboard($user);
    }

    /**
     * Build the merchant dashboard: revenue and incoming order counters.
     */
    private function merchantDashboard(User $user): Response|RedirectResponse
    {
        $merchant = $user->merchant;

        if ($merchant === null) {
            Inertia::flash('toast', [
                'type' => 'info',
                'message' => 'Lengkapi profil katering terlebih dahulu.',
            ]);

            return to_route('merchant.profile.edit');
        }

        $base = fn (): Builder => Order::query()->forMerchant($merchant->id);

        $revenue = fn (): Builder => $base()
            ->whereHas('payment', fn (Builder $query): Builder => $query
                ->where('status', PaymentStatus::Verified->value));

        $omzetBulanIni = (int) $revenue()
            ->where('created_at', '>=', Carbon::now()->startOfMonth())
            ->sum('total');

        $omzetTotal = (int) $revenue()->sum('total');

        $pesananMasuk = (int) $base()->count();

        $perluVerifikasi = (int) $base()
            ->whereHas('payment', fn (Builder $query): Builder => $query
                ->where('status', PaymentStatus::WaitingVerification->value))
            ->count();

        $recent = $base()
            ->with([
                'merchant:id,name,slug',
                'customer:id,name',
                'items',
                'payment',
            ])
            ->latest('created_at')
            ->latest('id')
            ->limit(5)
            ->get()
            ->map(fn (Order $order): array => $this->presenter->summary($order))
            ->all();

        return Inertia::render('dashboard/merchant', [
            'stats' => [
                'omzet_bulan_ini' => $omzetBulanIni,
                'omzet_total' => $omzetTotal,
                'pesanan_masuk' => $pesananMasuk,
                'perlu_verifikasi' => $perluVerifikasi,
            ],
            'orders' => $recent,
        ]);
    }

    /**
     * Build the office dashboard: order counters and latest orders.
     */
    private function customerDashboard(User $user): Response
    {
        $base = fn (): Builder => Order::query()->forCustomer($user->id);

        $aktif = (int) $base()
            ->whereNotIn('status', [
                OrderStatus::Completed->value,
                OrderStatus::Cancelled->value,
                OrderStatus::Rejected->value,
            ])
            ->count();

        $menungguBayar = (int) $base()
            ->whereHas('payment', fn (Builder $query): Builder => $query
                ->where('status', PaymentStatus::Unpaid->value))
            ->count();

        $selesai = (int) $base()
            ->where('status', OrderStatus::Completed->value)
            ->count();

        $recent = $base()
            ->with([
                'merchant:id,name,slug',
                'customer:id,name',
                'items',
                'payment',
            ])
            ->latest('created_at')
            ->latest('id')
            ->limit(3)
            ->get()
            ->map(fn (Order $order): array => $this->presenter->summary($order))
            ->all();

        return Inertia::render('dashboard/customer', [
            'stats' => [
                'aktif' => $aktif,
                'menunggu_bayar' => $menungguBayar,
                'selesai' => $selesai,
            ],
            'orders' => $recent,
        ]);
    }
}
