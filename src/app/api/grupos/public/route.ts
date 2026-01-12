import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Desabilitar cache para sempre retornar dados atualizados
export const dynamic = 'force-dynamic';

// GET /api/grupos/public - Listar grupos (público)
export async function GET() {
  try {
    const grupos = await prisma.grupo.findMany({
      select: {
        id: true,
        nome: true,
        categoria: true,
        diaSemana: true,
        horario: true,
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
            phone: true,
          },
        },
      },
      orderBy: [
        { diaSemana: 'asc' },
        { horario: 'asc' },
      ],
    });

    return NextResponse.json({ grupos });
  } catch (error) {
    console.error('Erro ao buscar grupos públicos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 