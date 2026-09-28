import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuth } from '@/app/actions';
import { z } from 'zod';
import { calcularTroca, podeEditarModeloChecklist } from '@/lib/checklist';

const updateItemSchema = z.union([
  z.object({ texto: z.string().trim().min(1, 'Texto é obrigatório').max(1000) }),
  z.object({ mover: z.enum(['cima', 'baixo']) }),
]);

// PATCH /api/checklist/modelo/itens/[id] — edita o texto ou move o item dentro do tópico
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await checkAuth();
    if (!(await podeEditarModeloChecklist(user))) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const body = updateItemSchema.parse(await request.json());
    const item = await prisma.checklistItem.findUnique({ where: { id: params.id }, select: { topicoId: true } });
    if (!item) return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });

    if ('texto' in body) {
      await prisma.checklistItem.update({ where: { id: params.id }, data: { texto: body.texto } });
    } else {
      const itens = await prisma.checklistItem.findMany({
        where: { topicoId: item.topicoId },
        orderBy: [{ ordem: 'asc' }, { createdAt: 'asc' }],
        select: { id: true },
      });
      const novaOrdem = calcularTroca(itens, params.id, body.mover);
      if (novaOrdem) {
        await prisma.$transaction(
          novaOrdem.map(({ id, ordem }) => prisma.checklistItem.update({ where: { id }, data: { ordem } }))
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 });
    }
    console.error('Erro ao atualizar item do checklist:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE /api/checklist/modelo/itens/[id]
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await checkAuth();
    if (!(await podeEditarModeloChecklist(user))) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    await prisma.checklistItem.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Erro ao excluir item do checklist:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
