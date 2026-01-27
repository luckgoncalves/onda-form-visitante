'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { getBairrosCuritiba, listUsers } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import GrupoFormSkeleton from './grupo-form-skeleton';

// Schema de validação
const grupoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  categoria: z.enum(['HOMENS', 'UNVT', 'MULHERES', 'MISTO', 'NEW', 'CASAIS'], {
    required_error: 'Selecione uma categoria',
  }),
  diaSemana: z.enum(['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO'], {
    required_error: 'Selecione um dia da semana',
  }),
  horario: z.string().min(1, 'Horário é obrigatório'),
  bairroId: z.string().optional(),
  lideresIds: z.array(z.string()).optional(),
});

export type GrupoFormData = z.infer<typeof grupoSchema>;

interface Bairro {
  id: string;
  nome: string;
}

interface Usuario {
  id: string;
  name: string;
  email: string;
}

interface GrupoFormProps {
  mode: 'create' | 'edit';
  initialData?: {
    id?: string;
    nome: string;
    categoria: 'HOMENS' | 'UNVT' | 'MULHERES' | 'MISTO' | 'NEW' | 'CASAIS';
    diaSemana: 'SEGUNDA' | 'TERCA' | 'QUARTA' | 'QUINTA' | 'SEXTA' | 'SABADO' | 'DOMINGO';
    horario: string;
    bairroId?: string;
    lideres?: { id: string; name: string; email: string; }[];
  };
  onSubmit: (data: GrupoFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function GrupoForm({ mode, initialData, onSubmit, onCancel, isLoading = false }: GrupoFormProps) {
  const [bairros, setBairros] = useState<Bairro[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { toast } = useToast();

  const form = useForm<GrupoFormData>({
    resolver: zodResolver(grupoSchema),
    defaultValues: {
      nome: initialData?.nome || '',
      categoria: initialData?.categoria,
      diaSemana: initialData?.diaSemana,
      horario: initialData?.horario || '',
      bairroId: initialData?.bairroId || '',
      lideresIds: initialData?.lideres?.map(l => l.id) || [],
    },
  });

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoadingData(true);
        
        // Carregar bairros e usuários
        const [bairrosData, usuariosData] = await Promise.all([
          getBairrosCuritiba(),
          listUsers(),
        ]);

        setBairros(bairrosData);
        setUsuarios(usuariosData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar dados iniciais',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, [toast]);

  const handleSubmit = async (data: GrupoFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
    }
  };

  const categorias = [
    { value: 'HOMENS', label: 'Homens' },
    { value: 'UNVT', label: 'UNVT' },
    { value: 'MULHERES', label: 'Mulheres' },
    { value: 'MISTO', label: 'Misto' },
    { value: 'NEW', label: 'New' },
    { value: 'CASAIS', label: 'Casais' },
  ];

  const diasSemana = [
    { value: 'SEGUNDA', label: 'Segunda-feira' },
    { value: 'TERCA', label: 'Terça-feira' },
    { value: 'QUARTA', label: 'Quarta-feira' },
    { value: 'QUINTA', label: 'Quinta-feira' },
    { value: 'SEXTA', label: 'Sexta-feira' },
    { value: 'SABADO', label: 'Sábado' },
    { value: 'DOMINGO', label: 'Domingo' },
  ];

  if (isLoadingData) {
    return <GrupoFormSkeleton mode={mode} />;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Cadastrar Novo GP' : 'Editar GP'}
        </CardTitle>
        <CardDescription>
          {mode === 'create' 
            ? 'Preencha os dados para criar um novo GP'
            : 'Atualize os dados do GP'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Nome */}
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Grupo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Grupo de Homens"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categoria */}
            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categorias.map((categoria) => (
                        <option key={categoria.value} value={categoria.value}>
                          {categoria.label}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dia da Semana */}
            <FormField
              control={form.control}
              name="diaSemana"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dia da Semana</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Selecione um dia da semana</option>
                      {diasSemana.map((dia) => (
                        <option key={dia.value} value={dia.value}>
                          {dia.label}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Horário */}
            <FormField
              control={form.control}
              name="horario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      placeholder="Ex: 19:30"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bairro */}
            <FormField
              control={form.control}
              name="bairroId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bairro (Opcional)</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Selecione um bairro</option>
                      {bairros.map((bairro) => (
                        <option key={bairro.id} value={bairro.id}>
                          {bairro.nome}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Líderes */}
            <FormField
              control={form.control}
              name="lideresIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Líderes (Opcional)</FormLabel>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                    {usuarios.map((usuario) => (
                      <div key={usuario.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={usuario.id}
                          checked={field.value?.includes(usuario.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...(field.value || []), usuario.id]);
                            } else {
                              field.onChange(
                                field.value?.filter((id) => id !== usuario.id)
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={usuario.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {usuario.name} ({usuario.email})
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : mode === 'create' ? 'Salvar GP' : 'Atualizar GP'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 