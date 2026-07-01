import { cn } from '@/lib/utils';

export const STATUS_CONFIG = {
  PENDENTE:     { label: 'Pendente',     class: 'bg-yellow-100 text-yellow-800' },
  RECEBIDO:     { label: 'Recebido',     class: 'bg-blue-100 text-blue-800' },
  EM_ANDAMENTO: { label: 'Em andamento', class: 'bg-purple-100 text-purple-800' },
  CONCLUIDO:    { label: 'Concluído',    class: 'bg-green-100 text-green-800' },
  CANCELADO:    { label: 'Cancelado',    class: 'bg-gray-100 text-gray-600' },
} as const;

export const PRIORIDADE_CONFIG = {
  BAIXA:   { label: 'Baixa',   class: 'bg-gray-100 text-gray-600' },
  MEDIA:   { label: 'Média',   class: 'bg-blue-100 text-blue-700' },
  ALTA:    { label: 'Alta',    class: 'bg-orange-100 text-orange-700' },
  URGENTE: { label: 'Urgente', class: 'bg-red-100 text-red-700' },
} as const;

type Status = keyof typeof STATUS_CONFIG;
type Prioridade = keyof typeof PRIORIDADE_CONFIG;

export function ChamadoStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as Status] ?? { label: status, class: 'bg-gray-100 text-gray-600' };
  return (
    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', config.class)}>
      {config.label}
    </span>
  );
}

export function ChamadoPrioridadeBadge({ prioridade }: { prioridade: string }) {
  const config = PRIORIDADE_CONFIG[prioridade as Prioridade] ?? { label: prioridade, class: 'bg-gray-100 text-gray-600' };
  return (
    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', config.class)}>
      {config.label}
    </span>
  );
}
