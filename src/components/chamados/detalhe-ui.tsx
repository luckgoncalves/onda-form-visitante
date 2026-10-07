'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Drawer, DrawerClose, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

// ─── Status (cores do detalhe) ──────────────────────────────────────────────

export const STATUS_DETALHE: Record<string, { label: string; texto: string; fundo: string; ponto: string }> = {
  PENDENTE: { label: 'Pendente', texto: '#6E4A00', fundo: '#FFF1CC', ponto: '#B7791F' },
  RECEBIDO: { label: 'Recebido', texto: '#1F2BC8', fundo: '#E9EBFB', ponto: '#1F2BC8' },
  EM_ANDAMENTO: { label: 'Em andamento', texto: '#034BBE', fundo: '#E5F4FE', ponto: '#034BBE' },
  CONCLUIDO: { label: 'Concluído', texto: '#1F6B36', fundo: '#E2FBE8', ponto: '#1F6B36' },
  CANCELADO: { label: 'Cancelado', texto: '#4A5068', fundo: '#F1F2F7', ponto: '#5B6478' },
};

export const PRIORIDADE_LABEL: Record<string, string> = { URGENTE: 'Urgente', ALTA: 'Alta', MEDIA: 'Média', BAIXA: 'Baixa' };

// ─── Datas ──────────────────────────────────────────────────────────────────

/** dd/mm/aaaa às HH:mm (sem segundos) */
export function dataHora(valor: string | Date) {
  const d = new Date(valor);
  return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

/** dd/mm às HH:mm */
export function diaMesHora(valor: string | Date) {
  const d = new Date(valor);
  return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

/** "2026-10-12" ou ISO → dd/mm/aaaa, sem deslocar o dia pelo fuso */
export function dataSemFuso(valor: string) {
  const [ano, mes, dia] = valor.slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

// ─── Avatar (iniciais ou foto) ──────────────────────────────────────────────

export function Avatar({ nome, foto, tamanho }: { nome: string; foto?: string | null; tamanho: 24 | 28 }) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  const iniciais = ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
  const classe = tamanho === 28 ? 'h-7 w-7' : 'h-6 w-6';
  if (foto) return <img src={foto} alt="" aria-hidden="true" className={cn(classe, 'shrink-0 rounded-full object-cover')} />;
  return (
    <span aria-hidden="true" className={cn(classe, 'flex shrink-0 items-center justify-center rounded-full bg-[#E9EBFB] text-[11px] font-bold text-onda-blue')}>
      {iniciais || '?'}
    </span>
  );
}

// ─── Folha base ─────────────────────────────────────────────────────────────

type FolhaBaseProps = {
  aberta: boolean;
  onAbertaChange: (aberta: boolean) => void;
  titulo: string;
  origemRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
};

function FolhaBase({ aberta, onAbertaChange, titulo, origemRef, children }: FolhaBaseProps) {
  const tituloRef = useRef<HTMLHeadingElement>(null);
  return (
    <Drawer open={aberta} onOpenChange={onAbertaChange} noBodyStyles>
      <DrawerContent
        hideCloseButton
        overlayClassName="bg-[rgba(12,14,40,0.48)]"
        className="flex max-h-[85dvh] flex-col gap-0 rounded-t-[20px] border-0 p-0 pb-[max(24px,env(safe-area-inset-bottom))] shadow-[0_-12px_32px_rgba(12,14,40,0.18)]"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          tituloRef.current?.focus();
        }}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          origemRef.current?.focus();
        }}
      >
        <div aria-hidden="true" className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-[#D5D8E3]" />
        <div className="flex shrink-0 items-center justify-between px-4 pt-2">
          <DrawerTitle ref={tituloRef} tabIndex={-1} className="text-lg font-bold text-[#0E1024] focus:outline-none">
            {titulo}
          </DrawerTitle>
          <DrawerClose asChild>
            <button type="button" aria-label="Fechar" className="-mr-2 flex h-11 w-11 items-center justify-center rounded-xl text-[#5B6478] hover:bg-[#F5F6FA]">
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </DrawerClose>
        </div>
        {children}
      </DrawerContent>
    </Drawer>
  );
}

// ─── Folha de opções (status, prioridade, responsável) ─────────────────────

export type Opcao = { valor: string; label: string; icone?: React.ReactNode };

type FolhaOpcoesProps = Omit<FolhaBaseProps, 'children'> & {
  legenda: string;
  opcoes: Opcao[];
  valor: string;
  /** Escolher salva e fecha; escolher a opção atual só fecha */
  onEscolher: (valor: string) => void;
  /** Mostra uma busca no topo (lista de pessoas grande) */
  comBusca?: boolean;
};

function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export function FolhaOpcoes({ legenda, opcoes, valor, onEscolher, comBusca, ...base }: FolhaOpcoesProps) {
  const [busca, setBusca] = useState('');
  useEffect(() => {
    if (!base.aberta) setBusca('');
  }, [base.aberta]);

  const termo = normalizar(busca);
  const visiveis = useMemo(
    () => opcoes.filter((o) => !termo || !o.valor || normalizar(o.label).includes(termo)),
    [opcoes, termo]
  );

  return (
    <FolhaBase {...base}>
      {comBusca && (
        <div className="relative mx-4 mt-3 shrink-0">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#5B6478]" />
          <input
            type="search"
            aria-label="Buscar pessoa"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar pessoa"
            className="h-11 w-full rounded-[10px] border border-[#E3E6EF] bg-[#F8F9FC] pl-10 pr-3 text-base text-[#0E1024] placeholder:text-[15px] placeholder:text-[#5B6478] focus:border-onda-blue focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
        </div>
      )}
      <fieldset className="mt-2 min-h-0 flex-1 overflow-y-auto px-4">
        <legend className="sr-only">{legenda}</legend>
        {visiveis.map((op) => {
          const atual = op.valor === valor;
          return (
            <label key={op.valor || 'nenhum'} className="flex min-h-[52px] cursor-pointer items-center gap-3 border-b border-[#ECEDF3] last:border-b-0">
              {op.icone}
              <span className={cn('min-w-0 flex-1 truncate text-[15px] text-[#0E1024]', atual ? 'font-semibold' : 'font-medium')}>
                {op.label}
              </span>
              <input
                type="radio"
                name={legenda}
                checked={atual}
                onChange={() => onEscolher(op.valor)}
                onClick={() => atual && onEscolher(op.valor)}
                className="h-5 w-5 shrink-0 accent-[#11187E]"
              />
            </label>
          );
        })}
        {visiveis.length === 0 && <p className="py-4 text-sm text-[#5B6478]">Nenhuma pessoa encontrada</p>}
      </fieldset>
    </FolhaBase>
  );
}

// ─── Folha da previsão de conclusão ─────────────────────────────────────────

type FolhaPrevisaoProps = Omit<FolhaBaseProps, 'children' | 'titulo'> & {
  valor: string; // 'aaaa-mm-dd' ou ''
  onEscolher: (valor: string) => void; // '' remove
};

export function FolhaPrevisao({ valor, onEscolher, ...base }: FolhaPrevisaoProps) {
  const [data, setData] = useState(valor);
  useEffect(() => {
    if (base.aberta) setData(valor);
  }, [base.aberta, valor]);

  return (
    <FolhaBase {...base} titulo="Previsão de conclusão">
      <div className="px-4 pt-4">
        <label htmlFor="previsao-data" className="mb-2 block text-[13px] font-semibold text-[#5B6478]">Data</label>
        <input
          id="previsao-data"
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="h-12 w-full rounded-xl border border-[#E3E6EF] bg-white px-3.5 text-base text-[#0E1024] focus:border-onda-blue focus:outline-none"
        />
        <div className="mt-5 flex gap-3">
          {valor && (
            <button
              type="button"
              onClick={() => onEscolher('')}
              className="h-[52px] rounded-[14px] border border-[#E3E6EF] bg-white px-4 text-base font-semibold text-[#B42318]"
            >
              Remover previsão
            </button>
          )}
          <button
            type="button"
            disabled={!data}
            onClick={() => onEscolher(data)}
            className="h-[52px] flex-1 rounded-[14px] bg-onda-blue px-4 text-base font-bold text-white disabled:bg-[#D5D8E3]"
          >
            Definir previsão
          </button>
        </div>
      </div>
    </FolhaBase>
  );
}
