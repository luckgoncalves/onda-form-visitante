import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const createCampoSchema = z.object({
  label: z.string().min(1, 'Label é obrigatório'),
  tipo: z.enum(['TEXTO', 'TEXTAREA', 'SELECT', 'MULTISELECT', 'ANEXO']),
  opcoes: z.array(z.string()).nullable().optional(),
  obrigatorio: z.boolean().default(false),
  ordem: z.number().int().default(0),
});

// GET /api/ministerios/[id]/campos
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const campos = await prisma.campoMinisterio.findMany({
      where: { ministerioId: params.id },
      orderBy: { ordem: 'asc' },
    });
    return NextResponse.json(campos);
  } catch (error) {
    console.error('Erro ao buscar campos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST /api/ministerios/[id]/campos
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ministerio = await prisma.ministerio.findUnique({ where: { id: params.id } });
    if (!ministerio) return NextResponse.json({ error: 'Ministério não encontrado' }, { status: 404 });

    const body = await request.json();
    const validated = createCampoSchema.parse(body);

    // Auto ordem se não fornecida
    if (!validated.ordem) {
      const last = await prisma.campoMinisterio.findFirst({
        where: { ministerioId: params.id },
        orderBy: { ordem: 'desc' },
      });
      validated.ordem = (last?.ordem ?? -1) + 1;
    }

    const campo = await prisma.campoMinisterio.create({
      data: {
        ministerioId: params.id,
        label: validated.label,
        tipo: validated.tipo,
        opcoes: validated.opcoes ? validated.opcoes : undefined,
        obrigatorio: validated.obrigatorio,
        ordem: validated.ordem,
      },
    });

    return NextResponse.json(campo, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 });
    }
    console.error('Erro ao criar campo:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
