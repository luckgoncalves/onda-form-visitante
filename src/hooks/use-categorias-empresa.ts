'use client';

import { useEffect, useState } from 'react';

export type CategoriaEmpresaOpcao = { id: string; nome: string };

/** Lista fixa de categorias de empresa (todas, em ordem alfabética), para os formulários. */
export function useCategoriasEmpresa() {
  const [categorias, setCategorias] = useState<CategoriaEmpresaOpcao[]>([]);

  useEffect(() => {
    let ativo = true;
    fetch('/api/empresas/categorias?todas=1')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (ativo && data) setCategorias(data.categorias.map((c: CategoriaEmpresaOpcao) => ({ id: c.id, nome: c.nome })));
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, []);

  return categorias;
}
