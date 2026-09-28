'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuth } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { ArrowDown, ArrowLeft, ArrowUp, Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { ChecklistTopicoModelo, canAccessChecklist } from '@/config/checklist-inspecao';

type Exclusao =
  | { tipo: 'topico'; id: string; titulo: string; totalItens: number }
  | { tipo: 'item'; id: string; texto: string };

type Edicao = { tipo: 'topico' | 'item'; id: string } | null;

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`h-9 w-9 shrink-0 ${danger ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-muted-foreground'}`}
    >
      {children}
    </Button>
  );
}

function EditorInline({
  valorInicial,
  multilinha,
  onSalvar,
  onCancelar,
  disabled,
}: {
  valorInicial: string;
  multilinha?: boolean;
  onSalvar: (valor: string) => void;
  onCancelar: () => void;
  disabled?: boolean;
}) {
  const [valor, setValor] = useState(valorInicial);
  const salvar = () => {
    if (valor.trim()) onSalvar(valor.trim());
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onCancelar();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      salvar();
    }
  };

  return (
    <div className="flex flex-1 items-start gap-1">
      {multilinha ? (
        <Textarea
          autoFocus
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
          className="flex-1 text-sm"
        />
      ) : (
        <Input
          autoFocus
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={onKeyDown}
          className="flex-1"
        />
      )}
      <IconButton label="Salvar" onClick={salvar} disabled={disabled || !valor.trim()}>
        <Check className="h-4 w-4" />
      </IconButton>
      <IconButton label="Cancelar" onClick={onCancelar} disabled={disabled}>
        <X className="h-4 w-4" />
      </IconButton>
    </div>
  );
}

function NovoRegistro({
  placeholder,
  botao,
  onCriar,
  disabled,
}: {
  placeholder: string;
  botao: string;
  onCriar: (valor: string) => Promise<boolean>;
  disabled?: boolean;
}) {
  const [valor, setValor] = useState('');
  const criar = async () => {
    if (!valor.trim()) return;
    if (await onCriar(valor.trim())) setValor('');
  };

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        criar();
      }}
    >
      <Input value={valor} onChange={(e) => setValor(e.target.value)} placeholder={placeholder} className="flex-1" />
      <Button
        type="submit"
        disabled={disabled || !valor.trim()}
        className="shrink-0 gap-1 bg-onda-darkBlue text-white hover:bg-onda-darkBlue/90"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">{botao}</span>
      </Button>
    </form>
  );
}

export default function ChecklistModeloPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [topicos, setTopicos] = useState<ChecklistTopicoModelo[] | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [edicao, setEdicao] = useState<Edicao>(null);
  const [exclusao, setExclusao] = useState<Exclusao | null>(null);

  const carregar = useCallback(async () => {
    const res = await fetch('/api/checklist/modelo');
    if (!res.ok) throw new Error();
    const data: { topicos: ChecklistTopicoModelo[]; podeEditar: boolean } = await res.json();
    if (!data.podeEditar) {
      router.push('/checklist');
      return;
    }
    setTopicos(data.topicos);
  }, [router]);

  useEffect(() => {
    checkAuth().then(async ({ user }) => {
      if (!user) { router.push('/'); return; }
      if (!canAccessChecklist(user)) { router.push('/register'); return; }
      try {
        await carregar();
      } catch {
        toast({ title: 'Erro', description: 'Erro ao carregar o checklist', variant: 'destructive' });
      }
    });
  }, [router, carregar, toast]);

  // Executa uma alteração e recarrega o modelo
  const executar = async (url: string, method: string, body?: object, sucesso?: string) => {
    setIsBusy(true);
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) throw new Error();
      await carregar();
      if (sucesso) toast({ title: sucesso });
      return true;
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível salvar a alteração', variant: 'destructive' });
      return false;
    } finally {
      setIsBusy(false);
    }
  };

  const confirmarExclusao = async () => {
    if (!exclusao) return;
    const url =
      exclusao.tipo === 'topico'
        ? `/api/checklist/modelo/topicos/${exclusao.id}`
        : `/api/checklist/modelo/itens/${exclusao.id}`;
    await executar(url, 'DELETE', undefined, exclusao.tipo === 'topico' ? 'Tópico excluído' : 'Item excluído');
    setExclusao(null);
  };

  if (!topicos) {
    return (
      <div className="p-2 sm:p-6 mt-[72px] max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-6 mt-[72px] max-w-3xl mx-auto space-y-4 pb-32 sm:pb-6">
      <Button variant="ghost" size="sm" onClick={() => router.push('/checklist')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Checklist
      </Button>

      <div>
        <h1 className="text-xl font-bold">Editar checklist</h1>
        <p className="text-sm text-muted-foreground">
          As alterações valem para os próximos preenchimentos. Checklists já salvos não mudam.
        </p>
      </div>

      {topicos.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            Nenhum tópico cadastrado. Adicione o primeiro abaixo.
          </CardContent>
        </Card>
      )}

      {topicos.map((topico, t) => {
        const editandoTopico = edicao?.tipo === 'topico' && edicao.id === topico.id;
        return (
          <Card key={topico.id}>
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-1">
                {editandoTopico ? (
                  <EditorInline
                    valorInicial={topico.titulo}
                    disabled={isBusy}
                    onCancelar={() => setEdicao(null)}
                    onSalvar={async (titulo) => {
                      if (await executar(`/api/checklist/modelo/topicos/${topico.id}`, 'PATCH', { titulo })) {
                        setEdicao(null);
                      }
                    }}
                  />
                ) : (
                  <>
                    <h2 className="min-w-0 flex-1 text-base font-semibold">
                      {t + 1}. {topico.titulo}
                    </h2>
                    <IconButton
                      label="Mover tópico para cima"
                      disabled={isBusy || t === 0}
                      onClick={() => executar(`/api/checklist/modelo/topicos/${topico.id}`, 'PATCH', { mover: 'cima' })}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                      label="Mover tópico para baixo"
                      disabled={isBusy || t === topicos.length - 1}
                      onClick={() => executar(`/api/checklist/modelo/topicos/${topico.id}`, 'PATCH', { mover: 'baixo' })}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                      label="Renomear tópico"
                      disabled={isBusy}
                      onClick={() => setEdicao({ tipo: 'topico', id: topico.id })}
                    >
                      <Pencil className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                      label="Excluir tópico"
                      danger
                      disabled={isBusy}
                      onClick={() =>
                        setExclusao({ tipo: 'topico', id: topico.id, titulo: topico.titulo, totalItens: topico.itens.length })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-0 space-y-2">
              {topico.itens.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum item neste tópico.</p>
              )}

              {topico.itens.map((item, i) => {
                const editandoItem = edicao?.tipo === 'item' && edicao.id === item.id;
                return (
                  <div key={item.id} className="flex items-start gap-1 rounded-lg border border-gray-200 p-2">
                    <span className="w-10 shrink-0 pt-2 font-mono text-xs text-muted-foreground">
                      {t + 1}.{i + 1}
                    </span>
                    {editandoItem ? (
                      <EditorInline
                        multilinha
                        valorInicial={item.texto}
                        disabled={isBusy}
                        onCancelar={() => setEdicao(null)}
                        onSalvar={async (texto) => {
                          if (await executar(`/api/checklist/modelo/itens/${item.id}`, 'PATCH', { texto })) {
                            setEdicao(null);
                          }
                        }}
                      />
                    ) : (
                      <>
                        <p className="min-w-0 flex-1 pt-1.5 text-sm">{item.texto}</p>
                        <div className="flex shrink-0 flex-wrap justify-end sm:flex-nowrap">
                          <IconButton
                            label="Mover item para cima"
                            disabled={isBusy || i === 0}
                            onClick={() => executar(`/api/checklist/modelo/itens/${item.id}`, 'PATCH', { mover: 'cima' })}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </IconButton>
                          <IconButton
                            label="Mover item para baixo"
                            disabled={isBusy || i === topico.itens.length - 1}
                            onClick={() => executar(`/api/checklist/modelo/itens/${item.id}`, 'PATCH', { mover: 'baixo' })}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </IconButton>
                          <IconButton
                            label="Editar item"
                            disabled={isBusy}
                            onClick={() => setEdicao({ tipo: 'item', id: item.id })}
                          >
                            <Pencil className="h-4 w-4" />
                          </IconButton>
                          <IconButton
                            label="Excluir item"
                            danger
                            disabled={isBusy}
                            onClick={() => setExclusao({ tipo: 'item', id: item.id, texto: item.texto })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </IconButton>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              <NovoRegistro
                placeholder="Novo item"
                botao="Adicionar item"
                disabled={isBusy}
                onCriar={(texto) =>
                  executar(`/api/checklist/modelo/topicos/${topico.id}/itens`, 'POST', { texto })
                }
              />
            </CardContent>
          </Card>
        );
      })}

      <Card>
        <CardHeader className="p-4 pb-2">
          <h2 className="text-base font-semibold">Novo tópico</h2>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <NovoRegistro
            placeholder="Ex.: Estacionamento"
            botao="Adicionar tópico"
            disabled={isBusy}
            onCriar={(titulo) => executar('/api/checklist/modelo', 'POST', { titulo }, 'Tópico adicionado')}
          />
        </CardContent>
      </Card>

      <AlertDialog open={!!exclusao} onOpenChange={(open) => !open && setExclusao(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {exclusao?.tipo === 'topico' ? 'Excluir tópico?' : 'Excluir item?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {exclusao?.tipo === 'topico'
                ? exclusao.totalItens === 0
                  ? `"${exclusao.titulo}" será removido do checklist.`
                  : `"${exclusao.titulo}" e ${exclusao.totalItens === 1 ? 'seu item' : `seus ${exclusao.totalItens} itens`} serão removidos do checklist.`
                : `"${exclusao?.texto}" será removido do checklist.`}{' '}
              Checklists já salvos não são afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBusy}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmarExclusao();
              }}
              disabled={isBusy}
              className="bg-red-600 hover:bg-red-700"
            >
              {isBusy ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
