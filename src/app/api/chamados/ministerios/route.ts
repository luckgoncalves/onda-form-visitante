import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuth } from '@/app/actions';

export const dynamic = 'force-dynamic';

// GET /api/chamados/ministerios — ministérios do filtro da lista de chamados (ordem alfabética).
// Admin: todos. Demais: ministérios da pessoa com a página Chamados liberada
// (ou sem configuração de páginas, cujo menu padrão já inclui Chamados).
export async function GET() {
  try {
    const { user } = await checkAuth();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const ministerios =
      user.role === 'admin'
        ? (await prisma.ministerio.findMany({ select: { id: true, nome: true } })).map((m) => ({ id: m.id, nome: m.nome.trim() }))
        : user.ministeriosNav
            .filter((m) => m.paginasHabilitadas.length === 0 || m.paginasHabilitadas.includes('/chamados'))
            .map((m) => ({ id: m.id, nome: m.nome }));

    ministerios.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    return NextResponse.json({ ministerios });
  } catch (error) {
    console.error('Erro ao listar ministérios dos chamados:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
