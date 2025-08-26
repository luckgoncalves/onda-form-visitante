import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Schema de validação para criação de grupo
const createGrupoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  categoria: z.enum(['HOMENS', 'UNVT', 'MULHERES', 'MISTO', 'NEW', 'CASAIS']),
  diaSemana: z.enum(['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO']),
  horario: z.string().min(1, 'Horário é obrigatório'),
  bairroId: z.string().optional(),
  lideresIds: z.array(z.string()).optional(),
});

// GET /api/grupos - Listar grupos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;



    // Construir filtros de busca inteligente
    const searchTerm = search.trim();
    let searchFilter = {};
    
    if (searchTerm) {
      const conditions = [];
      
      // Busca no nome (string)
      conditions.push({ nome: { contains: searchTerm } });
      
      // Busca na categoria (enum) - busca exata ou parcial
      const categorias = ['HOMENS', 'UNVT', 'MULHERES', 'MISTO', 'NEW', 'CASAIS'];
      const categoriaMatch = categorias.find(cat => 
        cat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        searchTerm.toLowerCase().includes(cat.toLowerCase())
      );
      if (categoriaMatch) {
        conditions.push({ categoria: categoriaMatch });
      }
      
      // Busca no bairro (relação)
      conditions.push({ bairro: { nome: { contains: searchTerm } } });
      
      // Busca nos líderes (relação many-to-many)
      conditions.push({ lideres: { some: { name: { contains: searchTerm } } } });
      
      searchFilter = { OR: conditions };
    }

    const grupos = await prisma.grupo.findMany({
      where: searchFilter,
      skip,
      take: limit,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await prisma.grupo.count({
      where: searchFilter,
    });



    return NextResponse.json({
      grupos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar grupos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/grupos - Criar novo grupo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createGrupoSchema.parse(body);

    const resultado = await prisma.$transaction(async (tx) => {
      // Criar o grupo
      const grupo = await tx.grupo.create({
        data: {
          nome: validatedData.nome,
          categoria: validatedData.categoria,
          diaSemana: validatedData.diaSemana,
          horario: validatedData.horario,
          bairroId: validatedData.bairroId,
          lideres: validatedData.lideresIds ? {
            connect: validatedData.lideresIds.map(id => ({ id }))
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

    return NextResponse.json(resultado, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao criar grupo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 