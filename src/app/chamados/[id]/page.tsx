'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { checkAuth } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Send } from 'lucide-react';
import { ChamadoStatusBadge, ChamadoPrioridadeBadge } from '@/components/chamados/chamado-status-badge';
import { useToast } from '@/hooks/use-toast';

interface Comentario {
  id: string;
  texto: string;
  createdAt: string;
  autor: { id: string; name: string; profileImageUrl?: string | null };
}

interface Chamado {
  id: string;
  codigo: string;
  titulo: string;
  descricao?: string;
  status: string;
  prioridade: string;
  createdAt: string;
  ministerio: { nome: string };
  abertoPor: { name: string };
  respostas: {
    id: string;
    valor: string;
    campo: { id: string; label: string; tipo: string; ordem: number };
  }[];
  comentarios: Comentario[];
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
  const [comentario, setComentario] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const comentariosEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth().then(({ user }) => {
      if (!user) { router.push('/'); return; }
      setCurrentUserId(user.id);
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

  return (
    <div className="p-2 sm:p-6 mt-[72px] max-w-2xl mx-auto space-y-4">
      <Button variant="ghost" size="sm" onClick={() => router.push('/chamados')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Meus chamados
      </Button>

      {/* Header */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm text-muted-foreground">{chamado.codigo}</span>
            <ChamadoStatusBadge status={chamado.status} />
            <ChamadoPrioridadeBadge prioridade={chamado.prioridade} />
          </div>
          <h1 className="text-xl font-bold">{chamado.titulo}</h1>
          {chamado.descricao && (
            <p className="text-sm text-muted-foreground whitespace-pre-line">{chamado.descricao}</p>
          )}
          <div className="text-xs text-muted-foreground space-y-0.5 pt-1">
            <p>Ministério: <span className="font-medium text-foreground">{chamado.ministerio.nome}</span></p>
            <p>Aberto por: <span className="font-medium text-foreground">{chamado.abertoPor.name}</span></p>
            <p>Data: {new Date(chamado.createdAt).toLocaleString('pt-BR')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Campos personalizados */}
      {chamado.respostas.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Detalhes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
          <CardTitle className="text-base">
            Comentários ({chamado.comentarios.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {chamado.comentarios.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum comentário ainda.
            </p>
          )}
          {chamado.comentarios.map((c) => (
            <div
              key={c.id}
              className={`flex gap-2 ${c.autor.id === currentUserId ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`rounded-full h-8 w-8 flex items-center justify-center text-xs font-bold shrink-0 ${
                  c.autor.id === currentUserId ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {c.autor.name.charAt(0).toUpperCase()}
              </div>
              <div className={`flex-1 ${c.autor.id === currentUserId ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                <span className="text-xs text-muted-foreground">{c.autor.name}</span>
                <div
                  className={`text-sm rounded-lg px-3 py-2 max-w-[85%] ${
                    c.autor.id === currentUserId
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {c.texto}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(c.createdAt).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          ))}
          <div ref={comentariosEndRef} />

          {/* Input de comentário */}
          {chamado.status !== 'CONCLUIDO' && chamado.status !== 'CANCELADO' && (
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
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
