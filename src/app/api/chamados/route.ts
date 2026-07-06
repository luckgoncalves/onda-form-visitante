import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuth } from '@/app/actions';
import { z } from 'zod';

const CODIGO_CHARS = 'ABCDEFGHJKLMNPQRTUVWXY0123456789';

async function generateCodigo(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    let code = 'CHM-';
    for (let i = 0; i < 6; i++) {
      code += CODIGO_CHARS[Math.floor(Math.random() * CODIGO_CHARS.length)];
    }
    const exists = await prisma.chamado.findUnique({ where: { codigo: code } });
    if (!exists) return code;
  }
  throw new Error('Não foi possível gerar código único');
}

const createChamadoSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().optional(),
  prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']).default('MEDIA'),
  ministerioId: z.string().min(1, 'Ministério é obrigatório'),
  respostas: z.record(z.string(), z.string()).optional(), // { campoId: valor }
});

// GET /api/chamados
export async function GET(request: NextRequest) {
  try {
    const { user } = await checkAuth();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || '';
    const ministerioId = searchParams.get('ministerioId') || '';
    const meus = searchParams.get('meus') === 'true';
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    const isAdmin = user.role === 'admin';

    // Filtro de visibilidade:
    // - Admin: todos (filtrado por campus se tiver)
    // - Outros: chamados que abriu OU ministérios que pertence (membro, líder, co-líder)
    const visibilityWhere = isAdmin
      ? user.campusId ? { campusId: user.campusId } : {}
      : {
          OR: [
            { abertoPorId: user.id },
            {
              ministerio: {
                OR: [
                  { liderId: user.id },
                  { coLiderId: user.id },
                  { membros: { some: { userId: user.id } } },
                ],
              },
            },
          ],
        };

    const where: Record<string, unknown> = { ...visibilityWhere };
    if (meus) { (where as Record<string, unknown>).abertoPorId = user.id; delete (where as Record<string, unknown>).OR; }
    if (status) where.status = status;
    if (ministerioId) where.ministerioId = ministerioId;
    if (search) {
      where.OR = [
        { titulo: { contains: search, mode: 'insensitive' } },
        { codigo: { contains: search, mode: 'insensitive' } },
        { abertoPor: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [chamados, total] = await Promise.all([
      prisma.chamado.findMany({
        where,
        skip,
        take: limit,
        include: {
          ministerio: { select: { id: true, nome: true } },
          abertoPor: { select: { id: true, name: true, email: true } },
          respostas: {
            include: { campo: { select: { id: true, label: true, tipo: true } } },
          },
          comentarios: {
            orderBy: { createdAt: 'desc' as const },
            take: 1,
            select: { autorId: true },
          },
          _count: { select: { comentarios: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.chamado.count({ where }),
    ]);

    return NextResponse.json({
      chamados,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Erro ao buscar chamados:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST /api/chamados
export async function POST(request: NextRequest) {
  try {
    const { user } = await checkAuth();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const body = await request.json();
    const validated = createChamadoSchema.parse(body);

    const codigo = await generateCodigo();

    const chamado = await prisma.$transaction(async (tx) => {
      const created = await tx.chamado.create({
        data: {
          codigo,
          titulo: validated.titulo,
          descricao: validated.descricao,
          prioridade: validated.prioridade,
          ministerioId: validated.ministerioId,
          abertoPorId: user.id,
          campusId: user.campusId ?? null,
        },
      });

      if (validated.respostas && Object.keys(validated.respostas).length > 0) {
        await tx.chamadoResposta.createMany({
          data: Object.entries(validated.respostas).map(([campoId, valor]) => ({
            chamadoId: created.id,
            campoId,
            valor,
          })),
        });
      }

      return tx.chamado.findUnique({
        where: { id: created.id },
        include: {
          ministerio: { select: { id: true, nome: true } },
          abertoPor: { select: { id: true, name: true } },
          respostas: { include: { campo: true } },
        },
      });
    });

    return NextResponse.json(chamado, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 });
    }
    console.error('Erro ao criar chamado:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
