import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuth } from '@/app/actions';
import { z } from 'zod';
import { calcularTroca, podeEditarModeloChecklist } from '@/lib/checklist';

const updateTopicoSchema = z.union([
  z.object({ titulo: z.string().trim().min(1, 'Título é obrigatório').max(191) }),
  z.object({ mover: z.enum(['cima', 'baixo']) }),
]);

// PATCH /api/checklist/modelo/topicos/[id] — renomeia ou move o tópico
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await checkAuth();
    if (!(await podeEditarModeloChecklist(user))) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const body = updateTopicoSchema.parse(await request.json());
    const existe = await prisma.checklistTopico.findUnique({ where: { id: params.id }, select: { id: true } });
    if (!existe) return NextResponse.json({ error: 'Tópico não encontrado' }, { status: 404 });

    if ('titulo' in body) {
      await prisma.checklistTopico.update({ where: { id: params.id }, data: { titulo: body.titulo } });
    } else {
      const topicos = await prisma.checklistTopico.findMany({
        orderBy: [{ ordem: 'asc' }, { createdAt: 'asc' }],
        select: { id: true },
      });
      const novaOrdem = calcularTroca(topicos, params.id, body.mover);
      if (novaOrdem) {
        await prisma.$transaction(
          novaOrdem.map(({ id, ordem }) => prisma.checklistTopico.update({ where: { id }, data: { ordem } }))
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 });
    }
    console.error('Erro ao atualizar tópico do checklist:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE /api/checklist/modelo/topicos/[id] — remove o tópico e seus itens
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await checkAuth();
    if (!(await podeEditarModeloChecklist(user))) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    await prisma.checklistTopico.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Erro ao excluir tópico do checklist:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
