'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { checkAuth } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Ministerio {
  id: string;
  nome: string;
}

const CONFIGURABLE_PAGES = [
  { key: '/register', label: 'Cadastro de Visitante', section: 'Geral' },
  { key: '/empresas', label: 'Empresas', section: 'Geral' },
  { key: '/chamados', label: 'Chamados', section: 'Geral' },
  { key: 'grupos', label: 'Grupos', section: 'Comunidade' },
  { key: '/list', label: 'Visitantes', section: 'Gestão' },
  { key: '/dashboard', label: 'Dashboard', section: 'Gestão' },
  { key: '/dashboard/forms', label: 'Formulários', section: 'Gestão' },
  { key: '/dashboard/etiquetas', label: 'Etiquetas', section: 'Gestão' },
  { key: '/users', label: 'Membros', section: 'Gestão' },
  { key: '/dashboard/ministerios', label: 'Ministérios', section: 'Gestão' },
];

export default function PaginasMinisterioPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const [ministerio, setMinisterio] = useState<Ministerio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [paginasHabilitadas, setPaginasHabilitadas] = useState<string[]>([]);
  const [paginaInicial, setPaginaInicial] = useState('/register');

  useEffect(() => {
    async function init() {
      const { user } = await checkAuth();
      if (!user || user.role !== 'admin') {
        router.push('/');
        return;
      }

      const [resMin, resNav] = await Promise.all([
        fetch(`/api/ministerios/${params.id}`),
        fetch(`/api/ministerios/${params.id}/nav-config`),
      ]);

      if (!resMin.ok) {
        router.push('/dashboard/ministerios');
        return;
      }

      const minData = await resMin.json();
      setMinisterio({ id: minData.id, nome: minData.nome });

      if (resNav.ok) {
        const navData = await resNav.json();
        setPaginasHabilitadas(navData.paginasHabilitadas || []);
        setPaginaInicial(navData.paginaInicial || '/register');
      }

      setIsLoading(false);
    }
    init();
  }, [params.id, router]);

  const togglePage = (key: string) => {
    setPaginasHabilitadas((prev) => {
      if (prev.includes(key)) {
        const next = prev.filter((k) => k !== key);
        // If paginaInicial was this page, reset it
        if (paginaInicial === key) {
          const remaining = CONFIGURABLE_PAGES.filter((p) => next.includes(p.key));
          setPaginaInicial(remaining[0]?.key || '/register');
        }
        return next;
      }
      return [...prev, key];
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/ministerios/${params.id}/nav-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paginaInicial, paginasHabilitadas }),
      });

      if (!res.ok) throw new Error('Erro ao salvar');

      toast({ title: 'Sucesso', description: 'Configuração de navegação salva!' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro', description: 'Erro ao salvar configuração', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  // Pages that are checked and can be set as initial
  const checkedPages = CONFIGURABLE_PAGES.filter((p) => paginasHabilitadas.includes(p.key));

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
          <CardTitle>Páginas do Ministério — {ministerio.nome}</CardTitle>
          <CardDescription>
            Configure quais páginas são visíveis para os membros deste ministério e qual é a página
            inicial após o login. Se nenhuma página for marcada, todas as páginas padrão serão
            exibidas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Page checklist grouped by section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Páginas habilitadas</h3>
            {(['Geral', 'Comunidade', 'Gestão'] as const).map((section) => {
              const pages = CONFIGURABLE_PAGES.filter((p) => p.section === section);
              return (
                <div key={section} className="space-y-2">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{section}</p>
                  {pages.map((page) => {
                    const checked = paginasHabilitadas.includes(page.key);
                    return (
                      <label
                        key={page.key}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-onda-darkBlue accent-[#0f172a]"
                          checked={checked}
                          onChange={() => togglePage(page.key)}
                        />
                        <span className="text-sm font-medium text-gray-800">{page.label}</span>
                        <span className="ml-auto text-xs text-gray-400 font-mono">{page.key}</span>
                      </label>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Initial page select */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Página inicial após login</h3>
            {checkedPages.length === 0 ? (
              <p className="text-sm text-gray-500">
                Marque ao menos uma página acima para definir a página inicial.
              </p>
            ) : (
              <select
                value={paginaInicial}
                onChange={(e) => setPaginaInicial(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-onda-darkBlue focus:outline-none focus:ring-1 focus:ring-onda-darkBlue"
              >
                {checkedPages.map((page) => (
                  <option key={page.key} value={page.key}>
                    {page.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-onda-darkBlue hover:bg-onda-darkBlue/90 text-white gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Salvando...' : 'Salvar configuração'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
