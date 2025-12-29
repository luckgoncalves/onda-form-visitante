'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatPhone } from '@/lib/utils';
import { ArrowLeft, ArrowRight, Plus, Trash2, User, Building } from 'lucide-react';
import { registerUserSchema, registerSchema } from '@/lib/validations/register';
import { empresaSchema, EmpresaFormData } from '@/lib/validations/empresa';
import ButtonForm from '@/components/button-form';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { z } from 'zod';

type RegisterUserData = z.infer<typeof registerUserSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [empresas, setEmpresas] = useState<EmpresaFormData[]>([]);

  // Form para dados do usuário
  const userForm = useForm<RegisterUserData>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
    },
  });

  // Form para empresa individual
  const empresaForm = useForm<EmpresaFormData>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      nomeNegocio: '',
      ramoAtuacao: '',
      detalhesServico: '',
      whatsapp: '',
      endereco: '',
      site: '',
      instagram: '',
      facebook: '',
      linkedin: '',
      email: '',
    },
  });

  const handleNextStep = async () => {
    if (currentStep === 0) {
      const isValid = await userForm.trigger();
      if (isValid) {
        setCurrentStep(1);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddEmpresa = async () => {
    const isValid = await empresaForm.trigger();
    if (isValid) {
      const empresaData = empresaForm.getValues();
      setEmpresas([...empresas, empresaData]);
      empresaForm.reset();
      toast({
        title: 'Sucesso',
        description: 'Empresa adicionada com sucesso!',
      });
    }
  };

  const handleRemoveEmpresa = (index: number) => {
    setEmpresas(empresas.filter((_, i) => i !== index));
    toast({
      title: 'Sucesso',
      description: 'Empresa removida com sucesso!',
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Validar dados do usuário
      const userData = await userForm.trigger();
      if (!userData) {
        return;
      }

      // Preparar payload (sempre definir role como 'user' para registro público)
      const payload = {
        user: {
          ...userForm.getValues(),
          role: 'user' as const,
        },
        empresas: empresas,
      };

      // Validar payload completo
      registerSchema.parse(payload);

      // Chamar API de registro
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar conta');
      }

      toast({
        title: 'Sucesso',
        description: `Conta criada com sucesso! ${empresas.length > 0 ? `${empresas.length} empresa(s) cadastrada(s).` : ''}`,
      });

      // Redirecionar para dashboard ou página inicial
      router.push('/register');

    } catch (error) {
      console.error('Erro ao criar conta:', error);
      if (error instanceof z.ZodError) {
        toast({
          title: 'Erro de validação',
          description: 'Por favor, verifique os dados preenchidos.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro',
          description: error instanceof Error ? error.message : 'Erro ao criar conta. Tente novamente.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { title: 'Dados Pessoais', icon: User },
    { title: 'Empresas', icon: Building },
  ];

  return (
    <main className="flex w-full min-h-screen flex-col items-center gap-4 p-2 sm:p-6">
      <div className="p-2 sm:p-6 max-w-2xl mx-auto w-full">
        {/* Header da página */}
        <div className="flex items-center justify-center mb-6">
          <Image 
            src="/logo-login.png" 
            alt="Onda Logo" 
            width={150} 
            height={60} 
            className="mx-auto"
            priority
          />
        </div>

        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="">
            <h1 className="text-xl sm:text-2xl font-bold">Criar Conta</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Preencha seus dados e cadastre suas empresas
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        {/* Indicador de Passos */}
        <div className="flex items-center mb-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex items-center">
                <div className={`flex items-center gap-2 py-2 rounded-lg ${
                  index === currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : index < currentStep 
                      ? 'bg-green-100 text-green-700 px-2' 
                      : 'bg-muted text-muted-foreground'
                }`}>
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />
                )}
              </div>
            );
          })}
        </div>

        {/* Conteúdo do Step */}
        <Card className="bg-white border-none">
          <CardContent className="p-6">
            {currentStep === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Dados Pessoais</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Preencha suas informações básicas
                  </p>
                </div>

                <Form {...userForm}>
                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={userForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite seu nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={userForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Digite seu e-mail" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={userForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="(11) 99999-9999"
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
                      control={userForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Form>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Empresas</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Adicione suas empresas (opcional)
                  </p>
                </div>

                {/* Lista de empresas adicionadas */}
                {empresas.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Empresas Adicionadas ({empresas.length})</h3>
                    <div className="grid gap-4">
                      {empresas.map((empresa, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{empresa.nomeNegocio}</h4>
                                <Badge variant="secondary">{empresa.ramoAtuacao}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {empresa.detalhesServico}
                              </p>
                              <div className="flex gap-4 text-xs text-muted-foreground">
                                <span>📱 {empresa.whatsapp}</span>
                                <span>📧 {empresa.email}</span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveEmpresa(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                    <Separator />
                  </div>
                )}

                {/* Formulário para adicionar nova empresa */}
                <div>
                  <Form {...empresaForm}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={empresaForm.control}
                        name="nomeNegocio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Negócio</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Studio de Beleza Maria" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={empresaForm.control}
                        name="ramoAtuacao"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ramo de Atuação</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Beleza e Estética" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={empresaForm.control}
                        name="whatsapp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WhatsApp</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="(11) 99999-9999"
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
                        control={empresaForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-mail</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="contato@empresa.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="md:col-span-2">
                        <FormField
                          control={empresaForm.control}
                          name="detalhesServico"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Detalhes do Serviço/Produto</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Descreva os serviços ou produtos oferecidos..."
                                  className="min-h-[80px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={empresaForm.control}
                        name="endereco"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Endereço</FormLabel>
                            <FormControl>
                              <Input placeholder="Rua, número, bairro, cidade" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={empresaForm.control}
                        name="site"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site (opcional)</FormLabel>
                            <FormControl>
                              <Input type="url" placeholder="https://www.empresa.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={empresaForm.control}
                        name="instagram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instagram (opcional)</FormLabel>
                            <FormControl>
                              <Input placeholder="@empresa" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={empresaForm.control}
                        name="facebook"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Facebook (opcional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://facebook.com/empresa" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={empresaForm.control}
                        name="linkedin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>LinkedIn (opcional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://linkedin.com/in/empresa" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-4">
                      <Button type="button" onClick={handleAddEmpresa} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Empresa
                      </Button>
                    </div>
                  </Form>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botões de Navegação */}
        <div className="flex justify-between mt-6">
          <div>
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevStep}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            {currentStep < steps.length - 1 ? (
              <ButtonForm
                type="button"
                onClick={handleNextStep}
                label="Próximo"
                icon={<ArrowRight className="h-4 w-4" />}
              />
            ) : (
              <ButtonForm
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                label={isSubmitting ? 'Criando conta...' : 'Criar Conta'}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

