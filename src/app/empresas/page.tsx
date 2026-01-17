'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { HeaderPublic } from '@/components/header-public';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { checkAuth, logout } from '@/app/actions';
import { useDebounce } from '@/app/users/hooks/useDebounce';
import EmpresaCard from '@/components/empresas/empresa-card';
import { EmpresasGridSkeleton } from '@/components/empresas/empresa-skeleton';
import { Empresa, EmpresaListResponse, EmpresaFiltersResponse, EmpresaContactChannel, EMPRESA_CONTACT_CHANNELS } from '@/types/empresa';
import { SearchInput } from '@/components/search-input';
import { EmpresaFilters } from '@/components/empresas/empresa-filters';

export default function EmpresasPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<{
    ramos: string[];
    channels: EmpresaContactChannel[];
    ownerName: string;
  }>({
    ramos: [],
    channels: [],
    ownerName: '',
  });
  const [availableRamos, setAvailableRamos] = useState<string[]>([]);
  const [availableChannels, setAvailableChannels] = useState<EmpresaContactChannel[]>();
  const [isFetchingFilterOptions, setIsFetchingFilterOptions] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const requestIdRef = useRef(0);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Verificar autenticação
  useEffect(() => {
    async function checkAuthentication() {
      try {
        const authResult = await checkAuth();
        if (authResult.isAuthenticated && authResult.user) {
          setIsAuthenticated(true);
          setUserName(authResult.user.name);
          setUserId(authResult.user.id);
          setCurrentUser({
            id: authResult.user.id,
            role: authResult.user.role,
          });
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    }

    checkAuthentication();
  }, []);

  // Carregar empresas na inicialização (independente de autenticação)
  useEffect(() => {
    fetchEmpresas();
    fetchFilterOptions();
  }, []); //eslint-disable-line

  // Recarregar empresas quando busca ou filtros mudarem
  useEffect(() => {
    fetchEmpresas(1, debouncedSearchTerm, filters);
  }, [debouncedSearchTerm, filters]); //eslint-disable-line

  const fetchEmpresas = async (
    page = 1,
    search = '',
    appliedFilters: { ramos: string[]; channels: EmpresaContactChannel[]; ownerName: string } = filters,
    options?: { append?: boolean; showLoading?: boolean }
  ) => {
    const requestId = ++requestIdRef.current;
    const { append = false, showLoading = true } = options || {};

    try {
      if (showLoading) {
        setIsLoading(true);
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (search) {
        params.append('search', search);
      }

      if (appliedFilters.ramos.length > 0) {
        params.append('ramo', appliedFilters.ramos.join(','));
      }

      if (appliedFilters.channels.length > 0) {
        params.append('channels', appliedFilters.channels.join(','));
      }

      if (appliedFilters.ownerName) {
        params.append('ownerName', appliedFilters.ownerName);
      }

      const response = await fetch(`/api/empresas?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar empresas');
      }

      const data: EmpresaListResponse = await response.json();
      if (requestId === requestIdRef.current) {
        setEmpresas((prev) => (append ? [...prev, ...data.empresas] : data.empresas));
        setPagination(data.pagination);
      }

    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar empresas',
        variant: 'destructive',
      });
    } finally {
      if (showLoading && requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  const fetchFilterOptions = async () => {
    try {
      setIsFetchingFilterOptions(true);
      const response = await fetch('/api/empresas/filters');

      if (!response.ok) {
        throw new Error('Erro ao carregar filtros');
      }

      const data: EmpresaFiltersResponse = await response.json();
      setAvailableRamos(data.ramos);
      setAvailableChannels(data.channels);
    } catch (error) {
      console.error('Erro ao carregar filtros de empresas:', error);
      setAvailableChannels(Array.from(EMPRESA_CONTACT_CHANNELS) as EmpresaContactChannel[]);
    } finally {
      setIsFetchingFilterOptions(false);
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

      await fetchEmpresas(pagination.page, debouncedSearchTerm, filters);

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

  const handleLoadMore = async () => {
    if (pagination.page < pagination.totalPages && !isLoadingMore) {
      setIsLoadingMore(true);
      try {
        await fetchEmpresas(
          pagination.page + 1,
          debouncedSearchTerm,
          filters,
          { append: true, showLoading: false }
        );
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  const handleRamosChange = (nextRamos: string[]) => {
    setFilters((prev) => ({
      ...prev,
      ramos: nextRamos,
    }));
  };

  const handleChannelsChange = (nextChannels: EmpresaContactChannel[]) => {
    setFilters((prev) => ({
      ...prev,
      channels: nextChannels,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      ramos: [],
      channels: [],
      ownerName: '',
    });
  };

  const handleOwnerNameChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      ownerName: value,
    }));
  };

  return (
    <>
      {isAuthenticated ? (
        <Header userId={userId} userName={userName} onLogout={handleLogout} />
      ) : (
        <HeaderPublic />
      )}
      <div className="p-2 sm:p-6 max-w-7xl mx-auto mt-[72px]">
        {/* Header da página */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-onda-darkBlue font-gotham">Empresas</h1>
            <p className="text-gray-600 mt-1">
              {pagination.total} empresa{pagination.total !== 1 ? 's' : ''} cadastrada{pagination.total !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Barra de Pesquisa + Filtros */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar empresas..."
            className="w-full sm:max-w-xl mb-0"
          />

          <div className="w-full sm:w-auto">
            <EmpresaFilters
              availableRamos={availableRamos}
              availableChannels={availableChannels || Array.from(EMPRESA_CONTACT_CHANNELS) as EmpresaContactChannel[]}
              selectedRamos={filters.ramos}
              selectedChannels={filters.channels}
              ownerName={filters.ownerName}
              onRamosChange={handleRamosChange}
              onChannelsChange={handleChannelsChange}
              onOwnerNameChange={handleOwnerNameChange}
              onClearAll={handleClearFilters}
              isFetchingOptions={isFetchingFilterOptions}
            />
          </div>
        </div>

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
                  disabled={isLoading || isLoadingMore}
                  className="border-onda-darkBlue/20 hover:bg-onda-darkBlue/10 hover:border-onda-darkBlue/40 text-onda-darkBlue"
                >
                  {isLoadingMore ? 'Carregando...' : 'Carregar Mais'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
} 