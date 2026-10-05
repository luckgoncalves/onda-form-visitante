import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Mesma regra da lista do Hub (/api/empresas): só empresas de donos aprovados
const NO_HUB = { usuarios: { some: { user: { approved: true } } } };

// GET /api/empresas/categorias
// Padrão: categorias com 1+ empresa no Hub, da maior para a menor quantidade (empate: nome).
// ?todas=1: todas as categorias em ordem alfabética (para os formulários de cadastro).
export async function GET(request: NextRequest) {
  try {
    const todas = new URL(request.url).searchParams.get('todas') === '1';

    const [categorias, totalEmpresas] = await Promise.all([
      prisma.categoriaEmpresa.findMany({
        select: { id: true, nome: true, _count: { select: { empresas: { where: NO_HUB } } } },
      }),
      prisma.empresa.count({ where: NO_HUB }),
    ]);

    const lista = categorias
      .map((c) => ({ id: c.id, nome: c.nome, total: c._count.empresas }))
      .filter((c) => todas || c.total > 0)
      .sort((a, b) =>
        todas ? a.nome.localeCompare(b.nome, 'pt-BR') : b.total - a.total || a.nome.localeCompare(b.nome, 'pt-BR')
      );

    return NextResponse.json({ totalEmpresas, categorias: lista });
  } catch (error) {
    console.error('Erro ao listar categorias de empresas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
