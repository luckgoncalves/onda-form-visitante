import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { formSchema } from '@/lib/validations/form';
import { checkAuth, checkIsAdmin } from '@/app/actions';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/forms/[id] - Get a single form
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const form = await prisma.form.findUnique({
      where: { id },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { responses: true },
        },
      },
    });

    if (!form) {
      return NextResponse.json(
        { error: 'Formulário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error('Error fetching form:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar formulário' },
      { status: 500 }
    );
  }
}

// PUT /api/forms/[id] - Update a form
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    const validationResult = formSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Validation error:', JSON.stringify(validationResult.error.errors, null, 2));
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { fields, ...formData } = validationResult.data;

    // Check if form exists
    const existingForm = await prisma.form.findUnique({
      where: { id },
      include: { fields: true },
    });

    if (!existingForm) {
      return NextResponse.json(
        { error: 'Formulário não encontrado' },
        { status: 404 }
      );
    }

    // Prepare form data, converting null/empty strings to null for optional fields
    const updateData: any = {
      title: formData.title,
      description: formData.description || null,
      status: formData.status,
      visibility: formData.visibility,
      requireAuth: formData.requireAuth,
      emailEnabled: formData.emailEnabled,
      emailSubject: formData.emailEnabled ? (formData.emailSubject || null) : null,
      emailBody: formData.emailEnabled ? (formData.emailBody || null) : null,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : null,
    };

    // Update form and fields in a transaction
    const form = await prisma.$transaction(async (tx) => {
      // Delete existing fields
      await tx.formField.deleteMany({
        where: { formId: id },
      });

      // Update form and create new fields
      return tx.form.update({
        where: { id },
        data: {
          ...updateData,
          fields: {
            create: fields.map((field, index) => ({
              label: field.label,
              type: field.type,
              required: field.required,
              placeholder: field.placeholder || null,
              helpText: field.helpText || null,
              options: field.options || null,
              order: field.order ?? index,
            })),
          },
        },
        include: {
          fields: {
            orderBy: { order: 'asc' },
          },
        },
      });
    });

    return NextResponse.json(form);
  } catch (error) {
    console.error('Error updating form:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar formulário' },
      { status: 500 }
    );
  }
}

// DELETE /api/forms/[id] - Delete a form
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Check if form exists
    const existingForm = await prisma.form.findUnique({
      where: { id },
    });

    if (!existingForm) {
      return NextResponse.json(
        { error: 'Formulário não encontrado' },
        { status: 404 }
      );
    }

    // Delete form (cascade will delete fields, responses, and answers)
    await prisma.form.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting form:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir formulário' },
      { status: 500 }
    );
  }
}
