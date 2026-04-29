import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { checkAuth, checkIsAdmin } from '@/app/actions';
import prisma from '@/lib/prisma';

const etiquetaSchema = z.object({
  nome: z.string().trim().min(1, 'Nome é obrigatório').max(50, 'Nome deve ter no máximo 50 caracteres'),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal'),
});

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

export async function GET(request: NextRequest) {
  try {
    const auth = await getAdminCampus();
    if (auth.error) return auth.error;
    if (!auth.campusId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const search = request.nextUrl.searchParams.get('search')?.trim();

    const etiquetas = await prisma.etiqueta.findMany({
      where: {
        campusId: auth.campusId,
        ...(search && {
          nome: {
            contains: search,
          },
        }),
      },
      orderBy: {
        nome: 'asc',
      },
    });

    return NextResponse.json(etiquetas);
  } catch (error) {
    console.error('Erro ao buscar etiquetas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar etiquetas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAdminCampus();
    if (auth.error) return auth.error;
    if (!auth.campusId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const body = await request.json();
    const validationResult = etiquetaSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const etiqueta = await prisma.etiqueta.create({
      data: {
        nome: validationResult.data.nome,
        cor: validationResult.data.cor,
        campusId: auth.campusId,
      },
    });

    return NextResponse.json(etiqueta, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe uma etiqueta com esse nome neste campus' },
        { status: 409 }
      );
    }

    console.error('Erro ao criar etiqueta:', error);
    return NextResponse.json(
      { error: 'Erro ao criar etiqueta' },
      { status: 500 }
    );
  }
}
