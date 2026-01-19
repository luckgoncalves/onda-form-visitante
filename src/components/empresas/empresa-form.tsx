'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { useToast } from '@/hooks/use-toast';
import { cn, formatPhone } from '@/lib/utils';
import { empresaSchema, EmpresaFormData } from '@/lib/validations/empresa';
import { Empresa } from '@/types/empresa';
import ButtonForm from '@/components/button-form';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';

interface EmpresaFormProps {
  onModal?: boolean;
  mode: 'create' | 'edit';
  initialData?: Empresa;
  userId?: string;
  onSubmit: (data: EmpresaFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function EmpresaForm({ 
  onModal = false,
  mode, 
  initialData, 
  userId,
  onSubmit, 
  onCancel, 
  isLoading = false 
}: EmpresaFormProps) {
  const { toast } = useToast();
  const [ramosOpen, setRamosOpen] = useState(false);
  const [availableRamos, setAvailableRamos] = useState<string[]>([]);
  const [isLoadingRamos, setIsLoadingRamos] = useState(false);
  const ramosDropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ramosDropdownRef.current && !ramosDropdownRef.current.contains(event.target as Node)) {
        setRamosOpen(false);
      }
    };

    if (ramosOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ramosOpen]);

  // Função para buscar ramos existentes
  const fetchRamos = async () => {
    try {
      setIsLoadingRamos(true);
      const response = await fetch('/api/empresas/filters');
      if (response.ok) {
        const data = await response.json();
        setAvailableRamos(data.ramos || []);
      }
    } catch (error) {
      console.error('Erro ao carregar ramos:', error);
    } finally {
      setIsLoadingRamos(false);
    }
  };

  // Buscar ramos existentes na inicialização
  useEffect(() => {
    fetchRamos();
  }, []);

  const form = useForm<EmpresaFormData>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      nomeNegocio: initialData?.nomeNegocio || '',
      ramoAtuacao: initialData?.ramoAtuacao || '',
      detalhesServico: initialData?.detalhesServico || '',
      whatsapp: initialData?.whatsapp || '',
      endereco: initialData?.endereco || '',
      site: initialData?.site || '',
      instagram: initialData?.instagram || '',
      facebook: initialData?.facebook || '',
      linkedin: initialData?.linkedin || '',
      email: initialData?.email || '',
    },
  });

  const handleSubmit = async (data: EmpresaFormData) => {
    try {
      await onSubmit(data);
      // Recarregar lista de ramos após criar/editar empresa com sucesso
      // para incluir novos ramos que possam ter sido criados
      await fetchRamos();
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar empresa',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className={cn("max-w-2xl mx-auto", onModal && "w-full")}>
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Nova Empresa' : 'Editar Empresa'}
        </CardTitle>
        <CardDescription>
          {mode === 'create' 
            ? 'Preencha os dados da nova empresa'
            : 'Atualize os dados da empresa'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Nome do Negócio */}
            <FormField
              control={form.control}
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

            {/* Ramo de Atuação */}
            <FormField
              control={form.control}
              name="ramoAtuacao"
              render={({ field }) => {
                const ramoValue = field.value || '';
                const ramoExists = availableRamos.some(
                  ramo => ramo.toLowerCase() === ramoValue.toLowerCase()
                );
                const filteredRamos = availableRamos.filter(ramo =>
                  ramo.toLowerCase().includes(ramoValue.toLowerCase())
                );

                return (
                  <FormItem className="flex flex-col">
                    <FormLabel>Ramo de Atuação</FormLabel>
                    <div className="relative" ref={ramosDropdownRef}>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Ex: Beleza e Estética"
                            value={ramoValue}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              setRamosOpen(true);
                            }}
                            onFocus={async () => {
                              // Recarregar ramos ao focar no campo para garantir lista atualizada
                              await fetchRamos();
                              if (availableRamos.length > 0 || ramoValue) {
                                setRamosOpen(true);
                              }
                            }}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={async () => {
                              if (!ramosOpen) {
                                // Recarregar ramos ao abrir dropdown para garantir lista atualizada
                                await fetchRamos();
                              }
                              setRamosOpen(!ramosOpen);
                            }}
                          >
                            <ChevronsUpDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </div>
                      </FormControl>
                      {ramosOpen && (ramoValue || filteredRamos.length > 0 || availableRamos.length > 0) && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                          <Command shouldFilter={false}>
                            <CommandList className="max-h-[300px]">
                              {ramoValue && !ramoExists && (
                                <CommandGroup>
                                  <CommandItem
                                    value={`criar-${ramoValue}`}
                                    onSelect={() => {
                                      field.onChange(ramoValue);
                                      setRamosOpen(false);
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Criar &quot;{ramoValue}&quot;
                                  </CommandItem>
                                </CommandGroup>
                              )}
                              {filteredRamos.length > 0 ? (
                                <CommandGroup>
                                  {filteredRamos.map((ramo) => (
                                    <CommandItem
                                      key={ramo}
                                      value={ramo}
                                      onSelect={() => {
                                        field.onChange(ramo);
                                        setRamosOpen(false);
                                      }}
                                      className="cursor-pointer"
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          ramoValue.toLowerCase() === ramo.toLowerCase()
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {ramo}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              ) : (
                                !ramoValue && availableRamos.length > 0 && (
                                  <CommandGroup>
                                    {availableRamos.map((ramo) => (
                                      <CommandItem
                                        key={ramo}
                                        value={ramo}
                                        onSelect={() => {
                                          field.onChange(ramo);
                                          setRamosOpen(false);
                                        }}
                                        className="cursor-pointer"
                                      >
                                        {ramo}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                )
                              )}
                              {!ramoValue && availableRamos.length === 0 && !isLoadingRamos && (
                                <div className="p-4 text-sm text-center text-gray-500">
                                  Nenhum ramo cadastrado. Digite para criar um novo.
                                </div>
                              )}
                            </CommandList>
                          </Command>
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Detalhes do Serviço */}
            <FormField
              control={form.control}
              name="detalhesServico"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detalhes do Serviço/Produto</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva os serviços ou produtos oferecidos..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* WhatsApp */}
            <FormField
              control={form.control}
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

            {/* Email */}
            <FormField
              control={form.control}
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

            {/* Endereço */}
            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua, número, bairro, cidade" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Site */}
            <FormField
              control={form.control}
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

            {/* Instagram */}
            <FormField
              control={form.control}
              name="instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram (opcional)</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://instagram.com/empresa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Facebook */}
            <FormField
              control={form.control}
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

            {/* LinkedIn */}
            <FormField
              control={form.control}
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

            {/* Botões */}
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <ButtonForm 
                type="submit" 
                disabled={isLoading}
                label={isLoading 
                  ? (mode === 'create' ? 'Salvando...' : 'Atualizando...') 
                  : (mode === 'create' ? 'Salvar Empresa' : 'Atualizar Empresa')
                }
              />
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 