'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function usePushListener() {
  const { toast } = useToast();

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handler = (event: MessageEvent) => {
      if (event.data?.type !== 'PUSH_RECEIVED') return;

      const { title, body } = event.data.payload as { title: string; body: string };

      toast({ title, description: body, duration: 6000 });
    };

    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, [toast]);
}
