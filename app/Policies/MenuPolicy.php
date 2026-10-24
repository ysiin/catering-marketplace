<?php

namespace App\Policies;

use App\Models\Menu;
use App\Models\User;

class MenuPolicy
{
    /**
     * Determine whether the user can view any menus.
     */
    public function viewAny(User $user): bool
    {
        return $user->isMerchant();
    }

    /**
     * Determine whether the user can view the menu.
     */
    public function view(User $user, Menu $menu): bool
    {
        return $this->owns($user, $menu);
    }

    /**
     * Determine whether the user can create menus.
     */
    public function create(User $user): bool
    {
        return $user->isMerchant();
    }

    /**
     * Determine whether the user can update the menu.
     */
    public function update(User $user, Menu $menu): bool
    {
        return $this->owns($user, $menu);
    }

    /**
     * Determine whether the user can delete the menu.
     */
    public function delete(User $user, Menu $menu): bool
    {
        return $this->owns($user, $menu);
    }

    /**
     * Determine whether the user can toggle the menu availability.
     */
    public function toggleAvailability(User $user, Menu $menu): bool
    {
        return $this->owns($user, $menu);
    }

    /**
     * Determine whether the menu belongs to the user's merchant profile.
     */
    private function owns(User $user, Menu $menu): bool
    {
        return $user->isMerchant()
            && $user->merchant !== null
            && $menu->merchant_id === $user->merchant->id;
    }
}
