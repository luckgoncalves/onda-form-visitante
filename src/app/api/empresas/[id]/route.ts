import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { checkAuth, checkIsAdmin } from '@/app/actions';

// Schema de validação para atualizar empresa
const updateEmpresaSchema = z.object({
  nomeNegocio: z.string().min(1, 'Nome do negócio é obrigatório').optional(),
  ramoAtuacao: z.string().min(1, 'Ramo de atuação é obrigatório').optional(),
  detalhesServico: z.string().min(1, 'Detalhes do serviço são obrigatórios').optional(),
  whatsapp: z.string().min(1, 'WhatsApp é obrigatório').optional(),
  endereco: z.string().optional(),
  site: z.string().url('URL do site inválida').optional().or(z.literal('')),
  instagram: z.string().optional().or(z.literal('')),
  facebook: z.string().optional().or(z.literal('')),
  linkedin: z.string().optional().or(z.literal('')),
  email: z.string().email('Email inválido').optional(),
});

// GET /api/empresas/[id] - Buscar empresa específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const empresa = await prisma.empresa.findUnique({
      where: { id: params.id },
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

    if (!empresa) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(empresa);

  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/empresas/[id] - Atualizar empresa
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateEmpresaSchema.parse(body);

    // Verificar se a empresa existe
    const empresaExistente = await prisma.empresa.findUnique({
      where: { id: params.id }
    });

    if (!empresaExistente) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Preparar dados para atualização
    const updateData: any = { ...validatedData };
    
    // Tratar campos opcionais
    if ('site' in validatedData) {
      updateData.site = validatedData.site || null;
    }
    if ('instagram' in validatedData) {
      updateData.instagram = validatedData.instagram || null;
    }
    if ('facebook' in validatedData) {
      updateData.facebook = validatedData.facebook || null;
    }
    if ('linkedin' in validatedData) {
      updateData.linkedin = validatedData.linkedin || null;
    }

    // Atualizar empresa
    const empresaAtualizada = await prisma.empresa.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(empresaAtualizada);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao atualizar empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/empresas/[id] - Deletar empresa
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const { isAuthenticated, user } = await checkAuth();
    if (!isAuthenticated || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se a empresa existe e buscar seus proprietários
    const empresaExistente = await prisma.empresa.findUnique({
      where: { id: params.id },
      include: {
        usuarios: {
          select: {
            userId: true,
          }
        }
      }
    });

    if (!empresaExistente) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se o usuário é admin ou proprietário da empresa
    const { isAdmin } = await checkIsAdmin();
    const isOwner = empresaExistente.usuarios.some(userEmpresa => userEmpresa.userId === user.id);

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores ou proprietários podem deletar esta empresa.' },
        { status: 403 }
      );
    }

    // Deletar empresa (cascade vai deletar os relacionamentos)
    await prisma.empresa.delete({
      where: { id: params.id }
    });

    return NextResponse.json(
      { message: 'Empresa deletada com sucesso' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro ao deletar empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 