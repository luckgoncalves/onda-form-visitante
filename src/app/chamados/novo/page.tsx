'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuth } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Copy } from 'lucide-react';
import ChamadoForm from '@/components/chamados/chamado-form';
import { useToast } from '@/hooks/use-toast';

export default function NovoChamadoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [sucesso, setSucesso] = useState<{ id: string; codigo: string } | null>(null);

  useEffect(() => {
    checkAuth().then(({ user }) => { if (!user) router.push('/'); });
  }, [router]);

  const handleCopy = () => {
    if (!sucesso) return;
    navigator.clipboard.writeText(sucesso.codigo);
    toast({ title: 'Copiado!', description: 'Código copiado para a área de transferência' });
  };

  if (sucesso) {
    return (
      <div className="p-2 sm:p-6 mt-[72px] max-w-lg mx-auto">
        <div className="text-center space-y-4 py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold">Chamado aberto!</h2>
          <p className="text-muted-foreground">Seu chamado foi registrado com sucesso.</p>

          <div className="bg-gray-50 border rounded-lg p-4 space-y-2">
            <p className="text-sm text-muted-foreground">Código do chamado</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-mono font-bold">{sucesso.codigo}</span>
              <Button variant="ghost" size="icon" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button onClick={() => router.push(`/chamados/${sucesso.id}`)}>
              Acompanhar chamado
            </Button>
            <Button variant="outline" onClick={() => setSucesso(null)}>
              Abrir outro chamado
            </Button>
            <Button variant="ghost" onClick={() => router.push('/chamados')}>
              Meus chamados
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-6 mt-[72px]">
      <div className="max-w-2xl mx-auto mb-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
      <ChamadoForm
        onSuccess={setSucesso}
        onCancel={() => router.push('/chamados')}
      />
    </div>
  );
}
