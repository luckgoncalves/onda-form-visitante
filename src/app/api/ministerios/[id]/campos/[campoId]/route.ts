import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateCampoSchema = z.object({
  label: z.string().min(1).optional(),
  tipo: z.enum(['TEXTO', 'TEXTAREA', 'SELECT', 'MULTISELECT']).optional(),
  opcoes: z.array(z.string()).nullable().optional(),
  obrigatorio: z.boolean().optional(),
  ordem: z.number().int().optional(),
});

// PUT /api/ministerios/[id]/campos/[campoId]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; campoId: string } }
) {
  try {
    const body = await request.json();
    const validated = updateCampoSchema.parse(body);

    const campo = await prisma.campoMinisterio.update({
      where: { id: params.campoId },
      data: {
        ...validated,
        opcoes: validated.opcoes !== undefined ? (validated.opcoes ?? undefined) : undefined,
      },
    });

    return NextResponse.json(campo);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 });
    }
    console.error('Erro ao atualizar campo:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE /api/ministerios/[id]/campos/[campoId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; campoId: string } }
) {
  try {
    await prisma.campoMinisterio.delete({ where: { id: params.campoId } });
    return NextResponse.json({ message: 'Campo removido' });
  } catch (error) {
    console.error('Erro ao remover campo:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
