'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { checkAuth, checkIsAdmin, logout } from '@/app/actions';
import { ArrowLeft, Plus } from 'lucide-react';
import EmpresaCard from '@/components/empresas/empresa-card';
import EmpresaForm from '@/components/empresas/empresa-form';
import { EmpresasGridSkeleton } from '@/components/empresas/empresa-skeleton';
import { Empresa, UserEmpresasResponse } from '@/types/empresa';
import { EmpresaFormData } from '@/lib/validations/empresa';
import ButtonForm from '@/components/button-form';

export default function UserEmpresasPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { toast } = useToast();
  
  const [userName, setUserName] = useState('');
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);
  const [user, setUser] = useState<{ id: string; name: string; email: string; phone?: string | null } | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function checkAdminAccess() {
      const { isAdmin } = await checkIsAdmin();
      if (!isAdmin) {
        router.push('/');
        return;
      }

      const authResult = await checkAuth();
      if (authResult.user) {
        setUserName(authResult.user.name);
        setCurrentUser({
          id: authResult.user.id,
          role: authResult.user.role,
        });
      }

      fetchUserEmpresas();
    }

    checkAdminAccess();
  }, [router, userId]);

  const fetchUserEmpresas = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${userId}/empresas`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: 'Erro',
            description: 'Usuário não encontrado',
            variant: 'destructive',
          });
          router.push('/users');
          return;
        }
        throw new Error('Erro ao buscar empresas do usuário');
      }

      const data: UserEmpresasResponse = await response.json();
      setUser(data.user);
      setEmpresas(data.empresas);

    } catch (error) {
      console.error('Erro ao buscar empresas do usuário:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar empresas do usuário',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEmpresa = async (data: EmpresaFormData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/empresas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          userId: userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar empresa');
      }

      toast({
        title: 'Sucesso',
        description: 'Empresa criada com sucesso!',
      });

      setIsDialogOpen(false);
      fetchUserEmpresas();

    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar empresa',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEmpresa = async (data: EmpresaFormData) => {
    if (!editingEmpresa) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/empresas/${editingEmpresa.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar empresa');
      }

      toast({
        title: 'Sucesso',
        description: 'Empresa atualizada com sucesso!',
      });

      setIsDialogOpen(false);
      setEditingEmpresa(null);
      fetchUserEmpresas();

    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar empresa',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmpresa = async (empresaId: string) => {
    try {
      const response = await fetch(`/api/empresas/${empresaId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar empresa');
      }

      toast({
        title: 'Sucesso',
        description: 'Empresa deletada com sucesso!',
      });

      fetchUserEmpresas();

    } catch (error) {
      console.error('Erro ao deletar empresa:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao deletar empresa',
        variant: 'destructive',
      });
    }
  };

  const handleEditClick = (empresa: Empresa) => {
    setEditingEmpresa(empresa);
    setIsDialogOpen(true);
  };

  const handleNewClick = () => {
    setEditingEmpresa(null);
    setIsDialogOpen(true);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setEditingEmpresa(null);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!userName) {
    return (
      <main className="flex w-full h-[100%] min-h-screen flex-col items-center gap-4 p-2 sm:p-6 mt-[72px]">
        <Header userId={userId} userName={userName} onLogout={handleLogout} />
      </main>
    );
  }

  return (
    <>
      <Header userId={userId} userName={userName} onLogout={handleLogout} />
      <div className="p-2 sm:p-6 mt-[72px] max-w-7xl mx-auto">
        {/* Header da página */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Button variant="outline" onClick={() => router.push('/users')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <ButtonForm 
                label="Nova Empresa"
                icon={<Plus className="h-4 w-4 mr-2" />}
                onClick={handleNewClick}
              />
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEmpresa ? 'Editar Empresa' : 'Nova Empresa'}
                </DialogTitle>
              </DialogHeader>
              <EmpresaForm
                mode={editingEmpresa ? 'edit' : 'create'}
                initialData={editingEmpresa || undefined}
                userId={userId}
                onSubmit={editingEmpresa ? handleEditEmpresa : handleCreateEmpresa}
                onCancel={handleCancel}
                isLoading={isSubmitting}
              />
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex-1 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold">
              Empresas de {user?.name || 'Carregando...'}
            </h1>
            <p className="text-muted-foreground">
              {empresas.length} empresa{empresas.length !== 1 ? 's' : ''} cadastrada{empresas.length !== 1 ? 's' : ''}
            </p>
          </div>

        {/* Grid de Empresas */}
        {isLoading ? (
          <EmpresasGridSkeleton count={6} />
        ) : empresas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Este usuário ainda não possui empresas cadastradas.
            </p>
            <Button onClick={handleNewClick}>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Primeira Empresa
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {empresas.map((empresa) => (
              <EmpresaCard
                key={empresa.id}
                empresa={empresa}
                onEdit={handleEditClick}
                onDelete={handleDeleteEmpresa}
                showActions={true}
                showOwner={false}
                currentUser={currentUser}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
} 