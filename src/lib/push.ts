import webpush from 'web-push';
import prisma from '@/lib/prisma';

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

function getWebPush() {
  const email = process.env.VAPID_EMAIL;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!email || !publicKey || !privateKey) return null;

  webpush.setVapidDetails(email, publicKey, privateKey);
  return webpush;
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  const wp = getWebPush();
  if (!wp) return;

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      wp.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      )
    )
  );

  // Remove subscriptions that are no longer valid (410 Gone)
  const expired = results
    .map((result, i) => ({ result, sub: subscriptions[i] }))
    .filter(
      ({ result }) =>
        result.status === 'rejected' &&
        (result.reason as { statusCode?: number })?.statusCode === 410
    );

  if (expired.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: { id: { in: expired.map(({ sub }) => sub.id) } },
    });
  }
}

export async function sendPushToUsers(userIds: string[], payload: PushPayload) {
  await Promise.allSettled(userIds.map((id) => sendPushToUser(id, payload)));
}
