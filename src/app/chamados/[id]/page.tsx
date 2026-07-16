'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { checkAuth } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Send, Trash2, Copy, Check, Loader2, Save, Clock } from 'lucide-react';
import { ChamadoStatusBadge, ChamadoPrioridadeBadge, STATUS_CONFIG, PRIORIDADE_CONFIG } from '@/components/chamados/chamado-status-badge';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Membro {
  id: string;
  name: string;
}

interface Chamado {
  id: string;
  codigo: string;
  titulo: string;
  descricao?: string;
  status: string;
  prioridade: string;
  createdAt: string;
  previsaoConclusao?: string | null;
  canManage: boolean;
  ministerio: { id: string; nome: string };
  abertoPor: { name: string; email: string };
  responsavel?: { id: string; name: string } | null;
  respostas: {
    id: string;
    valor: string;
    campo: { id: string; label: string; tipo: string; ordem: number };
  }[];
  comentarios: {
    id: string;
    texto: string;
    createdAt: string;
    autor: { id: string; name: string; profileImageUrl?: string | null };
  }[];
  historico: HistoricoEntry[];
}

interface HistoricoEntry {
  id: string;
  tipo: string;
  detalhe: Record<string, string> | null;
  createdAt: string;
  autor: { id: string; name: string };
}

const STATUS_LABEL: Record<string, string> = {
  PENDENTE: 'Pendente', RECEBIDO: 'Recebido', EM_ANDAMENTO: 'Em andamento',
  CONCLUIDO: 'Concluído', CANCELADO: 'Cancelado',
};
const PRIORIDADE_LABEL: Record<string, string> = {
  BAIXA: 'Baixa', MEDIA: 'Média', ALTA: 'Alta', URGENTE: 'Urgente',
};

function formatHistoricoTexto(entry: HistoricoEntry): string {
  const d = entry.detalhe;
  switch (entry.tipo) {
    case 'CRIADO': return 'abriu o chamado';
    case 'STATUS_ALTERADO':
      return `alterou o status de "${STATUS_LABEL[d?.de ?? ''] ?? d?.de}" para "${STATUS_LABEL[d?.para ?? ''] ?? d?.para}"`;
    case 'PRIORIDADE_ALTERADA':
      return `alterou a prioridade de "${PRIORIDADE_LABEL[d?.de ?? ''] ?? d?.de}" para "${PRIORIDADE_LABEL[d?.para ?? ''] ?? d?.para}"`;
    case 'RESPONSAVEL_ATRIBUIDO':
      return `atribuiu o chamado para ${d?.responsavel ?? ''}`;
    case 'RESPONSAVEL_REMOVIDO':
      return `removeu o responsável${d?.responsavelAnterior ? ` (${d.responsavelAnterior})` : ''}`;
    default: return entry.tipo;
  }
}

interface FormState {
  status: string;
  prioridade: string;
  responsavelId: string | null;
  responsavelNome: string | null;
  previsaoConclusao: string;
}

function formatValor(valor: string, tipo: string): string {
  if (tipo === 'MULTISELECT') {
    try { return (JSON.parse(valor) as string[]).join(', '); } catch { return valor; }
  }
  return valor;
}

function AnexoViewer({ valor }: { valor: string }) {
  let urls: string[] = [];
  try { urls = JSON.parse(valor) as string[]; } catch { urls = []; }
  if (urls.length === 0) return <p className="text-sm text-muted-foreground">Sem anexos</p>;
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {urls.map((url) => (
        <a key={url} href={url} target="_blank" rel="noopener noreferrer">
          <img
            src={url}
            alt="Anexo"
            className="h-24 w-24 object-cover rounded-md border hover:opacity-80 transition-opacity cursor-pointer"
          />
        </a>
      ))}
    </div>
  );
}

export default function ChamadoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [chamado, setChamado] = useState<Chamado | null>(null);
  const [formState, setFormState] = useState<FormState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [comentario, setComentario] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [membroSearch, setMembroSearch] = useState('');
  const [showMembroDropdown, setShowMembroDropdown] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);
  const membroDropdownRef = useRef<HTMLDivElement>(null);
  const comentariosEndRef = useRef<HTMLDivElement>(null);

  const copiarCodigo = () => {
    if (!chamado) return;
    navigator.clipboard.writeText(chamado.codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const loadChamado = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/chamados/${params.id}`);
      if (res.status === 404 || res.status === 403) { router.push('/chamados'); return; }
      if (!res.ok) throw new Error();
      const data: Chamado = await res.json();
      setChamado(data);
      setFormState({
        status: data.status,
        prioridade: data.prioridade,
        responsavelId: data.responsavel?.id ?? null,
        responsavelNome: data.responsavel?.name ?? null,
        previsaoConclusao: data.previsaoConclusao
          ? new Date(data.previsaoConclusao).toISOString().split('T')[0]
          : '',
      });
    } catch {
      toast({ title: 'Erro', description: 'Erro ao carregar chamado', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth().then(({ user }) => {
      if (!user) { router.push('/'); return; }
      setIsAdmin(user.role === 'admin');
      loadChamado();
    });
  }, [params.id]);

  useEffect(() => {
    if (!chamado?.canManage) return;
    fetch(`/api/ministerios/${chamado.ministerio.id}`)
      .then((r) => r.json())
      .then((data) => {
        const todos = [
          data.lider,
          data.coLider,
          ...(data.membros ?? []).map((m: { user: Membro }) => m.user),
        ].filter(Boolean) as Membro[];
        const unique = Array.from(new Map(todos.map((m) => [m.id, m])).values());
        setMembros(unique);
      });
  }, [chamado?.canManage, chamado?.ministerio.id]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (membroDropdownRef.current && !membroDropdownRef.current.contains(e.target as Node)) {
        setShowMembroDropdown(false);
        setMembroSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = async () => {
    if (!formState) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/chamados/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: formState.status,
          prioridade: formState.prioridade,
          responsavelId: formState.responsavelId,
          previsaoConclusao: formState.previsaoConclusao || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast({ title: 'Salvo!', description: 'Chamado atualizado com sucesso' });
      loadChamado();
    } catch {
      toast({ title: 'Erro', description: 'Erro ao salvar alterações', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    await fetch(`/api/chamados/${params.id}`, { method: 'DELETE' });
    router.push('/chamados');
  };

  const handleComentario = async () => {
    if (!comentario.trim()) return;
    setIsSending(true);
    try {
      const res = await fetch(`/api/chamados/${params.id}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: comentario }),
      });
      if (!res.ok) throw new Error();
      const novoComentario = await res.json();
      setComentario('');
      setChamado((prev) => prev ? { ...prev, comentarios: [...prev.comentarios, novoComentario] } : prev);
      setTimeout(() => comentariosEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch {
      toast({ title: 'Erro', description: 'Erro ao enviar comentário', variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-2 sm:p-6 mt-[72px] max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!chamado || !formState) return null;

  const canManage = chamado.canManage;
  const comentarioHabilitado = canManage || (chamado.status !== 'CONCLUIDO' && chamado.status !== 'CANCELADO');

  return (
    <div className="p-2 sm:p-6 mt-[72px] max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push('/chamados')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Chamados
        </Button>
        {isAdmin && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-red-500">
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir chamado</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o chamado {chamado.codigo}? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={copiarCodigo}
              className="flex items-center gap-1 font-mono text-sm text-muted-foreground hover:text-foreground transition-colors group"
              title="Copiar código"
            >
              {chamado.codigo}
              {copiado
                ? <Check className="h-3.5 w-3.5 text-green-500" />
                : <Copy className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              }
            </button>
            <ChamadoStatusBadge status={formState.status} />
            <ChamadoPrioridadeBadge prioridade={formState.prioridade} />
          </div>
          <h1 className="text-xl font-bold">{chamado.titulo}</h1>
          {chamado.descricao && (
            <p className="text-sm text-muted-foreground whitespace-pre-line">{chamado.descricao}</p>
          )}

          {canManage && (
            <>
              <div className="grid grid-cols-2 gap-3 pt-2">
                {/* Status */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <select
                    value={formState.status}
                    onChange={(e) => setFormState((s) => s && { ...s, status: e.target.value })}
                    className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {Object.entries(STATUS_CONFIG).map(([k, { label }]) => (
                      <option key={k} value={k}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Prioridade */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Prioridade</p>
                  <select
                    value={formState.prioridade}
                    onChange={(e) => setFormState((s) => s && { ...s, prioridade: e.target.value })}
                    className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {Object.entries(PRIORIDADE_CONFIG).map(([k, { label }]) => (
                      <option key={k} value={k}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Responsável */}
                <div className="relative" ref={membroDropdownRef}>
                  <p className="text-xs text-muted-foreground mb-1">Responsável</p>
                  <button
                    type="button"
                    onClick={() => setShowMembroDropdown((v) => !v)}
                    className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm text-left focus:outline-none focus:ring-2 focus:ring-ring flex items-center justify-between"
                  >
                    <span className={formState.responsavelNome ? '' : 'text-muted-foreground'}>
                      {formState.responsavelNome ?? 'Não designado'}
                    </span>
                    <span className="text-muted-foreground text-xs">▾</span>
                  </button>
                  {showMembroDropdown && (
                    <div className="absolute z-20 top-full left-0 w-full mt-1 bg-white border rounded-md shadow-lg max-h-56 overflow-hidden flex flex-col">
                      <div className="p-2 border-b">
                        <input
                          type="text"
                          autoFocus
                          placeholder="Buscar membro..."
                          value={membroSearch}
                          onChange={(e) => setMembroSearch(e.target.value)}
                          className="w-full h-8 px-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </div>
                      <div className="overflow-y-auto flex-1">
                        {formState.responsavelId && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormState((s) => s && { ...s, responsavelId: null, responsavelNome: null });
                              setShowMembroDropdown(false);
                              setMembroSearch('');
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                          >
                            Remover responsável
                          </button>
                        )}
                        {membros
                          .filter((m) => m.name.toLowerCase().includes(membroSearch.toLowerCase()))
                          .map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                setFormState((s) => s && { ...s, responsavelId: m.id, responsavelNome: m.name });
                                setShowMembroDropdown(false);
                                setMembroSearch('');
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${formState.responsavelId === m.id ? 'font-medium text-onda-darkBlue' : ''}`}
                            >
                              {m.name}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Previsão de conclusão */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Previsão de conclusão</p>
                  <input
                    type="date"
                    value={formState.previsaoConclusao}
                    onChange={(e) => setFormState((s) => s && { ...s, previsaoConclusao: e.target.value })}
                    className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <Button onClick={handleSave} disabled={isSaving} className="w-full mt-1">
                {isSaving
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando...</>
                  : <><Save className="h-4 w-4 mr-2" /> Salvar alterações</>
                }
              </Button>
            </>
          )}

          {!canManage && (chamado.responsavel || chamado.previsaoConclusao) && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t">
              {chamado.responsavel && (
                <div>
                  <p className="text-xs text-muted-foreground">Responsável</p>
                  <p className="text-sm font-medium">{chamado.responsavel.name}</p>
                </div>
              )}
              {chamado.previsaoConclusao && (
                <div>
                  <p className="text-xs text-muted-foreground">Previsão de conclusão</p>
                  <p className="text-sm font-medium">{new Date(chamado.previsaoConclusao).toLocaleDateString('pt-BR')}</p>
                </div>
              )}
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-0.5 border-t pt-3">
            <p>Ministério: <span className="font-medium text-foreground">{chamado.ministerio.nome}</span></p>
            <p>
              {isAdmin ? 'Solicitante' : 'Aberto por'}:{' '}
              <span className="font-medium text-foreground">
                {chamado.abertoPor.name}{isAdmin && ` (${chamado.abertoPor.email})`}
              </span>
            </p>
            <p>Data: {new Date(chamado.createdAt).toLocaleString('pt-BR')}</p>
            {(() => {
              const conclusao = [...chamado.historico].reverse().find(
                (h) => h.tipo === 'STATUS_ALTERADO' && h.detalhe?.para === 'CONCLUIDO'
              );
              return conclusao ? (
                <p>Concluído por: <span className="font-medium text-foreground">{conclusao.autor.name}</span> em {new Date(conclusao.createdAt).toLocaleString('pt-BR')}</p>
              ) : null;
            })()}
          </div>
        </CardContent>
      </Card>

      {chamado.respostas.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Detalhes</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {chamado.respostas
              .sort((a, b) => a.campo.ordem - b.campo.ordem)
              .map((r) => (
                <div key={r.id} className={r.campo.tipo === 'ANEXO' ? 'sm:col-span-2' : ''}>
                  <p className="text-xs text-muted-foreground">{r.campo.label}</p>
                  {r.campo.tipo === 'ANEXO'
                    ? <AnexoViewer valor={r.valor} />
                    : <p className="text-sm font-medium">{formatValor(r.valor, r.campo.tipo)}</p>
                  }
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {chamado.historico.length > 0 && (
        <Card>
          <button
            type="button"
            onClick={() => setShowHistorico((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <span className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Histórico
              <span className="text-xs font-normal text-muted-foreground">({chamado.historico.length})</span>
            </span>
            <span className="text-muted-foreground text-xs">{showHistorico ? '▲' : '▼'}</span>
          </button>
          {showHistorico && (
            <CardContent className="px-4 pb-4 pt-0">
              <ol className="relative border-l border-gray-200 space-y-4 ml-2">
                {chamado.historico.map((entry) => (
                  <li key={entry.id} className="ml-4">
                    <div className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border border-white bg-gray-300" />
                    <p className="text-sm">
                      <span className="font-medium">{entry.autor.name}</span>{' '}
                      <span className="text-muted-foreground">{formatHistoricoTexto(entry)}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(entry.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </li>
                ))}
              </ol>
            </CardContent>
          )}
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Comentários ({chamado.comentarios.length})</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100">
          {chamado.comentarios.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum comentário ainda.</p>
          )}
          {chamado.comentarios.map((c) => (
            <div key={c.id} className="flex gap-3 py-3">
              <div className="rounded-full h-8 w-8 flex items-center justify-center text-xs font-bold shrink-0 bg-onda-darkBlue text-white">
                {c.autor.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium">{c.autor.name}</span>
                <div className="mt-1 text-sm bg-gray-100 rounded-lg px-3 py-2 text-gray-900">
                  {c.texto}
                </div>
                <span className="text-xs text-muted-foreground mt-1 block">
                  {new Date(c.createdAt).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          ))}
          <div ref={comentariosEndRef} />

          {comentarioHabilitado && (
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Escreva um comentário..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComentario(); } }}
                className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <Button size="sm" onClick={handleComentario} disabled={isSending || !comentario.trim()}>
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
