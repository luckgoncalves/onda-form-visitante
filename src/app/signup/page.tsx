'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Info } from 'lucide-react';
import { registerUserSchema } from '@/lib/validations/register';
import ButtonForm from '@/components/button-form';
import Image from 'next/image';
import { z } from 'zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CampusCombobox } from '@/components/campus-combobox';

// Cadastro pede só os dados obrigatórios; telefone, foto, membresia e empresas
// podem ser completados depois em "Meu perfil".
const signupSchema = registerUserSchema.pick({ name: true, email: true, password: true });

type SignupData = z.infer<typeof signupSchema>;

type Campus = {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
};

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [campusList, setCampusList] = useState<Campus[]>([]);
  const [selectedCampusId, setSelectedCampusId] = useState<string>('');
  const [campusError, setCampusError] = useState(false);

  // Buscar lista de campus ao carregar a página
  useEffect(() => {
    async function fetchCampus() {
      try {
        const response = await fetch('/api/campus');
        if (response.ok) {
          const data = await response.json();
          setCampusList(data);
          // Se houver apenas um campus, seleciona automaticamente
          if (data.length === 1) {
            setSelectedCampusId(data[0].id);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar campus:', error);
      }
    }
    fetchCampus();
  }, []);

  const form = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const handleSubmit = form.handleSubmit(async (userData) => {
    if (campusList.length > 0 && !selectedCampusId) {
      setCampusError(true);
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: {
            ...userData,
            role: 'user',
            campusId: selectedCampusId || undefined,
          },
          empresas: [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar conta');
      }

      toast({
        title: 'Cadastro realizado com sucesso!',
        description: data.message || 'Sua conta foi criada. Aguarde a aprovação de um administrador para fazer login.',
      });

      // Redirecionar para página de login após alguns segundos
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao criar conta. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <main className="flex w-full min-h-screen flex-col items-center gap-4 p-2 sm:p-6">
      <div className="p-2 sm:p-6 max-w-2xl mx-auto w-full">
        {/* Header da página */}
        <div className="flex items-center justify-center mb-6">
          <Image
            src="/logos/logo-principal-preto.png"
            alt="Igreja Onda"
            width={240}
            height={50}
            className="h-10 w-auto mx-auto"
            priority
          />
        </div>

        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Criar Conta</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Preencha seus dados para se cadastrar
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <Card className="bg-white border border-slate-200">
          <CardContent className="p-6">
            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Sua conta precisará ser aprovada por um administrador antes de você poder fazer login.
                Telefone, foto e empresas podem ser adicionados depois, em Meu perfil.
              </AlertDescription>
            </Alert>

            <Form {...form}>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite seu nome completo" autoComplete="name" {...field} />
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
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Digite seu e-mail" autoComplete="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {campusList.length > 0 && (
                  <div>
                    <CampusCombobox
                      label="Campus"
                      options={campusList}
                      value={selectedCampusId}
                      onChange={(id) => {
                        setSelectedCampusId(id);
                        setCampusError(false);
                      }}
                      placeholder="Selecione um campus"
                      required
                    />
                    {campusError && (
                      <p className="mt-2 text-sm font-medium text-red-500">Selecione um campus</p>
                    )}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Mínimo 6 caracteres" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <ButtonForm
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                  label={isSubmitting ? 'Criando conta...' : 'Criar Conta'}
                />
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
