'use client';
import { Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/use-pwa-install';

export function PWAInstallButton() {
  const { isIOS, handleInstall } = usePWAInstall();

  return (
    <Button
      onClick={handleInstall}
      aria-label="Instalar app"
      variant="ghost"
      className="flex items-center text-white hover:bg-white/15 hover:text-white transition-colors"
      size="sm"
    >
      {isIOS ? (
        <>
          <Smartphone aria-hidden="true" className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline text-base font-medium">Instalar App</span>
        </>
      ) : (
        <>
          <Download aria-hidden="true" className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline text-base font-medium">Instalar App</span>
        </>
      )}
    </Button>
  );
}
