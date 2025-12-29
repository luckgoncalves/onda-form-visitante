import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { EMPRESA_CONTACT_CHANNELS, EmpresaContactChannel } from '@/types/empresa';

// Schema de validação para criar empresa
const createEmpresaSchema = z.object({
  nomeNegocio: z.string().min(1, 'Nome do negócio é obrigatório'),
  ramoAtuacao: z.string().min(1, 'Ramo de atuação é obrigatório'),
  detalhesServico: z.string().min(1, 'Detalhes do serviço são obrigatórios'),
  whatsapp: z.string().min(1, 'WhatsApp é obrigatório'),
  endereco: z.string().optional(),
  site: z.string().url('URL do site inválida').optional().or(z.literal('')),
  instagram: z.string().optional().or(z.literal('')),
  facebook: z.string().optional().or(z.literal('')),
  linkedin: z.string().optional().or(z.literal('')),
  email: z.string().email('Email inválido'),
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
});

// Schema de validação para listar empresas
const listEmpresasSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
  userId: z.string().optional(),
  ramo: z.string().optional(),
  channels: z.string().optional(),
  ownerName: z.string().optional(),
});

// GET /api/empresas - Listar empresas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const validatedParams = listEmpresasSchema.parse(queryParams);

    const { page, limit, search, userId, ramo, channels, ownerName } = validatedParams;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};
    
    if (search) {
      where.OR = [
        { nomeNegocio: { contains: search } },
        { ramoAtuacao: { contains: search } },
        { detalhesServico: { contains: search } },
      ];
    }

    if (ramo) {
      const ramoList = ramo
        .split(',')
        .map(value => value.trim())
        .filter(Boolean);

      if (ramoList.length > 0) {
        where.ramoAtuacao = { in: ramoList };
      }
    }

    if (channels) {
      const selectedChannels = channels
        .split(',')
        .map(value => value.trim())
        .filter((value): value is EmpresaContactChannel =>
          (EMPRESA_CONTACT_CHANNELS as readonly string[]).includes(value)
        );

      if (selectedChannels.length > 0) {
        selectedChannels.forEach(channel => {
          where[channel] = {
            not: null,
          };
        });
      }
    }

    const usuarioWhere: any = {};

    if (userId) {
      usuarioWhere.userId = userId;
    }

    if (ownerName) {
      usuarioWhere.user = {
        name: {
          contains: ownerName,
        },
      };
    }

    if (Object.keys(usuarioWhere).length > 0) {
      where.usuarios = {
        some: usuarioWhere,
      };
    }

    const [empresas, total] = await Promise.all([
      prisma.empresa.findMany({
        where,
        include: {
          usuarios: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.empresa.count({ where }),
    ]);

    return NextResponse.json({
      empresas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao listar empresas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/empresas - Criar nova empresa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createEmpresaSchema.parse(body);

    const { userId, ...empresaData } = validatedData;

    // Verificar se o usuário existe
    const user = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Criar empresa e relacionamento em transação
    const resultado = await prisma.$transaction(async (tx) => {
      // Criar empresa
      const empresa = await tx.empresa.create({
        data: {
          ...empresaData,
          endereco: empresaData.endereco || null,
          site: empresaData.site || null,
          instagram: empresaData.instagram || null,
          facebook: empresaData.facebook || null,
          linkedin: empresaData.linkedin || null,
        }
      });

      // Criar relacionamento com usuário
      await tx.userEmpresa.create({
        data: {
          userId: userId,
          empresaId: empresa.id,
        }
      });

      // Retornar empresa com dados do usuário
      return await tx.empresa.findUnique({
        where: { id: empresa.id },
        include: {
          usuarios: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                }
              }
            }
          }
        }
      });
    });

    return NextResponse.json(resultado, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao criar empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 