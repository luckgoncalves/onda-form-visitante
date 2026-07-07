'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { checkAuth, logout } from '@/app/actions';
import { Header } from '@/components/header';

type AuthUser = {
  id: string;
  name: string;
  campusNome?: string | null;
  ministerioNavConfig?: { paginaInicial: string; paginasHabilitadas: string[] } | null;
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
          campusNome: authResult.user.campusNome || null,
          ministerioNavConfig: authResult.user.ministerioNavConfig || null,
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
      campusNome={user.campusNome}
      navConfig={user.ministerioNavConfig}
      onLogout={handleLogout}
    />
  );
}
