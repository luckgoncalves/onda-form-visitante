import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuth, checkIsAdmin } from '@/app/actions';
import { z } from 'zod';

// GET /api/campus - Listar todos os campus ativos
export async function GET(request: NextRequest) {
  try {
    const campus = await prisma.campus.findMany({
      where: { ativo: true },
      select: {
        id: true,
        nome: true,
        cidade: true,
        estado: true,
      },
      orderBy: { nome: 'asc' }
    });

    return NextResponse.json(campus);
  } catch (error) {
    console.error('Erro ao listar campus:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Schema para criar campus
const createCampusSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres'),
});

// POST /api/campus - Criar novo campus (apenas admin)
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação e permissão
    const { isAuthenticated } = await checkAuth();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { isAdmin } = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem criar campus.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createCampusSchema.parse(body);

    // Verificar se já existe campus com mesma cidade/estado
    const existingCampus = await prisma.campus.findUnique({
      where: {
        cidade_estado: {
          cidade: validatedData.cidade,
          estado: validatedData.estado.toUpperCase(),
        }
      }
    });

    if (existingCampus) {
      return NextResponse.json(
        { error: 'Já existe um campus nesta cidade/estado' },
        { status: 400 }
      );
    }

    const campus = await prisma.campus.create({
      data: {
        nome: validatedData.nome,
        cidade: validatedData.cidade,
        estado: validatedData.estado.toUpperCase(),
      }
    });

    return NextResponse.json(campus, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao criar campus:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
