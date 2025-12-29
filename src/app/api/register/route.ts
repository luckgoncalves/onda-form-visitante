import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { registerSchema } from '@/lib/validations/register';

// POST /api/register - Registrar novo usuário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    const { user: userData, empresas } = validatedData;

    // Verificar se o email já existe
    const existingUser = await prisma.users.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Criar usuário e empresas em transação
    const resultado = await prisma.$transaction(async (tx) => {
      // Criar usuário com role 'user' e requirePasswordChange: false
      // Garantir que role seja sempre 'user' para registro público
      const user = await tx.users.create({
        data: {
          name: userData.name,
          email: userData.email,
          phone: userData.phone || null,
          password: hashedPassword,
          role: 'user', // Sempre 'user' para registro público
          requirePasswordChange: false,
        }
      });

      // Criar empresas se fornecidas
      const createdEmpresas = [];
      if (empresas && empresas.length > 0) {
        for (const empresaData of empresas) {
          const empresa = await tx.empresa.create({
            data: {
              nomeNegocio: empresaData.nomeNegocio,
              ramoAtuacao: empresaData.ramoAtuacao,
              detalhesServico: empresaData.detalhesServico,
              whatsapp: empresaData.whatsapp,
              endereco: empresaData.endereco || null,
              site: empresaData.site || null,
              instagram: empresaData.instagram || null,
              facebook: empresaData.facebook || null,
              linkedin: empresaData.linkedin || null,
              email: empresaData.email,
            }
          });

          // Criar relacionamento com usuário
          await tx.userEmpresa.create({
            data: {
              userId: user.id,
              empresaId: empresa.id,
            }
          });

          createdEmpresas.push(empresa);
        }
      }

      return { user, empresas: createdEmpresas };
    });

    // Auto-login: criar token JWT
    const token = sign(
      { userId: resultado.user.id, email: resultado.user.email, role: resultado.user.role },
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

    return NextResponse.json({
      success: true,
      user: {
        id: resultado.user.id,
        name: resultado.user.name,
        email: resultado.user.email,
        phone: resultado.user.phone,
        role: resultado.user.role,
        requirePasswordChange: resultado.user.requirePasswordChange,
      },
      empresas: resultado.empresas,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    // Verificar se é erro de email duplicado do Prisma
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 400 }
      );
    }

    console.error('Erro ao registrar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

