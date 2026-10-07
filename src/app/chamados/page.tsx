'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpDown, Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import { checkAuth } from '@/app/actions';
import { cn } from '@/lib/utils';
import { STATUS_CONFIG } from '@/components/chamados/chamado-status-badge';
import { ChamadoCard, ChamadoCardSkeleton, ChamadoLista } from '@/components/chamados/chamado-card';
import { FiltrarOrdenarSheet, OPCOES_PADRAO, OpcoesFolha } from '@/components/chamados/filtrar-ordenar-sheet';
import {
  ESTADO_PADRAO,
  EstadoListaChamados,
  estadoInicialLista,
  salvarEstadoLista,
} from '@/lib/chamados-lista-estado';

const LIMITE = 30;

const STATUS_CHIPS = [
  { valor: '', label: 'Todos' },
  ...(['PENDENTE', 'RECEBIDO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO'] as const).map((s) => ({
    valor: s,
    label: STATUS_CONFIG[s].label,
  })),
];

// "4 pendentes", "1 recebido", "3 em andamento"…
const STATUS_PLURAL: Record<string, [string, string]> = {
  '': ['chamado', 'chamados'],
  PENDENTE: ['pendente', 'pendentes'],
  RECEBIDO: ['recebido', 'recebidos'],
  EM_ANDAMENTO: ['em andamento', 'em andamento'],
  CONCLUIDO: ['concluído', 'concluídos'],
  CANCELADO: ['cancelado', 'cancelados'],
};

const ORDEM_LABEL = { prioridade: 'Prioridade', recentes: 'Mais recentes', antigos: 'Mais antigos' } as const;

function paramsDe(estado: EstadoListaChamados, busca: string, opcoes?: OpcoesFolha) {
  const o = opcoes ?? estado;
  const params = new URLSearchParams({ escopo: estado.escopo, ordem: o.ordem });
  if (estado.status) params.set('status', estado.status);
  if (busca.trim()) params.set('search', busca.trim());
  if (o.prioridades.length) params.set('prioridade', o.prioridades.join(','));
  if (o.dias) params.set('dias', String(o.dias));
  if (o.ministerioId) params.set('ministerioId', o.ministerioId);
  return params;
}

export default function ChamadosPage() {
  const router = useRouter();
  const [estado, setEstado] = useState<EstadoListaChamados>(estadoInicialLista);
  const [buscaDebounced, setBuscaDebounced] = useState(estado.busca);
  const [usuario, setUsuario] = useState<{ isAdmin: boolean; podeVerMinisterio: boolean } | null>(null);

  const [chamados, setChamados] = useState<ChamadoLista[]>([]);
  const [lista, setLista] = useState<'carregando' | 'erro' | 'pronto'>('carregando');
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState({ page: 1, totalPages: 1 });
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});
  // Ministérios do filtro (a seção só aparece na folha com 2 ou mais)
  const [ministerios, setMinisterios] = useState<{ id: string; nome: string }[]>([]);

  const [folhaAberta, setFolhaAberta] = useState(false);
  const origemFolhaRef = useRef<HTMLButtonElement | null>(null);
  const botaoFiltroRef = useRef<HTMLButtonElement>(null);
  const botaoOrdemRef = useRef<HTMLButtonElement>(null);

  const chipsRef = useRef<HTMLDivElement>(null);
  const [chipsNoFim, setChipsNoFim] = useState(true);
  const requisicaoRef = useRef(0);

  // Pull-to-refresh
  const [puxando, setPuxando] = useState(0);
  const [atualizando, setAtualizando] = useState(false);

  const atualizar = (parcial: Partial<EstadoListaChamados>) => setEstado((e) => ({ ...e, ...parcial }));

  useEffect(() => {
    salvarEstadoLista(estado);
  }, [estado]);

  useEffect(() => {
    checkAuth().then(({ user }) => {
      if (!user) {
        router.push('/');
        return;
      }
      const isAdmin = user.role === 'admin';
      const podeVerMinisterio = isAdmin || user.temMinisterio;
      if (!podeVerMinisterio) setEstado((e) => ({ ...e, escopo: 'meus' }));
      setUsuario({ isAdmin, podeVerMinisterio });
    });
    fetch('/api/chamados/ministerios')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setMinisterios(data.ministerios))
      .catch(() => {});
  }, [router]);

  // Busca: espera 300ms depois da digitação
  useEffect(() => {
    const t = setTimeout(() => setBuscaDebounced(estado.busca), 300);
    return () => clearTimeout(t);
  }, [estado.busca]);

  const carregar = useCallback(
    async (page: number) => {
      const id = ++requisicaoRef.current;
      if (page === 1) setLista('carregando');
      else setCarregandoMais(true);
      try {
        const params = paramsDe(estado, buscaDebounced);
        params.set('page', String(page));
        params.set('limit', String(LIMITE));
        const [resLista, resCounts] = await Promise.all([
          fetch(`/api/chamados?${params}`),
          page === 1 ? fetch(`/api/chamados/counts?${params}`) : Promise.resolve(null),
        ]);
        if (!resLista.ok) throw new Error();
        const data = await resLista.json();
        if (id !== requisicaoRef.current) return;
        setChamados((atual) => (page === 1 ? data.chamados : [...atual, ...data.chamados]));
        setTotal(data.pagination.total);
        setPagina({ page: data.pagination.page, totalPages: data.pagination.totalPages });
        if (resCounts?.ok) setCounts(await resCounts.json());
        setLista('pronto');
      } catch {
        if (id === requisicaoRef.current && page === 1) setLista('erro');
      } finally {
        if (page > 1) setCarregandoMais(false);
      }
    },
    [estado, buscaDebounced]
  );

  useEffect(() => {
    if (usuario) carregar(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario, estado.escopo, estado.status, estado.ordem, estado.prioridades, estado.dias, estado.ministerioId, buscaDebounced]);

  // Total da combinação escolhida na folha (para "Ver N chamados")
  const contarFolha = useCallback(
    async (opcoes: OpcoesFolha) => {
      try {
        const res = await fetch(`/api/chamados/counts?${paramsDe(estado, buscaDebounced, opcoes)}`);
        if (!res.ok) return null;
        const c = await res.json();
        return c[estado.status] ?? 0;
      } catch {
        return null;
      }
    },
    [estado, buscaDebounced]
  );

  // Degradê no fim da fileira de chips enquanto houver mais à direita
  const verificarChips = () => {
    const el = chipsRef.current;
    if (el) setChipsNoFim(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  };
  useEffect(() => {
    verificarChips();
    // O chip selecionado entra na área visível
    chipsRef.current?.querySelector('[aria-pressed="true"]')?.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }, [estado.status, counts]);

  // Pull-to-refresh: puxar a lista para baixo (no topo da página) recarrega
  useEffect(() => {
    let inicio: number | null = null;
    let distancia = 0;
    const onStart = (e: TouchEvent) => {
      inicio = window.scrollY <= 0 && !folhaAberta ? e.touches[0].clientY : null;
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
        await carregar(1);
        setAtualizando(false);
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
  }, [carregar, folhaAberta]);

  const abrirFolha = (origem: HTMLButtonElement | null) => {
    origemFolhaRef.current = origem;
    setFolhaAberta(true);
  };

  const filtrosFolhaAtivos =
    estado.prioridades.length > 0 ||
    estado.dias !== 0 ||
    estado.ordem !== OPCOES_PADRAO.ordem ||
    !!estado.ministerioId;
  const semFiltros = !estado.busca && estado.prioridades.length === 0 && estado.dias === 0 && !estado.ministerioId;
  const semChamadosNoEscopo = lista === 'pronto' && semFiltros && (counts[''] ?? 0) === 0;
  const [singular, pluralTexto] = STATUS_PLURAL[estado.status] ?? STATUS_PLURAL[''];
  const escopoMinisterio = estado.escopo === 'ministerio';

  const limparFiltros = () =>
    atualizar({ status: '', busca: '', ordem: ESTADO_PADRAO.ordem, prioridades: [], dias: 0, ministerioId: '' });

  const novoChamado = () => router.push('/chamados/novo');

  return (
    <div className="mt-[72px] px-4 pb-[88px] pt-3 md:pb-24">
      {/* Pull-to-refresh */}
      {(puxando > 0 || atualizando) && (
        <p role="status" className="py-2 text-center text-xs text-[#5B6478]" style={{ height: atualizando ? 32 : puxando / 2 }}>
          {atualizando ? 'Atualizando…' : puxando > 70 ? 'Solte para atualizar' : 'Puxe para atualizar'}
        </p>
      )}

      {/* 1. Título + escopo */}
      <div className="flex min-h-11 items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-[#0E1024]">Chamados</h1>
        {usuario?.podeVerMinisterio && (
          <div role="group" aria-label="Escopo dos chamados" className="flex rounded-xl bg-[#F1F2F7] p-[3px]">
            {(
              [
                { valor: 'meus', label: 'Meus' },
                { valor: 'ministerio', label: ministerios.length >= 2 ? 'Dos ministérios' : 'Do ministério' },
              ] as const
            ).map((op) => {
              const ativo = estado.escopo === op.valor;
              return (
                <button
                  key={op.valor}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => atualizar({ escopo: op.valor })}
                  className={cn(
                    'h-[38px] whitespace-nowrap rounded-[9px] px-3.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue/40',
                    ativo ? 'bg-white font-semibold text-[#0E1024] shadow-[0_1px_2px_rgba(12,14,40,0.14)]' : 'font-medium text-[#5B6478]'
                  )}
                >
                  {op.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Busca + filtro */}
      <div className="mt-2.5 flex gap-2">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="busca-chamados" className="sr-only">Buscar chamados</label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#5B6478]" />
          <input
            id="busca-chamados"
            type="search"
            value={estado.busca}
            onChange={(e) => atualizar({ busca: e.target.value })}
            // Precisa caber inteiro em 360px de largura
            placeholder={escopoMinisterio ? 'Título, código ou pessoa' : 'Buscar por título ou código'}
            autoComplete="off"
            className={cn(
              'h-11 w-full rounded-xl border border-[#E3E6EF] bg-[#F8F9FC] pl-10 text-base text-[#0E1024] placeholder:text-[15px] placeholder:text-[#5B6478] focus:border-onda-blue focus:outline-none focus:ring-2 focus:ring-onda-blue/20 [&::-webkit-search-cancel-button]:hidden',
              estado.busca ? 'pr-11' : 'pr-3'
            )}
          />
          {estado.busca && (
            <button
              type="button"
              aria-label="Limpar busca"
              onClick={() => atualizar({ busca: '' })}
              className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-[#5B6478]"
            >
              <X aria-hidden="true" className="h-[18px] w-[18px]" />
            </button>
          )}
        </div>
        <button
          ref={botaoFiltroRef}
          type="button"
          aria-label="Filtrar e ordenar"
          aria-expanded={folhaAberta}
          onClick={() => abrirFolha(botaoFiltroRef.current)}
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue/40',
            folhaAberta || filtrosFolhaAtivos
              ? 'border-onda-blue bg-[#E9EBFB] text-onda-blue'
              : 'border-[#E3E6EF] bg-white text-[#0E1024]'
          )}
        >
          <SlidersHorizontal aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>

      {/* 3. Chips de status (rolagem lateral, sangra até a borda direita) */}
      <div className="relative -mr-4 mt-2.5">
        <div
          ref={chipsRef}
          onScroll={verificarChips}
          role="group"
          aria-label="Status"
          className="flex gap-2 overflow-x-auto pr-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {STATUS_CHIPS.map((chip) => {
            const ativo = estado.status === chip.valor;
            return (
              <button
                key={chip.valor || 'todos'}
                type="button"
                aria-pressed={ativo}
                onClick={() => atualizar({ status: chip.valor })}
                className={cn(
                  'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[18px] border px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue/40',
                  ativo ? 'border-onda-blue bg-onda-blue font-semibold text-white' : 'border-[#E3E6EF] bg-white font-medium text-[#0E1024]'
                )}
              >
                {chip.label}
                <span className={ativo ? 'text-[#D5D8F5]' : 'text-[#5B6478]'}>{counts[chip.valor] ?? 0}</span>
              </button>
            );
          })}
        </div>
        {!chipsNoFim && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-r from-transparent to-white" />
        )}
      </div>

      {/* 4. Ordenação */}
      {/* A contagem já aparece no chip de status; fica só para leitor de tela */}
      <div className="mt-3 flex h-6 items-center justify-end">
        <p aria-live="polite" className="sr-only">
          {lista === 'pronto' && `${total} ${total === 1 ? singular : pluralTexto}`}
        </p>
        <button
          ref={botaoOrdemRef}
          type="button"
          onClick={() => abrirFolha(botaoOrdemRef.current)}
          className="-my-2.5 inline-flex min-h-11 items-center gap-1 text-[13px] font-semibold text-onda-blue"
        >
          <ArrowUpDown aria-hidden="true" className="h-4 w-4" />
          {ORDEM_LABEL[estado.ordem]}
        </button>
      </div>

      {/* 5. Lista */}
      <div className="mt-2">
        {lista === 'carregando' ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <ChamadoCardSkeleton key={i} />
            ))}
          </div>
        ) : lista === 'erro' ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="font-medium text-[#0E1024]">Não foi possível carregar os chamados</p>
            <button
              type="button"
              onClick={() => carregar(1)}
              className="h-11 rounded-xl border-[1.5px] border-onda-blue px-4 text-[15px] font-semibold text-onda-blue"
            >
              Tentar de novo
            </button>
          </div>
        ) : semChamadosNoEscopo ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="font-medium text-[#0E1024]">
              {escopoMinisterio ? 'Ainda não há chamados do ministério' : 'Você ainda não abriu nenhum chamado'}
            </p>
            <button
              type="button"
              onClick={novoChamado}
              className="inline-flex h-[52px] items-center gap-2 rounded-[26px] bg-onda-blue px-6 text-[15px] font-semibold text-white"
            >
              <Plus aria-hidden="true" className="h-5 w-5" />
              Novo chamado
            </button>
          </div>
        ) : chamados.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <p className="font-medium text-[#0E1024]">Nenhum chamado encontrado</p>
            <button type="button" onClick={limparFiltros} className="min-h-11 px-3 text-[15px] font-semibold text-onda-blue">
              Limpar filtros
            </button>
          </div>
        ) : (
          <>
            <ul className="space-y-2">
              {chamados.map((c) => (
                <li key={c.id}>
                  <ChamadoCard
                    chamado={c}
                    mostrarStatus={!estado.status}
                    mostrarSolicitante={escopoMinisterio}
                    isAdmin={!!usuario?.isAdmin}
                    onAbrir={() => router.push(`/chamados/${c.id}`)}
                  />
                </li>
              ))}
            </ul>
            {pagina.page < pagina.totalPages && (
              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={() => carregar(pagina.page + 1)}
                  disabled={carregandoMais}
                  className="h-11 rounded-xl border border-[#E3E6EF] bg-white px-4 text-[15px] font-semibold text-[#0E1024] disabled:opacity-60"
                >
                  {carregandoMais ? 'Carregando…' : 'Carregar mais'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 6. Novo chamado (flutuante, 12px acima da barra de navegação) */}
      {!semChamadosNoEscopo && (
        <button
          type="button"
          onClick={novoChamado}
          className="fixed bottom-[calc(76px+env(safe-area-inset-bottom))] right-4 z-40 inline-flex h-[52px] items-center gap-2 rounded-[26px] bg-onda-blue px-5 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(12,14,40,0.24)] transition-colors hover:bg-onda-navy md:bottom-6 md:right-6"
        >
          <Plus aria-hidden="true" className="h-5 w-5" />
          Novo chamado
        </button>
      )}

      {/* 7. Folha "Filtrar e ordenar" */}
      <FiltrarOrdenarSheet
        aberta={folhaAberta}
        onAbertaChange={setFolhaAberta}
        aplicadas={{ ordem: estado.ordem, prioridades: estado.prioridades, dias: estado.dias, ministerioId: estado.ministerioId }}
        ministerios={ministerios}
        onAplicar={(opcoes) => {
          atualizar(opcoes);
          setFolhaAberta(false);
        }}
        contar={contarFolha}
        origemRef={origemFolhaRef}
      />
    </div>
  );
}
