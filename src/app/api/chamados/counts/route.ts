import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuth } from '@/app/actions';
import { lerFiltros, whereChamados } from '@/lib/chamados-filtros';

// GET /api/chamados/counts?escopo=meus|ministerio&search=&prioridade=&dias=
export async function GET(request: NextRequest) {
  try {
    const { user } = await checkAuth();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    // Contagem por status: respeita escopo, busca e filtros, mas não o próprio status
    const where = whereChamados(user, lerFiltros(new URL(request.url).searchParams), false);

    const groups = await prisma.chamado.groupBy({
      by: ['status'],
      where,
      _count: { _all: true },
    });

    const counts: Record<string, number> = {
      PENDENTE: 0, RECEBIDO: 0, EM_ANDAMENTO: 0, CONCLUIDO: 0, CANCELADO: 0,
    };
    let total = 0;
    for (const g of groups) {
      counts[g.status] = g._count._all;
      total += g._count._all;
    }
    counts[''] = total;

    return NextResponse.json(counts);
  } catch (error) {
    console.error('Erro ao buscar contagens:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
