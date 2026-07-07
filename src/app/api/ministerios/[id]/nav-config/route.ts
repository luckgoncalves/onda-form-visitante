import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuth } from '@/app/actions';
import { z } from 'zod';

const updateNavConfigSchema = z.object({
  paginaInicial: z.string().min(1, 'Página inicial é obrigatória'),
  paginasHabilitadas: z.array(z.string()),
});

// GET /api/ministerios/[id]/nav-config
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await checkAuth();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const ministerio = await prisma.ministerio.findUnique({ where: { id: params.id } });
    if (!ministerio) {
      return NextResponse.json({ error: 'Ministério não encontrado' }, { status: 404 });
    }

    const navConfig = await (prisma as any).ministerioNavConfig.findUnique({
      where: { ministerioId: params.id },
    });

    if (!navConfig) {
      return NextResponse.json({
        paginaInicial: '/register',
        paginasHabilitadas: [],
      });
    }

    return NextResponse.json({
      paginaInicial: navConfig.paginaInicial,
      paginasHabilitadas: Array.isArray(navConfig.paginasHabilitadas)
        ? navConfig.paginasHabilitadas
        : JSON.parse(navConfig.paginasHabilitadas as string || '[]'),
    });
  } catch (error) {
    console.error('Erro ao buscar nav config:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT /api/ministerios/[id]/nav-config
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await checkAuth();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const ministerio = await prisma.ministerio.findUnique({ where: { id: params.id } });
    if (!ministerio) {
      return NextResponse.json({ error: 'Ministério não encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const validated = updateNavConfigSchema.parse(body);

    const navConfig = await (prisma as any).ministerioNavConfig.upsert({
      where: { ministerioId: params.id },
      update: {
        paginaInicial: validated.paginaInicial,
        paginasHabilitadas: validated.paginasHabilitadas,
      },
      create: {
        ministerioId: params.id,
        paginaInicial: validated.paginaInicial,
        paginasHabilitadas: validated.paginasHabilitadas,
      },
    });

    return NextResponse.json({
      paginaInicial: navConfig.paginaInicial,
      paginasHabilitadas: Array.isArray(navConfig.paginasHabilitadas)
        ? navConfig.paginasHabilitadas
        : JSON.parse(navConfig.paginasHabilitadas as string || '[]'),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 });
    }
    console.error('Erro ao salvar nav config:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
