'use client';

import React, { useEffect, useId, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, ChevronUp, LogOut, MoreHorizontal, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import {
  buildNavMenu,
  DEPARTMENT_FALLBACK_COLOR,
  feedbackItem,
  inicioItem,
  MinisterioNav,
  NavigationItem,
} from '@/config/navigation';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type MoreMenuSheetProps = {
  isAdmin: boolean;
  userName: string;
  userId: string;
  campusNome?: string | null;
  campusCidade?: string | null;
  profileImageUrl?: string | null;
  navConfig?: { paginaInicial: string; paginasHabilitadas: string[] } | null;
  ministerios?: MinisterioNav[];
  onLogout: () => void;
  children: React.ReactNode;
};

const STORAGE_PREFIX = 'onda:menu-departamentos:';
const SECTION_LABEL = 'px-1 text-xs font-bold uppercase tracking-[0.06em] text-[#6B7280]';
const STATUS_ABERTOS = ['PENDENTE', 'RECEBIDO', 'EM_ANDAMENTO'];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

function readSavedState(userId: string): Record<string, boolean> | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + userId);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSavedState(userId: string, state: Record<string, boolean>) {
  try {
    localStorage.setItem(STORAGE_PREFIX + userId, JSON.stringify(state));
  } catch {
    // armazenamento indisponível: o menu funciona sem persistir
  }
}

function matchesPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function CountBadge({ count, tone }: { count: number; tone: 'danger' | 'primary' }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-xs font-bold text-white',
        tone === 'danger' ? 'bg-[#C4320A]' : 'bg-primary'
      )}
    >
      <span aria-hidden="true">{count > 99 ? '99+' : count}</span>
      <span className="sr-only">{count} {count === 1 ? 'pendência' : 'pendências'}</span>
    </span>
  );
}

function NavItemButton({
  item,
  active,
  badgeCount,
  inDepartment,
  onSelect,
}: {
  item: NavigationItem;
  active: boolean;
  badgeCount: number;
  inDepartment?: boolean;
  onSelect: (item: NavigationItem) => void;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      onClick={() => onSelect(item)}
      className={cn(
        'flex min-h-12 w-full items-center gap-3.5 rounded-xl px-3 text-left text-[15px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        active
          ? 'bg-[#E8E9F4] font-semibold text-primary'
          : 'font-medium text-[#0E1024] hover:bg-[#F3F4F8]'
      )}
    >
      <Icon aria-hidden="true" className={cn('shrink-0', inDepartment ? 'h-5 w-5' : 'h-[22px] w-[22px]')} />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {badgeCount > 0 && <CountBadge count={badgeCount} tone="primary" />}
    </button>
  );
}

export function MoreMenuSheet({
  isAdmin,
  userName,
  userId,
  campusNome,
  campusCidade,
  profileImageUrl,
  navConfig,
  ministerios,
  onLogout,
  children,
}: MoreMenuSheetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Menu "Mais opções" do rodapé: sempre começa fechado (não é salvo)
  const [opcoesAbertas, setOpcoesAbertas] = useState(false);
  const opcoesId = useId();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [chamadosAbertos, setChamadosAbertos] = useState(0);

  const menu = useMemo(() => {
    const base = buildNavMenu(isAdmin, navConfig?.paginasHabilitadas, ministerios);
    return { ...base, general: [inicioItem, ...base.general] };
  }, [isAdmin, navConfig?.paginasHabilitadas, ministerios]);

  // Página ativa = href mais específico que casa com a rota atual
  const activeHref = useMemo(() => {
    const hrefs = [...menu.general, ...menu.departments.flatMap((d) => d.pages)]
      .map((item) => item.href)
      .filter((href): href is string => !!href && matchesPath(pathname, href));
    return hrefs.sort((a, b) => b.length - a.length)[0];
  }, [menu, pathname]);

  const temChamados = [...menu.general, ...menu.departments.flatMap((d) => d.pages)].some(
    (item) => item.href === '/chamados'
  );

  // Ao abrir: restaura o estado salvo e abre o departamento da página atual
  useEffect(() => {
    if (!open) {
      setOpcoesAbertas(false);
      return;
    }

    const saved = readSavedState(userId);
    const initial: Record<string, boolean> = {};
    for (const dep of menu.departments) {
      initial[dep.id] = saved?.[dep.id] ?? menu.departments.length === 1;
      if (activeHref && dep.pages.some((p) => p.href === activeHref)) initial[dep.id] = true;
    }
    setExpanded(initial);
  }, [open, userId, menu, activeHref]);

  // Pendências: chamados em aberto (apenas para quem atende chamados)
  useEffect(() => {
    if (!open || !temChamados || (!isAdmin && !ministerios?.length)) return;
    let ativo = true;
    fetch('/api/chamados/counts')
      .then((res) => (res.ok ? res.json() : null))
      .then((counts: Record<string, number> | null) => {
        if (!ativo || !counts) return;
        setChamadosAbertos(STATUS_ABERTOS.reduce((acc, status) => acc + (counts[status] || 0), 0));
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, [open, temChamados, isAdmin, ministerios]);

  const badgeFor = (item: NavigationItem) => (item.href === '/chamados' ? chamadosAbertos : 0);

  const { general, departments } = menu;

  const toggleDepartment = (id: string) => {
    setExpanded((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      writeSavedState(userId, next);
      return next;
    });
  };

  const handleNavigate = (item: Pick<NavigationItem, 'href' | 'externalHref'>) => {
    if (item.externalHref) {
      window.open(item.externalHref, '_blank', 'noopener,noreferrer');
    } else if (item.href) {
      router.push(item.href);
    }
    setOpen(false);
  };

  const handleLogout = () => {
    setOpen(false);
    onLogout();
  };

  const cidade = campusCidade || campusNome;
  const FeedbackIcon = feedbackItem.icon;

  return (
    // handleOnly: toques nos itens nunca viram gesto de arrastar (evita fechar no pointerup e o toque cair na página de trás).
    // noBodyStyles: sem o position:fixed + scrollTo do vaul no Safari/iOS, que rolava a página durante a navegação.
    // O scroll do fundo continua travado pelo Dialog do Radix.
    <Drawer open={open} onOpenChange={setOpen} direction="right" handleOnly noBodyStyles>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent
        side="right"
        hideCloseButton
        overlayClassName="bg-[rgba(12,14,40,0.55)]"
        className="flex w-[350px] max-w-[85vw] flex-col gap-0 p-0 sm:max-w-[85vw]"
      >
        <DrawerTitle className="sr-only">Menu</DrawerTitle>
        <DrawerDescription className="sr-only">Navegação do aplicativo</DrawerDescription>

        {/* Cabeçalho do perfil */}
        <div className="flex items-center gap-1 px-3 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
          <button
            type="button"
            onClick={() => handleNavigate({ href: '/perfil' })}
            className="flex min-h-14 min-w-0 flex-1 items-center gap-3 rounded-xl px-2 text-left transition-colors hover:bg-[#F3F4F8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt=""
                className="h-11 w-11 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white"
              >
                {getInitials(userName)}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-base font-semibold text-[#0E1024]">{userName}</span>
              <span className="block truncate text-[13px] text-[#5B6478]">
                {cidade ? `${cidade} · Ver perfil` : 'Ver perfil'}
              </span>
            </span>
            <ChevronRight aria-hidden="true" className="h-5 w-5 shrink-0 text-[#5B6478]" />
          </button>
          <DrawerClose asChild>
            <button
              type="button"
              aria-label="Fechar menu"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#5B6478] transition-colors hover:bg-[#F3F4F8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </DrawerClose>
        </div>

        {/* Área rolável */}
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4">
          <div className="space-y-5">
            {general.length > 0 && (
              <section>
                <h3 className={cn(SECTION_LABEL, 'mb-2')}>Geral</h3>
                <ul className="space-y-0.5">
                  {general.map((item) => (
                    <li key={item.label}>
                      <NavItemButton
                        item={item}
                        active={!!item.href && item.href === activeHref}
                        badgeCount={badgeFor(item)}
                        onSelect={handleNavigate}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {departments.length > 0 && (
              <section>
                <div className="mb-1 flex items-center gap-2">
                  <h3 className={SECTION_LABEL}>Meus departamentos</h3>
                  <span className="rounded-full bg-[#F3F4F8] px-2 py-0.5 text-xs font-semibold text-[#5B6478]">
                    <span aria-hidden="true">{menu.departments.length}</span>
                    <span className="sr-only">
                      {menu.departments.length} {menu.departments.length === 1 ? 'departamento' : 'departamentos'}
                    </span>
                  </span>
                </div>

                <div className="space-y-0.5">
                  {departments.map((dep) => {
                    const isOpen = !!expanded[dep.id];
                    const pendencias = dep.pages.reduce((acc, page) => acc + badgeFor(page), 0);
                    const color = dep.color || DEPARTMENT_FALLBACK_COLOR;
                    const DepIcon = dep.icon;
                    const listId = `menu-departamento-${dep.id}`;

                    return (
                      <div key={dep.id}>
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={listId}
                          onClick={() => toggleDepartment(dep.id)}
                          className="flex min-h-[52px] w-full items-center gap-3 rounded-xl px-2 text-left transition-colors hover:bg-[#F3F4F8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                          <span
                            aria-hidden="true"
                            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px]"
                            style={{ backgroundColor: color.bg, color: color.fg }}
                          >
                            <DepIcon className="h-[18px] w-[18px]" />
                          </span>
                          <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-[#0E1024]">
                            {dep.name}
                          </span>
                          {!isOpen && pendencias > 0 && <CountBadge count={pendencias} tone="danger" />}
                          <ChevronDown
                            aria-hidden="true"
                            className={cn(
                              'h-5 w-5 shrink-0 text-[#5B6478] transition-transform duration-200',
                              isOpen && 'rotate-180'
                            )}
                          />
                        </button>

                        <ul id={listId} hidden={!isOpen} className="space-y-0.5 pb-2 pl-[22px]">
                          {dep.pages.map((item) => (
                            <li key={item.label}>
                              <NavItemButton
                                item={item}
                                active={!!item.href && item.href === activeHref}
                                badgeCount={badgeFor(item)}
                                inDepartment
                                onSelect={handleNavigate}
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Rodapé: uma linha só; "Enviar feedback" e "Sair" ficam no menu "Mais opções" */}
        <div className="border-t border-[#ECEDF3] px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-2">
          <DropdownMenu open={opcoesAbertas} onOpenChange={setOpcoesAbertas}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-controls={opcoesId}
                className="flex min-h-12 w-full items-center gap-3.5 rounded-xl px-3 text-left text-[15px] font-medium text-[#0E1024] transition-colors hover:bg-[#F3F4F8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 data-[state=open]:bg-[#F3F4F8]"
              >
                <MoreHorizontal aria-hidden="true" className="h-[22px] w-[22px] shrink-0" />
                <span className="flex-1">Mais opções</span>
                {opcoesAbertas ? (
                  <ChevronDown aria-hidden="true" className="h-5 w-5 shrink-0 text-[#5B6478]" />
                ) : (
                  <ChevronUp aria-hidden="true" className="h-5 w-5 shrink-0 text-[#5B6478]" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              id={opcoesId}
              side="top"
              align="start"
              sideOffset={4}
              className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-[14px] border-[#E3E6EF] p-1.5 shadow-[0_12px_32px_rgba(12,14,40,0.18)] duration-150 motion-reduce:animate-none"
            >
              <DropdownMenuItem
                onSelect={() => handleNavigate(feedbackItem)}
                className="min-h-12 cursor-pointer gap-3.5 rounded-[10px] px-3 text-[15px] font-medium text-[#0E1024]"
              >
                <FeedbackIcon aria-hidden="true" className="h-5 w-5 shrink-0" />
                Enviar feedback
              </DropdownMenuItem>
              <DropdownMenuSeparator className="mx-2 my-1 bg-[#ECEDF3]" />
              <DropdownMenuItem
                onSelect={handleLogout}
                className="min-h-12 cursor-pointer gap-3.5 rounded-[10px] px-3 text-[15px] font-semibold text-[#B42318] focus:bg-[#FEF3F2] focus:text-[#B42318]"
              >
                <LogOut aria-hidden="true" className="h-5 w-5 shrink-0" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
