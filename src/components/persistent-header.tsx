'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { checkAuth, logout } from '@/app/actions';
import { Header } from '@/components/header';
import { usePushListener } from '@/hooks/usePushListener';
import type { MinisterioNav } from '@/config/navigation';

type AuthUser = {
  id: string;
  name: string;
  isAdmin: boolean;
  campusNome?: string | null;
  campusCidade?: string | null;
  profileImageUrl?: string | null;
  ministerioNavConfig?: { paginaInicial: string; paginasHabilitadas: string[] } | null;
  ministeriosNav?: MinisterioNav[];
  semMinisterio?: boolean;
};

const routesWithoutAuthenticatedHeader = new Set([
  '/',
  '/login',
  '/signup',
  '/change-password',
]);

function shouldHideAuthenticatedHeader(pathname: string) {
  return routesWithoutAuthenticatedHeader.has(pathname) || pathname.startsWith('/f/');
}

export function PersistentHeader() {
  usePushListener();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const hideHeader = shouldHideAuthenticatedHeader(pathname);

  useEffect(() => {
    let isActive = true;

    async function loadUser() {
      if (hideHeader || user) {
        setHasCheckedAuth(true);
        return;
      }

      const authResult = await checkAuth();

      if (!isActive) return;

      if (authResult.isAuthenticated && authResult.user) {
        setUser({
          id: authResult.user.id,
          name: authResult.user.name,
          isAdmin: authResult.user.role === 'admin',
          campusNome: authResult.user.campusNome || null,
          campusCidade: authResult.user.campusCidade || null,
          profileImageUrl: authResult.user.profileImageUrl || null,
          ministerioNavConfig: authResult.user.ministerioNavConfig || null,
          ministeriosNav: authResult.user.ministeriosNav || [],
          semMinisterio: authResult.user.role === 'user' && !authResult.user.temMinisterio,
        });
      } else {
        setUser(null);
      }

      setHasCheckedAuth(true);
    }

    loadUser();

    return () => {
      isActive = false;
    };
  }, [hideHeader, user]);

  const handleLogout = useCallback(async () => {
    await logout();
    setUser(null);
    router.push('/');
  }, [router]);

  if (hideHeader || !hasCheckedAuth || !user) {
    return null;
  }

  return (
    <Header
      userId={user.id}
      userName={user.name}
      isAdmin={user.isAdmin}
      campusNome={user.campusNome}
      campusCidade={user.campusCidade}
      profileImageUrl={user.profileImageUrl}
      navConfig={user.ministerioNavConfig}
      ministerios={user.ministeriosNav}
      semMinisterio={!user.isAdmin && user.semMinisterio}
      onLogout={handleLogout}
    />
  );
}
