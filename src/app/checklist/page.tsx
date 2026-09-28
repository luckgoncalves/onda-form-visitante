'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkAuth } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Check, ChevronDown, ChevronLeft, ChevronRight, ClipboardCheck, Pencil, Save } from 'lucide-react';
import { ChecklistTopicoModelo, canAccessChecklist, formatDataHora } from '@/config/checklist-inspecao';

interface ChecklistResumo {
  id: string;
  totalItens: number;
  itensVerificados: number;
  createdAt: string;
  responsavel: { id: string; name: string };
}

export default function ChecklistPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [userName, setUserName] = useState<string | null>(null);
  const [aba, setAba] = useState<'preencher' | 'historico'>('preencher');
  const [agora, setAgora] = useState(() => new Date());
  const [verificados, setVerificados] = useState<Set<string>>(new Set());
  const [topicos, setTopicos] = useState<ChecklistTopicoModelo[]>([]);
  const [podeEditar, setPodeEditar] = useState(false);
  const [secoesAbertas, setSecoesAbertas] = useState<Set<string>>(new Set());
  const [observacoes, setObservacoes] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const [historico, setHistorico] = useState<ChecklistResumo[]>([]);
  const [isLoadingHistorico, setIsLoadingHistorico] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  useEffect(() => {
    // Autenticação e modelo em paralelo (a API também valida o acesso)
    const modeloPromise = fetch('/api/checklist/modelo');
    checkAuth().then(async ({ user }) => {
      if (!user) { router.push('/'); return; }
      if (!canAccessChecklist(user)) { router.push('/register'); return; }

      try {
        const res = await modeloPromise;
        if (!res.ok) throw new Error();
        const data: { topicos: ChecklistTopicoModelo[]; podeEditar: boolean } = await res.json();
        setTopicos(data.topicos);
        setPodeEditar(data.podeEditar);
        if (data.topicos[0]) setSecoesAbertas(new Set([data.topicos[0].id]));
      } catch {
        toast({ title: 'Erro', description: 'Erro ao carregar o checklist', variant: 'destructive' });
      }
      setUserName(user.name);
    });
  }, [router, toast]);

  useEffect(() => {
    const timer = setInterval(() => setAgora(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const loadHistorico = useCallback(async (page: number) => {
    setIsLoadingHistorico(true);
    try {
      const res = await fetch(`/api/checklist?page=${page}&limit=20`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setHistorico(data.checklists);
      setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
    } catch {
      toast({ title: 'Erro', description: 'Erro ao carregar histórico', variant: 'destructive' });
    } finally {
      setIsLoadingHistorico(false);
    }
  }, [toast]);

  useEffect(() => {
    if (aba === 'historico' && userName) loadHistorico(1);
  }, [aba, userName, loadHistorico]);

  const toggleSecao = (id: string) => {
    setSecoesAbertas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleItem = (secaoId: string, itemId: string) => {
    const next = new Set(verificados);
    if (next.has(itemId)) next.delete(itemId);
    else next.add(itemId);
    setVerificados(next);

    // Ao completar uma seção, fecha ela e abre a próxima ainda incompleta
    const secao = topicos.find((s) => s.id === secaoId);
    const completou = !verificados.has(itemId) && secao?.itens.every((i) => next.has(i.id));
    if (!completou) return;

    const indice = topicos.findIndex((s) => s.id === secaoId);
    const proxima = topicos.slice(indice + 1).find((s) => s.itens.some((i) => !next.has(i.id)));
    setSecoesAbertas((prev) => {
      const abertas = new Set(prev);
      abertas.delete(secaoId);
      if (proxima) abertas.add(proxima.id);
      return abertas;
    });
  };

  const totalItens = useMemo(() => topicos.reduce((acc, t) => acc + t.itens.length, 0), [topicos]);
  const pendentes = totalItens - verificados.size;
  const progresso = totalItens ? Math.round((verificados.size / totalItens) * 100) : 0;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificados: Array.from(verificados), observacoes }),
      });
      if (!res.ok) throw new Error();

      toast({ title: 'Checklist salvo', description: 'A verificação foi registrada com sucesso.' });
      setVerificados(new Set());
      setObservacoes({});
      setSecoesAbertas(new Set(topicos[0] ? [topicos[0].id] : []));
      setAba('historico');
      window.scrollTo({ top: 0 });
    } catch {
      toast({ title: 'Erro', description: 'Erro ao salvar checklist', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!userName) {
    return (
      <div className="p-2 sm:p-6 mt-[72px] max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-60" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const { data, hora } = formatDataHora(agora);

  return (
    <div className="p-2 sm:p-6 mt-[72px] max-w-3xl mx-auto pb-32 sm:pb-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Checklist de Verificação e Inspeção</h1>
          <p className="text-xs text-muted-foreground">Manutenção</p>
        </div>
        {podeEditar && (
          <Button variant="outline" size="sm" className="shrink-0 gap-2" onClick={() => router.push('/checklist/modelo')}>
            <Pencil className="h-4 w-4" />
            <span className="hidden sm:inline">Editar checklist</span>
            <span className="sm:hidden">Editar</span>
          </Button>
        )}
      </div>

      <div className="flex gap-1.5 mb-5">
        {([
          { value: 'preencher', label: 'Preencher' },
          { value: 'historico', label: 'Histórico' },
        ] as const).map((opt) => (
          <button
            key={opt.value}
            onClick={() => setAba(opt.value)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              aba === opt.value
                ? 'bg-onda-darkBlue text-white border-onda-darkBlue'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {aba === 'preencher' ? (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Data</p>
                <p className="font-medium">{data}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Horário</p>
                <p className="font-medium">{hora}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs text-muted-foreground">Responsável</p>
                <p className="font-medium truncate">{userName}</p>
              </div>
            </CardContent>
          </Card>

          {topicos.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                Nenhum tópico cadastrado.{podeEditar && ' Use "Editar checklist" para adicionar.'}
              </CardContent>
            </Card>
          )}

          {topicos.map((secao, t) => {
            const feitos = secao.itens.filter((i) => verificados.has(i.id)).length;
            const aberta = secoesAbertas.has(secao.id);
            return (
              <Card key={secao.id}>
                <button
                  type="button"
                  onClick={() => toggleSecao(secao.id)}
                  aria-expanded={aberta}
                  className="w-full text-left"
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-base flex items-center justify-between gap-2">
                      <span>{t + 1}. {secao.titulo}</span>
                      <span className="flex items-center gap-2 shrink-0">
                        {observacoes[secao.id]?.trim() && !aberta && (
                          <span className="text-xs font-normal text-muted-foreground">com obs.</span>
                        )}
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            feitos === secao.itens.length ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {feitos}/{secao.itens.length}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground transition-transform ${aberta ? 'rotate-180' : ''}`}
                        />
                      </span>
                    </CardTitle>
                  </CardHeader>
                </button>
                {aberta && (
                  <CardContent className="p-4 pt-0 space-y-2">
                    {secao.itens.map((item, i) => {
                      const checked = verificados.has(item.id);
                      return (
                        <label
                          key={item.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            checked ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="mt-0.5 h-5 w-5 shrink-0 rounded border-gray-300 accent-[#0f172a]"
                            checked={checked}
                            onChange={() => toggleItem(secao.id, item.id)}
                          />
                          <span className="text-sm">
                            <span className="font-mono text-xs text-muted-foreground mr-1.5">{t + 1}.{i + 1}</span>
                            {item.texto}
                          </span>
                        </label>
                      );
                    })}
                    <Textarea
                      placeholder="Observações"
                      value={observacoes[secao.id] || ''}
                      onChange={(e) => setObservacoes((prev) => ({ ...prev, [secao.id]: e.target.value }))}
                      className="mt-2 text-sm"
                      rows={2}
                    />
                  </CardContent>
                )}
              </Card>
            );
          })}

          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{verificados.size} de {totalItens} itens verificados</span>
                <span className="text-muted-foreground">{progresso}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-green-500 transition-all" style={{ width: `${progresso}%` }} />
              </div>
              {pendentes > 0 && (
                <p className="text-xs text-amber-700">
                  {pendentes} {pendentes === 1 ? 'item não verificado será registrado' : 'itens não verificados serão registrados'} como pendente.
                </p>
              )}
              <Button
                onClick={handleSave}
                disabled={isSaving || totalItens === 0}
                className="w-full bg-onda-darkBlue hover:bg-onda-darkBlue/90 text-white gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Salvando...' : 'Salvar checklist'}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : isLoadingHistorico ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : historico.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-medium mb-1">Nenhum checklist registrado</p>
          <p className="text-sm text-muted-foreground">Os checklists salvos aparecerão aqui.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {historico.map((item) => {
              const { data: d, hora: h } = formatDataHora(item.createdAt);
              const completo = item.itensVerificados === item.totalItens;
              return (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/checklist/${item.id}`)}
                >
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium">{d} às {h}</p>
                      <p className="text-sm text-muted-foreground truncate">{item.responsavel.name}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                          completo ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {completo && <Check className="h-3 w-3" />}
                        {item.itensVerificados}/{item.totalItens}
                      </span>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6">
              <Button
                variant="outline" size="sm"
                onClick={() => loadHistorico(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline" size="sm"
                onClick={() => loadHistorico(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
