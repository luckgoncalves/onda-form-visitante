'use server'
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { sign, verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prismaClient = new PrismaClient()

export const save = async (data: any) => {
    console.log(data)
   const user = await prisma.visitantes.create({
     data: {
        ...data, 
        idade: Number(data.idade),
    }
   })
 }

 export const findAll = async () => {
    return await prisma.visitantes.findMany({
        orderBy: {
            created_at: 'desc'
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
    { userId: user.id, email: user.email },
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

  return { success: true, user: { id: user.id, name: user.name, email: user.email } };
}

export async function checkAuth() {
  const authToken = cookies().get('authToken')?.value;

  if (!authToken) {
    return { isAuthenticated: false };
  }

  try {
    const decoded = verify(authToken, process.env.JWT_SECRET!) as { userId: string, email: string };
    
    // Fetch the user from the database
    const user = await prismaClient.users.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true }
    });

    if (!user) {
      return { isAuthenticated: false };
    }

    return { isAuthenticated: true, user };
  } catch (error) {
    return { isAuthenticated: false };
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
      acc[date] = {
        'sabado': 0,
        'domingo-manha': 0,
        'domingo-noite': 0,
        total: 0
      };
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
        idade,
        telefone,
        culto,
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
