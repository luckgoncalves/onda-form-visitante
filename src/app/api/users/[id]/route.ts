import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { checkIsAdmin } from '@/app/actions'; // Assuming checkIsAdmin is correctly set up for API routes

const prisma = new PrismaClient();

export async function GET(
  request: Request, // Standard Request object
  { params }: { params: { id: string } }
) {
  try {
    // It's crucial to ensure that checkIsAdmin can work in an API route context.
    // API routes don't have the same session context as server components or server actions by default.
    // This might require passing auth tokens or other mechanisms if checkIsAdmin relies on cookies/session.
    const { isAdmin } = await checkIsAdmin(); 
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = params.id;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.users.findUnique({
      where: {
        id: userId,
      },
      select: { // Select only non-sensitive fields
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        requirePasswordChange: true, // If this field is relevant for the edit page
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('[API USERS GET]', error);
    // Avoid sending detailed error messages to the client in production
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 