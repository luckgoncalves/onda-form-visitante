'use client';

import { useEffect, useState } from 'react';

/** Altura do teclado virtual (px), via visualViewport. 0 quando fechado ou sem suporte. */
export function useKeyboardOffset() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const atualizar = () => {
      const altura = window.innerHeight - vv.height - vv.offsetTop;
      setOffset(altura > 80 ? Math.round(altura) : 0);
    };
    atualizar();
    vv.addEventListener('resize', atualizar);
    vv.addEventListener('scroll', atualizar);
    return () => {
      vv.removeEventListener('resize', atualizar);
      vv.removeEventListener('scroll', atualizar);
    };
  }, []);

  return offset;
}
