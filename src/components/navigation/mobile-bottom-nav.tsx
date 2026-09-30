'use client';

import { forwardRef } from 'react';
import { LucideIcon, MoreHorizontal, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { getBottomNavItems, MinisterioNav, NavigationItem } from '@/config/navigation';
import { MoreMenuSheet } from '@/components/navigation/more-menu-sheet';
import { cn } from '@/lib/utils';

type MobileBottomNavProps = {
  isAdmin: boolean;
  userName: string;
  userId: string;
  campusNome?: string | null;
  campusCidade?: string | null;
  profileImageUrl?: string | null;
  navConfig?: { paginaInicial: string; paginasHabilitadas: string[] } | null;
  ministerios?: MinisterioNav[];
  semMinisterio?: boolean;
  onLogout: () => void;
};

function isActive(pathname: string, href?: string) {
  if (!href) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type ItemBarraProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: LucideIcon;
  label: string;
  active: boolean;
};

// Item da barra: pílula atrás do ícone quando ativo
const ItemBarra = forwardRef<HTMLButtonElement, ItemBarraProps>(function ItemBarra(
  { icon: Icon, label, active, className, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue/40',
        active ? 'font-bold text-onda-blue' : 'font-medium text-[#5B6478]',
        className
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn('flex h-[30px] w-[52px] items-center justify-center rounded-full', active && 'bg-[#E8E9F4]')}
      >
        <Icon className="h-[22px] w-[22px]" />
      </span>
      <span className="max-w-full truncate px-0.5">{label}</span>
    </button>
  );
});

export function MobileBottomNav({
  isAdmin,
  userName,
  userId,
  campusNome,
  campusCidade,
  profileImageUrl,
  navConfig,
  ministerios,
  semMinisterio,
  onLogout,
}: MobileBottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const itens = getBottomNavItems({
    isAdmin,
    paginasHabilitadas: navConfig?.paginasHabilitadas,
    semMinisterio,
  });
  // Sem ministério a barra termina em "Perfil"; nos demais casos, em "Mais"
  const comPerfil = !isAdmin && !!semMinisterio;
  const perfilHref = `/users/${userId}`;
  const maisAtivo = !comPerfil && !itens.some((item) => isActive(pathname, item.href));

  const handleNavigate = (item: NavigationItem) => {
    if (item.externalHref) {
      window.open(item.externalHref, '_blank', 'noopener,noreferrer');
      return;
    }
    if (!item.href) return;
    // Tocar na página em que já está (ex.: Início) rola até o topo
    if (pathname === item.href) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    router.push(item.href);
  };

  const colunas = itens.length + 1;

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#ECEDF3] bg-white px-1 pb-[calc(env(safe-area-inset-bottom)+0.25rem)] pt-1 md:hidden"
    >
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${colunas}, minmax(0, 1fr))` }}>
        {itens.map((item) => (
          <ItemBarra
            key={item.label}
            icon={item.icon}
            label={item.label}
            active={isActive(pathname, item.href)}
            onClick={() => handleNavigate(item)}
          />
        ))}

        {comPerfil ? (
          <ItemBarra
            icon={User}
            label="Perfil"
            active={isActive(pathname, perfilHref)}
            onClick={() => handleNavigate({ label: 'Perfil', href: perfilHref, icon: User })}
          />
        ) : (
          <MoreMenuSheet
            isAdmin={isAdmin}
            userName={userName}
            userId={userId}
            campusNome={campusNome}
            campusCidade={campusCidade}
            profileImageUrl={profileImageUrl}
            navConfig={navConfig}
            ministerios={ministerios}
            onLogout={onLogout}
          >
            <ItemBarra icon={MoreHorizontal} label="Mais" active={maisAtivo} />
          </MoreMenuSheet>
        )}
      </div>
    </nav>
  );
}
