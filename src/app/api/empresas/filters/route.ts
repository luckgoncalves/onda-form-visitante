import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EMPRESA_CONTACT_CHANNELS } from '@/types/empresa';

// Desabilitar cache para garantir dados sempre atualizados
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    return NextResponse.json(
      {
        ramos,
        channels: EMPRESA_CONTACT_CHANNELS,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('Erro ao carregar filtros de empresas:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar filtros de empresas' },
      { status: 500 }
    );
  }
}

