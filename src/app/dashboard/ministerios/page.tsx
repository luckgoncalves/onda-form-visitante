'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Plus, Search, X } from 'lucide-react';
import { checkAuth } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ICONES_ACOES, MinisterioAcoes } from '@/components/ministerios/ministerio-acoes';
import { resolverVisualMinisterio } from '@/config/ministerio-visual';

interface Ministerio {
  id: string;
  nome: string;
  icone?: string | null;
  cor?: string | null;
  lider: { id: string; name: string } | null;
  coLider?: { id: string; name: string } | null;
}

const BOTAO_PRIMARIO =
  'inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-onda-blue px-4 text-[15px] font-bold text-white transition-colors hover:bg-onda-blue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue focus-visible:ring-offset-2';
const BOTAO_SECUNDARIO =
  'inline-flex h-11 items-center justify-center rounded-xl border-[1.5px] border-onda-blue px-4 text-[15px] font-semibold text-onda-blue transition-colors hover:bg-onda-blue/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue focus-visible:ring-offset-2';

function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

function nomesLideres(m: Ministerio) {
  const nomes = [m.lider?.name, m.coLider?.name].filter(Boolean);
  return nomes.length ? `Líder: ${nomes.join(', ')}` : 'Sem líder definido';
}

function IconeMinisterio({ ministerio }: { ministerio: Ministerio }) {
  const { icon: Icon, color } = resolverVisualMinisterio(ministerio.icone, ministerio.cor);
  return (
    <span
      aria-hidden="true"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
      style={{ backgroundColor: color.bg, color: color.fg }}
    >
      <Icon className="h-[22px] w-[22px]" />
    </span>
  );
}

function EstadoVazio({
  icone,
  titulo,
  texto,
  children,
}: {
  icone?: React.ReactNode;
  titulo: string;
  texto: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#ECEDF3] bg-white px-6 py-10 text-center">
      {icone}
      <h2 className="text-lg font-bold text-[#0E1024]">{titulo}</h2>
      <p className="mx-auto mt-1.5 max-w-sm text-sm leading-normal text-[#4A5068]">{texto}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2.5">{children}</div>
    </div>
  );
}

export default function MinisteriosPage() {
  const router = useRouter();
  const { toast } = useToast();
  const buscaRef = useRef<HTMLInputElement>(null);

  const [ministerios, setMinisterios] = useState<Ministerio[]>([]);
  const [estado, setEstado] = useState<'carregando' | 'erro' | 'pronto'>('carregando');
  const [busca, setBusca] = useState('');
  const [excluir, setExcluir] = useState<Ministerio | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregar = useCallback(async () => {
    setEstado('carregando');
    try {
      // Lista completa: a busca é local, em tempo real e sem acentos
      const res = await fetch('/api/ministerios?limit=1000');
      if (!res.ok) throw new Error();
      const data: { ministerios: Ministerio[] } = await res.json();
      setMinisterios(
        [...data.ministerios].sort((a, b) => a.nome.trim().localeCompare(b.nome.trim(), 'pt-BR'))
      );
      setEstado('pronto');
    } catch {
      setEstado('erro');
    }
  }, []);

  useEffect(() => {
    checkAuth().then(({ user }) => {
      if (!user) {
        router.push('/');
        return;
      }
      carregar();
    });
  }, [router, carregar]);

  const termo = normalizar(busca);
  const filtrados = useMemo(
    () =>
      termo
        ? ministerios.filter((m) =>
            [m.nome, m.lider?.name, m.coLider?.name].some((t) => t && normalizar(t).includes(termo))
          )
        : ministerios,
    [ministerios, termo]
  );

  const total = ministerios.length;
  const contagem = termo
    ? `${filtrados.length} de ${total} ${total === 1 ? 'ministério' : 'ministérios'}`
    : `${total} ${total === 1 ? 'ministério' : 'ministérios'}`;

  const limparBusca = () => {
    setBusca('');
    buscaRef.current?.focus();
  };

  const confirmarExclusao = async () => {
    if (!excluir) return;
    setExcluindo(true);
    try {
      const res = await fetch(`/api/ministerios/${excluir.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setMinisterios((atuais) => atuais.filter((m) => m.id !== excluir.id));
      toast({ title: 'Ministério excluído' });
      setExcluir(null);
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível excluir o ministério', variant: 'destructive' });
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <div className="mt-[72px] min-h-[calc(100dvh-72px)] bg-[#F5F6FA]">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 pb-6 pt-5">
        {/* Título + Novo */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-[26px] font-bold leading-tight text-[#0E1024]">Ministérios</h1>
            {estado === 'pronto' && (
              <p aria-live="polite" className="mt-0.5 text-sm text-[#4A5068]">{contagem}</p>
            )}
          </div>
          <Link href="/dashboard/ministerios/new" className={BOTAO_PRIMARIO}>
            <Plus aria-hidden="true" className="h-5 w-5" />
            Novo
          </Link>
        </div>

        {/* Busca */}
        <div className="relative">
          <label htmlFor="busca-ministerio" className="sr-only">Buscar ministério</label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#4A5068]" />
          <input
            ref={buscaRef}
            id="busca-ministerio"
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou líder"
            autoComplete="off"
            className="h-12 w-full rounded-xl border-[1.5px] border-[#D5D8E6] bg-white pl-11 pr-12 text-base text-[#0E1024] placeholder:text-[#6B7280] focus:border-onda-blue focus:outline-none focus:ring-2 focus:ring-onda-blue/20 [&::-webkit-search-cancel-button]:hidden"
          />
          {busca && (
            <button
              type="button"
              onClick={limparBusca}
              aria-label="Limpar busca"
              className="absolute right-0.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-[#4A5068] hover:bg-[#F3F4F8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue/40"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Lista e estados */}
        {estado === 'carregando' ? (
          <div className="overflow-hidden rounded-2xl border border-[#ECEDF3] bg-white" aria-busy="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex min-h-[72px] items-center gap-3 border-b border-[#ECEDF3] px-4 last:border-b-0">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3.5 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : estado === 'erro' ? (
          <EstadoVazio
            icone={<AlertCircle aria-hidden="true" className="mx-auto mb-3 h-10 w-10 text-[#4A5068]" />}
            titulo="Não foi possível carregar os ministérios."
            texto="Verifique sua conexão e tente de novo."
          >
            <button type="button" onClick={carregar} className={BOTAO_PRIMARIO}>Tentar de novo</button>
          </EstadoVazio>
        ) : total === 0 ? (
          <EstadoVazio titulo="Nenhum ministério ainda" texto="Crie o primeiro para organizar líderes e membros.">
            <Link href="/dashboard/ministerios/new" className={BOTAO_PRIMARIO}>
              <Plus aria-hidden="true" className="h-5 w-5" />
              Novo ministério
            </Link>
          </EstadoVazio>
        ) : filtrados.length === 0 ? (
          <EstadoVazio
            icone={<Search aria-hidden="true" className="mx-auto mb-3 h-10 w-10 text-[#4A5068]" />}
            titulo="Nenhum ministério encontrado"
            texto={`Nada com “${busca.trim()}” no nome ou no líder. Confira a grafia ou crie um novo ministério.`}
          >
            <button type="button" onClick={limparBusca} className={BOTAO_SECUNDARIO}>Limpar busca</button>
            <Link href="/dashboard/ministerios/new" className={BOTAO_PRIMARIO}>
              <Plus aria-hidden="true" className="h-5 w-5" />
              Novo ministério
            </Link>
          </EstadoVazio>
        ) : (
          <ul aria-label="Lista de ministérios" className="overflow-hidden rounded-2xl border border-[#ECEDF3] bg-white">
            {filtrados.map((m) => {
              const lideres = nomesLideres(m);
              return (
                <li key={m.id} className="flex min-h-[72px] items-center border-b border-[#ECEDF3] pr-2 last:border-b-0">
                  <Link
                    href={`/dashboard/ministerios/${m.id}/edit`}
                    className="flex min-h-[72px] min-w-0 flex-1 items-center gap-3 py-3 pl-4 pr-2 transition-colors hover:bg-[#F8F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-onda-blue/40"
                  >
                    <IconeMinisterio ministerio={m} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-base font-bold text-[#0E1024]">{m.nome.trim()}</span>
                      <span className="block truncate text-sm text-[#4A5068]">{lideres}</span>
                    </span>
                  </Link>
                  <MinisterioAcoes
                    nome={m.nome.trim()}
                    lideres={lideres}
                    identidade={<IconeMinisterio ministerio={m} />}
                    acoes={[
                      {
                        key: 'editar',
                        titulo: 'Editar ministério',
                        descricao: 'Nome, líder, co-líder e membros',
                        icon: ICONES_ACOES.editar,
                        onSelect: () => router.push(`/dashboard/ministerios/${m.id}/edit`),
                      },
                      {
                        key: 'campos',
                        titulo: 'Campos do chamado',
                        descricao: 'Perguntas do formulário de chamado',
                        icon: ICONES_ACOES.campos,
                        onSelect: () => router.push(`/dashboard/ministerios/${m.id}/campos`),
                      },
                      {
                        key: 'paginas',
                        titulo: 'Páginas do menu',
                        descricao: 'O que os membros veem no menu',
                        icon: ICONES_ACOES.paginas,
                        onSelect: () => router.push(`/dashboard/ministerios/${m.id}/paginas`),
                      },
                      {
                        key: 'excluir',
                        titulo: 'Excluir ministério',
                        descricao: 'Remove o ministério e seus vínculos',
                        icon: ICONES_ACOES.excluir,
                        perigo: true,
                        onSelect: () => setExcluir(m),
                      },
                    ]}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <AlertDialog open={!!excluir} onOpenChange={(open) => !open && setExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir ministério?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{excluir?.nome.trim()}&quot; será removido. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={excluindo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmarExclusao();
              }}
              disabled={excluindo}
              className="bg-red-600 hover:bg-red-700"
            >
              {excluindo ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
