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

  const user = await prismaClient.users.findUnique({
    where: { email },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { success: false, message: 'Credenciais inválidas' };
  }

  const token = sign(
    { userId: user.id, email: user.email, role: user.role },
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
      role: user.role,
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
        requirePasswordChange: true 
      }
    });

    if (!user) {
      return { isAuthenticated: false, user: null };
    }

    return { isAuthenticated: true, user };
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
    const visits = await prisma.$queryRaw`
      SELECT 
        id,
        nome,
        bairro,
        idade,
        genero,
        estado_civil,
        telefone,
        culto,
        como_nos_conheceu,
        como_chegou_ate_nos,
        frequenta_igreja,
        qual_igreja,
        interesse_em_conhecer,
        observacao,
        mensagem_enviada,
        created_at - INTERVAL '3 hours' as created_at
      FROM visitantes 
      WHERE created_at - INTERVAL '3 hours' >= ${params.startDate}::timestamp
      AND created_at - INTERVAL '3 hours' <= ${params.endDate}::timestamp
      ORDER BY created_at ASC
    `;
    
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

export async function createUser(data: { email: string; password?: string; name: string; phone?: string; role: string }) {
  if (!data.password) {
    throw new Error('Senha é obrigatória para criar um usuário');
  }
  
  const hashedPassword = await bcrypt.hash(data.password, 10);
  
  const user = await prismaClient.users.create({
    data: {
      ...data,
      password: hashedPassword,
      requirePasswordChange: true
    },
  });

  return { success: true, user: { 
    id: user.id, 
    name: user.name, 
    email: user.email, 
    phone: user.phone,
    role: user.role,
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
      createdAt: true,
      requirePasswordChange: true,
    },
    orderBy: {
      name: 'asc'
    }
  });

  return users;
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
  requirePasswordChange?: boolean;
};

export async function updateUser(id: string, data: UpdateUserData) {
  const updateData: any = {
    email: data.email,
    name: data.name,
    phone: data.phone,
    role: data.role,
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
  });

  return { success: true, user: { 
    id: user.id, 
    name: user.name, 
    email: user.email, 
    phone: user.phone,
    role: user.role,
    requirePasswordChange: user.requirePasswordChange 
  } };
}
