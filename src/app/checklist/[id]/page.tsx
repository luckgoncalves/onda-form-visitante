'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { checkAuth } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Check, X } from 'lucide-react';
import {
  ChecklistSecaoPreenchida,
  canAccessChecklist,
  formatDataHora,
} from '@/config/checklist-inspecao';

interface ChecklistDetalhe {
  id: string;
  secoes: ChecklistSecaoPreenchida[];
  totalItens: number;
  itensVerificados: number;
  createdAt: string;
  responsavel: { id: string; name: string };
  campus: { id: string; nome: string } | null;
}

export default function ChecklistDetalhePage() {
  const router = useRouter();
  const params = useParams();
  const [checklist, setChecklist] = useState<ChecklistDetalhe | null>(null);

  useEffect(() => {
    async function init() {
      const { user } = await checkAuth();
      if (!user) { router.push('/'); return; }
      if (!canAccessChecklist(user)) { router.push('/register'); return; }

      const res = await fetch(`/api/checklist/${params.id}`);
      if (!res.ok) { router.push('/checklist'); return; }
      setChecklist(await res.json());
    }
    init();
  }, [params.id, router]);

  if (!checklist) {
    return (
      <div className="p-2 sm:p-6 mt-[72px] max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const { data, hora } = formatDataHora(checklist.createdAt);

  return (
    <div className="p-2 sm:p-6 mt-[72px] max-w-3xl mx-auto space-y-4 pb-32 sm:pb-6">
      <Button variant="ghost" size="sm" onClick={() => router.push('/checklist')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Checklists
      </Button>

      <div>
        <h1 className="text-xl font-bold">Checklist de Verificação e Inspeção</h1>
        <p className="text-xs text-muted-foreground">
          {checklist.itensVerificados} de {checklist.totalItens} itens verificados
        </p>
      </div>

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
            <p className="font-medium truncate">{checklist.responsavel.name}</p>
          </div>
        </CardContent>
      </Card>

      {checklist.secoes.map((secao) => (
        <Card key={secao.id}>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">{secao.id}. {secao.titulo}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            {secao.itens.map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  item.verificado ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'
                }`}
              >
                {item.verificado
                  ? <Check className="h-5 w-5 shrink-0 text-green-600" />
                  : <X className="h-5 w-5 shrink-0 text-amber-600" />}
                <span className="text-sm">
                  <span className="font-mono text-xs text-muted-foreground mr-1.5">{item.id}</span>
                  {item.texto}
                </span>
              </div>
            ))}
            {secao.observacoes && (
              <div className="mt-2 p-3 rounded-lg bg-gray-50 text-sm">
                <p className="text-xs text-muted-foreground mb-1">Observações</p>
                <p className="whitespace-pre-wrap">{secao.observacoes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
