'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('splash-shown');
    if (alreadyShown) return;

    sessionStorage.setItem('splash-shown', 'true');
    setVisible(true);

    const fadeTimer = setTimeout(() => setFadeOut(true), 1500);
    const hideTimer = setTimeout(() => setVisible(false), 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.5s ease',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <Image
        src="/logos/logo-principal-preto.png"
        alt="Igreja Onda"
        width={260}
        height={55}
        priority
      />
    </div>
  );
}
