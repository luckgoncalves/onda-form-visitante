'use client';

import { useEffect, useState } from "react";
import { checkAuth, checkIsAdmin, createUser, deleteUser, listUsers, logout, updateUser } from "../actions";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Trash2, Pencil, KeyRound } from "lucide-react";

const userSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  role: z.string({
    required_error: "Selecione um papel",
  }).refine(value => ['user', 'admin'].includes(value), {
    message: "Papel inválido"
  })
});

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  requirePasswordChange: boolean;
};

type EditUserFormData = {
  name: string;
  email: string;
  role: string;
  password?: string;
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "user",
    },
  });

  const editForm = useForm<EditUserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "user",
    },
  });

  useEffect(() => {
    if (editingUser) {
      editForm.reset({
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
      });
    }
  }, [editingUser, editForm]);

  useEffect(() => {
    async function checkAdminAccess() {
      const { isAdmin } = await checkIsAdmin();
      if (!isAdmin) {
        router.push('/');
        return;
      }

      const { user } = await checkAuth();
      if (user) {
        setUserName(user.name);
      }

      fetchUsers();
    }

    checkAdminAccess();
  }, [router]);

  async function fetchUsers() {
    const fetchedUsers = await listUsers();
    setUsers(fetchedUsers.map(user => ({
      ...user,
      createdAt: user.createdAt.toISOString()
    })));
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const onSubmit = async (data: z.infer<typeof userSchema>) => {
    try {
      setIsLoading(true);
      await createUser({ ...data, password: 'ondadura' });
      await fetchUsers();
      setIsDialogOpen(false);
      form.reset();
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

  const onSubmitEdit = async (data: z.infer<typeof userSchema>) => {
    if (!editingUser) return;
    
    try {
      setIsLoading(true);
      await updateUser(editingUser.id, data);
      await fetchUsers();
      setEditingUser(null);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForcePasswordChange = async (userId: string) => {
    try {
      setIsLoading(true);
      await updateUser(userId, {
        ...users.find(u => u.id === userId)!,
        requirePasswordChange: true
      });
      await fetchUsers();
    } catch (error) {
      console.error('Erro ao forçar redefinição de senha:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header userName={userName} onLogout={handleLogout} />
      <div className="p-2 sm:p-6 mt-[72px]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">Gerenciar Usuários</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Novo Usuário</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
                <DialogDescription>
                  Preencha os dados abaixo para criar um novo usuário.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Criando..." : "Criar Usuário"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
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
                    onClick={() => setEditingUser(user)}
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
                        <AlertDialogAction onClick={() => handleForcePasswordChange(user.id)}>
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
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
                        <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
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
          ))}
        </div>
      </div>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Altere os dados do usuário abaixo.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
              <FormField
                control={editForm.control}
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
                control={editForm.control}
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
                control={editForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha (deixe em branco para manter a atual)</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Papel</FormLabel>
                    <select
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    >
                      <option value="user">Usuário</option>
                      <option value="admin">Administrador</option>
                    </select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
} 