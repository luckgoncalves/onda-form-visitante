'use client';

import { useState } from 'react';
import { Bell, BellOff, BellRing, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/use-toast';

export function PushNotificationButton() {
  const { status, subscribe, unsubscribe, isSupported } = usePushNotifications();
  const { toast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isSupported || status === 'unsupported') return null;

  const isLoading = status === 'loading';
  const isSubscribed = status === 'subscribed';
  const isDenied = status === 'denied';

  const handleClick = async () => {
    if (isSubscribed) {
      setShowConfirm(true);
      return;
    }

    const result = await subscribe();
    if (result === 'subscribed') {
      toast({ title: 'Notificações ativadas', description: 'Você receberá uma confirmação em instantes.' });
    } else if (result === 'denied') {
      toast({
        title: 'Permissão negada',
        description: 'Habilite as notificações nas configurações do navegador.',
        variant: 'destructive',
      });
    } else if (result === 'error') {
      toast({
        title: 'Erro ao ativar notificações',
        description: 'Tente novamente ou verifique o console para mais detalhes.',
        variant: 'destructive',
      });
    }
  };

  const handleConfirmUnsubscribe = async () => {
    setShowConfirm(false);
    const result = await unsubscribe();
    if (result === 'idle') {
      toast({ title: 'Notificações desativadas' });
    }
  };

  const label = isDenied
    ? 'Notificações bloqueadas'
    : isSubscribed
    ? 'Desativar notificações'
    : 'Ativar notificações';

  return (
    <>
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
          <BellRing className="h-5 w-5" />
        ) : (
          <BellOff className="h-5 w-5" />
        )}
      </Button>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar notificações?</AlertDialogTitle>
            <AlertDialogDescription>
              Você não receberá mais alertas de chamados e atualizações.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUnsubscribe}>
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
