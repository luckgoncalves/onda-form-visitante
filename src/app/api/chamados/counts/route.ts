import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { checkAuth } from '@/app/actions';

// GET /api/chamados/counts?meus=true
export async function GET(request: NextRequest) {
  try {
    const { user } = await checkAuth();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const meus = new URL(request.url).searchParams.get('meus') === 'true';
    const isAdmin = user.role === 'admin';

    let where: Prisma.ChamadoWhereInput;

    if (isAdmin) {
      where = user.campusId ? { campusId: user.campusId } : {};
    } else if (meus) {
      where = { abertoPorId: user.id };
    } else {
      where = {
        OR: [
          { abertoPorId: user.id },
          {
            ministerio: {
              OR: [
                { liderId: user.id },
                { coLiderId: user.id },
                { membros: { some: { userId: user.id } } },
              ],
            },
          },
        ],
      };
    }

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
