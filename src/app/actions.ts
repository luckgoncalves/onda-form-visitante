'use server'
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

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
  const user = await prismaClient.users.findUnique({
    where: { email, password },
  })

  if (!user) {
    return { success: false, message: 'Credenciais inválidas' }
  }

  return { success: true, user: { id: user.id, name: user.name, email: user.email } }
}

export async function checkAuth() {
  // Aqui você deve implementar a lógica para verificar se o usuário está autenticado
  // Por exemplo, você pode verificar se há um token válido na sessão ou no cookie
  // Por enquanto, vamos simular isso retornando um valor booleano
  
  // Simule uma verificação de autenticação (substitua isso pela sua lógica real)
  const isAuthenticated = Math.random() < 0.5; // 50% de chance de estar autenticado
//   const isAuthenticated = Math.random() < 0.5; // 50% de chance de estar autenticado
  
  return { isAuthenticated };
}
