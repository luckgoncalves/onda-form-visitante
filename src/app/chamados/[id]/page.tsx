'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { checkAuth } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Send, Trash2, Copy, Check, Loader2 } from 'lucide-react';
import { ChamadoStatusBadge, ChamadoPrioridadeBadge, STATUS_CONFIG, PRIORIDADE_CONFIG } from '@/components/chamados/chamado-status-badge';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Chamado {
  id: string;
  codigo: string;
  titulo: string;
  descricao?: string;
  status: string;
  prioridade: string;
  createdAt: string;
  ministerio: { nome: string };
  abertoPor: { name: string; email: string };
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
}

function formatValor(valor: string, tipo: string): string {
  if (tipo === 'MULTISELECT') {
    try { return (JSON.parse(valor) as string[]).join(', '); } catch { return valor; }
  }
  return valor;
}

export default function ChamadoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [chamado, setChamado] = useState<Chamado | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const [comentario, setComentario] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const comentariosEndRef = useRef<HTMLDivElement>(null);

  const copiarCodigo = () => {
    if (!chamado) return;
    navigator.clipboard.writeText(chamado.codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  useEffect(() => {
    checkAuth().then(({ user }) => {
      if (!user) { router.push('/'); return; }
      setCurrentUserId(user.id);
      setIsAdmin(user.role === 'admin');
      loadChamado();
    });
  }, [params.id]);

  const loadChamado = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/chamados/${params.id}`);
      if (res.status === 404 || res.status === 403) { router.push('/chamados'); return; }
      if (!res.ok) throw new Error();
      setChamado(await res.json());
    } catch {
      toast({ title: 'Erro', description: 'Erro ao carregar chamado', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    await fetch(`/api/chamados/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    loadChamado();
  };

  const handlePrioridadeChange = async (prioridade: string) => {
    await fetch(`/api/chamados/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prioridade }),
    });
    loadChamado();
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

  if (!chamado) return null;

  const comentarioHabilitado = isAdmin || (chamado.status !== 'CONCLUIDO' && chamado.status !== 'CANCELADO');

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
            <ChamadoStatusBadge status={chamado.status} />
            <ChamadoPrioridadeBadge prioridade={chamado.prioridade} />
          </div>
          <h1 className="text-xl font-bold">{chamado.titulo}</h1>
          {chamado.descricao && (
            <p className="text-sm text-muted-foreground whitespace-pre-line">{chamado.descricao}</p>
          )}

          {isAdmin ? (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <select
                  value={chamado.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {Object.entries(STATUS_CONFIG).map(([k, { label }]) => (
                    <option key={k} value={k}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Prioridade</p>
                <select
                  value={chamado.prioridade}
                  onChange={(e) => handlePrioridadeChange(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {Object.entries(PRIORIDADE_CONFIG).map(([k, { label }]) => (
                    <option key={k} value={k}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}

          <div className="text-xs text-muted-foreground space-y-0.5 border-t pt-3">
            <p>Ministério: <span className="font-medium text-foreground">{chamado.ministerio.nome}</span></p>
            <p>
              {isAdmin ? 'Solicitante' : 'Aberto por'}:{' '}
              <span className="font-medium text-foreground">
                {chamado.abertoPor.name}{isAdmin && ` (${chamado.abertoPor.email})`}
              </span>
            </p>
            <p>Data: {new Date(chamado.createdAt).toLocaleString('pt-BR')}</p>
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
                <div key={r.id}>
                  <p className="text-xs text-muted-foreground">{r.campo.label}</p>
                  <p className="text-sm font-medium">{formatValor(r.valor, r.campo.tipo)}</p>
                </div>
              ))}
          </CardContent>
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
