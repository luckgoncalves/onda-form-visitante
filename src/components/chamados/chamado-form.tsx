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
import { Loader2, Plus, X } from 'lucide-react';

type TipoCampo = 'TEXTO' | 'TEXTAREA' | 'SELECT' | 'MULTISELECT' | 'ANEXO';

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
  const [uploadingCampos, setUploadingCampos] = useState<Record<string, boolean>>({});
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

  const getAnexoUrls = (campoId: string): string[] => {
    try { return respostas[campoId] ? JSON.parse(respostas[campoId]) : []; } catch { return []; }
  };

  const handleAnexoUpload = async (campoId: string, file: File) => {
    setUploadingCampos((prev) => ({ ...prev, [campoId]: true }));
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'chamados/anexos');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao fazer upload');
      }
      const { url } = await res.json();
      setRespostas((prev) => {
        const current = prev[campoId] ? JSON.parse(prev[campoId]) as string[] : [];
        return { ...prev, [campoId]: JSON.stringify([...current, url]) };
      });
    } catch (error) {
      toast({
        title: 'Erro ao enviar arquivo',
        description: error instanceof Error ? error.message : 'Tente novamente',
        variant: 'destructive',
      });
    } finally {
      setUploadingCampos((prev) => ({ ...prev, [campoId]: false }));
    }
  };

  const handleAnexoRemove = (campoId: string, url: string) => {
    setRespostas((prev) => {
      const current = prev[campoId] ? JSON.parse(prev[campoId]) as string[] : [];
      return { ...prev, [campoId]: JSON.stringify(current.filter((u) => u !== url)) };
    });
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

                {campo.tipo === 'ANEXO' && (
                  <div className="space-y-2">
                    {getAnexoUrls(campo.id).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {getAnexoUrls(campo.id).map((url) => (
                          <div key={url} className="relative">
                            <img
                              src={url}
                              alt="Anexo"
                              className="h-20 w-20 object-cover rounded-md border"
                            />
                            <button
                              type="button"
                              onClick={() => handleAnexoRemove(campo.id, url)}
                              className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        {uploadingCampos[campo.id] && (
                          <div className="h-20 w-20 rounded-md border flex items-center justify-center bg-gray-50">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    )}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        disabled={uploadingCampos[campo.id]}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAnexoUpload(campo.id, file);
                          e.target.value = '';
                        }}
                      />
                      <span className="inline-flex items-center gap-1.5 text-sm border rounded-md px-3 py-1.5 hover:bg-gray-50 cursor-pointer">
                        {uploadingCampos[campo.id]
                          ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
                          : <><Plus className="h-4 w-4" /> Adicionar foto</>
                        }
                      </span>
                    </label>
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
