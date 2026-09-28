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
} from 'lucide-react';

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

export function getSecondaryNavigationItems(isAdmin: boolean) {
  return getVisibleNavigationItems(isAdmin).filter(
    (item) => !item.desktopPrimary || item.section
  );
}

export function getMobileMoreNavigationItems(isAdmin: boolean) {
  return getVisibleNavigationItems(isAdmin).filter((item) =>
    isAdmin ? !item.mobilePrimaryAdmin : !item.mobilePrimaryUser
  );
}

export type MinisterioNav = {
  id: string;
  nome: string;
  paginasHabilitadas: string[];
};

export type NavigationMenuSection = {
  title: string;
  items: NavigationItem[];
};

function getNavKey(item: NavigationItem): string {
  return item.href ?? (item.externalHref?.includes('groups') ? 'grupos' : '');
}

/**
 * Agrupa os itens do menu em seções. Páginas restritas (adminOnly) liberadas
 * por um ministério do usuário aparecem na seção desse ministério; as demais
 * mantêm a seção padrão, com Comunidade dentro de Geral.
 */
export function groupNavigationBySection(
  items: NavigationItem[],
  ministerios: MinisterioNav[] = []
): NavigationMenuSection[] {
  const sections = new Map<string, NavigationItem[]>();
  const seen = new Set<string>();

  for (const item of items) {
    const key = getNavKey(item);
    if (seen.has(key)) continue;
    seen.add(key);

    const ministerio = item.adminOnly
      ? ministerios.find((m) => m.paginasHabilitadas.includes(key))
      : undefined;
    const section = item.section === 'Comunidade' ? undefined : item.section;
    const title = ministerio?.nome || section || 'Geral';
    sections.set(title, [...(sections.get(title) || []), item]);
  }

  // Geral (inclui Comunidade) sempre primeiro
  return Array.from(sections, ([title, sectionItems]) => ({ title, items: sectionItems })).sort(
    (a, b) => Number(b.title === 'Geral') - Number(a.title === 'Geral')
  );
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
