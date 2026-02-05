import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { checkAuth, checkIsAdmin } from '@/app/actions';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { isAuthenticated, user: currentUser } = await checkAuth();
    if (!isAuthenticated || !currentUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { isAdmin } = await checkIsAdmin();
    const canAccess = isAdmin || currentUser.id === userId;
    if (!canAccess) {
      return NextResponse.json({ error: 'Acesso negado a este perfil' }, { status: 403 });
    }

    const user = await prisma.users.findUnique({
      where: {
        id: userId,
      },
      select: { // Select only non-sensitive fields
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        campusId: true,
        roleRelation: {
          select: {
            name: true
          }
        },
        campus: {
          select: {
            id: true,
            nome: true
          }
        },
        dataMembresia: true,
        profileImageUrl: true,
        requirePasswordChange: true, // If this field is relevant for the edit page
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Retornar com role mapeado da relação
    return NextResponse.json({
      ...user,
      role: user.roleRelation?.name || user.role,
      campusNome: user.campus?.nome
    });
  } catch (error) {
    console.error('[API USERS GET]', error);
    // Avoid sending detailed error messages to the client in production
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 