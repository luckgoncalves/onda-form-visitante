'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { checkAuth } from '@/app/actions';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // Verificar se o componente foi montado no cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Só executa no cliente após a montagem
    if (!isMounted) return;

    async function checkAuthentication() {
      try {
        const { isAuthenticated: authStatus, user } = await checkAuth();
        
        if (!authStatus || !user) {
          // Se não estiver autenticado, redireciona para login
          router.push('/');
          return;
        }

        // Se precisar trocar a senha, redireciona
        if (user.requirePasswordChange) {
          router.push('/change-password');
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    }

    checkAuthentication();
  }, [isMounted, router]);

  // Durante o SSR ou antes da montagem, mostra loading
  if (!isMounted || isLoading) {
    return (
      <main className="w-full h-full flex items-center justify-center">
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9562DC]"></div>
        </div>
      </main>
    );
  }

  // Se chegou até aqui, está autenticado e pode mostrar o sidebar
  if (isAuthenticated) {
    return (
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <main className="w-full h-full">
         
          {children}
        </main>
      </SidebarProvider>
    );
  }

  // Fallback - não deveria chegar aqui devido aos redirects acima
  return null;
}
