'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { checkAuth } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Send, Trash2 } from 'lucide-react';
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
    id: string; valor: string;
    campo: { id: string; label: string; tipo: string; ordem: number };
  }[];
  comentarios: {
    id: string; texto: string; createdAt: string;
    autor: { id: string; name: string };
  }[];
}

function formatValor(valor: string, tipo: string) {
  if (tipo === 'MULTISELECT') { try { return (JSON.parse(valor) as string[]).join(', '); } catch { return valor; } }
  return valor;
}

export default function DashboardChamadoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [chamado, setChamado] = useState<Chamado | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState('');
  const [comentario, setComentario] = useState('');
  const [isSending, setIsSending] = useState(false);
  const comentariosEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth().then(({ user }) => {
      if (!user || user.role !== 'admin') { router.push('/'); return; }
      setCurrentUserId(user.id);
      loadChamado();
    });
  }, [params.id]);

  const loadChamado = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/chamados/${params.id}`);
      if (!res.ok) { router.push('/dashboard/chamados'); return; }
      setChamado(await res.json());
    } finally { setIsLoading(false); }
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
    router.push('/dashboard/chamados');
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
      setComentario('');
      await loadChamado();
      setTimeout(() => comentariosEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {
      toast({ title: 'Erro', description: 'Erro ao enviar comentário', variant: 'destructive' });
    } finally { setIsSending(false); }
  };

  if (isLoading) {
    return (
      <div className="p-2 sm:p-6 mt-[72px] max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!chamado) return null;

  return (
    <div className="p-2 sm:p-6 mt-[72px] max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/chamados')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Chamados
        </Button>
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
      </div>

      {/* Detalhes + controles admin */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm text-muted-foreground">{chamado.codigo}</span>
            <ChamadoStatusBadge status={chamado.status} />
            <ChamadoPrioridadeBadge prioridade={chamado.prioridade} />
          </div>
          <h1 className="text-xl font-bold">{chamado.titulo}</h1>
          {chamado.descricao && (
            <p className="text-sm text-muted-foreground whitespace-pre-line">{chamado.descricao}</p>
          )}

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

          <div className="text-xs text-muted-foreground space-y-0.5 border-t pt-3">
            <p>Ministério: <span className="font-medium text-foreground">{chamado.ministerio.nome}</span></p>
            <p>Solicitante: <span className="font-medium text-foreground">{chamado.abertoPor.name} ({chamado.abertoPor.email})</span></p>
            <p>Aberto em: {new Date(chamado.createdAt).toLocaleString('pt-BR')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Campos personalizados */}
      {chamado.respostas.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Detalhes do chamado</CardTitle></CardHeader>
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

      {/* Comentários */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Comentários ({chamado.comentarios.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {chamado.comentarios.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum comentário ainda.</p>
          )}
          {chamado.comentarios.map((c) => (
            <div key={c.id} className={`flex gap-2 ${c.autor.id === currentUserId ? 'flex-row-reverse' : ''}`}>
              <div className={`rounded-full h-8 w-8 flex items-center justify-center text-xs font-bold shrink-0 ${c.autor.id === currentUserId ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}`}>
                {c.autor.name.charAt(0).toUpperCase()}
              </div>
              <div className={`flex-1 ${c.autor.id === currentUserId ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                <span className="text-xs text-muted-foreground">{c.autor.name}</span>
                <div className={`text-sm rounded-lg px-3 py-2 max-w-[85%] ${c.autor.id === currentUserId ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'}`}>
                  {c.texto}
                </div>
                <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString('pt-BR')}</span>
              </div>
            </div>
          ))}
          <div ref={comentariosEndRef} />
          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Escreva uma atualização..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleComentario(); } }}
              className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button size="sm" onClick={handleComentario} disabled={isSending || !comentario.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
