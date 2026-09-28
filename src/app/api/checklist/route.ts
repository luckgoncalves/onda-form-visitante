import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuth } from '@/app/actions';
import { z } from 'zod';
import {
  CHECKLIST_INSPECAO,
  ChecklistSecaoPreenchida,
  canAccessChecklist,
} from '@/config/checklist-inspecao';

const createChecklistSchema = z.object({
  verificados: z.array(z.string()),
  observacoes: z.record(z.string(), z.string()).optional(),
});

// GET /api/checklist
export async function GET(request: NextRequest) {
  try {
    const { user } = await checkAuth();
    if (!user || !canAccessChecklist(user)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const where = user.campusId ? { campusId: user.campusId } : {};

    const [checklists, total] = await Promise.all([
      prisma.checklistInspecao.findMany({
        where,
        select: {
          id: true,
          totalItens: true,
          itensVerificados: true,
          createdAt: true,
          responsavel: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.checklistInspecao.count({ where }),
    ]);

    return NextResponse.json({
      checklists,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (error) {
    console.error('Erro ao listar checklists:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST /api/checklist
export async function POST(request: NextRequest) {
  try {
    const { user } = await checkAuth();
    if (!user || !canAccessChecklist(user)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createChecklistSchema.parse(body);
    const verificados = new Set(validated.verificados);

    // Monta o snapshot a partir do modelo do servidor, não do texto enviado pelo cliente
    const secoes: ChecklistSecaoPreenchida[] = CHECKLIST_INSPECAO.map((secao) => ({
      id: secao.id,
      titulo: secao.titulo,
      observacoes: validated.observacoes?.[secao.id]?.trim() || '',
      itens: secao.itens.map((item) => ({ ...item, verificado: verificados.has(item.id) })),
    }));

    const todosItens = secoes.flatMap((s) => s.itens);

    const checklist = await prisma.checklistInspecao.create({
      data: {
        responsavelId: user.id,
        campusId: user.campusId,
        secoes,
        totalItens: todosItens.length,
        itensVerificados: todosItens.filter((i) => i.verificado).length,
      },
      select: { id: true },
    });

    return NextResponse.json(checklist, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 });
    }
    console.error('Erro ao salvar checklist:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
