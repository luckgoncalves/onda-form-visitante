'use client';

import { useState, useEffect, useCallback } from 'react';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from(Array.from(rawData).map((char) => char.charCodeAt(0)));
}

export type PushStatus = 'idle' | 'loading' | 'subscribed' | 'denied' | 'unsupported' | 'error';

export function usePushNotifications() {
  const [status, setStatus] = useState<PushStatus>('idle');

  const isSupported =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window;

  useEffect(() => {
    if (!isSupported) {
      setStatus('unsupported');
      return;
    }

    if (Notification.permission === 'denied') {
      setStatus('denied');
      return;
    }

    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager.getSubscription().then((sub) => {
        setStatus(sub ? 'subscribed' : 'idle');
      });
    });
  }, [isSupported]);

  const subscribe = useCallback(async (): Promise<PushStatus> => {
    if (!isSupported) return 'unsupported';

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      console.error('[Push] NEXT_PUBLIC_VAPID_PUBLIC_KEY não está definida.');
      setStatus('error');
      return 'error';
    }

    setStatus('loading');

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus('denied');
        return 'denied';
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const json = subscription.toJSON();
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
        }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      setStatus('subscribed');
      return 'subscribed';
    } catch (err) {
      console.error('[Push] Erro ao ativar notificações:', err);
      setStatus('error');
      return 'error';
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async (): Promise<PushStatus> => {
    if (!isSupported) return 'unsupported';
    setStatus('loading');

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setStatus('idle');
      return 'idle';
    } catch (err) {
      console.error('[Push] Erro ao desativar notificações:', err);
      setStatus('subscribed');
      return 'subscribed';
    }
  }, [isSupported]);

  return { status, subscribe, unsubscribe, isSupported };
}
