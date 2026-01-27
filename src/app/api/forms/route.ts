import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { formSchema } from '@/lib/validations/form';
import { checkAuth, checkIsAdmin } from '@/app/actions';
import { nanoid } from 'nanoid';
import { FormStatus } from '@/types/form';

// GET /api/forms - List all forms (admin only)
export async function GET(request: NextRequest) {
  try {
    const { isAuthenticated, user } = await checkAuth();
    const { isAdmin } = await checkIsAdmin();

    if (!isAuthenticated || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as FormStatus | null;
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.title = {
        contains: search,
      };
    }

    const forms = await prisma.form.findMany({
      where,
      include: {
        _count: {
          select: { responses: true },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const formList = forms.map((form) => ({
      id: form.id,
      title: form.title,
      status: form.status,
      visibility: form.visibility,
      responseCount: form._count.responses,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
      publicToken: form.publicToken,
      privateToken: form.privateToken,
    }));

    return NextResponse.json(formList);
  } catch (error) {
    console.error('Error fetching forms:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar formulários' },
      { status: 500 }
    );
  }
}

// POST /api/forms - Create a new form
export async function POST(request: NextRequest) {
  try {
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
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { fields, ...formData } = validationResult.data;

    // Generate tokens
    const publicToken = nanoid(12);
    const privateToken = nanoid(16);

    // Prepare form data, ensuring null values are handled correctly
    const createData: any = {
      title: formData.title,
      description: formData.description || null,
      status: formData.status,
      visibility: formData.visibility,
      requireAuth: formData.requireAuth,
      emailEnabled: formData.emailEnabled,
      emailSubject: formData.emailEnabled ? (formData.emailSubject || null) : null,
      emailBody: formData.emailEnabled ? (formData.emailBody || null) : null,
      publicToken,
      privateToken,
      createdById: user.id,
    };

    // Create form with fields in a transaction
    const form = await prisma.form.create({
      data: {
        ...createData,
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

    return NextResponse.json(form, { status: 201 });
  } catch (error) {
    console.error('Error creating form:', error);
    return NextResponse.json(
      { error: 'Erro ao criar formulário' },
      { status: 500 }
    );
  }
}
