'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatPhone } from '@/lib/utils';
import { empresaSchema, EmpresaFormData } from '@/lib/validations/empresa';
import { Empresa } from '@/types/empresa';
import ButtonForm from '@/components/button-form';

interface EmpresaFormProps {
  mode: 'create' | 'edit';
  initialData?: Empresa;
  userId?: string;
  onSubmit: (data: EmpresaFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function EmpresaForm({ 
  mode, 
  initialData, 
  userId,
  onSubmit, 
  onCancel, 
  isLoading = false 
}: EmpresaFormProps) {
  const { toast } = useToast();

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
    <Card className="max-w-2xl mx-auto">
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
                  <FormLabel>Endereço</FormLabel>
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
                    <Input placeholder="@empresa ou https://instagram.com/empresa" {...field} />
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