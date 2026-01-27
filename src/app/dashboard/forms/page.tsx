'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuth, checkIsAdmin, logout } from '@/app/actions';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { FormCard } from '@/components/forms/form-card';
import { FormListItem, FormStatus } from '@/types/form';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function FormsListPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [forms, setForms] = useState<FormListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FormStatus | 'ALL'>('ALL');
  const [deleteFormId, setDeleteFormId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function checkAuthentication() {
      const { isAuthenticated, user } = await checkAuth();
      const { isAdmin } = await checkIsAdmin();

      if (!isAuthenticated || !user) {
        router.push('/');
        return;
      }

      if (!isAdmin) {
        router.push('/list');
        return;
      }

      setUserName(user.name);
      setUserId(user.id);
      fetchForms();
    }
    checkAuthentication();
  }, [router]);

  const fetchForms = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') {
        params.append('status', statusFilter);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/forms?${params.toString()}`);
      if (!response.ok) throw new Error('Erro ao buscar formulários');
      
      const data = await response.json();
      setForms(data);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os formulários',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchForms();
    }
  }, [statusFilter]);

  const handleSearch = () => {
    fetchForms();
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleCreateForm = () => {
    router.push('/dashboard/forms/new');
  };

  const handleEditForm = (formId: string) => {
    router.push(`/dashboard/forms/${formId}/edit`);
  };

  const handleViewResponses = (formId: string) => {
    router.push(`/dashboard/forms/${formId}/responses`);
  };

  const handleDeleteForm = async () => {
    if (!deleteFormId) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/forms/${deleteFormId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao excluir formulário');

      toast({
        title: 'Sucesso',
        description: 'Formulário excluído com sucesso',
      });

      setForms((prev) => prev.filter((f) => f.id !== deleteFormId));
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o formulário',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteFormId(null);
    }
  };

  const handleDuplicateForm = async (formId: string) => {
    // TODO: Implement form duplication
    toast({
      title: 'Em breve',
      description: 'Funcionalidade de duplicar será implementada em breve',
    });
  };

  const handlePublishForm = async (formId: string) => {
    try {
      const response = await fetch(`/api/forms/${formId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PUBLISHED' }),
      });

      if (!response.ok) throw new Error('Erro ao publicar formulário');

      toast({
        title: 'Sucesso',
        description: 'Formulário publicado com sucesso',
      });

      fetchForms();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível publicar o formulário',
        variant: 'destructive',
      });
    }
  };

  const handleCloseForm = async (formId: string) => {
    try {
      const response = await fetch(`/api/forms/${formId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CLOSED' }),
      });

      if (!response.ok) throw new Error('Erro ao fechar formulário');

      toast({
        title: 'Sucesso',
        description: 'Formulário fechado com sucesso',
      });

      fetchForms();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível fechar o formulário',
        variant: 'destructive',
      });
    }
  };

  const handleCopyLink = (form: FormListItem) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/f/${form.publicToken}`;
    
    navigator.clipboard.writeText(link).then(() => {
      toast({
        title: 'Link copiado!',
        description: 'O link do formulário foi copiado para a área de transferência',
      });
    });
  };

  return (
    <>
      <Header userId={userId} userName={userName} onLogout={handleLogout} />
      
      <div className="p-4 sm:p-6 mt-[72px]">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Formulários</h1>
            <p className="text-gray-500 mt-1">
              Crie e gerencie seus formulários dinâmicos
            </p>
          </div>
          <Button
            onClick={handleCreateForm}
            className="bg-onda-darkBlue hover:bg-onda-darkBlue/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Formulário
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Buscar formulários..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="max-w-sm"
            />
            <Button variant="outline" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as FormStatus | 'ALL')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="DRAFT">Rascunho</SelectItem>
              <SelectItem value="PUBLISHED">Publicado</SelectItem>
              <SelectItem value="CLOSED">Fechado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Forms List */}
        {isLoading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : forms.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Nenhum formulário encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || statusFilter !== 'ALL'
                ? 'Tente alterar os filtros de busca'
                : 'Comece criando seu primeiro formulário'}
            </p>
            {!searchQuery && statusFilter === 'ALL' && (
              <Button
                onClick={handleCreateForm}
                className="bg-onda-darkBlue hover:bg-onda-darkBlue/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Formulário
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {forms.map((form) => (
              <FormCard
                key={form.id}
                form={form}
                onEdit={() => handleEditForm(form.id)}
                onDelete={() => setDeleteFormId(form.id)}
                onDuplicate={() => handleDuplicateForm(form.id)}
                onViewResponses={() => handleViewResponses(form.id)}
                onPublish={() => handlePublishForm(form.id)}
                onClose={() => handleCloseForm(form.id)}
                onCopyLink={() => handleCopyLink(form)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteFormId} onOpenChange={() => setDeleteFormId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir formulário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O formulário e todas as suas respostas serão excluídos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteForm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
