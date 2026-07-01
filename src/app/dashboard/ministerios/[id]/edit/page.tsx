'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuth } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import MinisterioForm, { MinisterioFormData } from '@/components/ministerios/ministerio-form';
import MinisterioFormSkeleton from '@/components/ministerios/ministerio-form-skeleton';

interface Ministerio {
  id: string;
  nome: string;
  descricao?: string;
  liderId: string;
  coLiderId?: string;
  membros: { user: { id: string; name: string; email: string } }[];
}

export default function EditarMinisterioPage({ params }: { params: { id: string } }) {
  const [ministerio, setMinisterio] = useState<Ministerio | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function init() {
      const { user } = await checkAuth();
      if (!user) {
        router.push('/');
        return;
      }
      await loadMinisterio();
    }
    init();
  }, [params.id, router]);

  const loadMinisterio = async () => {
    try {
      setIsLoadingData(true);
      const response = await fetch(`/api/ministerios/${params.id}`);

      if (!response.ok) {
        if (response.status === 404) throw new Error('Ministério não encontrado');
        throw new Error('Erro ao carregar ministério');
      }

      const data = await response.json();
      setMinisterio({
        id: data.id,
        nome: data.nome,
        descricao: data.descricao,
        liderId: data.lider.id,
        coLiderId: data.coLider?.id,
        membros: data.membros,
      });
    } catch (error) {
      console.error('Erro ao carregar ministério:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao carregar ministério',
        variant: 'destructive',
      });
      if (error instanceof Error && error.message === 'Ministério não encontrado') {
        router.push('/dashboard/ministerios');
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (data: MinisterioFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/ministerios/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          coLiderId: data.coLiderId || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar ministério');
      }

      toast({ title: 'Sucesso', description: 'Ministério atualizado com sucesso!' });
      router.push('/dashboard/ministerios');
    } catch (error) {
      console.error('Erro ao atualizar ministério:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao atualizar ministério',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="p-2 sm:p-6 mt-[72px]">
        <MinisterioFormSkeleton mode="edit" />
      </div>
    );
  }

  if (!ministerio) {
    return (
      <div className="p-2 sm:p-6 mt-[72px]">
        <div className="max-w-2xl mx-auto text-center py-8 text-gray-500">
          Ministério não encontrado
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-6 mt-[72px]">
      <MinisterioForm
        mode="edit"
        initialData={ministerio}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/dashboard/ministerios')}
        isLoading={isLoading}
      />
    </div>
  );
}
