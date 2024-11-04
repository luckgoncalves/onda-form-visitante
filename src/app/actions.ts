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
