import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateMinisterioSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').optional(),
  descricao: z.string().optional(),
  campusId: z.string().optional(),
  liderId: z.string().min(1, 'Líder é obrigatório').optional(),
  coLiderId: z.string().nullable().optional(),
  membrosIds: z.array(z.string()).optional(),
});

// GET /api/ministerios/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ministerio = await prisma.ministerio.findUnique({
      where: { id: params.id },
      include: {
        lider: { select: { id: true, name: true, email: true } },
        coLider: { select: { id: true, name: true, email: true } },
        membros: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!ministerio) {
      return NextResponse.json({ error: 'Ministério não encontrado' }, { status: 404 });
    }

    return NextResponse.json(ministerio);
  } catch (error) {
    console.error('Erro ao buscar ministério:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT /api/ministerios/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateMinisterioSchema.parse(body);

    const existente = await prisma.ministerio.findUnique({ where: { id: params.id } });
    if (!existente) {
      return NextResponse.json({ error: 'Ministério não encontrado' }, { status: 404 });
    }

    const ministerio = await prisma.$transaction(async (tx) => {
      // Atualizar membros: deletar todos e recriar
      if (validatedData.membrosIds !== undefined) {
        await tx.userMinisterio.deleteMany({ where: { ministerioId: params.id } });
        if (validatedData.membrosIds.length > 0) {
          await tx.userMinisterio.createMany({
            data: validatedData.membrosIds.map((userId) => ({
              userId,
              ministerioId: params.id,
            })),
          });
        }
      }

      return tx.ministerio.update({
        where: { id: params.id },
        data: {
          nome: validatedData.nome,
          descricao: validatedData.descricao,
          campusId: validatedData.campusId,
          liderId: validatedData.liderId,
          coLiderId: validatedData.coLiderId,
        },
        include: {
          lider: { select: { id: true, name: true, email: true } },
          coLider: { select: { id: true, name: true, email: true } },
          membros: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });
    });

    revalidatePath('/dashboard/ministerios');

    return NextResponse.json(ministerio);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 });
    }
    console.error('Erro ao atualizar ministério:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE /api/ministerios/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existente = await prisma.ministerio.findUnique({ where: { id: params.id } });
    if (!existente) {
      return NextResponse.json({ error: 'Ministério não encontrado' }, { status: 404 });
    }

    await prisma.ministerio.delete({ where: { id: params.id } });

    revalidatePath('/dashboard/ministerios');

    return NextResponse.json({ message: 'Ministério removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover ministério:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
