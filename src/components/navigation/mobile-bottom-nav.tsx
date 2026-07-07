'use client';

import { MoreHorizontal } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { getMobilePrimaryItems, getNavItemsForMinisterio, NavigationItem } from '@/config/navigation';
import { MoreMenuSheet } from '@/components/navigation/more-menu-sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type MobileBottomNavProps = {
  isAdmin: boolean;
  userName: string;
  userId: string;
  campusNome?: string | null;
  navConfig?: { paginaInicial: string; paginasHabilitadas: string[] } | null;
  onLogout: () => void;
};

function isActive(pathname: string, item: NavigationItem) {
  if (!item.href) return false;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function MobileBottomNav({
  isAdmin,
  userName,
  userId,
  campusNome,
  navConfig,
  onLogout,
}: MobileBottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const primaryItems = (() => {
    if (isAdmin) return getMobilePrimaryItems(true);
    if (navConfig?.paginasHabilitadas?.length) {
      // Ministry config: show exactly the granted pages (may include admin-only ones)
      return getNavItemsForMinisterio(navConfig.paginasHabilitadas);
    }
    return getMobilePrimaryItems(false);
  })();

  const handleNavigate = (item: NavigationItem) => {
    if (item.externalHref) {
      window.open(item.externalHref, '_blank', 'noopener,noreferrer');
      return;
    }

    if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
      <div className="grid grid-cols-4 gap-1">
        {primaryItems.slice(0, 3).map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item);

          return (
            <Button
              key={item.label}
              variant="ghost"
              className={cn(
                'h-14 flex-col gap-1 rounded-2xl px-2 text-xs text-gray-500',
                active && 'bg-onda-darkBlue/10 text-onda-darkBlue'
              )}
              onClick={() => handleNavigate(item)}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Button>
          );
        })}

        <MoreMenuSheet
          isAdmin={isAdmin}
          userName={userName}
          userId={userId}
          campusNome={campusNome}
          navConfig={navConfig}
          onLogout={onLogout}
          variant="mobile"
        >
          <Button
            variant="ghost"
            className="h-14 flex-col gap-1 rounded-2xl px-2 text-xs text-gray-500"
          >
            <MoreHorizontal className="h-5 w-5" />
            <span>Mais</span>
          </Button>
        </MoreMenuSheet>
      </div>
    </nav>
  );
}
