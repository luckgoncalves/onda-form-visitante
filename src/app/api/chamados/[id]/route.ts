import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuth } from '@/app/actions';
import { z } from 'zod';

const updateSchema = z.object({
  status: z.enum(['PENDENTE', 'RECEBIDO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO']).optional(),
  prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']).optional(),
  responsavelId: z.string().nullable().optional(),
  previsaoConclusao: z.coerce.date().nullable().optional(),
});

async function getMinisterioMembership(ministerioId: string, userId: string) {
  const ministerio = await prisma.ministerio.findUnique({
    where: { id: ministerioId },
    select: {
      liderId: true,
      coLiderId: true,
      membros: { select: { userId: true } },
    },
  });
  return (
    ministerio?.liderId === userId ||
    ministerio?.coLiderId === userId ||
    ministerio?.membros.some((m) => m.userId === userId) ||
    false
  );
}

// GET /api/chamados/[id]
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await checkAuth();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const chamado = await prisma.chamado.findUnique({
      where: { id: params.id },
      include: {
        ministerio: { select: { id: true, nome: true } },
        abertoPor: { select: { id: true, name: true, email: true } },
        responsavel: { select: { id: true, name: true } },
        respostas: {
          include: { campo: { select: { id: true, label: true, tipo: true, ordem: true } } },
          orderBy: { campo: { ordem: 'asc' } },
        },
        comentarios: {
          include: { autor: { select: { id: true, name: true, profileImageUrl: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!chamado) return NextResponse.json({ error: 'Chamado não encontrado' }, { status: 404 });

    const isAdmin = user.role === 'admin';
    const pertenceAoMinisterio = isAdmin
      ? false
      : await getMinisterioMembership(chamado.ministerioId, user.id);

    if (!isAdmin && chamado.abertoPorId !== user.id && !pertenceAoMinisterio) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    return NextResponse.json({
      ...chamado,
      canManage: isAdmin || pertenceAoMinisterio,
    });
  } catch (error) {
    console.error('Erro ao buscar chamado:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PATCH /api/chamados/[id]
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await checkAuth();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const chamado = await prisma.chamado.findUnique({ where: { id: params.id }, select: { ministerioId: true } });
    if (!chamado) return NextResponse.json({ error: 'Chamado não encontrado' }, { status: 404 });

    const isAdmin = user.role === 'admin';
    const pertenceAoMinisterio = isAdmin
      ? false
      : await getMinisterioMembership(chamado.ministerioId, user.id);

    if (!isAdmin && !pertenceAoMinisterio) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const validated = updateSchema.parse(body);

    const updated = await prisma.chamado.update({
      where: { id: params.id },
      data: {
        status: validated.status,
        prioridade: validated.prioridade,
        responsavelId: validated.responsavelId,
        previsaoConclusao: validated.previsaoConclusao,
      },
      include: {
        ministerio: { select: { id: true, nome: true } },
        abertoPor: { select: { id: true, name: true } },
        responsavel: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 });
    }
    console.error('Erro ao atualizar chamado:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE /api/chamados/[id]
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await checkAuth();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    await prisma.chamado.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'Chamado removido' });
  } catch (error) {
    console.error('Erro ao remover chamado:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
