import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const createMinisterioSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  campusId: z.string().optional(),
  liderId: z.string().min(1, 'Líder é obrigatório'),
  coLiderId: z.string().optional(),
  membrosIds: z.array(z.string()).optional(),
});

// GET /api/ministerios - Listar ministérios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    let searchFilter = {};

    if (search.trim()) {
      searchFilter = {
        OR: [
          { nome: { contains: search.trim() } },
          { lider: { name: { contains: search.trim() } } },
          { coLider: { name: { contains: search.trim() } } },
        ],
      };
    }

    const [ministerios, total] = await Promise.all([
      prisma.ministerio.findMany({
        where: searchFilter,
        skip,
        take: limit,
        include: {
          lider: { select: { id: true, name: true, email: true } },
          coLider: { select: { id: true, name: true, email: true } },
          membros: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.ministerio.count({ where: searchFilter }),
    ]);

    return NextResponse.json({
      ministerios,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar ministérios:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST /api/ministerios - Criar ministério
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createMinisterioSchema.parse(body);

    const ministerio = await prisma.$transaction(async (tx) => {
      const created = await tx.ministerio.create({
        data: {
          nome: validatedData.nome,
          descricao: validatedData.descricao,
          campusId: validatedData.campusId,
          liderId: validatedData.liderId,
          coLiderId: validatedData.coLiderId || null,
          membros: validatedData.membrosIds?.length
            ? {
                create: validatedData.membrosIds.map((userId) => ({ userId })),
              }
            : undefined,
        },
        include: {
          lider: { select: { id: true, name: true, email: true } },
          coLider: { select: { id: true, name: true, email: true } },
          membros: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });
      return created;
    });

    revalidatePath('/dashboard/ministerios');

    return NextResponse.json(ministerio, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 });
    }
    console.error('Erro ao criar ministério:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
