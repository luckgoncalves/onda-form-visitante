import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuth, checkIsAdmin } from '@/app/actions';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/forms/[id]/responses - Get all responses for a form
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

    // Check if form exists
    const form = await prisma.form.findUnique({
      where: { id },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!form) {
      return NextResponse.json(
        { error: 'Formulário não encontrado' },
        { status: 404 }
      );
    }

    // Get query params for pagination
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Get responses with answers
    const [responses, total] = await Promise.all([
      prisma.formResponse.findMany({
        where: { formId: id },
        include: {
          answers: {
            include: {
              field: true,
            },
          },
          respondentUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.formResponse.count({
        where: { formId: id },
      }),
    ]);

    return NextResponse.json({
      form: {
        id: form.id,
        title: form.title,
        fields: form.fields,
      },
      responses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar respostas' },
      { status: 500 }
    );
  }
}
