import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verify } from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { empresaSchema } from '@/lib/validations/empresa';
import { CADASTRO_EMPRESA_TOKEN_PURPOSE } from '@/lib/validations/register';

const bodySchema = z.object({
  token: z.string().min(1),
  empresa: empresaSchema,
});

function textoOuNull(valor?: string) {
  return valor && valor.trim() !== '' ? valor.trim() : null;
}

// POST /api/register/empresa — cadastra empresa para a conta recém-criada (ainda pendente de aprovação).
// Autorizado pelo token de 30 minutos devolvido por /api/register.
export async function POST(request: NextRequest) {
  try {
    const { token, empresa } = bodySchema.parse(await request.json());

    let userId: string;
    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as { userId?: string; purpose?: string };
      if (decoded.purpose !== CADASTRO_EMPRESA_TOKEN_PURPOSE || !decoded.userId) throw new Error();
      userId = decoded.userId;
    } catch {
      return NextResponse.json(
        { error: 'O prazo para cadastrar empresas por aqui expirou. Você pode cadastrar em Meu perfil depois da aprovação.' },
        { status: 401 }
      );
    }

    const user = await prisma.users.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const criada = await prisma.$transaction(async (tx) => {
      const nova = await tx.empresa.create({
        data: {
          nomeNegocio: empresa.nomeNegocio.trim(),
          categoriaId: empresa.categoriaId,
          ramoAtuacao: empresa.ramoAtuacao.trim(),
          detalhesServico: empresa.detalhesServico.trim(),
          whatsapp: empresa.whatsapp,
          email: empresa.email.trim(),
          endereco: textoOuNull(empresa.endereco),
          site: textoOuNull(empresa.site),
          instagram: textoOuNull(empresa.instagram),
          facebook: textoOuNull(empresa.facebook),
          linkedin: textoOuNull(empresa.linkedin),
          logoUrl: textoOuNull(empresa.logoUrl),
        },
        select: { id: true, nomeNegocio: true },
      });
      await tx.userEmpresa.create({ data: { userId, empresaId: nova.id } });
      return nova;
    });

    return NextResponse.json(criada, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 });
    }
    console.error('Erro ao cadastrar empresa no cadastro:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
