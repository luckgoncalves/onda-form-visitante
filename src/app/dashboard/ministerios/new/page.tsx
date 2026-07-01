'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuth } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import MinisterioForm, { MinisterioFormData } from '@/components/ministerios/ministerio-form';

export default function NovoMinisterioPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function init() {
      const { user } = await checkAuth();
      if (!user) router.push('/');
    }
    init();
  }, [router]);

  const handleSubmit = async (data: MinisterioFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ministerios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar ministério');
      }

      toast({ title: 'Sucesso', description: 'Ministério criado com sucesso!' });
      router.push('/dashboard/ministerios');
    } catch (error) {
      console.error('Erro ao criar ministério:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao criar ministério',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-2 sm:p-6 mt-[72px]">
      <MinisterioForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={() => router.push('/dashboard/ministerios')}
        isLoading={isLoading}
      />
    </div>
  );
}
