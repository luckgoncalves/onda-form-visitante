'use client';

import { useEffect, useState, useRef } from "react";
import { checkAuth, checkIsAdmin, createUser, deleteUser, listUsers, logout, updateUser } from "../actions";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Skeleton } from "@/components/ui/skeleton";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Trash2, Pencil, KeyRound, Search, X, Plus } from "lucide-react";
import { userSchema } from "./validate";
import { z } from "zod";
import ButtonForm from "@/components/button-form";
import Image from "next/image";
import { useDebounce } from "./hooks/useDebounce";
import { formatPhone } from "@/lib/utils";

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
  requirePasswordChange: boolean;
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const isAdminRef = useRef(false);

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const createUserForm = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "user",
    },
  });

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

  const onCreateUserSubmit = async (data: z.infer<typeof userSchema>) => {
    try {
      setIsLoading(true);
      await createUser({ ...data, password: 'ondadura' });
      await fetchUsers(debouncedSearchTerm);
      setIsCreateUserDialogOpen(false);
      createUserForm.reset();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
    } finally {
      setIsLoading(false);
    }
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

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  if (!isAdminRef.current) {
    return (
      <main className="flex w-full h-[100%]  min-h-screen flex-col  justify-center items-center gap-4 p-4">
        <div className="flex justify-center items-center h-full">
          <Image
            src="/logo.svg"
            alt="Onda Logo"
            width={550}
            height={350}
            className="m-auto"
          />
        </div>
      </main>
    );
  }

  return (
    <>
      <Header userName={userName} onLogout={handleLogout} />
      <div className="p-2 sm:p-6 mt-[72px] max-w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">Gerenciar Usuários</h1>
          <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
            <DialogTrigger asChild>
              <ButtonForm icon={<Plus size={20} />} label="Novo Usuário" type="button" />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
                <DialogDescription>
                  Preencha os dados abaixo para criar um novo usuário.
                </DialogDescription>
              </DialogHeader>
              <Form {...createUserForm}>
                <form onSubmit={createUserForm.handleSubmit(onCreateUserSubmit)} className="space-y-4">
                  <FormField
                    control={createUserForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createUserForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createUserForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(11) 99999-9999"
                            id="phone"
                            type="tel"
                            {...field}
                            onChange={(e) => {
                              const mask = formatPhone(e.target.value);
                              field.onChange(mask);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    A senha inicial será &quot;ondadura&quot;. O usuário será solicitado a alterá-la no primeiro login.
                  </div>
                  <FormField
                    control={createUserForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Papel</FormLabel>
                        <Select
                          onChange={field.onChange}
                          value={field.value}
                        >
                          <option value="user">Usuário</option>
                          <option value="admin">Administrador</option>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <ButtonForm type="submit" disabled={isLoading} label={isLoading ? "Criando..." : "Criar Usuário"} />
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6 w-full max-w-md sm:w-64">
          <Input
            type="text"
            placeholder="Buscar usuários por nome..."
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

        {/* Results count */}
        {!isLoadingUsers && (
          <div className="mb-4 text-sm text-gray-600">
            {searchTerm ? (
              <span>
                {users.length} usuário{users.length !== 1 ? 's' : ''} encontrado{users.length !== 1 ? 's' : ''} para &quot;{searchTerm}&quot;
              </span>
            ) : (
              <span>{users.length} usuário{users.length !== 1 ? 's' : ''} no total</span>
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
                {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? `Não encontramos usuários com o nome "${searchTerm}".`
                  : 'Comece criando o primeiro usuário do sistema.'
                }
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={handleClearSearch}>
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
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/users/${user.id}`)}
                      title="Editar usuário"
                      className="h-8 w-8"
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
                            Tem certeza que deseja forçar este usuário a redefinir sua senha no próximo login?
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
                            Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
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
                  <span className="text-gray-500 truncate">Papel: {user.role === 'admin' ? 'Administrador' : 'Usuário'}</span>
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