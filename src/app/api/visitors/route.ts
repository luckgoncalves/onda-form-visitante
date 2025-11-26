import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { checkAuth, checkIsAdmin } from '@/app/actions';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { isAuthenticated } = await checkAuth();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions
    const { isAdmin } = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const culto = searchParams.get('culto') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const skip = (page - 1) * limit;

    // Build where clause for search/filters
    const whereClause: Prisma.visitantesWhereInput = {};

    if (search.trim() !== '') {
      whereClause.nome = {
        contains: search,
      };
    }

    if (culto) {
      whereClause.culto = culto;
    }

    if (startDate || endDate) {
      whereClause.created_at = {
        ...(startDate && { gte: new Date(`${startDate}T00:00:00.000Z`) }),
        ...(endDate && { lte: new Date(`${endDate}T23:59:59.999Z`) }),
      };
    }

    // Execute queries in parallel
    const [visitantes, total] = await Promise.all([
      prisma.visitantes.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
        include: {
          registeredBy: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.visitantes.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({
      visitantes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching visitors:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 