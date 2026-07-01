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
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

type TipoCampo = 'TEXTO' | 'TEXTAREA' | 'SELECT' | 'MULTISELECT';

interface Campo {
  id: string;
  label: string;
  tipo: TipoCampo;
  opcoes: string[] | null;
  obrigatorio: boolean;
  ordem: number;
}

interface Ministerio {
  id: string;
  nome: string;
}

const baseSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().optional(),
  prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']).default('MEDIA'),
  ministerioId: z.string().min(1, 'Selecione um ministério'),
});

type BaseFormData = z.infer<typeof baseSchema>;

interface ChamadoFormProps {
  onSuccess?: (chamado: { id: string; codigo: string }) => void;
  onCancel?: () => void;
}

export default function ChamadoForm({ onSuccess, onCancel }: ChamadoFormProps) {
  const [ministerios, setMinisterios] = useState<Ministerio[]>([]);
  const [campos, setCampos] = useState<Campo[]>([]);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [isLoadingMinisterios, setIsLoadingMinisterios] = useState(true);
  const [isLoadingCampos, setIsLoadingCampos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<BaseFormData>({
    resolver: zodResolver(baseSchema),
    defaultValues: { titulo: '', descricao: '', prioridade: 'MEDIA', ministerioId: '' },
  });

  const ministerioId = form.watch('ministerioId');

  useEffect(() => {
    async function loadMinisterios() {
      try {
        const res = await fetch('/api/ministerios?limit=100');
        if (!res.ok) throw new Error();
        const data = await res.json();
        setMinisterios(data.ministerios);
      } catch {
        toast({ title: 'Erro', description: 'Erro ao carregar ministérios', variant: 'destructive' });
      } finally {
        setIsLoadingMinisterios(false);
      }
    }
    loadMinisterios();
  }, []);

  useEffect(() => {
    if (!ministerioId) { setCampos([]); setRespostas({}); return; }
    async function loadCampos() {
      setIsLoadingCampos(true);
      try {
        const res = await fetch(`/api/ministerios/${ministerioId}/campos`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setCampos(data);
        setRespostas({});
      } catch {
        toast({ title: 'Erro', description: 'Erro ao carregar campos', variant: 'destructive' });
      } finally {
        setIsLoadingCampos(false);
      }
    }
    loadCampos();
  }, [ministerioId]);

  const handleResposta = (campoId: string, valor: string) => {
    setRespostas((prev) => ({ ...prev, [campoId]: valor }));
  };

  const handleMultiResposta = (campoId: string, opcao: string, checked: boolean) => {
    setRespostas((prev) => {
      const current = prev[campoId] ? JSON.parse(prev[campoId]) as string[] : [];
      const updated = checked ? [...current, opcao] : current.filter((o) => o !== opcao);
      return { ...prev, [campoId]: JSON.stringify(updated) };
    });
  };

  const getMultiValue = (campoId: string): string[] => {
    try { return respostas[campoId] ? JSON.parse(respostas[campoId]) : []; } catch { return []; }
  };

  const validateCampos = (): boolean => {
    for (const campo of campos) {
      if (campo.obrigatorio) {
        const valor = respostas[campo.id] ?? '';
        if (!valor.trim() || valor === '[]') {
          toast({
            title: 'Campo obrigatório',
            description: `Preencha o campo "${campo.label}"`,
            variant: 'destructive',
          });
          return false;
        }
      }
    }
    return true;
  };

  const onSubmit = async (data: BaseFormData) => {
    if (!validateCampos()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/chamados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, respostas }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao abrir chamado');
      }
      const chamado = await res.json();
      toast({ title: 'Chamado aberto!', description: `Código: ${chamado.codigo}` });
      onSuccess?.(chamado);
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao abrir chamado',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingMinisterios) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Abrir Chamado</CardTitle>
        <CardDescription>Descreva o que você precisa e selecione o ministério responsável</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Ministério */}
            <FormField
              control={form.control}
              name="ministerioId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ministério</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Selecione o ministério</option>
                      {ministerios.map((m) => (
                        <option key={m.id} value={m.id}>{m.nome}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Título */}
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Resumo do chamado" {...field} />
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
                      placeholder="Detalhes adicionais..."
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Prioridade */}
            <FormField
              control={form.control}
              name="prioridade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridade</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="BAIXA">Baixa</option>
                      <option value="MEDIA">Média</option>
                      <option value="ALTA">Alta</option>
                      <option value="URGENTE">Urgente</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campos personalizados do ministério */}
            {isLoadingCampos && ministerioId && (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            )}

            {!isLoadingCampos && campos.map((campo) => (
              <div key={campo.id} className="space-y-1.5">
                <label className="text-sm font-medium leading-none">
                  {campo.label}
                  {campo.obrigatorio && <span className="text-red-500 ml-1">*</span>}
                </label>

                {campo.tipo === 'TEXTO' && (
                  <Input
                    placeholder={campo.label}
                    value={respostas[campo.id] ?? ''}
                    onChange={(e) => handleResposta(campo.id, e.target.value)}
                  />
                )}

                {campo.tipo === 'TEXTAREA' && (
                  <textarea
                    rows={3}
                    placeholder={campo.label}
                    value={respostas[campo.id] ?? ''}
                    onChange={(e) => handleResposta(campo.id, e.target.value)}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  />
                )}

                {campo.tipo === 'SELECT' && (
                  <select
                    value={respostas[campo.id] ?? ''}
                    onChange={(e) => handleResposta(campo.id, e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Selecione...</option>
                    {(campo.opcoes ?? []).map((op) => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>
                )}

                {campo.tipo === 'MULTISELECT' && (
                  <div className="space-y-2 border rounded-md p-3">
                    {(campo.opcoes ?? []).map((op) => (
                      <div key={op} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${campo.id}-${op}`}
                          checked={getMultiValue(campo.id).includes(op)}
                          onCheckedChange={(checked) =>
                            handleMultiResposta(campo.id, op, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={`${campo.id}-${op}`}
                          className="text-sm cursor-pointer"
                        >
                          {op}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="flex gap-4 pt-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                  Cancelar
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Abrindo...' : 'Abrir Chamado'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
