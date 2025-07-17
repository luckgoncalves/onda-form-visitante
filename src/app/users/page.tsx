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
import { Trash2, Pencil, KeyRound } from "lucide-react";
import { userSchema } from "./validate";
import { z } from "zod";
import ButtonForm from "@/components/button-form";
import Image from "next/image";

type User = {
  id: string;
  name: string;
  email: string;
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
  const router = useRouter();
  const isAdminRef = useRef(false);

  const createUserForm = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
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

  async function fetchUsers() {
    try {
      setIsLoadingUsers(true);
      const fetchedUsers = await listUsers();
      setUsers(fetchedUsers.map(user => ({
        ...user,
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
      await fetchUsers();
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
      await fetchUsers();
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
      await fetchUsers();
    } catch (error) {
      console.error('Erro ao forçar redefinição de senha:', error);
    } finally {
      setIsLoading(false);
    }
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
      <div className="p-2 sm:p-6 mt-[72px]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">Gerenciar Usuários</h1>
          <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
            <DialogTrigger asChild>
              <ButtonForm label="Novo Usuário" type="button" />
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          ) : (
            users.map((user) => (
              <Card key={user.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
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
                        <Button variant="ghost" size="icon" title="Excluir usuário">
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
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Papel: {user.role === 'admin' ? 'Administrador' : 'Usuário'}</span>
                  <span className="text-gray-500">
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