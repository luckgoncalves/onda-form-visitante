'use client';

import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export function PushNotificationButton() {
  const { status, subscribe, unsubscribe, isSupported } = usePushNotifications();

  if (!isSupported || status === 'unsupported') return null;

  const isLoading = status === 'loading';
  const isSubscribed = status === 'subscribed';
  const isDenied = status === 'denied';

  const label = isDenied
    ? 'Notificações bloqueadas'
    : isSubscribed
    ? 'Desativar notificações'
    : 'Ativar notificações';

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-white hover:bg-white/20 hover:text-white"
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={isLoading || isDenied}
      aria-label={label}
      title={label}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isSubscribed ? (
        <Bell className="h-5 w-5 fill-white" />
      ) : (
        <BellOff className="h-5 w-5" />
      )}
    </Button>
  );
}
