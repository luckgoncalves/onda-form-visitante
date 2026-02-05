'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/header';
import { checkAuth, logout } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import ButtonForm from '@/components/button-form';
import GruposTableSkeleton from '@/components/grupos/grupos-table-skeleton';

interface Grupo {
  id: string;
  nome: string;
  categoria: string;
  diaSemana: string;
  horario: string;
  bairro?: {
    id: string;
    nome: string;
  };
  lideres: {
    id: string;
    name: string;
    email: string;
  }[];
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Hook useDebounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function GruposPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [campusNome, setCampusNome] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const router = useRouter();
  const { toast } = useToast();

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const loadGrupos = useCallback(async (page: number = 1, limit: number = 10, search: string = '') => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search.trim() && { search: search.trim() })
      });
      

      
      const response = await fetch(`/api/grupos?${params}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar grupos');
      }

      const data = await response.json();
      setGrupos(data.grupos);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar grupos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

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
        setUserId(user.id);
        setCampusNome(user.campusNome || null);
        // Carregar grupos
        await loadGrupos(1, 10, '');
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
  }, [router, toast, loadGrupos]);

  // Fetch grupos when debounced search term changes
  useEffect(() => {
    if (userName) { // Only search if user is authenticated
      loadGrupos(1, 10, debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, userName, loadGrupos]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleDeleteGrupo = async (id: string) => {
    try {
      const response = await fetch(`/api/grupos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao remover grupo');
      }

      toast({
        title: 'Sucesso',
        description: 'Grupo removido com sucesso!',
      });

      // Recarregar a lista
      await loadGrupos(1, 10, debouncedSearchTerm);
    } catch (error) {
      console.error('Erro ao remover grupo:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover grupo',
        variant: 'destructive',
      });
    }
  };

  const formatCategoria = (categoria: string) => {
    const categorias: { [key: string]: string } = {
      HOMENS: 'Homens',
      UNVT: 'UNVT',
      MULHERES: 'Mulheres',
      MISTO: 'Misto',
      NEW: 'New',
      CASAIS: 'Casais',
    };
    return categorias[categoria] || categoria;
  };

  const formatDiaSemana = (dia: string) => {
    const dias: { [key: string]: string } = {
      SEGUNDA: 'Segunda-feira',
      TERCA: 'Terça-feira',
      QUARTA: 'Quarta-feira',
      QUINTA: 'Quinta-feira',
      SEXTA: 'Sexta-feira',
      SABADO: 'Sábado',
      DOMINGO: 'Domingo',
    };
    return dias[dia] || dia;
  };

  const formatHorario = (horario: string) => {
    // Se já está no formato HH:MM, retorna como está
    if (horario.includes(':')) {
      return horario;
    }
    // Caso contrário, formata como HH:MM
    return horario.length === 4 ? `${horario.slice(0, 2)}:${horario.slice(2)}` : horario;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadGrupos(newPage, 10, debouncedSearchTerm);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <>
      <Header userId={userId} userName={userName} campusNome={campusNome} onLogout={handleLogout} />
      
      <div className="p-2 sm:p-6 mt-[72px]">
        {/* Search Bar */}
        <div className="relative mb-6 w-full max-w-md">
          <Input
            type="text"
            placeholder="Buscar grupos por nome, categoria, bairro ou líder..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 bg-white rounded-md border-gray-300 focus:border-gray-500 focus:ring-gray-500 w-full"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>

        {/* Results counter */}
        {!isLoading && (
          <div className="mb-4 text-sm text-gray-600">
            {searchTerm ? (
              <span>
                {pagination.total} grupo{pagination.total !== 1 ? 's' : ''} encontrado{pagination.total !== 1 ? 's' : ''} para &quot;{searchTerm}&quot;
              </span>
            ) : (
              <span>{pagination.total} grupo{pagination.total !== 1 ? 's' : ''} no total</span>
            )}
          </div>
        )}

        {isLoading ? (
          <GruposTableSkeleton />
        ) : (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>GP&apos;s</CardTitle>
                  <CardDescription>
                    Gerencie os grupos pequenos
                  </CardDescription>
                </div>
                <ButtonForm onClick={() => router.push('/dashboard/grupos/new')} label={`Novo GP`} icon={<Plus size={20} />} />
              </div>
            </CardHeader>
            
            <CardContent>
              {grupos.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-gray-400 mb-4 mx-auto" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchTerm ? 'Nenhum grupo encontrado' : 'Nenhum GP encontrado'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm
                      ? `Não encontramos grupos com "${searchTerm}".`
                      : 'Comece criando o primeiro GP do sistema.'
                    }
                  </p>
                  {searchTerm ? (
                    <Button variant="outline" onClick={handleClearSearch}>
                      Limpar busca
                    </Button>
                  ) : (
                    <Button onClick={() => router.push('/dashboard/grupos/new')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro GP
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">Nome</th>
                        <th className="text-left p-4 font-medium">Categoria</th>
                        <th className="text-left p-4 font-medium">Dia da Semana</th>
                        <th className="text-left p-4 font-medium">Horário</th>
                        <th className="text-left p-4 font-medium">Bairro</th>
                        <th className="text-left p-4 font-medium">Líderes</th>
                        <th className="text-left p-4 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grupos.map((grupo) => (
                        <tr key={grupo.id} className="border-b hover:bg-gray-50">
                          <td className="p-4 font-medium">{grupo.nome}</td>
                          <td className="p-4">
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {formatCategoria(grupo.categoria)}
                            </span>
                          </td>
                          <td className="p-4">{formatDiaSemana(grupo.diaSemana)}</td>
                          <td className="p-4">{formatHorario(grupo.horario)}</td>
                          <td className="p-4">
                            {grupo.bairro ? grupo.bairro.nome : '-'}
                          </td>
                          <td className="p-4">
                            {grupo.lideres.length > 0 ? (
                              <div className="space-y-1">
                                {grupo.lideres.map((lider) => (
                                  <div key={lider.id} className="text-sm">
                                    {lider.name}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/dashboard/grupos/${grupo.id}/edit`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja remover este grupo? Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteGrupo(grupo.id)}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Remover
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Componente de Paginação */}
              {pagination.totalPages > 1 && (
                <div className="border-t">
                  {/* Informações da paginação - Mobile */}
                  <div className="flex items-center justify-center px-4 py-2 text-sm text-gray-500 sm:hidden">
                    Página {pagination.page} de {pagination.totalPages}
                  </div>
                  
                  {/* Informações da paginação - Desktop */}
                  <div className="hidden sm:flex items-center justify-between px-4 py-3">
                    <div className="flex items-center text-sm text-gray-500">
                      Mostrando {((pagination.page - 1) * pagination.limit) + 1} até {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} resultados
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Anterior</span>
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {/* Páginas */}
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          let pageNumber;
                          if (pagination.totalPages <= 5) {
                            pageNumber = i + 1;
                          } else if (pagination.page <= 3) {
                            pageNumber = i + 1;
                          } else if (pagination.page >= pagination.totalPages - 2) {
                            pageNumber = pagination.totalPages - 4 + i;
                          } else {
                            pageNumber = pagination.page - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNumber}
                              variant={pagination.page === pageNumber ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNumber)}
                              className="min-w-[40px]"
                            >
                              {pageNumber}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                      >
                        <span className="hidden sm:inline">Próxima</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Controles de paginação - Mobile */}
                  <div className="flex items-center justify-center space-x-2 px-4 py-3 sm:hidden">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {/* Páginas - versão mobile (máximo 3 páginas visíveis) */}
                      {Array.from({ length: Math.min(3, pagination.totalPages) }, (_, i) => {
                        let pageNumber;
                        if (pagination.totalPages <= 3) {
                          pageNumber = i + 1;
                        } else if (pagination.page <= 2) {
                          pageNumber = i + 1;
                        } else if (pagination.page >= pagination.totalPages - 1) {
                          pageNumber = pagination.totalPages - 2 + i;
                        } else {
                          pageNumber = pagination.page - 1 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNumber}
                            variant={pagination.page === pageNumber ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNumber)}
                            className="min-w-[40px]"
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
} 