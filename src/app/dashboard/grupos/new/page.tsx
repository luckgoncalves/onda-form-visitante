'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuth } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import GrupoForm, { GrupoFormData } from '@/components/grupos/grupo-form';

export default function NovoGrupoPage() {
  const [isLoading, setIsLoading] = useState(false);
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
  }, [router, toast]);


  const handleSubmit = async (data: GrupoFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/grupos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar grupo');
      }

      toast({
        title: 'Sucesso',
        description: 'Grupo criado com sucesso!',
      });

      router.push('/dashboard/grupos');
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao criar grupo',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/grupos');
  };

  return (
    <>
      
      <div className="p-2 sm:p-6">
        <GrupoForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </>
  );
} 