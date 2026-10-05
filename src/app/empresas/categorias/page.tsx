'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, Search, X } from 'lucide-react';
import { checkAuth } from '@/app/actions';
import { HeaderPublic } from '@/components/header-public';
import { Skeleton } from '@/components/ui/skeleton';

type Categoria = { id: string; nome: string; total: number };

function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export default function CategoriasEmpresasPage() {
  const router = useRouter();
  const buscaRef = useRef<HTMLInputElement>(null);
  const [logado, setLogado] = useState<boolean | null>(null);
  const [categorias, setCategorias] = useState<Categoria[] | null>(null);
  const [erro, setErro] = useState(false);
  const [busca, setBusca] = useState('');

  const carregar = useCallback(async () => {
    setErro(false);
    setCategorias(null);
    try {
      const res = await fetch('/api/empresas/categorias');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCategorias(data.categorias);
    } catch {
      setErro(true);
    }
  }, []);

  useEffect(() => {
    carregar();
    checkAuth()
      .then(({ isAuthenticated }) => setLogado(isAuthenticated))
      .catch(() => setLogado(false));
  }, [carregar]);

  const termo = normalizar(busca);
  const filtradas = useMemo(
    () => (categorias ?? []).filter((c) => !termo || normalizar(c.nome).includes(termo)),
    [categorias, termo]
  );

  const limparBusca = () => {
    setBusca('');
    buscaRef.current?.focus();
  };

  return (
    <>
      {logado === false && <HeaderPublic />}
      <div className="mt-[72px] min-h-[calc(100dvh-72px)] bg-[#F5F6FA]">
        {/* Barra da página */}
        <div className="flex h-14 items-center gap-1 border-b border-[#ECEDF3] bg-white px-2 md:px-4">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Voltar"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-[#0E1024] hover:bg-[#F5F6FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue/40"
          >
            <ArrowLeft aria-hidden="true" className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold text-[#0E1024]">Categorias</h1>
        </div>

        <div className="flex flex-col gap-4 px-4 pb-8 pt-4 md:px-6">
          {/* Busca */}
          <div className="relative">
            <label htmlFor="busca-categoria" className="sr-only">Buscar categoria</label>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#4A5068]" />
            <input
              ref={buscaRef}
              id="busca-categoria"
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar categoria"
              autoComplete="off"
              className="h-12 w-full rounded-xl border-[1.5px] border-[#D5D8E6] bg-white pl-11 pr-12 text-base text-[#0E1024] placeholder:text-[#6B7280] focus:border-onda-blue focus:outline-none focus:ring-2 focus:ring-onda-blue/20 [&::-webkit-search-cancel-button]:hidden"
            />
            {busca && (
              <button
                type="button"
                onClick={limparBusca}
                aria-label="Limpar busca"
                className="absolute right-0.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-[#4A5068] hover:bg-[#F3F4F8]"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            )}
          </div>

          {erro ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#ECEDF3] bg-white px-5 py-8 text-center">
              <p className="text-sm text-[#4A5068]">Não foi possível carregar.</p>
              <button
                type="button"
                onClick={carregar}
                className="h-11 rounded-xl border-[1.5px] border-onda-blue px-4 text-[15px] font-semibold text-onda-blue"
              >
                Tentar de novo
              </button>
            </div>
          ) : !categorias ? (
            <div className="overflow-hidden rounded-2xl border border-[#ECEDF3] bg-white">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex min-h-14 items-center border-b border-[#ECEDF3] px-4 last:border-b-0">
                  <Skeleton className="h-4 w-48" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm text-[#4A5068]">
                <span aria-live="polite">
                  {filtradas.length} {filtradas.length === 1 ? 'categoria' : 'categorias'}
                </span>
                <span>Ordem: mais empresas</span>
              </div>

              {filtradas.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#ECEDF3] bg-white px-5 py-8 text-center">
                  <p className="font-bold text-[#0E1024]">Nenhuma categoria encontrada</p>
                  {busca && (
                    <button
                      type="button"
                      onClick={limparBusca}
                      className="h-11 rounded-xl border-[1.5px] border-onda-blue px-4 text-[15px] font-semibold text-onda-blue"
                    >
                      Limpar busca
                    </button>
                  )}
                </div>
              ) : (
                <ul aria-label="Categorias de empresas" className="overflow-hidden rounded-2xl border border-[#ECEDF3] bg-white">
                  {filtradas.map((c) => (
                    <li key={c.id} className="border-b border-[#ECEDF3] last:border-b-0">
                      <Link
                        href={`/empresas?categoria=${c.id}`}
                        aria-label={`${c.nome}, ${c.total} ${c.total === 1 ? 'empresa' : 'empresas'}`}
                        className="flex min-h-14 items-center gap-3 px-4 py-2 transition-colors hover:bg-[#F8F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-onda-blue/40"
                      >
                        <span className="min-w-0 flex-1 text-[15px] font-semibold text-[#0E1024]">{c.nome}</span>
                        <span aria-hidden="true" className="inline-flex h-[26px] min-w-[26px] items-center justify-center rounded-full bg-[#E8E9F4] px-2 text-[13px] font-bold text-onda-blue">
                          {c.total}
                        </span>
                        <ChevronRight aria-hidden="true" className="h-5 w-5 shrink-0 text-[#5B6478]" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
