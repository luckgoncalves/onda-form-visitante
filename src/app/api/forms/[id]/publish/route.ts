import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { formStatusUpdateSchema } from '@/lib/validations/form';
import { checkAuth, checkIsAdmin } from '@/app/actions';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/forms/[id]/publish - Update form status (publish/unpublish/close)
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    const body = await request.json();

    // Validate input
    const validationResult = formStatusUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Status inválido', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { status } = validationResult.data;

    // Check if form exists
    const existingForm = await prisma.form.findUnique({
      where: { id },
      include: {
        fields: true,
      },
    });

    if (!existingForm) {
      return NextResponse.json(
        { error: 'Formulário não encontrado' },
        { status: 404 }
      );
    }

    // Validate form has at least one field before publishing
    if (status === 'PUBLISHED' && existingForm.fields.length === 0) {
      return NextResponse.json(
        { error: 'Adicione pelo menos um campo antes de publicar' },
        { status: 400 }
      );
    }

    // Update form status
    const form = await prisma.form.update({
      where: { id },
      data: { status },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json(form);
  } catch (error) {
    console.error('Error updating form status:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar status do formulário' },
      { status: 500 }
    );
  }
}
