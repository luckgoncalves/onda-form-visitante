'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Drawer, DrawerClose, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import type { OrdemLista, PeriodoLista } from '@/lib/chamados-lista-estado';
import { PRIORIDADE_SELO } from './chamado-card';
import { MinisterioSelect, MinisterioSelectHandle } from './ministerio-select';

export type OpcoesFolha = { ordem: OrdemLista; prioridades: string[]; dias: PeriodoLista; ministerioId: string };

export const OPCOES_PADRAO: OpcoesFolha = { ordem: 'prioridade', prioridades: [], dias: 0, ministerioId: '' };

const ORDENS: { valor: OrdemLista; label: string }[] = [
  { valor: 'prioridade', label: 'Prioridade mais alta primeiro' },
  { valor: 'recentes', label: 'Mais recentes' },
  { valor: 'antigos', label: 'Mais antigos' },
];

const PERIODOS: { valor: PeriodoLista; label: string }[] = [
  { valor: 0, label: 'Qualquer data' },
  { valor: 7, label: 'Últimos 7 dias' },
  { valor: 30, label: 'Últimos 30 dias' },
];

const ROTULO = 'mb-2.5 text-[13px] font-semibold text-[#5B6478]';
const CHIP =
  'inline-flex h-10 items-center gap-1.5 rounded-[20px] border px-3.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue/40';
const CHIP_ATIVO = 'border-onda-blue bg-[#E9EBFB] font-semibold text-onda-blue';
const CHIP_INATIVO = 'border-[#E3E6EF] bg-white font-medium text-[#0E1024]';

type Props = {
  aberta: boolean;
  onAbertaChange: (aberta: boolean) => void;
  aplicadas: OpcoesFolha;
  onAplicar: (opcoes: OpcoesFolha) => void;
  /** Total de chamados que a combinação traz (consulta da página) */
  contar: (opcoes: OpcoesFolha) => Promise<number | null>;
  /** Botão que abriu a folha: recebe o foco de volta ao fechar */
  origemRef: React.RefObject<HTMLButtonElement | null>;
  /** Ministérios do filtro; a seção só aparece com 2 ou mais */
  ministerios: { id: string; nome: string }[];
};

export function FiltrarOrdenarSheet({ aberta, onAbertaChange, aplicadas, onAplicar, contar, origemRef, ministerios }: Props) {
  const [rascunho, setRascunho] = useState<OpcoesFolha>(aplicadas);
  const [total, setTotal] = useState<number | null>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const corpoRef = useRef<HTMLDivElement>(null);
  const ministerioRef = useRef<MinisterioSelectHandle>(null);

  // Ao abrir, parte do que está aplicado (mudanças não aplicadas são descartadas ao fechar)
  useEffect(() => {
    if (aberta) setRascunho(aplicadas);
  }, [aberta]); // eslint-disable-line react-hooks/exhaustive-deps

  // "Ver N chamados" acompanha cada mudança
  useEffect(() => {
    if (!aberta) return;
    let ativo = true;
    setTotal(null);
    contar(rascunho).then((n) => ativo && setTotal(n));
    return () => {
      ativo = false;
    };
  }, [aberta, rascunho, contar]);

  const alternarPrioridade = (p: string) =>
    setRascunho((r) => ({
      ...r,
      prioridades: r.prioridades.includes(p) ? r.prioridades.filter((x) => x !== p) : [...r.prioridades, p],
    }));

  return (
    <Drawer open={aberta} onOpenChange={onAbertaChange} noBodyStyles>
      <DrawerContent
        hideCloseButton
        overlayClassName="bg-[rgba(12,14,40,0.48)]"
        className="flex max-h-[92dvh] flex-col gap-0 rounded-t-[20px] border-0 p-0 shadow-[0_-12px_32px_rgba(12,14,40,0.18)] motion-reduce:transition-none"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          tituloRef.current?.focus();
        }}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          origemRef.current?.focus();
        }}
        // Esc fecha primeiro a lista de ministério e só depois a folha
        onEscapeKeyDown={(e) => {
          if (ministerioRef.current?.fecharSeAberta()) e.preventDefault();
        }}
      >
        <div aria-hidden="true" className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-[#D5D8E3]" />

        <div className="mt-2 flex shrink-0 items-center justify-between px-4">
          <DrawerTitle ref={tituloRef} tabIndex={-1} className="text-lg font-bold text-[#0E1024] focus:outline-none">
            Filtrar e ordenar
          </DrawerTitle>
          <DrawerClose asChild>
            <button
              type="button"
              aria-label="Fechar"
              className="-mr-2 flex h-11 w-11 items-center justify-center rounded-xl text-[#5B6478] hover:bg-[#F5F6FA]"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </DrawerClose>
        </div>

        {/* Miolo rolável; o rodapé com os botões fica fixo */}
        <div ref={corpoRef} className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <fieldset className="mt-4">
            <legend className={ROTULO}>Ordenar por</legend>
            {ORDENS.map((o) => (
              <label
                key={o.valor}
                className="flex min-h-11 cursor-pointer items-center gap-3 border-b border-[#ECEDF3] last:border-b-0"
              >
                <input
                  type="radio"
                  name="ordem-chamados"
                  value={o.valor}
                  checked={rascunho.ordem === o.valor}
                  onChange={() => setRascunho((r) => ({ ...r, ordem: o.valor }))}
                  className="h-5 w-5 accent-[#11187E]"
                />
                <span className="text-[15px] text-[#0E1024]">{o.label}</span>
              </label>
            ))}
          </fieldset>

          {ministerios.length >= 2 && (
            <div className="mt-4">
              <MinisterioSelect
                ref={ministerioRef}
                ministerios={ministerios}
                valor={rascunho.ministerioId}
                onChange={(id) => setRascunho((r) => ({ ...r, ministerioId: id }))}
                limiteRef={corpoRef}
              />
            </div>
          )}

          <div className="mt-4">
            <p className={ROTULO}>Prioridade</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PRIORIDADE_SELO).map(([valor, config]) => {
                const ativo = rascunho.prioridades.includes(valor);
                const Icon = config.icon;
                return (
                  <button
                    key={valor}
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => alternarPrioridade(valor)}
                    className={cn(CHIP, ativo ? CHIP_ATIVO : CHIP_INATIVO)}
                  >
                    <Icon aria-hidden="true" className="h-4 w-4" />
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4">
            <p className={ROTULO}>Aberto em</p>
            <div className="flex flex-wrap gap-2">
              {PERIODOS.map((p) => {
                const ativo = rascunho.dias === p.valor;
                return (
                  <button
                    key={p.valor}
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => setRascunho((r) => ({ ...r, dias: p.valor }))}
                    className={cn(CHIP, ativo ? CHIP_ATIVO : CHIP_INATIVO)}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        <div className="flex shrink-0 gap-3 border-t border-[#ECEDF3] px-4 pb-[max(34px,env(safe-area-inset-bottom))] pt-3">
          <button
            type="button"
            onClick={() => setRascunho(OPCOES_PADRAO)}
            className="h-[52px] rounded-[14px] border border-[#E3E6EF] bg-white px-5 text-base font-semibold text-[#0E1024] hover:bg-[#F5F6FA]"
          >
            Limpar
          </button>
          <button
            type="button"
            aria-live="polite"
            onClick={() => onAplicar(rascunho)}
            className="h-[52px] flex-1 rounded-[14px] bg-onda-blue px-4 text-base font-bold text-white hover:bg-onda-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue focus-visible:ring-offset-2"
          >
            {total === null ? 'Calculando…' : `Ver ${total} ${total === 1 ? 'chamado' : 'chamados'}`}
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
