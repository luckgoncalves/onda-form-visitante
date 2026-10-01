import {
  Building,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  LucideIcon,
  MessageSquare,
  Plus,
  Tag,
  Ticket,
  UserCog,
  Users,
  UsersRound,
  Church,
  Home,
} from 'lucide-react';
import { resolverVisualMinisterio } from '@/config/ministerio-visual';

export type NavigationSection = 'Gestão' | 'Comunidade';

export type NavigationItem = {
  label: string;
  href?: string;
  externalHref?: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  section?: NavigationSection;
  desktopPrimary?: boolean;
  mobilePrimaryAdmin?: boolean;
  mobilePrimaryUser?: boolean;
};

export const navigationItems: NavigationItem[] = [
  {
    label: 'Visitantes',
    href: '/list',
    icon: Users,
    adminOnly: true,
    desktopPrimary: true,
    mobilePrimaryAdmin: true,
  },
  {
    label: 'Visitante',
    href: '/register',
    icon: Plus,
    desktopPrimary: true,
    mobilePrimaryAdmin: true,
    mobilePrimaryUser: true,
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    adminOnly: true,
    section: 'Gestão',
  },
  {
    label: 'Formulários',
    href: '/dashboard/forms',
    icon: FileText,
    adminOnly: true,
    section: 'Gestão',
  },
  {
    label: 'Etiquetas',
    href: '/dashboard/etiquetas',
    icon: Tag,
    adminOnly: true,
    section: 'Gestão',
  },
  {
    label: 'Membros',
    href: '/users',
    icon: UserCog,
    adminOnly: true,
    section: 'Gestão',
  },
  {
    label: 'Ministérios',
    href: '/dashboard/ministerios',
    icon: Church,
    adminOnly: true,
    section: 'Gestão',
  },
  {
    label: 'Chamados',
    href: '/chamados',
    icon: Ticket,
    adminOnly: true,
    section: 'Gestão',
  },
  {
    label: 'Checklist',
    href: '/checklist',
    icon: ClipboardCheck,
    adminOnly: true,
    section: 'Gestão',
  },
  {
    label: 'Empresas',
    href: '/empresas',
    icon: Building,
    desktopPrimary: true,
    mobilePrimaryAdmin: true,
    mobilePrimaryUser: true,
  },
  {
    label: 'Chamados',
    href: '/chamados',
    icon: Ticket,
    desktopPrimary: true,
    mobilePrimaryAdmin: true,
    mobilePrimaryUser: true,
  },
  {
    label: 'Grupos',
    externalHref: 'https://igrejaondacuritiba.inpeaceapp.com/groups',
    icon: UsersRound,
    section: 'Comunidade',
    mobilePrimaryUser: true,
  },
];

// Início de quem ainda não participa de nenhum ministério (/inicio)
export const inicioItem: NavigationItem = {
  label: 'Início',
  href: '/inicio',
  icon: Home,
};

/**
 * Itens da barra inferior (celular), exceto "Mais", que o componente acrescenta.
 * Início é sempre o primeiro. Com ministério ou perfil de acesso: Início + até 3 itens + Mais
 * (o que passar disso fica no "Mais"). Sem ministério: Início · Empresas · Grupos + Mais.
 */
export function getBottomNavItems({
  isAdmin,
  paginasHabilitadas = [],
  semMinisterio = false,
}: {
  isAdmin: boolean;
  paginasHabilitadas?: string[];
  semMinisterio?: boolean;
}): NavigationItem[] {
  if (!isAdmin && semMinisterio) {
    const empresas = navigationItems.find((i) => i.href === '/empresas' && !i.adminOnly);
    const grupos = navigationItems.find((i) => i.externalHref?.includes('groups'));
    return [inicioItem, empresas, grupos].filter((i): i is NavigationItem => !!i);
  }

  const doPerfil = isAdmin
    ? getMobilePrimaryItems(true)
    : paginasHabilitadas.length
      ? getNavItemsForMinisterio(paginasHabilitadas)
      : getMobilePrimaryItems(false);
  return [inicioItem, ...doPerfil.slice(0, 3)];
}

/** Página de entrada de um ministério: a página inicial configurada ou a primeira habilitada. */
export function getEntradaMinisterio(ministerio: MinisterioNav): NavigationItem | null {
  const paginas = getNavItemsForMinisterio(ministerio.paginasHabilitadas);
  if (!paginas.length) return null;
  return paginas.find((p) => getNavKey(p) === ministerio.paginaInicial) ?? paginas[0];
}

export const feedbackItem = {
  label: 'Feedback',
  externalHref: 'https://vox.devstack.com.br/board/de2454a0-1502-43d8-a4f7-4b2ff8992f07',
  icon: MessageSquare,
};

export function getVisibleNavigationItems(isAdmin: boolean) {
  return navigationItems.filter((item) => !item.adminOnly || isAdmin);
}

export function getDesktopPrimaryItems(isAdmin: boolean) {
  return getVisibleNavigationItems(isAdmin).filter((item) => item.desktopPrimary);
}

export function getMobilePrimaryItems(isAdmin: boolean) {
  return getVisibleNavigationItems(isAdmin).filter((item) =>
    isAdmin ? item.mobilePrimaryAdmin : item.mobilePrimaryUser
  );
}

export type MinisterioNav = {
  id: string;
  nome: string;
  icone?: string | null;
  cor?: string | null;
  paginaInicial?: string | null;
  paginasHabilitadas: string[];
};

export type NavDepartment = {
  id: string;
  name: string;
  icon: LucideIcon;
  color?: { bg: string; fg: string };
  pages: NavigationItem[];
};

export type NavMenu = {
  general: NavigationItem[];
  departments: NavDepartment[];
};

export const DEPARTMENT_FALLBACK_COLOR = { bg: '#EEF0F5', fg: '#3A4150' };

function getNavKey(item: NavigationItem): string {
  return item.href ?? (item.externalHref?.includes('groups') ? 'grupos' : '');
}

/**
 * Monta o menu lateral: páginas gerais (liberadas a todos) e os departamentos
 * do usuário. Páginas restritas (adminOnly) liberadas por um ministério ficam
 * no departamento desse ministério; as demais restritas ficam em "Gestão"
 * (somente admin). Departamentos sem páginas não aparecem.
 */
export function buildNavMenu(
  isAdmin: boolean,
  paginasHabilitadas: string[] = [],
  ministerios: MinisterioNav[] = []
): NavMenu {
  const accessible = isAdmin
    ? getVisibleNavigationItems(true)
    : paginasHabilitadas.length
      ? getNavItemsForMinisterio(paginasHabilitadas)
      : getVisibleNavigationItems(false);

  const general: NavigationItem[] = [];
  const gestao: NavigationItem[] = [];
  const porMinisterio = new Map<string, NavigationItem[]>();
  const seen = new Set<string>();

  for (const item of accessible) {
    const key = getNavKey(item);
    if (seen.has(key)) continue;
    seen.add(key);

    if (!item.adminOnly) {
      general.push(item);
      continue;
    }

    const donos = ministerios.filter((m) => m.paginasHabilitadas.includes(key));
    if (donos.length === 0) {
      if (isAdmin) gestao.push(item);
      continue;
    }
    for (const m of donos) {
      porMinisterio.set(m.id, [...(porMinisterio.get(m.id) || []), item]);
    }
  }

  const departments: NavDepartment[] = [];
  if (gestao.length) {
    departments.push({
      id: 'gestao',
      name: 'Gestão',
      icon: LayoutDashboard,
      color: { bg: '#E8E9F4', fg: '#141B7A' },
      pages: gestao,
    });
  }
  for (const m of ministerios) {
    const pages = porMinisterio.get(m.id);
    if (pages?.length) {
      const visual = resolverVisualMinisterio(m.icone, m.cor);
      departments.push({ id: m.id, name: m.nome, icon: visual.icon, color: visual.color, pages });
    }
  }

  return { general, departments };
}

export function filterByNavConfig(
  items: NavigationItem[],
  paginasHabilitadas: string[]
): NavigationItem[] {
  if (!paginasHabilitadas.length) return items;
  return items.filter(item => {
    return paginasHabilitadas.includes(getNavKey(item));
  });
}

/**
 * Returns nav items for ministry members based on the ministry nav config.
 * Unlike getVisibleNavigationItems, this bypasses the adminOnly check —
 * items are granted explicitly by the ministry configuration.
 */
export function getNavItemsForMinisterio(paginasHabilitadas: string[]): NavigationItem[] {
  if (!paginasHabilitadas.length) return [];
  const seen = new Set<string>();
  return navigationItems.filter(item => {
    const key = getNavKey(item);
    if (!paginasHabilitadas.includes(key)) return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
