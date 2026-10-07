'use client';

import { forwardRef, useEffect, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Ministerio = { id: string; nome: string };

type Props = {
  ministerios: Ministerio[];
  valor: string; // '' = todos
  onChange: (id: string) => void;
  /** Elemento que delimita o espaço disponível (a folha), para decidir abrir para cima ou para baixo */
  limiteRef: React.RefObject<HTMLElement | null>;
};

export type MinisterioSelectHandle = {
  /** Fecha a lista se estiver aberta; devolve true se fechou (para o Esc da folha) */
  fecharSeAberta: () => boolean;
};

const ALTURA_MAX = 330;

function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** Lista suspensa de escolha única com busca, aberta por cima das seções seguintes da folha */
export const MinisterioSelect = forwardRef<MinisterioSelectHandle, Props>(function MinisterioSelect(
  { ministerios, valor, onChange, limiteRef },
  ref
) {
  const [aberta, setAberta] = useState(false);
  const [busca, setBusca] = useState('');
  const [paraCima, setParaCima] = useState(false);
  const campoRef = useRef<HTMLButtonElement>(null);
  const buscaRef = useRef<HTMLInputElement>(null);
  const painelRef = useRef<HTMLDivElement>(null);
  const listaId = useId();
  const rotuloId = useId();

  const termo = normalizar(busca);
  const opcoes = useMemo(() => {
    const filtrados = ministerios.filter((m) => !termo || normalizar(m.nome).includes(termo));
    // Com texto digitado, "Todos os ministérios" some
    return termo ? filtrados : [{ id: '', nome: 'Todos os ministérios' }, ...filtrados];
  }, [ministerios, termo]);

  const fechar = (devolverFoco = true) => {
    setAberta(false);
    setBusca('');
    if (devolverFoco) campoRef.current?.focus();
  };

  useImperativeHandle(ref, () => ({
    fecharSeAberta: () => {
      if (!aberta) return false;
      fechar();
      return true;
    },
  }));

  // Abre para cima quando não há espaço abaixo do campo
  useLayoutEffect(() => {
    if (!aberta || !campoRef.current || !limiteRef.current) return;
    const campo = campoRef.current.getBoundingClientRect();
    const limite = limiteRef.current.getBoundingClientRect();
    const abaixo = limite.bottom - campo.bottom;
    const acima = campo.top - limite.top;
    setParaCima(abaixo < Math.min(ALTURA_MAX, 60 + opcoes.length * 44) && acima > abaixo);
  }, [aberta]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tocar fora da lista (e do campo) fecha sem mudar a escolha
  useEffect(() => {
    if (!aberta) return;
    const aoTocar = (e: PointerEvent) => {
      const alvo = e.target as Node;
      if (painelRef.current?.contains(alvo) || campoRef.current?.contains(alvo)) return;
      fechar(false);
    };
    document.addEventListener('pointerdown', aoTocar, true);
    return () => document.removeEventListener('pointerdown', aoTocar, true);
  }, [aberta]); // eslint-disable-line react-hooks/exhaustive-deps

  const escolher = (id: string) => {
    onChange(id);
    fechar();
  };

  const opcoesDom = () => Array.from(painelRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? []);
  const focarOpcao = (indice: number) => {
    const lista = opcoesDom();
    if (lista.length) lista[Math.max(0, Math.min(indice, lista.length - 1))].focus();
  };

  const navegar = (e: React.KeyboardEvent) => {
    const lista = opcoesDom();
    const atual = lista.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focarOpcao(atual + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (atual <= 0) buscaRef.current?.focus();
      else focarOpcao(atual - 1);
    }
  };

  const nomeAtual = ministerios.find((m) => m.id === valor)?.nome ?? 'Todos os ministérios';
  const qtd = opcoes.filter((o) => o.id).length;

  return (
    <div className="relative">
      <p id={rotuloId} className="mb-2.5 text-[13px] font-semibold text-[#5B6478]">Ministério</p>
      <button
        ref={campoRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={aberta}
        aria-labelledby={`${rotuloId} ${rotuloId}-valor`}
        onClick={() => (aberta ? fechar() : setAberta(true))}
        onKeyDown={(e) => {
          if (aberta && e.key === 'ArrowDown') {
            e.preventDefault();
            focarOpcao(0);
          }
        }}
        className={cn(
          'flex h-12 w-full items-center gap-2 rounded-xl border bg-white pl-3.5 pr-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue/30',
          aberta ? 'border-onda-blue' : 'border-[#E3E6EF]'
        )}
      >
        <span id={`${rotuloId}-valor`} className="min-w-0 flex-1 truncate text-[15px] font-medium text-[#0E1024]">
          {nomeAtual}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn('h-5 w-5 shrink-0 transition-transform', aberta ? 'rotate-180 text-onda-blue' : 'text-[#5B6478]')}
        />
      </button>

      {aberta && (
        <div
          ref={painelRef}
          onKeyDown={navegar}
          className={cn(
            'absolute left-0 right-0 z-30 flex max-h-[330px] flex-col rounded-[14px] border border-[#E3E6EF] bg-white p-1.5 shadow-[0_12px_32px_rgba(12,14,40,0.18)]',
            paraCima ? 'bottom-[52px]' : 'top-full mt-1'
          )}
        >
          {/* Busca fixa no topo (o foco não vai para ela ao abrir, para o teclado não subir) */}
          <div className="relative mb-1.5 shrink-0">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#5B6478]" />
            <input
              ref={buscaRef}
              type="search"
              role="combobox"
              aria-controls={listaId}
              aria-expanded
              aria-label="Buscar ministério"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar ministério"
              autoComplete="off"
              className="h-11 w-full rounded-[10px] border border-[#E3E6EF] bg-[#F8F9FC] pl-10 pr-10 text-base text-[#0E1024] placeholder:text-[15px] placeholder:text-[#5B6478] focus:border-onda-blue focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {busca && (
              <button
                type="button"
                aria-label="Limpar busca"
                onClick={() => {
                  setBusca('');
                  buscaRef.current?.focus();
                }}
                className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-[#5B6478]"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            )}
          </div>
          <p aria-live="polite" className="sr-only">
            {qtd} {qtd === 1 ? 'ministério' : 'ministérios'}
          </p>

          {opcoes.length === 0 ? (
            <p className="px-3 py-3 text-sm text-[#5B6478]">Nenhum ministério encontrado</p>
          ) : (
            <ul id={listaId} role="listbox" aria-labelledby={rotuloId} className="min-h-0 overflow-y-auto">
              {opcoes.map((op) => {
                const escolhido = op.id === valor;
                return (
                  <li
                    key={op.id || 'todos'}
                    role="option"
                    aria-selected={escolhido}
                    tabIndex={-1}
                    onClick={() => escolher(op.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        escolher(op.id);
                      }
                    }}
                    className={cn(
                      'flex min-h-11 cursor-pointer items-center gap-2 rounded-[10px] px-3 text-[15px] outline-none focus:bg-[#F3F4F8]',
                      escolhido ? 'bg-[#E9EBFB] font-semibold text-onda-blue focus:bg-[#E9EBFB]' : 'font-medium text-[#0E1024]'
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{op.nome}</span>
                    {escolhido && <Check aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
});
