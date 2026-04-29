import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { checkAuth, checkIsAdmin } from '@/app/actions';
import prisma from '@/lib/prisma';

const updateEtiquetaSchema = z.object({
  nome: z.string().trim().min(1, 'Nome é obrigatório').max(50, 'Nome deve ter no máximo 50 caracteres'),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal'),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function getAdminCampus() {
  const { isAuthenticated, user } = await checkAuth();
  const { isAdmin } = await checkIsAdmin();

  if (!isAuthenticated || !user) {
    return { error: NextResponse.json({ error: 'Não autorizado' }, { status: 401 }), user: null };
  }

  if (!isAdmin) {
    return { error: NextResponse.json({ error: 'Acesso negado' }, { status: 403 }), user: null };
  }

  if (!user.campusId) {
    return { error: NextResponse.json({ error: 'Usuário sem campus vinculado' }, { status: 400 }), user: null };
  }

  return { error: null, user, campusId: user.campusId };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await getAdminCampus();
    if (auth.error) return auth.error;
    if (!auth.campusId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const body = await request.json();
    const validationResult = updateEtiquetaSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const existingEtiqueta = await prisma.etiqueta.findFirst({
      where: {
        id,
        campusId: auth.campusId,
      },
    });

    if (!existingEtiqueta) {
      return NextResponse.json(
        { error: 'Etiqueta não encontrada' },
        { status: 404 }
      );
    }

    const etiqueta = await prisma.etiqueta.update({
      where: { id },
      data: validationResult.data,
    });

    return NextResponse.json(etiqueta);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe uma etiqueta com esse nome neste campus' },
        { status: 409 }
      );
    }

    console.error('Erro ao atualizar etiqueta:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar etiqueta' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await getAdminCampus();
    if (auth.error) return auth.error;
    if (!auth.campusId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const existingEtiqueta = await prisma.etiqueta.findFirst({
      where: {
        id,
        campusId: auth.campusId,
      },
    });

    if (!existingEtiqueta) {
      return NextResponse.json(
        { error: 'Etiqueta não encontrada' },
        { status: 404 }
      );
    }

    await prisma.etiqueta.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir etiqueta:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir etiqueta' },
      { status: 500 }
    );
  }
}
