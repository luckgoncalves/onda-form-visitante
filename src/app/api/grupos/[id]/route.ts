import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Schema de validação para atualização de grupo
const updateGrupoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').optional(),
  categoria: z.enum(['HOMENS', 'UNVT', 'MULHERES', 'MISTO', 'NEW', 'CASAIS']).optional(),
  diaSemana: z.enum(['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO']).optional(),
  horario: z.string().min(1, 'Horário é obrigatório').optional(),
  bairroId: z.string().optional(),
  lideresIds: z.array(z.string()).optional(),
});

// GET /api/grupos/[id] - Buscar grupo específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const grupo = await prisma.grupo.findUnique({
      where: { id },
      include: {
        bairro: {
          select: {
            id: true,
            nome: true,
          },
        },
        lideres: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!grupo) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(grupo);
  } catch (error) {
    console.error('Erro ao buscar grupo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/grupos/[id] - Atualizar grupo
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const validatedData = updateGrupoSchema.parse(body);

    // Verificar se o grupo existe
    const grupoExistente = await prisma.grupo.findUnique({
      where: { id },
    });

    if (!grupoExistente) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      );
    }

    const resultado = await prisma.$transaction(async (tx) => {
      // Atualizar o grupo
      const grupo = await tx.grupo.update({
        where: { id },
        data: {
          nome: validatedData.nome,
          categoria: validatedData.categoria,
          diaSemana: validatedData.diaSemana,
          horario: validatedData.horario,
          bairroId: validatedData.bairroId,
          lideres: validatedData.lideresIds ? {
            set: validatedData.lideresIds.map(id => ({ id }))
          } : undefined,
        },
        include: {
          bairro: {
            select: {
              id: true,
              nome: true,
            },
          },
          lideres: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return grupo;
    });

    return NextResponse.json(resultado);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao atualizar grupo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/grupos/[id] - Remover grupo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Verificar se o grupo existe
    const grupoExistente = await prisma.grupo.findUnique({
      where: { id },
    });

    if (!grupoExistente) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      );
    }

    await prisma.grupo.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Grupo removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover grupo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 