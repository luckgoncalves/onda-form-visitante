'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import ButtonForm from '@/components/button-form';
import { checkAuth, checkIsAdmin, updateUser } from '@/app/actions';
import { editUserPageSchema } from '../validate'; // Assuming validate.ts is in the parent users folder src/app/users/validate.ts
import { formatPhone } from '@/lib/utils';

type UserData = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  // requirePasswordChange: boolean; // This might be useful to display but not directly editable here
};

type EditUserPageFormData = z.infer<typeof editUserPageSchema>;

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUser, setIsFetchingUser] = useState(true);
  const [userName, setUserName] = useState("");
  const [fetchError, setFetchError] = useState<string | null>(null);

  const form = useForm<EditUserPageFormData>({
    resolver: zodResolver(editUserPageSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role: 'user',
      password: '',
    },
  });

  useEffect(() => {
    async function setupPageAndFetchUser() {
      try {
        const auth = await checkAuth();
        if (!auth.user) {
          router.push('/');
          return;
        }
        setUserName(auth.user.name);

        const { isAdmin } = await checkIsAdmin();
        if (!isAdmin) {
          router.push('/');
          return;
        }

        if (userId) {
          setIsFetchingUser(true);
          setFetchError(null);
          const response = await fetch(`/api/users/${userId}`);
          if (!response.ok) {
            if (response.status === 404) {
              setFetchError('Usuário não encontrado.');
            } else {
              setFetchError('Falha ao buscar dados do usuário.');
            }
            // console.error('Failed to fetch user data', response);
            // router.push('/users'); // Optionally redirect immediately
            setIsFetchingUser(false);
            return;
          }
          const userData: UserData = await response.json();
          setUser(userData);
          form.reset({
            name: userData.name,
            email: userData.email,
            phone: userData.phone || '',
            role: userData.role,
            password: '',
          });
        } else {
          setFetchError("ID do usuário não fornecido.");
        }
      } catch (error) {
        console.error('Error setting up page or fetching user:', error);
        setFetchError('Ocorreu um erro ao carregar a página.');
      } finally {
        setIsFetchingUser(false);
      }
    }

    setupPageAndFetchUser();
  }, [userId, router, form]);

  const onSubmit = async (data: EditUserPageFormData) => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Define the payload structure matching UpdateUserData from actions.ts
      // (name: string, email: string, role: string, password?: string, requirePasswordChange?: boolean)
      const updatePayload: {
        name: string;
        email: string;
        phone?: string;
        role: string;
        password?: string;
        // requirePasswordChange is not part of this form, so we don't include it.
        // The updateUser action should handle if it's undefined.
      } = {
        name: data.name,     // This is string due to EditUserPageFormData
        email: data.email,    // This is string
        phone: data.phone,    // This is string or undefined
        role: data.role,     // This is string
      };

      if (data.password && data.password.trim() !== '') {
        updatePayload.password = data.password;
      }

      await updateUser(user.id, updatePayload);
      router.push('/users');
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      // Consider adding an error toast/message here
      // For example, form.setError("root.serverError", { type: "manual", message: "Falha ao atualizar" });
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state for the whole page content based on user fetching
  if (isFetchingUser) {
    return (
      <>
        <div className="p-2 sm:p-6 max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-24" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-1/2" />
              <Skeleton className="h-4 w-3/4 mt-1" />
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-40" />
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // If fetching is done and there was an error or no user
  if (fetchError || !user) {
    return (
      <>
        <div className="p-2 sm:p-6 max-w-2xl mx-auto flex flex-col items-center justify-center text-center">
          <h1 className="text-xl sm:text-2xl font-bold mb-4">{fetchError || 'Usuário não encontrado'}</h1>
          <Button variant="outline" onClick={() => router.push('/users')}>Voltar para Usuários</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="p-2 sm:p-6 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">Editar Membro</h1>
          <Button variant="outline" onClick={() => router.push('/users')}>Voltar</Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Detalhes de {user.name}</CardTitle>
            <CardDescription>
              Atualize as informações do membro abaixo. Deixe o campo de senha em branco para manter a senha atual.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo do membro" {...field} />
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
                        <Input type="email" placeholder="exemplo@dominio.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
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
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Deixe em branco para não alterar" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Papel</FormLabel>
                      <FormControl>
                        {/* Using a native select. Replace with ShadCN Select if preferred and available */}
                        <select
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="user">Usuário</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Display server-side error from form.setError here if implemented */}
                {form.formState.errors.root?.serverError && (
                  <p className="text-sm font-medium text-destructive">{form.formState.errors.root.serverError.message}</p>
                )}
                <ButtonForm type="submit" disabled={isLoading || isFetchingUser} label={isLoading ? "Salvando..." : "Salvar Alterações"} />
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 