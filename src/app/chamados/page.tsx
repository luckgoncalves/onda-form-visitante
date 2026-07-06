'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuth } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Ticket, ChevronRight } from 'lucide-react';
import { ChamadoStatusBadge, ChamadoPrioridadeBadge } from '@/components/chamados/chamado-status-badge';

interface Chamado {
  id: string;
  codigo: string;
  titulo: string;
  status: string;
  prioridade: string;
  ministerio: { nome: string };
  createdAt: string;
  _count: { comentarios: number };
}

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'RECEBIDO', label: 'Recebido' },
  { value: 'EM_ANDAMENTO', label: 'Em andamento' },
  { value: 'CONCLUIDO', label: 'Concluído' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

export default function MeusChamadosPage() {
  const router = useRouter();
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [total, setTotal] = useState(0);

  const load = useCallback(async (status: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ meus: 'true', limit: '50' });
      if (status) params.set('status', status);
      const res = await fetch(`/api/chamados?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setChamados(data.chamados);
      setTotal(data.pagination.total);
    } catch {
      // silencioso
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth().then(({ user }) => {
      if (!user) router.push('/');
      else load(statusFilter);
    });
  }, [router, load, statusFilter]);

  return (
    <div className="p-2 sm:p-6 mt-[72px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold">Meus Chamados</h1>
          <p className="text-sm text-muted-foreground">{total} chamado{total !== 1 ? 's' : ''}</p>
        </div>
        <Button
          onClick={() => router.push('/chamados/novo')}
          className="hidden sm:flex bg-onda-darkBlue hover:bg-onda-darkBlue/90 text-white items-center gap-2"
        >
          <Plus size={20} />
          Novo Chamado
        </Button>
      </div>

      {/* FAB mobile */}
      <button
        onClick={() => router.push('/chamados/novo')}
        className="sm:hidden fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] right-4 z-40 flex items-center gap-2 bg-onda-darkBlue text-white rounded-full px-4 py-3 shadow-lg"
      >
        <Plus size={20} />
        <span className="text-sm font-medium">Novo Chamado</span>
      </button>

      {/* Filtro de status */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`text-sm px-3 py-1 rounded-full border transition-colors ${
              statusFilter === opt.value
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : chamados.length === 0 ? (
        <div className="text-center py-16">
          <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-medium mb-1">Nenhum chamado encontrado</p>
          <p className="text-sm text-muted-foreground mb-4">
            {statusFilter ? 'Tente outro filtro.' : 'Abra seu primeiro chamado.'}
          </p>
          {!statusFilter && (
            <Button onClick={() => router.push('/chamados/novo')}>
              <Plus className="h-4 w-4 mr-2" />
              Abrir Chamado
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {chamados.map((chamado) => (
            <Card
              key={chamado.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/chamados/${chamado.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-xs text-muted-foreground">{chamado.codigo}</span>
                      <ChamadoStatusBadge status={chamado.status} />
                      <ChamadoPrioridadeBadge prioridade={chamado.prioridade} />
                    </div>
                    <p className="font-medium truncate">{chamado.titulo}</p>
                    <p className="text-sm text-muted-foreground">
                      {chamado.ministerio.nome} · {new Date(chamado.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
