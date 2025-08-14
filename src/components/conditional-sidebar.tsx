'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { checkAuth } from '@/app/actions';

interface ConditionalSidebarProps {
  children: React.ReactNode;
}

export function ConditionalSidebar({ children }: ConditionalSidebarProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  // Pages that should not show sidebar even when authenticated
  const noSidebarPages = ['/', '/change-password'];
  const shouldShowSidebar = isAuthenticated && !noSidebarPages.includes(pathname);

  useEffect(() => {
    async function checkAuthentication() {
      try {
        const { isAuthenticated: authStatus } = await checkAuth();
        setIsAuthenticated(authStatus);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuthentication();
  }, [pathname]); // Re-check when pathname changes

  if (isLoading) {
    return (
      <main className="w-full h-full">
        {children}
      </main>
    );
  }

  if (shouldShowSidebar) {
    return (
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <main className="w-full h-full">
            <SidebarTrigger className='m-4' />
          {children}
        </main>
      </SidebarProvider>
    );
  }

  return (
    <main className="w-full h-full">
      {children}
    </main>
  );
} 