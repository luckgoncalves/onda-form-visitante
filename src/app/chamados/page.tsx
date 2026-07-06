'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuth } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Ticket, ChevronRight, ChevronLeft } from 'lucide-react';
import { ChamadoStatusBadge, ChamadoPrioridadeBadge, STATUS_CONFIG } from '@/components/chamados/chamado-status-badge';

interface Chamado {
  id: string;
  codigo: string;
  titulo: string;
  status: string;
  prioridade: string;
  ministerio: { nome: string };
  abertoPor: { id: string; name: string };
  comentarios: { autorId: string }[];
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

const STATUS_FECHADO = new Set(['CONCLUIDO', 'CANCELADO']);

function TagResposta({ chamado, isAdmin }: { chamado: Chamado; isAdmin: boolean }) {
  const ultimoComentario = chamado.comentarios[0];
  if (!ultimoComentario || STATUS_FECHADO.has(chamado.status)) return null;

  const ultimoFoiOAbertoPor = ultimoComentario.autorId === chamado.abertoPor.id;

  if (ultimoFoiOAbertoPor) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium whitespace-nowrap">
        Aguardando equipe
      </span>
    );
  }

  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium whitespace-nowrap">
      {isAdmin ? 'Aguardando solicitante' : 'Aguardando sua resposta'}
    </span>
  );
}

export default function ChamadosPage() {
  const router = useRouter();
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const load = useCallback(async (status: string, page: number, admin: boolean) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: admin ? '20' : '50', page: String(page) });
      if (!admin) params.set('meus', 'true');
      if (status) params.set('status', status);
      const res = await fetch(`/api/chamados?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setChamados(data.chamados);
      setTotal(data.pagination.total);
      setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
    } catch {
      // silencioso
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth().then(({ user }) => {
      if (!user) { router.push('/'); return; }
      setIsAdmin(user.role === 'admin');
    });
  }, [router]);

  useEffect(() => {
    if (isAdmin === null) return;
    load(statusFilter, 1, isAdmin);
  }, [isAdmin, statusFilter, load]);

  const handleStatusChange = async (chamadoId: string, status: string) => {
    await fetch(`/api/chamados/${chamadoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load(statusFilter, pagination.page, true);
  };

  return (
    <div className="p-2 sm:p-6 mt-[72px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold">{isAdmin ? 'Chamados' : 'Meus Chamados'}</h1>
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
        <>
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
                        <TagResposta chamado={chamado} isAdmin={!!isAdmin} />
                      </div>
                      <p className="font-medium truncate">{chamado.titulo}</p>
                      <p className="text-sm text-muted-foreground">
                        {chamado.ministerio.nome} · {new Date(chamado.createdAt).toLocaleDateString('pt-BR')}
                        {isAdmin && ` · ${chamado.abertoPor.name}`}
                      </p>
                      {isAdmin && (
                        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={chamado.status}
                            onChange={(e) => handleStatusChange(chamado.id, e.target.value)}
                            className="text-xs border rounded px-2 py-1 bg-background focus:outline-none"
                          >
                            {Object.entries(STATUS_CONFIG).map(([k, { label }]) => (
                              <option key={k} value={k}>{label}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {isAdmin && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6">
              <Button
                variant="outline" size="sm"
                onClick={() => load(statusFilter, pagination.page - 1, true)}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline" size="sm"
                onClick={() => load(statusFilter, pagination.page + 1, true)}
                disabled={pagination.page === pagination.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* FAB mobile */}
      <button
        onClick={() => router.push('/chamados/novo')}
        className="sm:hidden fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] right-4 z-40 flex items-center gap-2 bg-onda-darkBlue text-white rounded-full px-4 py-3 shadow-lg"
      >
        <Plus size={20} />
        <span className="text-sm font-medium">Novo Chamado</span>
      </button>
    </div>
  );
}
