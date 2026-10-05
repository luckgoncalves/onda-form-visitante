'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Drawer, DrawerClose, DrawerContent, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

export type FiltrosEmpresas = {
  /** Nomes das categorias selecionadas (OU entre si) */
  ramos: string[];
  /** Parte do nome do responsável (E com as categorias) */
  ownerName: string;
};

type Categoria = { id: string; nome: string; total: number };

interface EmpresaFiltersProps {
  selectedRamos: string[];
  ownerName: string;
  /** Busca atual da listagem, para a contagem do botão bater com a lista */
  searchTerm: string;
  onApplyFilters: (filtros: FiltrosEmpresas) => void;
}

function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

const porNome = (a: Categoria, b: Categoria) => a.nome.localeCompare(b.nome, 'pt-BR');
const ROTULO_GRUPO = 'px-1 pb-1 pt-3 text-xs font-bold uppercase tracking-[0.06em] text-[#5B6478]';

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return isDesktop;
}

export function EmpresaFilters({ selectedRamos, ownerName, searchTerm, onApplyFilters }: EmpresaFiltersProps) {
  const isDesktop = useIsDesktop();
  const [open, setOpen] = useState(false);

  // Categorias (com contagem) — as mesmas da seção de categorias da home
  const [categorias, setCategorias] = useState<Categoria[] | null>(null);
  const [erroCategorias, setErroCategorias] = useState(false);

  // Rascunho: só vale para a listagem ao tocar em "Ver N empresas"
  const [marcadas, setMarcadas] = useState<Set<string>>(new Set());
  const [responsavel, setResponsavel] = useState('');
  // Marcadas quando a folha abriu: definem o grupo "Selecionadas" (não reagrupa ao marcar)
  const [selecionadasAoAbrir, setSelecionadasAoAbrir] = useState<Set<string>>(new Set());
  const [buscaCategoria, setBuscaCategoria] = useState('');
  const buscaRef = useRef<HTMLInputElement>(null);

  const [contagem, setContagem] = useState<number | null>(null);
  const [responsavelDebounced, setResponsavelDebounced] = useState('');

  const carregarCategorias = useCallback(async () => {
    setErroCategorias(false);
    setCategorias(null);
    try {
      const res = await fetch('/api/empresas/categorias');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCategorias(data.categorias);
    } catch {
      setErroCategorias(true);
    }
  }, []);

  // Ao abrir: mostra os filtros aplicados na listagem. Fechar sem aplicar descarta o rascunho.
  const abrirFechar = (aberto: boolean) => {
    if (aberto) {
      setMarcadas(new Set(selectedRamos));
      setSelecionadasAoAbrir(new Set(selectedRamos));
      setResponsavel(ownerName);
      setResponsavelDebounced(ownerName);
      setBuscaCategoria('');
      setContagem(null);
      carregarCategorias();
    }
    setOpen(aberto);
  };

  // Responsável: espera ~300ms antes de recalcular
  useEffect(() => {
    const t = setTimeout(() => setResponsavelDebounced(responsavel), 300);
    return () => clearTimeout(t);
  }, [responsavel]);

  // Contagem do botão "Ver N empresas" (mesma consulta da listagem, só o total)
  useEffect(() => {
    if (!open || !categorias) return;
    let ativo = true;
    const ids = categorias.filter((c) => marcadas.has(c.nome)).map((c) => c.id);
    const params = new URLSearchParams({ page: '1', limit: '1' });
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    if (ids.length) params.set('categoria', ids.join(','));
    if (responsavelDebounced.trim()) params.set('ownerName', responsavelDebounced.trim());
    setContagem(null);
    fetch(`/api/empresas?${params}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (ativo && data) setContagem(data.pagination.total);
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, [open, categorias, marcadas, responsavelDebounced, searchTerm]);

  const alternar = (nome: string) => {
    setMarcadas((atual) => {
      const next = new Set(atual);
      if (next.has(nome)) next.delete(nome);
      else next.add(nome);
      return next;
    });
  };

  const limpar = () => {
    setMarcadas(new Set());
    setResponsavel('');
    setResponsavelDebounced('');
  };

  const aplicar = () => {
    onApplyFilters({ ramos: Array.from(marcadas), ownerName: responsavel.trim() });
    setOpen(false);
  };

  // Remover um filtro aplicado pela tag reaplica na hora
  const removerAplicado = (next: Partial<FiltrosEmpresas>) => {
    onApplyFilters({ ramos: next.ramos ?? selectedRamos, ownerName: next.ownerName ?? ownerName });
  };

  const termo = normalizar(buscaCategoria);
  const grupos = useMemo(() => {
    if (!categorias) return [];
    if (termo) {
      const resultado = categorias.filter((c) => normalizar(c.nome).includes(termo));
      const ordenado = [
        ...resultado.filter((c) => marcadas.has(c.nome)).sort(porNome),
        ...resultado.filter((c) => !marcadas.has(c.nome)).sort(porNome),
      ];
      const titulo = `${ordenado.length} ${ordenado.length === 1 ? 'resultado' : 'resultados'} para “${buscaCategoria.trim()}”`;
      return [{ titulo, itens: ordenado }];
    }
    const selecionadas = categorias.filter((c) => selecionadasAoAbrir.has(c.nome)).sort(porNome);
    const demais = categorias.filter((c) => !selecionadasAoAbrir.has(c.nome)).sort(porNome);
    return [
      ...(selecionadas.length ? [{ titulo: 'Selecionadas', itens: selecionadas }] : []),
      { titulo: 'Todas · A–Z', itens: demais },
    ];
  }, [categorias, termo, buscaCategoria, selecionadasAoAbrir, marcadas]);

  const nMarcadas = marcadas.size;
  const semFiltro = nMarcadas === 0 && !responsavel.trim();
  const activeCount = selectedRamos.length + (ownerName ? 1 : 0);
  const textoBotao =
    contagem === null
      ? 'Calculando…'
      : contagem === 0
        ? 'Nenhuma empresa'
        : semFiltro
          ? 'Ver todas as empresas'
          : `Ver ${contagem} ${contagem === 1 ? 'empresa' : 'empresas'}`;

  return (
    // "contents": o botão fica na linha da busca e as tags aplicadas descem para uma linha própria
    <div className="contents">
      <Drawer
        open={open}
        onOpenChange={abrirFechar}
        direction={isDesktop ? 'right' : 'bottom'}
        handleOnly={isDesktop}
        noBodyStyles
      >
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            aria-label={activeCount > 0 ? `Filtros (${activeCount} aplicados)` : 'Filtros'}
            className="h-10 w-auto shrink-0 justify-start gap-2 px-3 border-onda-darkBlue/20 hover:bg-onda-darkBlue/10 hover:border-onda-darkBlue/40 text-onda-darkBlue"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeCount > 0 && (
              <Badge variant="secondary" className="ml-1 bg-onda-darkBlue text-white">
                {activeCount}
              </Badge>
            )}
          </Button>
        </DrawerTrigger>

        <DrawerContent
          side={isDesktop ? 'right' : 'bottom'}
          hideCloseButton
          overlayClassName="bg-[rgba(12,14,40,0.55)]"
          className={cn(
            'flex flex-col gap-0 border-0 bg-white p-0',
            isDesktop ? 'h-full w-[400px] max-w-[100vw] sm:max-w-[400px]' : 'h-[90dvh] rounded-t-[22px]'
          )}
        >
          {!isDesktop && <div aria-hidden="true" className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-[#D5D8E6]" />}

          {/* Cabeçalho */}
          <div className="flex shrink-0 items-center justify-between border-b border-[#ECEDF3] py-2 pl-5 pr-2">
            <DrawerTitle className="text-lg font-bold text-[#0E1024]">Filtrar empresas</DrawerTitle>
            <DrawerClose asChild>
              <button
                type="button"
                aria-label="Fechar filtros"
                className="flex h-11 w-11 items-center justify-center rounded-xl text-[#4A5068] hover:bg-[#F5F6FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue/40"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </DrawerClose>
          </div>

          {/* Corpo (só ele rola) */}
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-5">
            <label htmlFor="filtro-responsavel" className="mb-2 block text-[15px] font-bold text-[#0E1024]">
              Responsável
            </label>
            <input
              id="filtro-responsavel"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              placeholder="Nome do responsável"
              autoComplete="off"
              className="h-12 w-full rounded-xl border-[1.5px] border-[#D5D8E6] bg-white px-3.5 text-base text-[#0E1024] placeholder:text-[#6B7280] focus:border-onda-blue focus:outline-none focus:ring-2 focus:ring-onda-blue/20"
            />

            <fieldset className="mt-6">
              <legend className="mb-2 text-[15px] font-bold text-[#0E1024]">
                Categoria
                {nMarcadas > 0 && (
                  <span className="font-normal text-[#4A5068]">
                    {' '}· {nMarcadas} {nMarcadas === 1 ? 'selecionada' : 'selecionadas'}
                  </span>
                )}
              </legend>

              {/* Busca de categoria: fica fixa no topo enquanto a lista rola */}
              <div className="sticky top-0 z-10 -mx-1 bg-white px-1 py-1">
                <div className="relative">
                  <label htmlFor="filtro-busca-categoria" className="sr-only">Buscar categoria</label>
                  <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#4A5068]" />
                  <input
                    ref={buscaRef}
                    id="filtro-busca-categoria"
                    type="search"
                    value={buscaCategoria}
                    onChange={(e) => setBuscaCategoria(e.target.value)}
                    placeholder="Buscar categoria"
                    autoComplete="off"
                    className={cn(
                      'h-11 w-full rounded-xl border-[1.5px] bg-[#F5F6FA] pl-10 pr-11 text-base text-[#0E1024] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-onda-blue/20 [&::-webkit-search-cancel-button]:hidden',
                      buscaCategoria ? 'border-onda-blue bg-white' : 'border-transparent'
                    )}
                  />
                  {buscaCategoria && (
                    <button
                      type="button"
                      onClick={() => {
                        setBuscaCategoria('');
                        buscaRef.current?.focus();
                      }}
                      aria-label="Limpar busca"
                      className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-[#4A5068]"
                    >
                      <X aria-hidden="true" className="h-[18px] w-[18px]" />
                    </button>
                  )}
                </div>
              </div>

              {erroCategorias ? (
                <div className="mt-4 flex flex-col items-center gap-3 py-6 text-center">
                  <p className="text-sm text-[#4A5068]">Não foi possível carregar as categorias.</p>
                  <button
                    type="button"
                    onClick={carregarCategorias}
                    className="h-11 rounded-xl border-[1.5px] border-onda-blue px-4 text-[15px] font-semibold text-onda-blue"
                  >
                    Tentar de novo
                  </button>
                </div>
              ) : !categorias ? (
                <div className="mt-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex min-h-[52px] items-center gap-3 border-b border-[#ECEDF3] px-1">
                      <Skeleton className="h-[22px] w-[22px] rounded" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
              ) : termo && grupos[0]?.itens.length === 0 ? (
                <div className="mt-4 flex flex-col items-center gap-3 py-6 text-center">
                  <p className="font-bold text-[#0E1024]">Nenhuma categoria encontrada</p>
                  <button
                    type="button"
                    onClick={() => setBuscaCategoria('')}
                    className="h-11 rounded-xl border-[1.5px] border-onda-blue px-4 text-[15px] font-semibold text-onda-blue"
                  >
                    Limpar busca
                  </button>
                </div>
              ) : (
                grupos.map((grupo) => (
                  <div key={grupo.titulo}>
                    <p className={ROTULO_GRUPO}>{grupo.titulo}</p>
                    <ul>
                      {grupo.itens.map((c) => {
                        const marcada = marcadas.has(c.nome);
                        return (
                          <li key={c.id} className="border-b border-[#ECEDF3] last:border-b-0">
                            <label className="flex min-h-[52px] cursor-pointer items-center gap-3 px-1">
                              <input
                                type="checkbox"
                                checked={marcada}
                                onChange={() => alternar(c.nome)}
                                aria-label={`${c.nome}, ${c.total} ${c.total === 1 ? 'empresa' : 'empresas'}`}
                                className="h-[22px] w-[22px] shrink-0 cursor-pointer accent-[#11187E]"
                              />
                              <span className={cn('min-w-0 flex-1 text-[15px] text-[#0E1024]', marcada ? 'font-bold' : 'font-medium')}>
                                {c.nome}
                              </span>
                              <span aria-hidden="true" className="text-sm text-[#4A5068]">{c.total}</span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))
              )}
            </fieldset>
          </div>

          {/* Rodapé */}
          <div className="flex shrink-0 items-center gap-3 border-t border-[#ECEDF3] px-5 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3">
            <button
              type="button"
              onClick={limpar}
              className="h-[52px] shrink-0 rounded-[14px] px-3 text-base font-bold text-onda-blue hover:bg-[#F5F6FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue/40"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={aplicar}
              disabled={contagem === null || contagem === 0}
              aria-live="polite"
              className="h-[52px] flex-1 rounded-[14px] bg-onda-blue px-4 text-base font-bold text-white transition-colors hover:bg-onda-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#C9CDE0]"
            >
              {textoBotao}
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Tags dos filtros aplicados na listagem */}
      {activeCount > 0 && (
        <div className="flex basis-full flex-wrap gap-2">
          {selectedRamos.map((ramo) => (
            <Badge
              key={`ramo-${ramo}`}
              variant="secondary"
              className="gap-1 text-xs bg-onda-darkBlue/10 text-onda-darkBlue border-onda-darkBlue/20"
            >
              {ramo}
              <button
                type="button"
                onClick={() => removerAplicado({ ramos: selectedRamos.filter((r) => r !== ramo) })}
                className="ml-1 hover:opacity-80"
                aria-label={`Remover filtro ${ramo}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {ownerName && (
            <Badge
              key="owner-name"
              variant="secondary"
              className="gap-1 text-xs bg-onda-darkBlue/10 text-onda-darkBlue border-onda-darkBlue/20"
            >
              Responsável: {ownerName}
              <button
                type="button"
                onClick={() => removerAplicado({ ownerName: '' })}
                className="ml-1 hover:opacity-80"
                aria-label="Remover filtro de responsável"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
