'use server'
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { sign, verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prismaClient = new PrismaClient()

export const save = async (data: any) => {
  const { user } = await checkAuth();

  const createData: any = {
    ...data,
    estado: data.estado,
    cidade: data.cidade,
    bairro: data.bairro, // Se for Curitiba, será o ID do bairro, caso contrário será o nome digitado
    observacao: data.observacao || '',
    idade: Number(data.idade),
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
  }

   const visitante = await prisma.visitantes.create({
     data: createData,
   })

   return visitante; // Return the created visitor object
 }

 export const findAll = async () => {
    return await prisma.visitantes.findMany({
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
    const skip = (page - 1) * limit;
    
    const [visitantes, total] = await Promise.all([
        prisma.visitantes.findMany({
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
        prisma.visitantes.count()
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

  // Buscar usuário com a relação de role
  const user = await prismaClient.users.findUnique({
    where: { email },
    include: {
      roleRelation: true
    }
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { success: false, message: 'Credenciais inválidas' };
  }

  // Verificar se o usuário está aprovado
  // MySQL retorna booleanos como 1 (true) ou 0 (false)
  // Se o campo approved não existir ainda (usuários antigos), considerar como aprovado
  const userApproved = (user as any).approved;
  
  // Tratar valores do MySQL: 1 = true, 0 = false, undefined/null = true (usuários antigos)
  const isApproved = userApproved === undefined || userApproved === null || userApproved === 1 || userApproved === true;
  
  if (!isApproved) {
    return { success: false, message: 'Sua conta ainda não foi aprovada por um administrador. Aguarde a aprovação.' };
  }

  // Usar o nome da role da relação, ou fallback para o campo legado
  const roleName = user.roleRelation?.name || user.role;

  const token = sign(
    { userId: user.id, email: user.email, role: roleName },
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
    success: true, 
    user: { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      role: roleName,
      requirePasswordChange: user.requirePasswordChange 
    } 
  };
}

export async function checkAuth() {
  const authToken = cookies().get('authToken')?.value;

  if (!authToken) {
    return { isAuthenticated: false, user: null };
  }

  try {
    const decoded = verify(authToken, process.env.JWT_SECRET!) as { userId: string, email: string, role: string };
    
    const user = await prismaClient.users.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true,
        roleRelation: {
          select: {
            name: true
          }
        },
        requirePasswordChange: true
      }
    });

    if (!user) {
      return { isAuthenticated: false, user: null };
    }

    // Verificar se o usuário está aprovado (se o campo existir)
    // MySQL retorna booleanos como 1 (true) ou 0 (false)
    // Se o campo approved não existir ainda (usuários antigos), considerar como aprovado
    try {
      const userWithApproved = await (prismaClient.users.findUnique as any)({
        where: { id: decoded.userId },
        select: { approved: true }
      });
      
      if (userWithApproved) {
        const approvedValue = userWithApproved.approved;
        // Tratar valores do MySQL: 0 = false, qualquer outro valor = true
        // Se for 0 ou false, usuário não está aprovado
        if (approvedValue === 0 || approvedValue === false) {
          // Limpar cookie se não estiver aprovado
          cookies().delete('authToken');
          return { isAuthenticated: false, user: null };
        }
      }
    } catch (error) {
      // Se o campo não existir ainda no banco, ignorar erro e permitir login (usuários antigos)
    }

    // Usar o nome da role da relação, ou fallback para o campo legado
    const roleName = user.roleRelation?.name || user.role;

    return { 
      isAuthenticated: true, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: roleName,
        requirePasswordChange: user.requirePasswordChange
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
    const start = new Date(params.startDate + 'T00:00:00.000Z');
    const end = new Date(params.endDate + 'T23:59:59.999Z');

    const visits = await prisma.visitantes.findMany({
      where: {
        created_at: {
          gte: start,
          lte: end,
        },
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
    const visits = await prisma.visitantes.groupBy({
      by: ['culto', 'genero'],
      where: {
        created_at: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
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
    const visits = await prisma.visitantes.findMany({
      where: {
        created_at: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      select: {
        idade: true,
        culto: true
      }
    });

    // Create age ranges (0-4, 5-9, 10-14, etc.)
    const ageRanges: { [key: string]: { [key: string]: number } } = {};
    
    visits.forEach((visit) => {
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

export async function createUser(data: { email: string; password?: string; name: string; phone?: string; role: string; dataMembresia?: string; profileImageUrl?: string }) {
  if (!data.password) {
    throw new Error('Senha é obrigatória para criar um usuário');
  }
  
  const hashedPassword = await bcrypt.hash(data.password, 10);
  
  // Buscar o roleId baseado no nome da role
  const roleRecord = await prismaClient.role.findUnique({
    where: { name: data.role }
  });
  
  const { dataMembresia, profileImageUrl, role, ...userData } = data;
  
  const user = await prismaClient.users.create({
    data: {
      ...userData,
      password: hashedPassword,
      role: role, // Manter campo legado por compatibilidade
      roleId: roleRecord?.id || null,
      requirePasswordChange: true,
      dataMembresia: dataMembresia && dataMembresia.trim() !== '' ? dataMembresia : null,
      profileImageUrl: profileImageUrl && profileImageUrl.trim() !== '' ? profileImageUrl : null,
    },
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

export async function listUsers(searchTerm?: string) {
  const users = await prismaClient.users.findMany({
    where: searchTerm ? {
      name: {
        contains: searchTerm
      }
    } : undefined,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      roleRelation: {
        select: {
          name: true
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
    role: user.roleRelation?.name || user.role
  }));
}

export async function deleteUser(id: string) {
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

export async function updateUser(id: string, data: UpdateUserData) {
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
    dataMembresia: data.dataMembresia && data.dataMembresia.trim() !== '' ? data.dataMembresia : null,
    profileImageUrl: data.profileImageUrl && data.profileImageUrl.trim() !== '' ? data.profileImageUrl : null,
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
