'use client';
import { Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/use-pwa-install';

export function PWAInstallButton() {
  const { isIOS, handleInstall } = usePWAInstall();

  return (
    <Button
      onClick={handleInstall}
      variant="ghost"
      className="flex items-center hover:bg-white/20 transition-colors text-white"
      size="sm"
    >
      {isIOS ? (
        <>
          <Smartphone className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline text-base font-medium">Instalar App</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline text-base font-medium">Instalar App</span>
        </>
      )}
    </Button>
  );
}
