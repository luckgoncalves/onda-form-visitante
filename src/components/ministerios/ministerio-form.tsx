'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { listUsers } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import MinisterioFormSkeleton from './ministerio-form-skeleton';

const ministerioSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  liderId: z.string().min(1, 'Líder é obrigatório'),
  coLiderId: z.string().optional(),
  membrosIds: z.array(z.string()).optional(),
});

export type MinisterioFormData = z.infer<typeof ministerioSchema>;

interface Usuario {
  id: string;
  name: string;
  email: string;
}

interface MinisterioFormProps {
  mode: 'create' | 'edit';
  initialData?: {
    id?: string;
    nome: string;
    descricao?: string;
    liderId: string;
    coLiderId?: string;
    membros?: { user: { id: string; name: string; email: string } }[];
  };
  onSubmit: (data: MinisterioFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface UserComboboxProps {
  value: string;
  onChange: (value: string) => void;
  usuarios: Usuario[];
  placeholder: string;
  noneLabel?: string;
}

function UserCombobox({ value, onChange, usuarios, placeholder, noneLabel }: UserComboboxProps) {
  const [open, setOpen] = useState(false);

  const selected = usuarios.find((u) => u.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {selected ? `${selected.name} (${selected.email})` : noneLabel ?? placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            <CommandGroup>
              {noneLabel && (
                <CommandItem
                  value=""
                  onSelect={() => {
                    onChange('');
                    setOpen(false);
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', value === '' ? 'opacity-100' : 'opacity-0')} />
                  {noneLabel}
                </CommandItem>
              )}
              {usuarios.map((u) => (
                <CommandItem
                  key={u.id}
                  value={`${u.name} ${u.email}`}
                  onSelect={() => {
                    onChange(u.id === value ? '' : u.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', value === u.id ? 'opacity-100' : 'opacity-0')} />
                  <span>
                    {u.name}{' '}
                    <span className="text-muted-foreground text-xs">({u.email})</span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function MinisterioForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: MinisterioFormProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [membrosSearch, setMembrosSearch] = useState('');
  const { toast } = useToast();

  const form = useForm<MinisterioFormData>({
    resolver: zodResolver(ministerioSchema),
    defaultValues: {
      nome: initialData?.nome || '',
      descricao: initialData?.descricao || '',
      liderId: initialData?.liderId || '',
      coLiderId: initialData?.coLiderId || '',
      membrosIds: initialData?.membros?.map((m) => m.user.id) || [],
    },
  });

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoadingData(true);
        const usuariosData = await listUsers();
        setUsuarios(usuariosData);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        toast({ title: 'Erro', description: 'Erro ao carregar usuários', variant: 'destructive' });
      } finally {
        setIsLoadingData(false);
      }
    }
    loadData();
  }, [toast]);

  const filteredMembros = membrosSearch.trim()
    ? usuarios.filter(
        (u) =>
          u.name.toLowerCase().includes(membrosSearch.toLowerCase()) ||
          u.email.toLowerCase().includes(membrosSearch.toLowerCase())
      )
    : usuarios;

  if (isLoadingData) {
    return <MinisterioFormSkeleton mode={mode} />;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Cadastrar Ministério' : 'Editar Ministério'}
        </CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Preencha os dados para criar um novo ministério'
            : 'Atualize os dados do ministério'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome */}
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Ministério</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Ministério de Louvor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descrição */}
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      rows={3}
                      placeholder="Descreva o ministério..."
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Líder */}
            <FormField
              control={form.control}
              name="liderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Líder</FormLabel>
                  <FormControl>
                    <UserCombobox
                      value={field.value}
                      onChange={field.onChange}
                      usuarios={usuarios}
                      placeholder="Buscar líder..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Co-Líder */}
            <FormField
              control={form.control}
              name="coLiderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Co-Líder (Opcional)</FormLabel>
                  <FormControl>
                    <UserCombobox
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      usuarios={usuarios}
                      placeholder="Buscar co-líder..."
                      noneLabel="Nenhum"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Membros */}
            <FormField
              control={form.control}
              name="membrosIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Membros (Opcional)</FormLabel>
                  <div className="border rounded-md">
                    <div className="p-2 border-b">
                      <Input
                        placeholder="Buscar membro..."
                        value={membrosSearch}
                        onChange={(e) => setMembrosSearch(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto p-3">
                      {filteredMembros.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          Nenhum membro encontrado.
                        </p>
                      ) : (
                        filteredMembros.map((usuario) => (
                          <div key={usuario.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`membro-${usuario.id}`}
                              checked={field.value?.includes(usuario.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...(field.value || []), usuario.id]);
                                } else {
                                  field.onChange(field.value?.filter((id) => id !== usuario.id));
                                }
                              }}
                            />
                            <label
                              htmlFor={`membro-${usuario.id}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {usuario.name}{' '}
                              <span className="text-muted-foreground text-xs">({usuario.email})</span>
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                    {(field.value?.length ?? 0) > 0 && (
                      <div className="px-3 py-2 border-t text-xs text-muted-foreground">
                        {field.value?.length} membro{(field.value?.length ?? 0) !== 1 ? 's' : ''} selecionado{(field.value?.length ?? 0) !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? 'Salvando...'
                  : mode === 'create'
                  ? 'Salvar Ministério'
                  : 'Atualizar Ministério'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
