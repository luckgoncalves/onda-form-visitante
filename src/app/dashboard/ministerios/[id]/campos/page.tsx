'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { checkAuth } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import CamposEditor from '@/components/chamados/campos-editor';

interface Ministerio {
  id: string;
  nome: string;
  descricao?: string;
}

export default function CamposMinisterioPage() {
  const router = useRouter();
  const params = useParams();
  const [ministerio, setMinisterio] = useState<Ministerio | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const { user } = await checkAuth();
      if (!user || user.role !== 'admin') { router.push('/'); return; }

      const res = await fetch(`/api/ministerios/${params.id}`);
      if (!res.ok) { router.push('/dashboard/ministerios'); return; }
      const data = await res.json();
      setMinisterio({ id: data.id, nome: data.nome, descricao: data.descricao });
      setIsLoading(false);
    }
    init();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="p-2 sm:p-6 mt-[72px] max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!ministerio) return null;

  return (
    <div className="p-2 sm:p-6 mt-[72px] max-w-2xl mx-auto space-y-4">
      <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/ministerios')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Ministérios
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Campos do Formulário — {ministerio.nome}</CardTitle>
          <CardDescription>
            Configure os campos personalizados que aparecerão no formulário de abertura de chamados
            para este ministério. Os campos base (título, descrição, prioridade) são sempre exibidos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CamposEditor ministerioId={ministerio.id} ministerioNome={ministerio.nome} />
        </CardContent>
      </Card>
    </div>
  );
}
