'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { checkAuth } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import ButtonForm from '@/components/button-form';
import { Skeleton } from '@/components/ui/skeleton';

interface Membro {
  user: { id: string; name: string; email: string };
}

interface Ministerio {
  id: string;
  nome: string;
  descricao?: string;
  lider: { id: string; name: string; email: string };
  coLider?: { id: string; name: string; email: string } | null;
  membros: Membro[];
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export default function MinisteriosPage() {
  const [ministerios, setMinisterios] = useState<Ministerio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const router = useRouter();
  const { toast } = useToast();

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const loadMinisterios = useCallback(
    async (page = 1, limit = 10, search = '') => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(search.trim() && { search: search.trim() }),
        });

        const response = await fetch(`/api/ministerios?${params}`);
        if (!response.ok) throw new Error('Erro ao carregar ministérios');

        const data = await response.json();
        setMinisterios(data.ministerios);
        setPagination(data.pagination);
      } catch (error) {
        console.error('Erro ao carregar ministérios:', error);
        toast({ title: 'Erro', description: 'Erro ao carregar ministérios', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    async function init() {
      const { user } = await checkAuth();
      if (!user) {
        router.push('/');
        return;
      }
      setIsAuthenticated(true);
      await loadMinisterios();
    }
    init();
  }, [router, loadMinisterios]);

  useEffect(() => {
    if (isAuthenticated) {
      loadMinisterios(1, 10, debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, isAuthenticated, loadMinisterios]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/ministerios/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erro ao remover ministério');
      toast({ title: 'Sucesso', description: 'Ministério removido com sucesso!' });
      await loadMinisterios(1, 10, debouncedSearchTerm);
    } catch (error) {
      console.error('Erro ao remover ministério:', error);
      toast({ title: 'Erro', description: 'Erro ao remover ministério', variant: 'destructive' });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadMinisterios(newPage, 10, debouncedSearchTerm);
    }
  };

  return (
    <div className="p-2 sm:p-6 mt-[72px]">
      {/* Busca */}
      <div className="relative mb-6 w-full max-w-md">
        <Input
          type="text"
          placeholder="Buscar por nome ou líder..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10 bg-white rounded-md border-gray-300 focus:border-gray-500 focus:ring-gray-500 w-full"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchTerm('')}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      </div>

      {!isLoading && (
        <div className="mb-4 text-sm text-gray-600">
          {searchTerm ? (
            <span>
              {pagination.total} ministério{pagination.total !== 1 ? 's' : ''} encontrado{pagination.total !== 1 ? 's' : ''} para &quot;{searchTerm}&quot;
            </span>
          ) : (
            <span>{pagination.total} ministério{pagination.total !== 1 ? 's' : ''} no total</span>
          )}
        </div>
      )}

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Ministérios</CardTitle>
                <CardDescription>Gerencie os ministérios da igreja</CardDescription>
              </div>
              <ButtonForm
                onClick={() => router.push('/dashboard/ministerios/new')}
                label="Novo Ministério"
                icon={<Plus size={20} />}
              />
            </div>
          </CardHeader>

          <CardContent>
            {ministerios.length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'Nenhum ministério encontrado' : 'Nenhum ministério cadastrado'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm
                    ? `Não encontramos ministérios com "${searchTerm}".`
                    : 'Comece criando o primeiro ministério.'}
                </p>
                {searchTerm ? (
                  <Button variant="outline" onClick={() => setSearchTerm('')}>
                    Limpar busca
                  </Button>
                ) : (
                  <Button onClick={() => router.push('/dashboard/ministerios/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Ministério
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Nome</th>
                      <th className="text-left p-4 font-medium">Líder</th>
                      <th className="text-left p-4 font-medium">Co-Líder</th>
                      <th className="text-left p-4 font-medium">Membros</th>
                      <th className="text-left p-4 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ministerios.map((ministerio) => (
                      <tr key={ministerio.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium">
                          <div>{ministerio.nome}</div>
                          {ministerio.descricao && (
                            <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                              {ministerio.descricao}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-sm">{ministerio.lider.name}</td>
                        <td className="p-4 text-sm">{ministerio.coLider?.name || '-'}</td>
                        <td className="p-4">
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {ministerio.membros.length}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/dashboard/ministerios/${ministerio.id}/edit`)}
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
                                    Tem certeza que deseja remover o ministério &quot;{ministerio.nome}&quot;? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(ministerio.id)}
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

            {pagination.totalPages > 1 && (
              <div className="border-t">
                <div className="hidden sm:flex items-center justify-between px-4 py-3">
                  <div className="text-sm text-gray-500">
                    Mostrando {(pagination.page - 1) * pagination.limit + 1} até{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} resultados
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
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNumber: number;
                      if (pagination.totalPages <= 5) pageNumber = i + 1;
                      else if (pagination.page <= 3) pageNumber = i + 1;
                      else if (pagination.page >= pagination.totalPages - 2)
                        pageNumber = pagination.totalPages - 4 + i;
                      else pageNumber = pagination.page - 2 + i;
                      return (
                        <Button
                          key={pageNumber}
                          variant={pagination.page === pageNumber ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(pageNumber)}
                          className="min-w-[40px]"
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
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

                <div className="flex items-center justify-center space-x-2 px-4 py-3 sm:hidden">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-500">
                    {pagination.page} / {pagination.totalPages}
                  </span>
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
  );
}
