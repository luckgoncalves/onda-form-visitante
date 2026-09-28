import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuth } from '@/app/actions';
import { z } from 'zod';
import { canAccessChecklist } from '@/config/checklist-inspecao';
import { getModeloChecklist, podeEditarModeloChecklist } from '@/lib/checklist';

const createTopicoSchema = z.object({
  titulo: z.string().trim().min(1, 'Título é obrigatório').max(191),
});

// GET /api/checklist/modelo
export async function GET() {
  try {
    const { user } = await checkAuth();
    if (!user || !canAccessChecklist(user)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const [topicos, podeEditar] = await Promise.all([
      getModeloChecklist(),
      podeEditarModeloChecklist(user),
    ]);

    return NextResponse.json({ topicos, podeEditar });
  } catch (error) {
    console.error('Erro ao buscar modelo do checklist:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST /api/checklist/modelo — cria um tópico no fim da lista
export async function POST(request: NextRequest) {
  try {
    const { user } = await checkAuth();
    if (!(await podeEditarModeloChecklist(user))) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const { titulo } = createTopicoSchema.parse(await request.json());
    const ultimo = await prisma.checklistTopico.findFirst({ orderBy: { ordem: 'desc' }, select: { ordem: true } });

    const topico = await prisma.checklistTopico.create({
      data: { titulo, ordem: (ultimo?.ordem ?? -1) + 1 },
      select: { id: true, titulo: true, ordem: true, itens: { select: { id: true, texto: true, ordem: true } } },
    });

    return NextResponse.json(topico, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 });
    }
    console.error('Erro ao criar tópico do checklist:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
