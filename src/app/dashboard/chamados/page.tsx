'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuth } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ChamadoStatusBadge, ChamadoPrioridadeBadge, STATUS_CONFIG } from '@/components/chamados/chamado-status-badge';

interface Chamado {
  id: string;
  codigo: string;
  titulo: string;
  status: string;
  prioridade: string;
  ministerio: { nome: string };
  abertoPor: { name: string };
  createdAt: string;
  _count: { comentarios: number };
}

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  ...Object.entries(STATUS_CONFIG).map(([value, { label }]) => ({ value, label })),
];

function useDebounce<T>(value: T, delay: number): T {
  const [d, setD] = useState<T>(value);
  useEffect(() => { const t = setTimeout(() => setD(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return d;
}

export default function DashboardChamadosPage() {
  const router = useRouter();
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

  const load = useCallback(async (page = 1, status = '') => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (status) params.set('status', status);
      const res = await fetch(`/api/chamados?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setChamados(data.chamados);
      setPagination({ page: data.pagination.page, total: data.pagination.total, totalPages: data.pagination.totalPages });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth().then(({ user }) => {
      if (!user || user.role !== 'admin') { router.push('/'); return; }
      load(1, statusFilter);
    });
  }, [router, load, statusFilter]);

  const handleStatus = async (chamadoId: string, status: string) => {
    await fetch(`/api/chamados/${chamadoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load(pagination.page, statusFilter);
  };

  return (
    <div className="p-2 sm:p-6 mt-[72px]">
      {/* KPIs simples */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Object.entries(STATUS_CONFIG).map(([key, { label, class: cls }]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(statusFilter === key ? '' : key)}
            className={`rounded-lg border p-3 text-left transition-all ${statusFilter === key ? 'ring-2 ring-black' : ''}`}
          >
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${cls}`}>{label}</span>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Chamados</CardTitle>
              <CardDescription>{pagination.total} chamado{pagination.total !== 1 ? 's' : ''}</CardDescription>
            </div>
            {statusFilter && (
              <Button variant="outline" size="sm" onClick={() => setStatusFilter('')}>
                <X className="h-4 w-4 mr-1" />
                Limpar filtro
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : chamados.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhum chamado encontrado.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Código</th>
                      <th className="text-left p-3 font-medium">Título</th>
                      <th className="text-left p-3 font-medium hidden sm:table-cell">Ministério</th>
                      <th className="text-left p-3 font-medium hidden md:table-cell">Solicitante</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium hidden sm:table-cell">Prioridade</th>
                      <th className="text-left p-3 font-medium hidden md:table-cell">Data</th>
                      <th className="text-left p-3 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chamados.map((chamado) => (
                      <tr key={chamado.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-mono text-xs text-muted-foreground">{chamado.codigo}</td>
                        <td className="p-3">
                          <button
                            className="font-medium hover:underline text-left line-clamp-1 max-w-[180px]"
                            onClick={() => router.push(`/dashboard/chamados/${chamado.id}`)}
                          >
                            {chamado.titulo}
                          </button>
                        </td>
                        <td className="p-3 hidden sm:table-cell text-muted-foreground">{chamado.ministerio.nome}</td>
                        <td className="p-3 hidden md:table-cell text-muted-foreground">{chamado.abertoPor.name}</td>
                        <td className="p-3">
                          <select
                            value={chamado.status}
                            onChange={(e) => handleStatus(chamado.id, e.target.value)}
                            className="text-xs border rounded px-1.5 py-1 bg-background focus:outline-none"
                          >
                            {Object.entries(STATUS_CONFIG).map(([k, { label }]) => (
                              <option key={k} value={k}>{label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3 hidden sm:table-cell">
                          <ChamadoPrioridadeBadge prioridade={chamado.prioridade} />
                        </td>
                        <td className="p-3 hidden md:table-cell text-muted-foreground text-xs">
                          {new Date(chamado.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/chamados/${chamado.id}`)}
                          >
                            Ver
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline" size="sm"
                    onClick={() => load(pagination.page - 1, statusFilter)}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline" size="sm"
                    onClick={() => load(pagination.page + 1, statusFilter)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
