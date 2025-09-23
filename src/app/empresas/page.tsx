'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { checkAuth, checkIsAdmin, logout } from '@/app/actions';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/app/users/hooks/useDebounce';
import EmpresaCard from '@/components/empresas/empresa-card';
import { EmpresasGridSkeleton } from '@/components/empresas/empresa-skeleton';
import { Empresa, EmpresaListResponse } from '@/types/empresa';
import { SearchInput } from '@/components/search-input';

export default function EmpresasPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    async function checkAdminAccess() {
      const authResult = await checkAuth();
      if (authResult.user) {
        setUserName(authResult.user.name);
        setUserId(authResult.user.id);
        setCurrentUser({
          id: authResult.user.id,
          role: authResult.user.role,
        });
      }

      fetchEmpresas();
    }

    checkAdminAccess();
  }, [router]); //eslint-disable-line

  useEffect(() => {
    if (userName) {
      fetchEmpresas(1, debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, userName]); //eslint-disable-line

  const fetchEmpresas = async (page = 1, search = '') => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/empresas?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar empresas');
      }

      const data: EmpresaListResponse = await response.json();
      setEmpresas(data.empresas);
      setPagination(data.pagination);

    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar empresas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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

      fetchEmpresas(pagination.page, debouncedSearchTerm);

    } catch (error) {
      console.error('Erro ao deletar empresa:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao deletar empresa',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages) {
      fetchEmpresas(pagination.page + 1, debouncedSearchTerm);
    }
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Empresas</h1>
            <p className="text-muted-foreground">
              {pagination.total} empresa{pagination.total !== 1 ? 's' : ''} cadastrada{pagination.total !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Barra de Pesquisa */}
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar empresas..."
        />

        {/* Grid de Empresas */}
        {isLoading ? (
          <EmpresasGridSkeleton count={12} />
        ) : empresas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhuma empresa encontrada para sua pesquisa.' : 'Nenhuma empresa cadastrada ainda.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {empresas.map((empresa) => (
                <EmpresaCard
                  key={empresa.id}
                  empresa={empresa}
                  onDelete={handleDeleteEmpresa}
                  showActions={true}
                  showOwner={true}
                  currentUser={currentUser}
                />
              ))}
            </div>

            {/* Botão Carregar Mais */}
            {pagination.page < pagination.totalPages && (
              <div className="text-center">
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  disabled={isLoading}
                >
                  Carregar Mais
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
} 