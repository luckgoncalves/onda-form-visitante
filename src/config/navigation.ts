import {
  Building,
  FileText,
  LayoutDashboard,
  LucideIcon,
  MessageSquare,
  Plus,
  Tag,
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
    label: 'Empresas',
    href: '/empresas',
    icon: Building,
    desktopPrimary: true,
    mobilePrimaryAdmin: true,
    mobilePrimaryUser: true,
  },
  {
    label: 'Grupos',
    externalHref: 'https://ondaduracuritiba.inpeaceapp.com/groups',
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
