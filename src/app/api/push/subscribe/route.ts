import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/app/actions';
import prisma from '@/lib/prisma';
import { sendPushToUser } from '@/lib/push';

// POST /api/push/subscribe — salva ou atualiza a subscription do usuário
export async function POST(req: NextRequest) {
  const { user } = await checkAuth();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const body = await req.json();
  const { endpoint, keys } = body as {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  };

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
  }

  await prisma.pushSubscription.upsert({
    where: {
      userId_endpoint: {
        userId: user.id,
        endpoint: endpoint.slice(0, 500),
      },
    },
    create: {
      userId: user.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
    update: {
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
  });

  // Envia notificação de boas-vindas para confirmar que o pipeline funciona
  sendPushToUser(user.id, {
    title: 'Notificações ativadas ✓',
    body: 'Você receberá alertas de chamados e atualizações.',
    url: '/',
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}

// DELETE /api/push/subscribe — remove a subscription do usuário
export async function DELETE(req: NextRequest) {
  const { user } = await checkAuth();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { endpoint } = await req.json() as { endpoint: string };

  if (!endpoint) {
    return NextResponse.json({ error: 'Endpoint obrigatório' }, { status: 400 });
  }

  await prisma.pushSubscription.deleteMany({
    where: { userId: user.id, endpoint },
  });

  return NextResponse.json({ ok: true });
}
