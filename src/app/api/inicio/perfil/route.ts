import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuth } from '@/app/actions';

// Depende do usuário logado (cookie): nunca pré-renderizar nem cachear
export const dynamic = 'force-dynamic';

// GET /api/inicio/perfil — o que falta no perfil do usuário logado (telefone, foto, empresa)
export async function GET() {
  try {
    const { user } = await checkAuth();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const dados = await prisma.users.findUnique({
      where: { id: user.id },
      select: { phone: true, profileImageUrl: true, _count: { select: { empresas: true } } },
    });
    if (!dados) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

    const faltando: ('phone' | 'photo' | 'company')[] = [];
    if (!dados.phone?.trim()) faltando.push('phone');
    if (!dados.profileImageUrl?.trim()) faltando.push('photo');
    if (dados._count.empresas === 0) faltando.push('company');

    return NextResponse.json({ faltando });
  } catch (error) {
    console.error('Erro ao verificar perfil:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
