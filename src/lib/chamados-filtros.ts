import { Prisma } from '@prisma/client';

// Filtros da lista de chamados, compartilhados por /api/chamados e /api/chamados/counts

export const PRIORIDADES = ['URGENTE', 'ALTA', 'MEDIA', 'BAIXA'] as const;
export const STATUS_CHAMADO = ['PENDENTE', 'RECEBIDO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO'] as const;

export type EscopoChamados = 'meus' | 'ministerio';
export type OrdemChamados = 'prioridade' | 'recentes' | 'antigos';

type Usuario = { id: string; role: string; campusId?: string | null };

export type FiltrosChamados = {
  escopo: EscopoChamados;
  status?: string;
  busca?: string;
  prioridades?: string[];
  /** Aberto nos últimos N dias */
  dias?: number;
  ministerioId?: string;
};

export function lerFiltros(searchParams: URLSearchParams): FiltrosChamados {
  // "meus=true" mantém compatibilidade com chamadas antigas
  const escopo: EscopoChamados =
    searchParams.get('escopo') === 'meus' || searchParams.get('meus') === 'true' ? 'meus' : 'ministerio';
  const prioridades = (searchParams.get('prioridade') || '')
    .split(',')
    .map((p) => p.trim())
    .filter((p) => (PRIORIDADES as readonly string[]).includes(p));
  const dias = parseInt(searchParams.get('dias') || '', 10);
  return {
    escopo,
    status: searchParams.get('status') || undefined,
    busca: searchParams.get('search')?.trim() || undefined,
    prioridades: prioridades.length ? prioridades : undefined,
    dias: Number.isFinite(dias) && dias > 0 ? dias : undefined,
    ministerioId: searchParams.get('ministerioId') || undefined,
  };
}

/** Monta o where. `incluirStatus=false` serve para as contagens por status. */
export function whereChamados(user: Usuario, filtros: FiltrosChamados, incluirStatus = true): Prisma.ChamadoWhereInput {
  const and: Prisma.ChamadoWhereInput[] = [];

  if (filtros.escopo === 'meus') {
    and.push({ abertoPorId: user.id });
  } else if (user.role === 'admin') {
    if (user.campusId) and.push({ campusId: user.campusId });
  } else {
    and.push({
      OR: [
        { abertoPorId: user.id },
        {
          ministerio: {
            OR: [{ liderId: user.id }, { coLiderId: user.id }, { membros: { some: { userId: user.id } } }],
          },
        },
      ],
    });
  }

  if (incluirStatus && filtros.status) and.push({ status: filtros.status as Prisma.ChamadoWhereInput['status'] });
  if (filtros.ministerioId) and.push({ ministerioId: filtros.ministerioId });
  if (filtros.prioridades) and.push({ prioridade: { in: filtros.prioridades as (typeof PRIORIDADES)[number][] } });
  if (filtros.dias) and.push({ createdAt: { gte: new Date(Date.now() - filtros.dias * 24 * 60 * 60 * 1000) } });
  if (filtros.busca) {
    // "Meus": título e código · "Do ministério": também o solicitante
    and.push({
      OR: [
        { titulo: { contains: filtros.busca } },
        { codigo: { contains: filtros.busca } },
        ...(filtros.escopo === 'ministerio' ? [{ abertoPor: { name: { contains: filtros.busca } } }] : []),
      ],
    });
  }

  return and.length === 1 ? and[0] : { AND: and };
}

/** Prioridade mais alta primeiro (dentro dela, o mais antigo antes), ou por data */
export function orderByChamados(ordem: string | null): Prisma.ChamadoOrderByWithRelationInput[] {
  if (ordem === 'recentes') return [{ createdAt: 'desc' }];
  if (ordem === 'antigos') return [{ createdAt: 'asc' }];
  // O enum é declarado BAIXA, MEDIA, ALTA, URGENTE: "desc" traz URGENTE primeiro
  return [{ prioridade: 'desc' }, { createdAt: 'asc' }];
}
