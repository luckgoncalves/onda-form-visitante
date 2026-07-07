'use client';
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { checkIsAdmin } from "@/app/actions";
import { PWAInstallButton } from "@/components/pwa-install-button";
import { getDesktopPrimaryItems, getNavItemsForMinisterio, NavigationItem } from "@/config/navigation";
import { MoreMenuSheet } from "@/components/navigation/more-menu-sheet";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { cn } from "@/lib/utils";
import Image from "next/image";

type HeaderProps = {
  userName: string;
  userId: string;
  campusNome?: string | null;
  navConfig?: { paginaInicial: string; paginasHabilitadas: string[] } | null;
  onLogout: () => void;
};

export function Header({ userName, userId, campusNome, navConfig, onLogout }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const { isAdmin } = await checkIsAdmin();
      setIsAdmin(isAdmin);
    }
    checkAdmin();
  }, []);

  useEffect(() => {
    document.body.classList.add('has-mobile-bottom-nav');

    return () => {
      document.body.classList.remove('has-mobile-bottom-nav');
    };
  }, []);

  const desktopPrimaryItems = (() => {
    if (isAdmin) return getDesktopPrimaryItems(true);
    if (navConfig?.paginasHabilitadas?.length) {
      // Ministry config: show exactly the granted pages (may include admin-only ones)
      return getNavItemsForMinisterio(navConfig.paginasHabilitadas);
    }
    return getDesktopPrimaryItems(false);
  })();

  const isActive = (item: NavigationItem) => {
    if (!item.href) return false;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

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
    <>
      <header className="bg-onda-darkBlue shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto flex items-center justify-between gap-3 px-3 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="shrink-0 cursor-pointer"
              onClick={() => router.push(isAdmin ? '/list' : '/register')}
              aria-label="Ir para início"
            >
              <Image
                src="/logos/logo-principal-branco.png"
                alt="Igreja Onda"
                width={192}
                height={40}
                className="h-8 w-auto"
                priority
              />
            </button>
            {campusNome && (
              <span className="hidden truncate rounded bg-white/10 px-2 py-1 text-sm font-medium text-white/70 sm:inline-block">
                {campusNome}
              </span>
            )}
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {desktopPrimaryItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);

              return (
                <Button
                  key={item.label}
                  variant="ghost"
                  className={cn(
                    "gap-2 text-white hover:bg-white/20 hover:text-white",
                    active && "bg-white/15"
                  )}
                  onClick={() => handleNavigate(item)}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <PWAInstallButton />
            <MoreMenuSheet
              isAdmin={isAdmin}
              userName={userName}
              userId={userId}
              campusNome={campusNome}
              navConfig={navConfig}
              onLogout={onLogout}
            >
              <Button
                variant="ghost"
                className="hidden items-center gap-2 text-white hover:bg-white/20 hover:text-white md:flex"
              >
                <span className="max-w-36 truncate text-base font-medium">{userName || 'Menu'}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </MoreMenuSheet>
          </div>
        </div>
      </header>
      <MobileBottomNav
        isAdmin={isAdmin}
        userName={userName}
        userId={userId}
        campusNome={campusNome}
        navConfig={navConfig}
        onLogout={onLogout}
      />
    </>
  )
}