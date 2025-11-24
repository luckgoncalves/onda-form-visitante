import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EMPRESA_CONTACT_CHANNELS } from '@/types/empresa';

export async function GET() {
  try {
    const ramosResult = await prisma.empresa.findMany({
      select: {
        ramoAtuacao: true,
      },
      distinct: ['ramoAtuacao'],
      orderBy: {
        ramoAtuacao: 'asc',
      },
    });

    const ramos = ramosResult
      .map((item) => item.ramoAtuacao?.trim())
      .filter((ramo): ramo is string => Boolean(ramo));

    return NextResponse.json({
      ramos,
      channels: EMPRESA_CONTACT_CHANNELS,
    });
  } catch (error) {
    console.error('Erro ao carregar filtros de empresas:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar filtros de empresas' },
      { status: 500 }
    );
  }
}

