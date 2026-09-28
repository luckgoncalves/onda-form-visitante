import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuth } from '@/app/actions';
import { z } from 'zod';
import { podeEditarModeloChecklist } from '@/lib/checklist';

const createItemSchema = z.object({
  texto: z.string().trim().min(1, 'Texto é obrigatório').max(1000),
});

// POST /api/checklist/modelo/topicos/[id]/itens — adiciona item no fim do tópico
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await checkAuth();
    if (!(await podeEditarModeloChecklist(user))) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const { texto } = createItemSchema.parse(await request.json());
    const topico = await prisma.checklistTopico.findUnique({ where: { id: params.id }, select: { id: true } });
    if (!topico) return NextResponse.json({ error: 'Tópico não encontrado' }, { status: 404 });

    const ultimo = await prisma.checklistItem.findFirst({
      where: { topicoId: params.id },
      orderBy: { ordem: 'desc' },
      select: { ordem: true },
    });

    const item = await prisma.checklistItem.create({
      data: { topicoId: params.id, texto, ordem: (ultimo?.ordem ?? -1) + 1 },
      select: { id: true, texto: true, ordem: true },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 });
    }
    console.error('Erro ao criar item do checklist:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
