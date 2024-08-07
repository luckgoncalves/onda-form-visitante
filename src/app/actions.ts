'use server'
import prisma from '@/lib/prisma';
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
    return await prisma.visitantes.findMany();
 }