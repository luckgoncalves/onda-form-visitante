'use client';

import { useEffect, useState, useRef } from "react";
import { checkAuth, checkIsAdmin, logout } from "../../actions";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X, Search, ArrowLeft, Building, Mail, Phone, Calendar } from "lucide-react";
import { SearchInput } from "@/components/search-input";
import { useDebounce } from "../hooks/useDebounce";
import LoadingOnda from "@/components/loading-onda";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type PendingUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  approved: boolean;
  createdAt: string;
  empresas: Array<{
    empresa: {
      id: string;
      nomeNegocio: string;
      ramoAtuacao: string;
      email: string;
      whatsapp: string;
    };
  }>;
};

export default function PendingUsersPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();
  const isAdminRef = useRef(false);
  const { toast } = useToast();

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    async function checkAdminAccess() {
      const { isAdmin } = await checkIsAdmin();
      if (!isAdmin) {
        router.push('/');
        return;
      }
      isAdminRef.current = isAdmin;

      const authResult = await checkAuth();
      if (authResult.user) {
        setUserName(authResult.user.name);
        setUserId(authResult.user.id);
      }

      fetchPendingUsers();
    }

    checkAdminAccess();
  }, [router]);

  // Fetch users when debounced search term or page changes
  useEffect(() => {
    if (isAdminRef.current) {
      fetchPendingUsers(debouncedSearchTerm, page);
    }
  }, [debouncedSearchTerm, page]);

  async function fetchPendingUsers(search?: string, currentPage: number = 1) {
    try {
      setIsLoadingUsers(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });
      
      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/users/pending?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar usuários pendentes');
      }

      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Erro ao buscar usuários pendentes:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao buscar usuários pendentes',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingUsers(false);
    }
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleApproveUser = async (userId: string, approve: boolean) => {
    try {
      setIsLoading(true);
      setLoadingUserId(userId);
      const response = await fetch(`/api/users/${userId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approved: approve }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar status do usuário');
      }

      toast({
        title: 'Sucesso',
        description: approve 
          ? 'Usuário aprovado com sucesso!' 
          : 'Usuário rejeitado com sucesso!',
      });

      // Recarregar lista
      await fetchPendingUsers(debouncedSearchTerm, page);
    } catch (error) {
      console.error('Erro ao aprovar/rejeitar usuário:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao atualizar status do usuário',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setLoadingUserId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!userName) {
    return <LoadingOnda />;
  }

  return (
    <>
      <Header userId={userId} userName={userName} onLogout={handleLogout} />
      <div className="p-2 sm:p-6 mt-[72px] max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push('/users')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Usuários Pendentes</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Aprove ou rejeite cadastros de novos usuários
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <SearchInput
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(value) => {
              setSearchTerm(value);
              setPage(1); // Reset to first page on new search
            }}
          />
        </div>

        {/* Users List */}
        {isLoadingUsers ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-20 w-full" />
              </Card>
            ))}
          </div>
        ) : users.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhum usuário pendente encontrado' : 'Nenhum usuário pendente de aprovação'}
            </p>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 mb-6">
              {users.map((user) => (
                <Card key={user.id} className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{user.name}</h3>
                          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {user.phone}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(user.createdAt)}
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          Pendente
                        </Badge>
                      </div>

                      {/* Empresas */}
                      {user.empresas && user.empresas.length > 0 && (
                        <div className="mt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Empresas ({user.empresas.length})</span>
                          </div>
                          <div className="grid gap-2 pl-6">
                            {user.empresas.map((userEmpresa) => (
                              <div key={userEmpresa.empresa.id} className="text-sm">
                                <span className="font-medium">{userEmpresa.empresa.nomeNegocio}</span>
                                <span className="text-muted-foreground ml-2">
                                  - {userEmpresa.empresa.ramoAtuacao}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 sm:flex-col">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="default"
                            size="sm"
                            disabled={isLoading}
                            className="w-full sm:w-auto"
                          >
                            {loadingUserId === user.id ? (
                              <>
                                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Processando...
                              </>
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Aprovar
                              </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Aprovação</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja aprovar o usuário <strong>{user.name}</strong>?
                              {user.empresas && user.empresas.length > 0 && (
                                <span className="block mt-2">
                                  Este usuário possui {user.empresas.length} empresa(s) cadastrada(s).
                                </span>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleApproveUser(user.id, true)}
                              disabled={isLoading}
                            >
                              {loadingUserId === user.id ? 'Aprovando...' : 'Aprovar'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isLoading}
                            className="w-full sm:w-auto"
                          >
                            {loadingUserId === user.id ? (
                              <>
                                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Processando...
                              </>
                            ) : (
                              <>
                                <X className="h-4 w-4 mr-2" />
                                Rejeitar
                              </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Rejeição</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja rejeitar o usuário <strong>{user.name}</strong>?
                              <br /><br />
                              <strong className="text-red-600">Atenção:</strong> Esta ação irá remover permanentemente o usuário e todas as empresas vinculadas a ele do sistema.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleApproveUser(user.id, false)}
                              disabled={isLoading}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {loadingUserId === user.id ? 'Removendo...' : 'Rejeitar e Remover'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoadingUsers}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || isLoadingUsers}
                >
                  Próxima
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

