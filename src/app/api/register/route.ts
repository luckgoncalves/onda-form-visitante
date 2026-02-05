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

    // Buscar o roleId para 'user'
    const userRole = await prisma.role.findUnique({
      where: { name: 'user' }
    });

    // Criar usuário e empresas em transação
    const resultado = await prisma.$transaction(async (tx) => {
      // Criar usuário com role 'user', requirePasswordChange: false e approved: false
      // Garantir que role seja sempre 'user' para registro público
      // Usuários precisam ser aprovados por um administrador
      const user = await tx.users.create({
        data: {
          name: userData.name,
          email: userData.email,
          phone: userData.phone || null,
          password: hashedPassword,
          role: 'user', // Campo legado - sempre 'user' para registro público
          roleId: userRole?.id || null, // Novo campo com referência à tabela Role
          campusId: userData.campusId || null, // Campus selecionado no registro
          requirePasswordChange: false,
          approved: false, // Usuário precisa ser aprovado por um administrador
          dataMembresia: userData.dataMembresia && userData.dataMembresia.trim() !== '' ? userData.dataMembresia : null,
          profileImageUrl: userData.profileImageUrl && userData.profileImageUrl.trim() !== '' ? userData.profileImageUrl : null,
        },
        include: {
          roleRelation: true,
          campus: true
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
              logoUrl: empresaData.logoUrl || null,
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

    // Não fazer auto-login pois o usuário precisa ser aprovado primeiro
    // O usuário será notificado que precisa aguardar aprovação

    return NextResponse.json({
      success: true,
      message: 'Cadastro realizado com sucesso! Aguarde a aprovação de um administrador para acessar o sistema.',
      user: {
        id: resultado.user.id,
        name: resultado.user.name,
        email: resultado.user.email,
        phone: resultado.user.phone,
        role: resultado.user.roleRelation?.name || resultado.user.role,
        campusId: resultado.user.campusId,
        campusNome: resultado.user.campus?.nome,
        approved: resultado.user.approved,
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

