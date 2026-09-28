import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuth } from '@/app/actions';
import { canAccessChecklist } from '@/config/checklist-inspecao';

// GET /api/checklist/[id]
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = await checkAuth();
    if (!user || !canAccessChecklist(user)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const checklist = await prisma.checklistInspecao.findUnique({
      where: { id: params.id },
      include: {
        responsavel: { select: { id: true, name: true } },
        campus: { select: { id: true, nome: true } },
      },
    });

    if (!checklist || (user.campusId && checklist.campusId !== user.campusId)) {
      return NextResponse.json({ error: 'Checklist não encontrado' }, { status: 404 });
    }

    return NextResponse.json(checklist);
  } catch (error) {
    console.error('Erro ao buscar checklist:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
