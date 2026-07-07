'use client';

import React from 'react';
import { LogOut, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import {
  feedbackItem,
  getMobileMoreNavigationItems,
  getNavItemsForMinisterio,
  getSecondaryNavigationItems,
  NavigationItem,
} from '@/config/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

type MoreMenuSheetProps = {
  isAdmin: boolean;
  userName: string;
  userId: string;
  campusNome?: string | null;
  navConfig?: { paginaInicial: string; paginasHabilitadas: string[] } | null;
  onLogout: () => void;
  variant?: 'desktop' | 'mobile';
  children: React.ReactNode;
};

function isActive(pathname: string, href?: string) {
  if (!href) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MoreMenuSheet({
  isAdmin,
  userName,
  userId,
  campusNome,
  navConfig,
  onLogout,
  variant = 'desktop',
  children,
}: MoreMenuSheetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const navigationItems = (() => {
    if (!isAdmin && navConfig?.paginasHabilitadas?.length) {
      return getNavItemsForMinisterio(navConfig.paginasHabilitadas);
    }
    return variant === 'mobile'
      ? getMobileMoreNavigationItems(isAdmin)
      : getSecondaryNavigationItems(isAdmin);
  })();
  const FeedbackIcon = feedbackItem.icon;
  const sections = navigationItems.reduce<Record<string, NavigationItem[]>>((acc, item) => {
    const section = item.section || 'Outros';
    acc[section] = [...(acc[section] || []), item];
    return acc;
  }, {});

  const handleNavigate = (item: Pick<NavigationItem, 'href' | 'externalHref'>) => {
    setOpen(false);

    if (item.externalHref) {
      window.open(item.externalHref, '_blank', 'noopener,noreferrer');
      return;
    }

    if (item.href) {
      router.push(item.href);
    }
  };

  const handleLogout = () => {
    setOpen(false);
    onLogout();
  };

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent side="right" className="w-full max-w-sm overflow-y-auto pb-8">
        <DrawerHeader className="text-left">
          <DrawerTitle>Menu</DrawerTitle>
          <DrawerDescription>
            {campusNome ? `${campusNome} · ${userName}` : userName}
          </DrawerDescription>
        </DrawerHeader>

        <div className="mt-6 space-y-6">
          {Object.entries(sections).map(([section, items]) => (
            <div key={section}>
              <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {section}
              </h3>
              <div className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(pathname, item.href);

                  return (
                    <Button
                      key={item.label}
                      variant="ghost"
                      className={cn(
                        'h-11 w-full justify-start rounded-xl px-3 text-base',
                        active && 'bg-onda-darkBlue/10 text-onda-darkBlue'
                      )}
                      onClick={() => handleNavigate(item)}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}

          <Separator />

          <div>
            <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Conta
            </h3>
            <div className="space-y-1">
              <Button
                variant="ghost"
                className={cn(
                  'h-11 w-full justify-start rounded-xl px-3 text-base',
                  isActive(pathname, `/users/${userId}`) && 'bg-onda-darkBlue/10 text-onda-darkBlue'
                )}
                onClick={() => handleNavigate({ href: `/users/${userId}` })}
              >
                <User className="mr-3 h-5 w-5" />
                Meu perfil
              </Button>
              <Button
                variant="ghost"
                className="h-11 w-full justify-start rounded-xl px-3 text-base"
                onClick={() => handleNavigate(feedbackItem)}
              >
                <FeedbackIcon className="mr-3 h-5 w-5" />
                {feedbackItem.label}
              </Button>
              <Button
                variant="ghost"
                className="h-11 w-full justify-start rounded-xl px-3 text-base text-red-600 hover:text-red-700"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
