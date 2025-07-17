'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { checkAuth, logout } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import GrupoForm, { GrupoFormData } from '@/components/grupos/grupo-form';
import GrupoFormSkeleton from '@/components/grupos/grupo-form-skeleton';

interface Grupo {
  id: string;
  nome: string;
  categoria: 'HOMENS' | 'UNVT' | 'MULHERES' | 'MISTO' | 'NEW' | 'CASAIS';
  diaSemana: 'SEGUNDA' | 'TERCA' | 'QUARTA' | 'QUINTA' | 'SEXTA' | 'SABADO' | 'DOMINGO';
  horario: string;
  bairroId?: string;
  lideres: {
    id: string;
    name: string;
    email: string;
  }[];
}

export default function EditarGrupoPage({ params }: { params: { id: string } }) {
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [userName, setUserName] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function initializeData() {
      try {
        // Verificar autenticação
        const { user } = await checkAuth();
        if (!user) {
          router.push('/');
          return;
        }
        setUserName(user.name);

        // Carregar dados do grupo
        await loadGrupo();
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar dados iniciais',
          variant: 'destructive',
        });
      }
    }

    initializeData();
  }, [params.id, router, toast]);

  const loadGrupo = async () => {
    try {
      setIsLoadingData(true);
      const response = await fetch(`/api/grupos/${params.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Grupo não encontrado');
        }
        throw new Error('Erro ao carregar grupo');
      }

      const data = await response.json();
      setGrupo(data);
    } catch (error) {
      console.error('Erro ao carregar grupo:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao carregar grupo',
        variant: 'destructive',
      });
      
      // Redirecionar para a lista se o grupo não for encontrado
      if (error instanceof Error && error.message === 'Grupo não encontrado') {
        router.push('/dashboard/grupos');
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleSubmit = async (data: GrupoFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/grupos/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar grupo');
      }

      toast({
        title: 'Sucesso',
        description: 'Grupo atualizado com sucesso!',
      });

      router.push('/dashboard/grupos');
    } catch (error) {
      console.error('Erro ao atualizar grupo:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao atualizar grupo',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/grupos');
  };

  if (isLoadingData) {
    return (
      <>
        <Header userName={userName} onLogout={handleLogout} />
        <div className="p-2 sm:p-6 mt-[72px]">
          <GrupoFormSkeleton mode="edit" />
        </div>
      </>
    );
  }

  if (!grupo) {
    return (
      <>
        <Header userName={userName} onLogout={handleLogout} />
        <div className="p-2 sm:p-6 mt-[72px]">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-center py-8">
              <div className="text-gray-500">Grupo não encontrado</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header userName={userName} onLogout={handleLogout} />
      
      <div className="p-2 sm:p-6 mt-[72px]">
        <GrupoForm
          mode="edit"
          initialData={grupo}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </>
  );
} 