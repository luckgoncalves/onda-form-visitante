import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuth } from '@/app/actions';
import { z } from 'zod';

const createSchema = z.object({
  texto: z.string().min(1, 'Comentário não pode ser vazio'),
});

// POST /api/chamados/[id]/comentarios
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await checkAuth();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const chamado = await prisma.chamado.findUnique({ where: { id: params.id } });
    if (!chamado) return NextResponse.json({ error: 'Chamado não encontrado' }, { status: 404 });

    // Pode comentar: admin, quem abriu, ou membro/líder/co-líder do ministério
    if (user.role !== 'admin') {
      const ministerio = await prisma.ministerio.findUnique({
        where: { id: chamado.ministerioId },
        select: {
          liderId: true,
          coLiderId: true,
          membros: { select: { userId: true } },
        },
      });
      const pertenceAoMinisterio =
        ministerio?.liderId === user.id ||
        ministerio?.coLiderId === user.id ||
        ministerio?.membros.some((m) => m.userId === user.id);

      if (chamado.abertoPorId !== user.id && !pertenceAoMinisterio) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
      }
    }

    const body = await request.json();
    const { texto } = createSchema.parse(body);

    const comentario = await prisma.chamadoComentario.create({
      data: { chamadoId: params.id, autorId: user.id, texto },
      include: { autor: { select: { id: true, name: true, profileImageUrl: true } } },
    });

    return NextResponse.json(comentario, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 });
    }
    console.error('Erro ao criar comentário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
