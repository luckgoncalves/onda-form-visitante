import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { checkAuth, checkIsAdmin } from '@/app/actions';

const approveUserSchema = z.object({
  approved: z.boolean(),
});

// PATCH /api/users/[id]/approve - Aprovar ou rejeitar usuário
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const { isAuthenticated } = await checkAuth();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se é administrador
    const { isAdmin } = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem aprovar usuários.' },
        { status: 403 }
      );
    }

    const userId = params.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    // Validar body
    const body = await request.json();
    const { approved } = approveUserSchema.parse(body);

    // Verificar se o usuário existe
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Se aprovado, atualizar status. Se rejeitado, deletar usuário e empresas
    if (approved) {
      const updatedUser = await prisma.users.update({
        where: { id: userId },
        data: { approved },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          approved: true,
          createdAt: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Usuário aprovado com sucesso',
        user: updatedUser,
      });
    } else {
      // Rejeitar = deletar usuário e suas empresas vinculadas
      await prisma.$transaction(async (tx) => {
        // Buscar empresas vinculadas apenas a este usuário
        const userEmpresas = await tx.userEmpresa.findMany({
          where: { userId },
          select: { empresaId: true },
        });

        const empresaIds = userEmpresas.map((ue) => ue.empresaId);

        // Para cada empresa, verificar se tem outros usuários vinculados
        for (const empresaId of empresaIds) {
          const otherUsers = await tx.userEmpresa.count({
            where: {
              empresaId,
              userId: { not: userId },
            },
          });

          // Se não tem outros usuários, deletar a empresa
          if (otherUsers === 0) {
            await tx.empresa.delete({
              where: { id: empresaId },
            });
          }
        }

        // Deletar o usuário (UserEmpresa será deletado em cascade)
        await tx.users.delete({
          where: { id: userId },
        });
      });

      return NextResponse.json({
        success: true,
        message: 'Usuário rejeitado e removido do sistema',
      });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao aprovar/rejeitar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

