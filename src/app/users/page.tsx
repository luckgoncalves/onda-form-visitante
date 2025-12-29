'use client';

import { useEffect, useState, useRef } from "react";
import { checkAuth, checkIsAdmin, deleteUser, listUsers, logout, updateUser } from "../actions";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Pencil, KeyRound, Search, Plus, Building } from "lucide-react";
import { SearchInput } from "@/components/search-input";
import { useDebounce } from "./hooks/useDebounce";
import ButtonForm from "@/components/button-form";
import LoadingOnda from "@/components/loading-onda";
import { formatRole } from "@/lib/utils";

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
  approved?: boolean;
  requirePasswordChange: boolean;
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const isAdminRef = useRef(false);

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

      fetchUsers();
    }

    checkAdminAccess();
  }, [router]);

  // Fetch users when debounced search term changes
  useEffect(() => {
    if (isAdminRef.current) {
      fetchUsers(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  async function fetchUsers(search?: string) {
    try {
      setIsLoadingUsers(true);
      const fetchedUsers = await listUsers(search);
      setUsers(fetchedUsers.map(user => ({
        ...user,
        phone: user.phone || undefined,
        createdAt: user.createdAt.toISOString()
      })));
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      await fetchUsers(debouncedSearchTerm);
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
    }
  };

  const handleForcePasswordChange = async (userId: string) => {
    try {
      setIsLoading(true);
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) {
        console.error('User not found for password change');
        setIsLoading(false);
        return;
      }
      await updateUser(userId, {
        name: userToUpdate.name,
        email: userToUpdate.email,
        role: userToUpdate.role,
        requirePasswordChange: true
      });
      await fetchUsers(debouncedSearchTerm);
    } catch (error) {
      console.error('Erro ao forçar redefinição de senha:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdminRef.current) {
    return (
      <LoadingOnda />
    );
  }

  return (
    <>
      <Header userId={userId} userName={userName} onLogout={handleLogout} />
      <div className="p-2 sm:p-6 mt-[72px] max-w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">Gerenciar Membros</h1>
          <div className="flex gap-2">
            <ButtonForm
              label="Usuários Pendentes"
              icon={<Search size={20} />}
              onClick={() => router.push('/users/pending')}
              className="bg-orange-500 hover:bg-orange-600"
            />
            <ButtonForm
              label="Novo Membro"
              icon={<Plus size={20} />}
              onClick={() => router.push('/users/create')}
            />
          </div>
        </div>

        {/* Search Bar */}
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar membros por nome..."
        />

        {/* Results count */}
        {!isLoadingUsers && (
          <div className="mb-4 text-sm text-gray-600">
            {searchTerm ? (
              <span>
                {users.length} membro{users.length !== 1 ? 's' : ''} encontrado{users.length !== 1 ? 's' : ''} para &quot;{searchTerm}&quot;
              </span>
            ) : (
              <span>{users.length} membro{users.length !== 1 ? 's' : ''} no total</span>
            )}
          </div>
        )}

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {isLoadingUsers ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={`skeleton-${index}`} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
                <div className="flex justify-between mt-4">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </Card>
            ))
          ) : users.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'Nenhum membro encontrado' : 'Nenhum membro cadastrado'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? `Não encontramos membros com o nome "${searchTerm}".`
                  : 'Comece criando o primeiro membro do sistema.'
                }
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Limpar busca
                </Button>
              )}
            </div>
          ) : (
            users.map((user) => (
              <Card key={user.id} className="p-4 w-full">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold truncate">{user.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    {user.phone && (
                      <p className="text-sm text-gray-500 truncate">{user.phone}</p>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/users/${user.id}/empresas`)}
                      title="Gerenciar empresas"
                    >
                      <Building className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/users/${user.id}`)}
                      title="Editar usuário"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Forçar redefinição de senha"
                          className="h-8 w-8"
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Forçar redefinição de senha</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja forçar este membro a redefinir sua senha no próximo login?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction className="bg-[#503387] hover:bg-[#503387]/90 text-white" onClick={() => handleForcePasswordChange(user.id)}>
                            Confirmar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" title="Excluir usuário" className="h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir este membro? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction className="bg-[#503387] hover:bg-[#503387]/90 text-white" onClick={() => handleDeleteUser(user.id)}>
                            Confirmar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-sm">
                  <span className="text-gray-500 truncate">Papel: {formatRole(user.role)}</span>
                  <span className="text-gray-500 truncate">
                    Criado em: {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
} 