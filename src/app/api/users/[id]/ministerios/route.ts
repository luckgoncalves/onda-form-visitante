import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const addMinisterioSchema = z.object({
  ministerioId: z.string().min(1, 'ID do ministério é obrigatório'),
});

// GET /api/users/[id]/ministerios - Listar ministérios do usuário
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.users.findUnique({ where: { id: params.id } });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const ministerios = await prisma.ministerio.findMany({
      where: {
        OR: [
          { membros: { some: { userId: params.id } } },
          { liderId: params.id },
          { coLiderId: params.id },
        ],
      },
      include: {
        lider: { select: { id: true, name: true, email: true } },
        coLider: { select: { id: true, name: true, email: true } },
        membros: { select: { userId: true } },
      },
      orderBy: { nome: 'asc' },
    });

    // Enriquecer com o papel do usuário em cada ministério
    const ministeriosComPapel = ministerios.map((m) => ({
      ...m,
      papel:
        m.liderId === params.id
          ? 'Líder'
          : m.coLiderId === params.id
          ? 'Co-Líder'
          : 'Membro',
    }));

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
      ministerios: ministeriosComPapel,
    });
  } catch (error) {
    console.error('Erro ao buscar ministérios do usuário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST /api/users/[id]/ministerios - Adicionar usuário a um ministério (como membro)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { ministerioId } = addMinisterioSchema.parse(body);
    const userId = params.id;

    const [user, ministerio] = await Promise.all([
      prisma.users.findUnique({ where: { id: userId } }),
      prisma.ministerio.findUnique({ where: { id: ministerioId } }),
    ]);

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }
    if (!ministerio) {
      return NextResponse.json({ error: 'Ministério não encontrado' }, { status: 404 });
    }

    const existing = await prisma.userMinisterio.findUnique({
      where: { userId_ministerioId: { userId, ministerioId } },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Usuário já é membro deste ministério' },
        { status: 400 }
      );
    }

    await prisma.userMinisterio.create({ data: { userId, ministerioId } });

    return NextResponse.json({ message: 'Usuário adicionado ao ministério' }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 });
    }
    console.error('Erro ao adicionar usuário ao ministério:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE /api/users/[id]/ministerios?ministerioId=... - Remover usuário de um ministério
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const ministerioId = searchParams.get('ministerioId');

    if (!ministerioId) {
      return NextResponse.json({ error: 'ID do ministério é obrigatório' }, { status: 400 });
    }

    const userId = params.id;

    const existing = await prisma.userMinisterio.findUnique({
      where: { userId_ministerioId: { userId, ministerioId } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Relacionamento não encontrado' }, { status: 404 });
    }

    await prisma.userMinisterio.delete({
      where: { userId_ministerioId: { userId, ministerioId } },
    });

    return NextResponse.json({ message: 'Usuário removido do ministério com sucesso' });
  } catch (error) {
    console.error('Erro ao remover usuário do ministério:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
