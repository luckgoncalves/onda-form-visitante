'use client';

import { AlertTriangle, ArrowDown, ChevronsUp, Clock, Equal, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STATUS_CONFIG } from '@/components/chamados/chamado-status-badge';

export const PRIORIDADE_SELO: Record<string, { label: string; icon: LucideIcon; classe: string }> = {
  URGENTE: { label: 'Urgente', icon: AlertTriangle, classe: 'bg-[#B42318] text-white' },
  ALTA: { label: 'Alta', icon: ChevronsUp, classe: 'bg-[#FEECE9] text-[#B42318]' },
  MEDIA: { label: 'Média', icon: Equal, classe: 'bg-[#E9EBFB] text-[#1F2BC8]' },
  BAIXA: { label: 'Baixa', icon: ArrowDown, classe: 'bg-[#F1F2F7] text-[#5B6478]' },
};

export function SeloPrioridade({ prioridade }: { prioridade: string }) {
  const config = PRIORIDADE_SELO[prioridade] ?? PRIORIDADE_SELO.MEDIA;
  const Icon = config.icon;
  return (
    <span className={cn('inline-flex h-6 shrink-0 items-center gap-1 rounded-md pl-1.5 pr-2 text-xs font-semibold', config.classe)}>
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

function SeloStatus({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
  return (
    <span className={cn('inline-flex h-6 shrink-0 items-center rounded-md px-2 text-xs font-medium', config?.class ?? 'bg-gray-100 text-gray-600')}>
      {config?.label ?? status}
    </span>
  );
}

/** "hoje", "ontem", "há N dias" até 30 dias; depois, dd/mm/aaaa */
export function dataRelativa(valor: string | Date) {
  const data = new Date(valor);
  const inicio = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dias = Math.round((inicio(new Date()) - inicio(data)) / 86_400_000);
  if (dias <= 0) return 'hoje';
  if (dias === 1) return 'ontem';
  if (dias <= 30) return `há ${dias} dias`;
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export type ChamadoLista = {
  id: string;
  codigo: string;
  titulo: string;
  status: string;
  prioridade: string;
  ministerio: { nome: string };
  abertoPor: { id: string; name: string; profileImageUrl?: string | null };
  comentarios: { autorId: string }[];
  createdAt: string;
};

const STATUS_FECHADO = new Set(['CONCLUIDO', 'CANCELADO']);

/** Quem precisa responder (último comentário do solicitante = equipe; senão, o solicitante) */
function aguardando(chamado: ChamadoLista, isAdmin: boolean) {
  const ultimo = chamado.comentarios[0];
  if (!ultimo || STATUS_FECHADO.has(chamado.status)) return null;
  if (ultimo.autorId === chamado.abertoPor.id) return 'Aguardando equipe';
  return isAdmin ? 'Aguardando solicitante' : 'Aguardando sua resposta';
}

type Props = {
  chamado: ChamadoLista;
  mostrarStatus: boolean;
  mostrarSolicitante: boolean;
  isAdmin: boolean;
  onAbrir: () => void;
};

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase() || '?';
}

export function ChamadoCard({ chamado, mostrarStatus, mostrarSolicitante, isAdmin, onAbrir }: Props) {
  const quando = dataRelativa(chamado.createdAt);
  const tag = aguardando(chamado, isAdmin);
  const prioridade = (PRIORIDADE_SELO[chamado.prioridade] ?? PRIORIDADE_SELO.MEDIA).label.toLowerCase();
  const statusLabel = STATUS_CONFIG[chamado.status as keyof typeof STATUS_CONFIG]?.label ?? chamado.status;

  // "título, prioridade alta, Manutenção, código CHM-…, aberto por Rodrigo Borges há 3 dias"
  const rotulo = [
    chamado.titulo,
    `prioridade ${prioridade}`,
    ...(mostrarStatus ? [statusLabel] : []),
    chamado.ministerio.nome,
    `código ${chamado.codigo}`,
    mostrarSolicitante ? `aberto por ${chamado.abertoPor.name} ${quando}` : `aberto ${quando}`,
    ...(tag ? [tag] : []),
  ].join(', ');

  const tempo = (
    <span className="inline-flex shrink-0 items-center gap-1 text-[13px] text-[#5B6478]">
      <Clock className="h-3.5 w-3.5" />
      {quando}
    </span>
  );
  const seloAguardando = tag && (
    <span className="inline-flex h-6 shrink-0 items-center rounded-md bg-amber-50 px-2 text-xs font-medium text-amber-800">
      {tag}
    </span>
  );

  return (
    <button
      type="button"
      onClick={onAbrir}
      aria-label={rotulo}
      className="w-full rounded-[14px] border border-[#E3E6EF] bg-white px-3.5 py-3 text-left transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue/40"
    >
      {/* Linha 1 — o quê */}
      <span aria-hidden="true" className="line-clamp-2 text-[15px] font-semibold leading-5 text-[#0E1024]">
        {chamado.titulo}
      </span>

      {/* Linha 2 — classificação: só a etiqueta do ministério trunca */}
      <span aria-hidden="true" className="mt-2 flex items-center gap-2">
        <SeloPrioridade prioridade={chamado.prioridade} />
        {mostrarStatus && <SeloStatus status={chamado.status} />}
        <span className="inline-flex h-6 min-w-0 items-center rounded-md border border-[#E3E6EF] px-2 text-xs font-medium text-[#5B6478]">
          <span className="truncate">{chamado.ministerio.nome}</span>
        </span>
        <span className="ml-auto shrink-0 font-mono text-[11px] text-[#5B6478]">{chamado.codigo}</span>
      </span>

      {/* Linha 3 — quem e quando (no escopo "Meus", só o tempo) */}
      <span aria-hidden="true" className="mt-2.5 flex items-center gap-2">
        {mostrarSolicitante ? (
          <>
            {chamado.abertoPor.profileImageUrl ? (
              <img src={chamado.abertoPor.profileImageUrl} alt="" className="h-5 w-5 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E9EBFB] text-[10px] font-bold text-onda-blue">
                {iniciais(chamado.abertoPor.name)}
              </span>
            )}
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#0E1024]">{chamado.abertoPor.name}</span>
            {seloAguardando}
            {tempo}
          </>
        ) : (
          <>
            {tempo}
            {seloAguardando && <span className="ml-auto">{seloAguardando}</span>}
          </>
        )}
      </span>
    </button>
  );
}

export function ChamadoCardSkeleton() {
  return (
    <div className="rounded-[14px] border border-[#E3E6EF] bg-white px-3.5 py-3">
      <div className="h-4 w-4/5 animate-pulse rounded bg-[#ECEEF6]" />
      <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-[#ECEEF6]" />
      <div className="mt-2 flex gap-2">
        <div className="h-6 w-16 animate-pulse rounded-md bg-[#ECEEF6]" />
        <div className="h-6 w-24 animate-pulse rounded-md bg-[#ECEEF6]" />
      </div>
      <div className="mt-2.5 h-5 w-28 animate-pulse rounded bg-[#ECEEF6]" />
    </div>
  );
}
