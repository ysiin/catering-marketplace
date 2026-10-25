import { Link, usePage } from '@inertiajs/react';
import {
    ClipboardList,
    LayoutGrid,
    Store,
    UtensilsCrossed,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as menuIndex } from '@/routes/merchant/menus';
import { index as orderIndex } from '@/routes/merchant/orders';
import { edit as editMerchantProfile } from '@/routes/merchant/profile';
import { index as customerOrderIndex } from '@/routes/orders';
import type { Auth, NavItem } from '@/types';

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        ...(auth?.role === 'merchant'
            ? [
                  {
                      title: 'Menu Saya',
                      href: menuIndex(),
                      icon: UtensilsCrossed,
                  },
                  {
                      title: 'Profil Katering',
                      href: editMerchantProfile(),
                      icon: Store,
                  },
                  {
                      title: 'Pesanan Masuk',
                      href: orderIndex(),
                      icon: ClipboardList,
                  },
              ]
            : []),
        ...(auth?.role === 'customer'
            ? [
                  {
                      title: 'Pesanan Saya',
                      href: customerOrderIndex(),
                      icon: ClipboardList,
                  },
              ]
            : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
