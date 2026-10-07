'use client';

import { useEffect, useRef, useState } from 'react';

/** Puxar a página para baixo (estando no topo) chama `onRefresh`. Devolve a distância puxada e se está atualizando. */
export function usePullToRefresh(onRefresh: () => Promise<unknown>, desativado = false) {
  const [puxando, setPuxando] = useState(0);
  const [atualizando, setAtualizando] = useState(false);
  const refreshRef = useRef(onRefresh);
  refreshRef.current = onRefresh;

  useEffect(() => {
    if (desativado) return;
    let inicio: number | null = null;
    let distancia = 0;
    const onStart = (e: TouchEvent) => {
      inicio = window.scrollY <= 0 ? e.touches[0].clientY : null;
      distancia = 0;
    };
    const onMove = (e: TouchEvent) => {
      if (inicio === null) return;
      distancia = Math.max(0, e.touches[0].clientY - inicio);
      setPuxando(Math.min(distancia, 90));
    };
    const onEnd = async () => {
      if (inicio !== null && distancia > 70) {
        setAtualizando(true);
        try {
          await refreshRef.current();
        } finally {
          setAtualizando(false);
        }
      }
      inicio = null;
      setPuxando(0);
    };
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [desativado]);

  return { puxando, atualizando };
}
