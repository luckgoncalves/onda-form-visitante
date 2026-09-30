import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuth } from '@/app/actions';

// Depende do usuário logado (cookie): nunca pré-renderizar nem cachear
export const dynamic = 'force-dynamic';

// GET /api/inicio/lideres — ministérios e o nome dos líderes, sem nenhum contato.
// Usado no início de quem ainda não participa de um ministério.
export async function GET() {
  try {
    const { user } = await checkAuth();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const ministerios = await prisma.ministerio.findMany({
      where: user.campusId ? { OR: [{ campusId: user.campusId }, { campusId: null }] } : undefined,
      select: {
        id: true,
        nome: true,
        icone: true,
        cor: true,
        lider: { select: { name: true } },
        coLider: { select: { name: true } },
      },
    });

    const resultado = ministerios
      .map((m) => ({
        id: m.id,
        nome: m.nome.trim(),
        icone: m.icone,
        cor: m.cor,
        lideres: [m.lider?.name, m.coLider?.name].filter((n): n is string => !!n),
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

    return NextResponse.json({ ministerios: resultado });
  } catch (error) {
    console.error('Erro ao listar líderes dos ministérios:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
