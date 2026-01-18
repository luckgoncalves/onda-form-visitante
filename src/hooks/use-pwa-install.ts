'use client';
import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Detectar evento beforeinstallprompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      // No iOS, mostrar instruções
      alert(
        'Para instalar este app no seu iPhone/iPad:\n\n' +
        '1. Toque no botão de compartilhar (ícone de quadrado com seta) na barra inferior\n' +
        '2. Role para baixo e toque em "Adicionar à Tela de Início"\n' +
        '3. Toque em "Adicionar" no canto superior direito'
      );
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      // Se não houver prompt disponível, mostrar instruções genéricas
      alert(
        'Para instalar este app:\n\n' +
        'No Chrome/Edge: Clique no ícone de instalação na barra de endereços\n' +
        'No Android: Use o menu do navegador e selecione "Adicionar à tela inicial"'
      );
    }
  };

  return {
    isIOS,
    handleInstall,
  };
}
