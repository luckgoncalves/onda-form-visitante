'use server'
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt'
import { randomBytes } from 'crypto'
import { sign, verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Usa o client compartilhado para não abrir um segundo pool de conexões
const prismaClient = prisma

export const save = async (data: any) => {
  const { user } = await checkAuth();

  const createData: any = {
    ...data,
    estado: data.estado,
    cidade: data.cidade,
    bairro: data.bairro, // Se for Curitiba, será o ID do bairro, caso contrário será o nome digitado
    observacao: data.observacao || '',
    idade: data.idade ? Number(data.idade) : null,
    estado_civil: data.estado_civil || null,
    interesse_em_conhecer: data.interesse_em_conhecer && data.interesse_em_conhecer.length > 0 ? data.interesse_em_conhecer : null,
  };

  if (createData.culto === 'new') {
    createData.responsavel_nome = data.responsavel_nome || null;
    createData.responsavel_telefone = data.responsavel_telefone || null;
  } else {
    createData.responsavel_nome = null;
    createData.responsavel_telefone = null;
  }

  if (user) {
    createData.registeredById = user.id;
    createData.campusId = user.campusId; // Vincular ao campus do usuário
  }

   const visitante = await prisma.visitantes.create({
     data: createData,
   })

   return visitante; // Return the created visitor object
 }

 export const findAll = async () => {
    const { user } = await checkAuth();
    
    return await prisma.visitantes.findMany({
        where: user?.campusId ? { campusId: user.campusId } : undefined,
        orderBy: {
            created_at: 'desc'
        },
        // Removed include to reduce query complexity and improve performance
        // include: {
        //     registeredBy: {
        //         select: {
        //             name: true
        //         }
        //     }
        // }
    });
 }

 export const findAllPaginated = async (page: number = 1, limit: number = 20) => {
    const { user } = await checkAuth();
    const skip = (page - 1) * limit;
    
    const whereClause = user?.campusId ? { campusId: user.campusId } : undefined;
    
    const [visitantes, total] = await Promise.all([
        prisma.visitantes.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy: {
                created_at: 'desc'
            },
            include: {
                registeredBy: {
                    select: {
                        name: true
                    }
                }
            }
        }),
        prisma.visitantes.count({ where: whereClause })
    ]);

    return {
        visitantes,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
        }
    };
 }

 export const getBairrosCuritiba = async () => {
    return await prisma.bairros.findMany({
        where: {
            cidadeId: '4106902'
        },
        orderBy: {
            nome: 'asc'
        },
        select: {
            id: true,
            nome: true
        }
    });
 }

 export async function login(email: string, password: string) {
  // const hashedPassword = await bcrypt.hash(password, 10);

  // Buscar usuário com a relação de role e campus
  const user = await prismaClient.users.findUnique({
    where: { email },
    include: {
      roleRelation: true,
      campus: true
    }
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { success: false as const, message: 'Credenciais inválidas' };
  }

  // Verificar se o usuário está aprovado
  // MySQL retorna booleanos como 1 (true) ou 0 (false)
  // Se o campo approved não existir ainda (usuários antigos), considerar como aprovado
  const userApproved = (user as any).approved;
  
  // Tratar valores do MySQL: 1 = true, 0 = false, undefined/null = true (usuários antigos)
  const isApproved = userApproved === undefined || userApproved === null || userApproved === 1 || userApproved === true;
  
  if (!isApproved) {
    return { success: false as const, message: 'Sua conta ainda não foi aprovada por um administrador. Aguarde a aprovação.' };
  }

  return iniciarSessao(user);
}

type UsuarioSessao = {
  id: string;
  name: string;
  email: string;
  role: string;
  campusId: string | null;
  requirePasswordChange: boolean;
  roleRelation: { name: string } | null;
  campus: { nome: string } | null;
};

// Cria o cookie de sessão. Em logins pelo InPeace a troca de senha local não é exigida.
function iniciarSessao(user: UsuarioSessao, provider?: 'inpeace') {
  // Usar o nome da role da relação, ou fallback para o campo legado
  const roleName = user.roleRelation?.name || user.role;

  const token = sign(
    { userId: user.id, email: user.email, role: roleName, campusId: user.campusId, ...(provider && { provider }) },
    process.env.JWT_SECRET!,
    { expiresIn: '1d' }
  );

  cookies().set('authToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 86400, // 1 day in seconds
    path: '/',
  });

  return {
    success: true as const,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: roleName,
      campusId: user.campusId,
      campusNome: user.campus?.nome,
      requirePasswordChange: provider === 'inpeace' ? false : user.requirePasswordChange,
    },
  };
}

// Lê o nome do usuário do payload do JWT do InPeace, se houver (usado só para exibição)
function nomeDoTokenInpeace(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
    const nome = payload?.name ?? payload?.nome ?? payload?.fullName ?? payload?.full_name;
    return typeof nome === 'string' && nome.trim() ? nome.trim() : null;
  } catch {
    return null;
  }
}

// Primeiro acesso pelo InPeace: cria a conta no app aguardando aprovação de um administrador.
// A senha local é aleatória: a pessoa entra pelo InPeace (ou redefine a senha depois).
async function criarContaPendenteInpeace(email: string, token: string) {
  const mensagem =
    'Conta criada a partir do InPeace! Aguarde a aprovação de um administrador para acessar o app.';

  try {
    const userRole = await prismaClient.role.findUnique({ where: { name: 'user' } });
    await prismaClient.users.create({
      data: {
        name: nomeDoTokenInpeace(token) || email.split('@')[0],
        email,
        password: await bcrypt.hash(randomBytes(32).toString('hex'), 10),
        role: 'user',
        roleId: userRole?.id || null,
        requirePasswordChange: false,
        approved: false,
      },
    });
  } catch (error) {
    // Outra requisição criou a conta ao mesmo tempo: mesma situação, aguardando aprovação
    if (!(error && typeof error === 'object' && 'code' in error && error.code === 'P2002')) {
      console.error('Erro ao criar conta a partir do InPeace:', error);
      return { success: false as const, message: 'Não foi possível criar sua conta. Tente novamente.' };
    }
  }

  return { success: false as const, pendente: true as const, message: mensagem };
}

const INPEACE_LOGIN_URL =
  process.env.INPEACE_LOGIN_URL || 'https://admin.inpeaceapp.com/api/v1/security/login_check';

// Login com e-mail e senha do InPeace: valida as credenciais no InPeace (sem armazená-las)
// e entra na conta do app que tem o mesmo e-mail.
export async function loginWithInpeace(email: string, password: string) {
  const emailNormalizado = email?.trim().toLowerCase();
  if (!emailNormalizado || !password) {
    return { success: false as const, message: 'Informe o e-mail e a senha do InPeace' };
  }

  let res: Response;
  try {
    res = await fetch(INPEACE_LOGIN_URL, {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify({ username: emailNormalizado, password }),
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
  } catch (error) {
    console.error('Erro ao conectar ao InPeace:', error);
    return { success: false as const, message: 'Não foi possível conectar ao InPeace. Tente novamente.' };
  }

  if (res.status === 401) {
    return { success: false as const, message: 'E-mail ou senha do InPeace inválidos' };
  }

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.token) {
    console.error('Resposta inesperada do InPeace:', res.status);
    return { success: false as const, message: 'Não foi possível entrar com o InPeace. Tente novamente.' };
  }

  const user = await prismaClient.users.findUnique({
    where: { email: emailNormalizado },
    include: { roleRelation: true, campus: true },
  });

  if (!user) {
    return criarContaPendenteInpeace(emailNormalizado, data.token);
  }

  if (!user.approved) {
    return { success: false as const, message: 'Sua conta ainda não foi aprovada por um administrador. Aguarde a aprovação.' };
  }

  return iniciarSessao(user, 'inpeace');
}

export async function checkAuth() {
  const authToken = cookies().get('authToken')?.value;

  if (!authToken) {
    return { isAuthenticated: false, user: null };
  }

  try {
    const decoded = verify(authToken, process.env.JWT_SECRET!) as { userId: string, email: string, role: string, campusId?: string, provider?: 'inpeace' };
    
    const user = await prismaClient.users.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        campusId: true,
        approved: true,
        profileImageUrl: true,
        roleRelation: {
          select: {
            name: true
          }
        },
        campus: {
          select: {
            id: true,
            nome: true,
            cidade: true
          }
        },
        requirePasswordChange: true,
        ministeriosLiderados: {
          select: {
            id: true,
            nome: true,
            icone: true,
            cor: true,
            navConfig: {
              select: {
                paginaInicial: true,
                paginasHabilitadas: true,
              }
            }
          },
        },
        ministeriosCoLiderados: {
          select: {
            id: true,
            nome: true,
            icone: true,
            cor: true,
            navConfig: {
              select: {
                paginaInicial: true,
                paginasHabilitadas: true,
              }
            }
          },
        },
        ministerios: {
          select: {
            ministerio: {
              select: {
                id: true,
                nome: true,
                icone: true,
                cor: true,
                navConfig: {
                  select: {
                    paginaInicial: true,
                    paginasHabilitadas: true,
                  }
                }
              }
            }
          },
        },
      }
    });

    if (!user) {
      return { isAuthenticated: false, user: null };
    }

    // Usuário não aprovado: limpa o cookie e trata como não autenticado
    if (!user.approved) {
      cookies().delete('authToken');
      return { isAuthenticated: false, user: null };
    }

    // Usar o nome da role da relação, ou fallback para o campo legado
    const roleName = user.roleRelation?.name || user.role;

    // Merge paginasHabilitadas from all ministries the user belongs to (union)
    // paginaInicial: use the first config found (priority: leader > co-leader > member)
    let ministerioNavConfig: { paginaInicial: string; paginasHabilitadas: string[] } | null = null;

    const parsePages = (raw: unknown): string[] => {
      if (Array.isArray(raw)) return raw as string[];
      try { return JSON.parse((raw as string) || '[]'); } catch { return []; }
    };

    const allConfigs = [
      ...user.ministeriosLiderados.map((m) => m.navConfig),
      ...user.ministeriosCoLiderados.map((m) => m.navConfig),
      ...user.ministerios.map((m) => m.ministerio.navConfig),
    ].filter(Boolean) as { paginaInicial: string; paginasHabilitadas: unknown }[];

    // Páginas liberadas por ministério, para agrupar o menu por ministério
    // Todos os ministérios do usuário (inclusive sem páginas configuradas), na ordem líder > co-líder > membro
    const ministeriosNav: {
      id: string;
      nome: string;
      icone: string | null;
      cor: string | null;
      paginaInicial: string | null;
      paginasHabilitadas: string[];
    }[] = [];
    for (const m of [
      ...user.ministeriosLiderados,
      ...user.ministeriosCoLiderados,
      ...user.ministerios.map((um) => um.ministerio),
    ]) {
      if (ministeriosNav.some((n) => n.id === m.id)) continue;
      ministeriosNav.push({
        id: m.id,
        nome: m.nome.trim(),
        icone: m.icone,
        cor: m.cor,
        paginaInicial: m.navConfig?.paginaInicial ?? null,
        paginasHabilitadas: m.navConfig ? parsePages(m.navConfig.paginasHabilitadas) : [],
      });
    }

    if (allConfigs.length > 0) {
      const merged = Array.from(
        new Set(allConfigs.flatMap((c) => parsePages(c.paginasHabilitadas)))
      );
      ministerioNavConfig = {
        paginaInicial: allConfigs[0].paginaInicial,
        paginasHabilitadas: merged,
      };
    }

    return {
      isAuthenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: roleName,
        campusId: user.campusId,
        campusNome: user.campus?.nome,
        campusCidade: user.campus?.cidade,
        profileImageUrl: user.profileImageUrl,
        // Quem entrou pelo InPeace não precisa trocar a senha local
        requirePasswordChange: decoded.provider === 'inpeace' ? false : user.requirePasswordChange,
        ministerioNavConfig,
        ministeriosNav,
        // Participa de algum ministério (como líder, co-líder ou membro), com ou sem páginas configuradas
        temMinisterio:
          user.ministeriosLiderados.length + user.ministeriosCoLiderados.length + user.ministerios.length > 0,
      }
    };
  } catch (error) {
    return { isAuthenticated: false, user: null };
  }
}

export async function updateMensagemEnviada(id: string) {
  const visitante = await prisma.visitantes.findUnique({
    where: { id }
  });
  
  const updatedVisitante = await prisma.visitantes.update({
    where: { id },
    data: {
      mensagem_enviada: !visitante?.mensagem_enviada
    }
  });

  return updatedVisitante;
}

export async function logout() {
  cookies().delete('authToken');
  return { success: true };
}

export async function getVisitStats({ startDate, endDate }: { startDate: string, endDate: string }) {
  const { user } = await checkAuth();
  
  // Ajusta as datas para incluir o dia inteiro, considerando UTC
  const start = new Date(startDate + 'T00:00:00.000Z');
  const end = new Date(endDate + 'T23:59:59.999Z');

  const initialCounts = {
    'sabado': 0,
    'domingo-manha': 0,
    'domingo-noite': 0,
    'evento': 0,
    'new': 0,
    total: 0
  };

  const visits = await prisma.visitantes.findMany({
    where: {
      created_at: {
        gte: start,
        lte: end,
      },
      ...(user?.campusId ? { campusId: user.campusId } : {}),
    },
    select: {
      created_at: true,
      culto: true,
    },
    orderBy: {
      created_at: 'asc'
    }
  });

  // Group by date and culto
  const stats = visits.reduce((acc: any, visit) => {
    const date = visit.created_at.toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { ...initialCounts };
    }
    if (typeof acc[date][visit.culto] !== 'number') {
      acc[date][visit.culto] = 0;
    }
    acc[date][visit.culto]++;
    acc[date].total++;
    return acc;
  }, {});

  return stats;
}

export async function deleteVisitante(id: string) {
  try {
    await prisma.visitantes.delete({
      where: { id }
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting visitante:', error);
    return { success: false };
  }
}

export async function getVisitStatsDetailed(params: { startDate: string, endDate: string }) {
  try {
    const { user } = await checkAuth();
    const start = new Date(params.startDate + 'T00:00:00.000Z');
    const end = new Date(params.endDate + 'T23:59:59.999Z');

    const visits = await prisma.visitantes.findMany({
      where: {
        created_at: {
          gte: start,
          lte: end,
        },
        ...(user?.campusId ? { campusId: user.campusId } : {}),
      },
      select: {
        id: true,
        nome: true,
        bairro: true,
        idade: true,
        genero: true,
        estado_civil: true,
        telefone: true,
        culto: true,
        responsavel_nome: true,
        responsavel_telefone: true,
        como_nos_conheceu: true,
        como_chegou_ate_nos: true,
        frequenta_igreja: true,
        qual_igreja: true,
        interesse_em_conhecer: true,
        observacao: true,
        mensagem_enviada: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    return visits;
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return [];
  }
}

export async function getGenderStats({ startDate, endDate }: { startDate: string; endDate: string }) {
  try {
    const { user } = await checkAuth();
    
    const visits = await prisma.visitantes.groupBy({
      by: ['culto', 'genero'],
      where: {
        created_at: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        },
        ...(user?.campusId ? { campusId: user.campusId } : {}),
      },
      _count: {
        id: true
      }
    });

    const stats: Record<string, { masculino: number; feminino: number }> = {
      'sabado': { masculino: 0, feminino: 0 },
      'domingo-manha': { masculino: 0, feminino: 0 },
      'domingo-noite': { masculino: 0, feminino: 0 },
      'evento': { masculino: 0, feminino: 0 },
      'new': { masculino: 0, feminino: 0 },
    };

    visits.forEach((visit) => {
      const generoKey = visit.genero.toLowerCase() === 'masculino' ? 'masculino' : 'feminino';
      if (!stats[visit.culto]) {
        stats[visit.culto] = { masculino: 0, feminino: 0 };
      }
      stats[visit.culto][generoKey] = visit._count.id;
    });

    return stats;
  } catch (error) {
    console.error('Error fetching gender stats:', error);
    throw error;
  }
}

export async function getAgeStats({ startDate, endDate }: { startDate: string; endDate: string }) {
  try {
    const { user } = await checkAuth();
    
    const visits = await prisma.visitantes.findMany({
      where: {
        created_at: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        },
        ...(user?.campusId ? { campusId: user.campusId } : {}),
      },
      select: {
        idade: true,
        culto: true
      }
    });

    // Create age ranges (0-4, 5-9, 10-14, etc.)
    const ageRanges: { [key: string]: { [key: string]: number } } = {};
    
    visits.forEach((visit) => {
      if (visit.idade == null) return;

      // Calculate age range start (round down to nearest 5)
      const rangeStart = Math.floor(visit.idade / 5) * 5;
      const rangeKey = `${rangeStart}-${rangeStart + 4}`;
      
      // Initialize age range if it doesn't exist
      if (!ageRanges[rangeKey]) {
        ageRanges[rangeKey] = {
          'sabado': 0,
          'domingo-manha': 0,
          'domingo-noite': 0,
          'evento': 0,
          'new': 0,
          total: 0
        };
      }
      
      // Increment counters
      ageRanges[rangeKey][visit.culto]++;
      ageRanges[rangeKey].total++;
    });

    // Convert to array and sort by age range
    const formattedData = Object.entries(ageRanges)
      .map(([range, counts]) => ({
        range,
        'Sábado': counts['sabado'],
        'Domingo Manhã': counts['domingo-manha'],
        'Domingo Noite': counts['domingo-noite'],
        'Evento': counts['evento'],
        'New': counts['new'],
        total: counts.total
      }))
      .sort((a, b) => {
        const [aStart] = a.range.split('-').map(Number);
        const [bStart] = b.range.split('-').map(Number);
        return aStart - bStart;
      });

    return formattedData;
  } catch (error) {
    console.error('Error fetching age stats:', error);
    throw error;
  }
}

export async function checkIsAdmin() {
  const { isAuthenticated, user } = await checkAuth();
  
  if (!isAuthenticated || !user) {
    return { isAdmin: false };
  }

  return { isAdmin: user.role === 'admin' };
}

export async function canAccessRegister() {
  const { isAuthenticated, user } = await checkAuth();
  
  if (!isAuthenticated || !user) {
    return { canAccess: false };
  }

  // Permitir acesso apenas para admin e base_pessoal
  return { canAccess: user.role === 'admin' || user.role === 'base_pessoal' };
}

export async function createUser(data: { email: string; password?: string; name: string; phone?: string; role: string; campusId?: string; dataMembresia?: string; profileImageUrl?: string }) {
  if (!data.password) {
    throw new Error('Senha é obrigatória para criar um usuário');
  }
  
  const { user: currentUser } = await checkAuth();
  // Só admin cria usuários (e define o papel, inclusive admin)
  if (currentUser?.role !== 'admin') {
    throw new Error('Não autorizado');
  }
  
  const hashedPassword = await bcrypt.hash(data.password, 10);
  
  // Buscar o roleId baseado no nome da role
  const roleRecord = await prismaClient.role.findUnique({
    where: { name: data.role }
  });
  
  const { dataMembresia, profileImageUrl, role, campusId, ...userData } = data;
  
  // Usar campusId fornecido ou o campus do usuário logado
  const userCampusId = campusId || currentUser?.campusId;
  
  const user = await prismaClient.users.create({
    data: {
      ...userData,
      password: hashedPassword,
      role: role, // Manter campo legado por compatibilidade
      roleId: roleRecord?.id || null,
      campusId: userCampusId || null,
      requirePasswordChange: true,
      dataMembresia: dataMembresia && dataMembresia.trim() !== '' ? dataMembresia : null,
      profileImageUrl: profileImageUrl && profileImageUrl.trim() !== '' ? profileImageUrl : null,
    },
    include: {
      roleRelation: true,
      campus: true
    }
  });

  return { success: true, user: { 
    id: user.id, 
    name: user.name, 
    email: user.email, 
    phone: user.phone,
    role: user.roleRelation?.name || user.role,
    campusId: user.campusId,
    campusNome: user.campus?.nome,
    requirePasswordChange: user.requirePasswordChange 
  } };
}

export async function listUsers(searchTerm?: string) {
  const { user: currentUser } = await checkAuth();
  
  const users = await prismaClient.users.findMany({
    where: {
      ...(searchTerm ? { name: { contains: searchTerm } } : {}),
      ...(currentUser?.campusId ? { campusId: currentUser.campusId } : {}),
    },
    select: {
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
          nome: true
        }
      },
      createdAt: true,
      requirePasswordChange: true,
    },
    orderBy: {
      name: 'asc'
    }
  });

  // Mapear para usar o nome da role da relação
  return users.map(user => ({
    ...user,
    role: user.roleRelation?.name || user.role,
    campusNome: user.campus?.nome
  }));
}

export async function deleteUser(id: string) {
  const { user: currentUser } = await checkAuth();
  if (currentUser?.role !== 'admin') {
    throw new Error('Não autorizado');
  }

  await prismaClient.users.delete({
    where: { id },
  });

  return { success: true };
}

type UpdateUserData = {
  email: string;
  name: string;
  phone?: string;
  role: string;
  password?: string;
  dataMembresia?: string;
  profileImageUrl?: string;
  requirePasswordChange?: boolean;
};

export async function updateUser(id: string, input: UpdateUserData) {
  const { user: currentUser } = await checkAuth();
  if (!currentUser) {
    throw new Error('Não autorizado');
  }

  // Só admin altera outras pessoas e muda papel/e-mail (ninguém se promove a admin).
  // Quem não é admin edita apenas os próprios dados e a senha.
  let data = input;
  if (currentUser.role !== 'admin') {
    if (currentUser.id !== id) {
      throw new Error('Não autorizado');
    }
    const atual = await prismaClient.users.findUnique({
      where: { id },
      select: { email: true, role: true, roleRelation: { select: { name: true } } },
    });
    if (!atual) {
      throw new Error('Usuário não encontrado');
    }
    data = {
      ...input,
      email: atual.email,
      role: atual.roleRelation?.name || atual.role,
      // "Exigir troca de senha" redefine a senha: só admin pode pedir
      requirePasswordChange: input.requirePasswordChange === true ? undefined : input.requirePasswordChange,
    };
  }

  // Buscar o roleId baseado no nome da role
  const roleRecord = await prismaClient.role.findUnique({
    where: { name: data.role }
  });

  const updateData: any = {
    email: data.email,
    name: data.name,
    phone: data.phone,
    role: data.role, // Manter campo legado por compatibilidade
    roleId: roleRecord?.id || null,
    // Campos não enviados ficam como estão (undefined não altera no Prisma)
    dataMembresia:
      data.dataMembresia === undefined ? undefined : data.dataMembresia.trim() !== '' ? data.dataMembresia : null,
    profileImageUrl:
      data.profileImageUrl === undefined ? undefined : data.profileImageUrl.trim() !== '' ? data.profileImageUrl : null,
    requirePasswordChange: data.requirePasswordChange
  };

  if(data.requirePasswordChange) {
    updateData.password = await bcrypt.hash('ondadura', 10);
  }
  
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  const user = await prismaClient.users.update({
    where: { id },
    data: updateData,
    include: {
      roleRelation: true
    }
  });

  return { success: true, user: { 
    id: user.id, 
    name: user.name, 
    email: user.email, 
    phone: user.phone,
    role: user.roleRelation?.name || user.role,
    requirePasswordChange: user.requirePasswordChange 
  } };
}
