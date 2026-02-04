import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuth, checkIsAdmin } from '@/app/actions';

// GET /api/users/pending - Listar usuários pendentes de aprovação
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const { isAuthenticated } = await checkAuth();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se é administrador
    const { isAdmin } = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem visualizar usuários pendentes.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {
      approved: false, // Apenas usuários não aprovados
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    // Buscar usuários pendentes com suas empresas
    const [usersRaw, total] = await Promise.all([
      prisma.users.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          roleRelation: {
            select: {
              name: true
            }
          },
          approved: true,
          createdAt: true,
          empresas: {
            include: {
              empresa: {
                select: {
                  id: true,
                  nomeNegocio: true,
                  ramoAtuacao: true,
                  email: true,
                  whatsapp: true,
                },
              },
            },
          },
        },
      }),
      prisma.users.count({ where }),
    ]);

    // Mapear para usar o nome da role da relação
    const users = usersRaw.map(user => ({
      ...user,
      role: user.roleRelation?.name || user.role
    }));

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Erro ao listar usuários pendentes:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

