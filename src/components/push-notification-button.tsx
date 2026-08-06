'use client';

import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/use-toast';

export function PushNotificationButton() {
  const { status, subscribe, unsubscribe, isSupported } = usePushNotifications();
  const { toast } = useToast();

  if (!isSupported || status === 'unsupported') return null;

  const isLoading = status === 'loading';
  const isSubscribed = status === 'subscribed';
  const isDenied = status === 'denied';

  const handleClick = async () => {
    if (isSubscribed) {
      await unsubscribe();
      toast({ title: 'Notificações desativadas' });
    } else {
      const result = await subscribe();
      if (result === 'subscribed') {
        toast({ title: 'Notificações ativadas', description: 'Você receberá uma confirmação em instantes.' });
      } else if (result === 'denied') {
        toast({
          title: 'Permissão negada',
          description: 'Habilite as notificações nas configurações do navegador.',
          variant: 'destructive',
        });
      }
    }
  };

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
      onClick={handleClick}
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
