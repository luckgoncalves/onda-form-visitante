import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

// Schema para adicionar empresa existente ao usuário
const addEmpresaSchema = z.object({
  empresaId: z.string().min(1, 'ID da empresa é obrigatório'),
});

// GET /api/users/[id]/empresas - Listar empresas de um usuário
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se o usuário existe
    const user = await prisma.users.findUnique({
      where: { id: params.id }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Buscar empresas do usuário
    const empresas = await prisma.empresa.findMany({
      where: {
        usuarios: {
          some: {
            userId: params.id
          }
        }
      },
      include: {
        usuarios: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      empresas
    });

  } catch (error) {
    console.error('Erro ao buscar empresas do usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/users/[id]/empresas - Adicionar empresa existente ao usuário
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = addEmpresaSchema.parse(body);

    const { empresaId } = validatedData;
    const userId = params.id;

    // Verificar se o usuário existe
    const user = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se a empresa existe
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId }
    });

    if (!empresa) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se o relacionamento já existe
    const existingRelation = await prisma.userEmpresa.findUnique({
      where: {
        userId_empresaId: {
          userId: userId,
          empresaId: empresaId,
        }
      }
    });

    if (existingRelation) {
      return NextResponse.json(
        { error: 'Usuário já está associado a esta empresa' },
        { status: 400 }
      );
    }

    // Criar relacionamento
    await prisma.userEmpresa.create({
      data: {
        userId: userId,
        empresaId: empresaId,
      }
    });

    // Retornar empresa com dados atualizados
    const empresaWithUsers = await prisma.empresa.findUnique({
      where: { id: empresaId },
      include: {
        usuarios: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              }
            }
          }
        }
      }
    });

    return NextResponse.json(empresaWithUsers, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao adicionar empresa ao usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id]/empresas?empresaId=... - Remover empresa do usuário
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresaId');

    if (!empresaId) {
      return NextResponse.json(
        { error: 'ID da empresa é obrigatório' },
        { status: 400 }
      );
    }

    const userId = params.id;

    // Verificar se o relacionamento existe
    const existingRelation = await prisma.userEmpresa.findUnique({
      where: {
        userId_empresaId: {
          userId: userId,
          empresaId: empresaId,
        }
      }
    });

    if (!existingRelation) {
      return NextResponse.json(
        { error: 'Relacionamento não encontrado' },
        { status: 404 }
      );
    }

    // Remover relacionamento
    await prisma.userEmpresa.delete({
      where: {
        userId_empresaId: {
          userId: userId,
          empresaId: empresaId,
        }
      }
    });

    return NextResponse.json(
      { message: 'Empresa removida do usuário com sucesso' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro ao remover empresa do usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 