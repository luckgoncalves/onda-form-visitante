import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuth, checkIsAdmin } from '@/app/actions';
import { randomBytes } from 'crypto';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/forms/[id]/duplicate - Duplicate an existing form
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

    const existingForm = await prisma.form.findUnique({
      where: { id },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!existingForm) {
      return NextResponse.json(
        { error: 'Formulário não encontrado' },
        { status: 404 }
      );
    }

    const publicToken = randomBytes(9).toString('base64url');
    const privateToken = randomBytes(12).toString('base64url');

    const duplicatedForm = await prisma.form.create({
      data: {
        title: `${existingForm.title} (cópia)`,
        description: existingForm.description,
        status: 'DRAFT',
        visibility: existingForm.visibility,
        requireAuth: existingForm.requireAuth,
        emailEnabled: existingForm.emailEnabled,
        emailSubject: existingForm.emailSubject,
        emailBody: existingForm.emailBody,
        expiresAt: existingForm.expiresAt,
        campusId: existingForm.campusId,
        publicToken,
        privateToken,
        createdById: user.id,
        fields: {
          create: existingForm.fields.map((field) => ({
            label: field.label,
            type: field.type,
            required: field.required,
            placeholder: field.placeholder,
            helpText: field.helpText,
            options: field.options as any,
            order: field.order,
          })),
        },
      },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json(duplicatedForm, { status: 201 });
  } catch (error) {
    console.error('Error duplicating form:', error);
    return NextResponse.json(
      { error: 'Erro ao duplicar formulário' },
      { status: 500 }
    );
  }
}
