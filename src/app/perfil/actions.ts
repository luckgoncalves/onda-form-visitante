'use server';

import bcrypt from 'bcrypt';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { checkAuth } from '@/app/actions';
import { empresaSchema } from '@/lib/validations/empresa';

// Ações do "Meu perfil": todas agem só sobre o usuário logado (id vem da sessão, nunca do cliente).

export type PapelMinisterio = 'lider' | 'colider' | 'membro';

export type PerfilMinisterio = {
  id: string;
  nome: string;
  icone: string | null;
  cor: string | null;
  papel: PapelMinisterio;
  liderNome: string | null;
  // Para calcular a página de entrada no cliente (getEntradaMinisterio)
  paginaInicial: string | null;
  paginasHabilitadas: string[];
  podeSair: boolean;
};

export type PerfilEmpresa = {
  id: string;
  nomeNegocio: string;
  ramoAtuacao: string;
  detalhesServico: string;
  whatsapp: string;
  email: string;
  endereco: string | null;
  site: string | null;
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  logoUrl: string | null;
};

export type MeuPerfil = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  profileImageUrl: string | null;
  dataMembresia: string | null; // "YYYY-MM"
  papelApp: string;
  cidade: string | null;
  ministerios: PerfilMinisterio[];
  empresas: PerfilEmpresa[];
};

type Resultado<T = undefined> = { ok: true; data?: T } | { ok: false; erro: string };

const PAPEIS_APP: Record<string, string> = {
  admin: 'Administrador',
  user: 'Usuário',
  base_pessoal: 'Base Pessoal',
};

async function usuarioLogado() {
  const { user } = await checkAuth();
  return user;
}

export async function getMeuPerfil(): Promise<Resultado<MeuPerfil>> {
  const user = await usuarioLogado();
  if (!user) return { ok: false, erro: 'Não autorizado' };

  const [dados, ministerios, empresas] = await Promise.all([
    prisma.users.findUnique({
      where: { id: user.id },
      select: { phone: true, profileImageUrl: true, dataMembresia: true },
    }),
    prisma.ministerio.findMany({
      where: { id: { in: user.ministeriosNav.map((m) => m.id) } },
      select: { id: true, liderId: true, coLiderId: true, lider: { select: { name: true } } },
    }),
    prisma.empresa.findMany({
      where: { usuarios: { some: { userId: user.id } } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nomeNegocio: true,
        ramoAtuacao: true,
        detalhesServico: true,
        whatsapp: true,
        email: true,
        endereco: true,
        site: true,
        instagram: true,
        facebook: true,
        linkedin: true,
        logoUrl: true,
      },
    }),
  ]);

  const porId = new Map(ministerios.map((m) => [m.id, m]));

  return {
    ok: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: dados?.phone ?? null,
      profileImageUrl: dados?.profileImageUrl ?? null,
      dataMembresia: dados?.dataMembresia ?? null,
      papelApp: PAPEIS_APP[user.role] ?? user.role,
      cidade: user.campusCidade ?? user.campusNome ?? null,
      // Mesma ordem do menu lateral (líder > co-líder > membro)
      ministerios: user.ministeriosNav.map((m) => {
        const extra = porId.get(m.id);
        const papel: PapelMinisterio =
          extra?.liderId === user.id ? 'lider' : extra?.coLiderId === user.id ? 'colider' : 'membro';
        return {
          id: m.id,
          nome: m.nome,
          icone: m.icone,
          cor: m.cor,
          papel,
          liderNome: extra?.lider?.name ?? null,
          paginaInicial: m.paginaInicial,
          paginasHabilitadas: m.paginasHabilitadas,
          podeSair: papel === 'membro',
        };
      }),
      empresas,
    },
  };
}

const dadosSchema = z.object({
  name: z.string().trim().min(3, 'Digite seu nome completo'),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
  dataMembresia: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'Data inválida')
    .optional()
    .or(z.literal('')),
});

export async function salvarMeusDados(input: z.infer<typeof dadosSchema>): Promise<Resultado> {
  const user = await usuarioLogado();
  if (!user) return { ok: false, erro: 'Não autorizado' };

  const parsed = dadosSchema.safeParse(input);
  if (!parsed.success) return { ok: false, erro: parsed.error.errors[0]?.message ?? 'Dados inválidos' };

  const { name, phone, dataMembresia } = parsed.data;
  await prisma.users.update({
    where: { id: user.id },
    data: { name, phone: phone || null, dataMembresia: dataMembresia || null },
  });
  return { ok: true };
}

export async function atualizarMinhaFoto(url: string | null): Promise<Resultado> {
  const user = await usuarioLogado();
  if (!user) return { ok: false, erro: 'Não autorizado' };
  if (url !== null && !z.string().url().safeParse(url).success) return { ok: false, erro: 'URL inválida' };

  await prisma.users.update({ where: { id: user.id }, data: { profileImageUrl: url } });
  return { ok: true };
}

export async function alterarMinhaSenha(input: { senhaAtual: string; novaSenha: string }): Promise<Resultado> {
  const user = await usuarioLogado();
  if (!user) return { ok: false, erro: 'Não autorizado' };
  if (!input.novaSenha || input.novaSenha.length < 6) {
    return { ok: false, erro: 'A nova senha precisa ter pelo menos 6 caracteres' };
  }

  const atual = await prisma.users.findUnique({ where: { id: user.id }, select: { password: true } });
  if (!atual || !(await bcrypt.compare(input.senhaAtual || '', atual.password))) {
    return { ok: false, erro: 'Senha atual incorreta' };
  }

  await prisma.users.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(input.novaSenha, 10), requirePasswordChange: false },
  });
  return { ok: true };
}

/** Sair de um ministério em que é membro (líder e co-líder não saem por aqui). */
export async function sairDoMinisterio(ministerioId: string): Promise<Resultado> {
  const user = await usuarioLogado();
  if (!user) return { ok: false, erro: 'Não autorizado' };

  const { count } = await prisma.userMinisterio.deleteMany({ where: { userId: user.id, ministerioId } });
  if (count === 0) return { ok: false, erro: 'Você não é membro deste ministério' };
  return { ok: true };
}

function textoOuNull(valor?: string) {
  return valor && valor.trim() !== '' ? valor.trim() : null;
}

function dadosEmpresa(empresa: z.infer<typeof empresaSchema>) {
  return {
    nomeNegocio: empresa.nomeNegocio.trim(),
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
  };
}

export async function criarMinhaEmpresa(input: z.infer<typeof empresaSchema>): Promise<Resultado> {
  const user = await usuarioLogado();
  if (!user) return { ok: false, erro: 'Não autorizado' };

  const parsed = empresaSchema.safeParse(input);
  if (!parsed.success) return { ok: false, erro: parsed.error.errors[0]?.message ?? 'Dados inválidos' };

  await prisma.$transaction(async (tx) => {
    const empresa = await tx.empresa.create({ data: dadosEmpresa(parsed.data), select: { id: true } });
    await tx.userEmpresa.create({ data: { userId: user.id, empresaId: empresa.id } });
  });
  return { ok: true };
}

export async function editarMinhaEmpresa(empresaId: string, input: z.infer<typeof empresaSchema>): Promise<Resultado> {
  const user = await usuarioLogado();
  if (!user) return { ok: false, erro: 'Não autorizado' };

  const vinculo = await prisma.userEmpresa.findFirst({ where: { userId: user.id, empresaId }, select: { id: true } });
  if (!vinculo) return { ok: false, erro: 'Empresa não encontrada' };

  const parsed = empresaSchema.safeParse(input);
  if (!parsed.success) return { ok: false, erro: parsed.error.errors[0]?.message ?? 'Dados inválidos' };

  await prisma.empresa.update({ where: { id: empresaId }, data: dadosEmpresa(parsed.data) });
  return { ok: true };
}

export async function excluirMinhaEmpresa(empresaId: string): Promise<Resultado> {
  const user = await usuarioLogado();
  if (!user) return { ok: false, erro: 'Não autorizado' };

  const vinculo = await prisma.userEmpresa.findFirst({ where: { userId: user.id, empresaId }, select: { id: true } });
  if (!vinculo) return { ok: false, erro: 'Empresa não encontrada' };

  await prisma.empresa.delete({ where: { id: empresaId } });
  return { ok: true };
}
