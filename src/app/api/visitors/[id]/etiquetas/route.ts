import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkAuth, checkIsAdmin } from '@/app/actions';
import prisma from '@/lib/prisma';

const updateVisitorEtiquetasSchema = z.object({
  etiquetaIds: z.array(z.string()).default([]),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { isAuthenticated, user } = await checkAuth();
    const { isAdmin } = await checkIsAdmin();

    if (!isAuthenticated || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    if (!user.campusId) {
      return NextResponse.json({ error: 'Usuário sem campus vinculado' }, { status: 400 });
    }

    const body = await request.json();
    const validationResult = updateVisitorEtiquetasSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const visitante = await prisma.visitantes.findUnique({
      where: { id },
      select: {
        id: true,
        campusId: true,
      },
    });

    if (!visitante) {
      return NextResponse.json({ error: 'Visitante não encontrado' }, { status: 404 });
    }

    if (visitante.campusId !== user.campusId) {
      return NextResponse.json(
        { error: 'Este visitante não pertence ao seu campus' },
        { status: 403 }
      );
    }

    const etiquetaIds = Array.from(new Set(validationResult.data.etiquetaIds));

    if (etiquetaIds.length > 0) {
      const etiquetas = await prisma.etiqueta.findMany({
        where: {
          id: {
            in: etiquetaIds,
          },
          campusId: user.campusId,
        },
        select: {
          id: true,
        },
      });

      if (etiquetas.length !== etiquetaIds.length) {
        return NextResponse.json(
          { error: 'Uma ou mais etiquetas são inválidas para este campus' },
          { status: 400 }
        );
      }
    }

    const updatedVisitante = await prisma.visitantes.update({
      where: { id },
      data: {
        etiquetas: {
          set: etiquetaIds.map((etiquetaId) => ({ id: etiquetaId })),
        },
      },
      include: {
        etiquetas: {
          select: {
            id: true,
            nome: true,
            cor: true,
          },
          orderBy: {
            nome: 'asc',
          },
        },
      },
    });

    return NextResponse.json(updatedVisitante);
  } catch (error) {
    console.error('Erro ao atualizar etiquetas do visitante:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar etiquetas do visitante' },
      { status: 500 }
    );
  }
}
