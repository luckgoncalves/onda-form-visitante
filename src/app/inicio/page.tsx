'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronDown, ChevronRight, Handshake, LayoutGrid, User } from 'lucide-react';
import { checkAuth } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { resolverVisualMinisterio } from '@/config/ministerio-visual';
import { getEntradaMinisterio, MinisterioNav } from '@/config/navigation';

type MinisterioLideres = { id: string; nome: string; icone: string | null; cor: string | null; lideres: string[] };
type Faltando = 'phone' | 'photo' | 'company';
type CategoriaHub = { id: string; nome: string; total: number };
type ResumoCategorias = { totalEmpresas: number; categorias: CategoriaHub[] };
type Secao<T> = { estado: 'carregando' | 'erro' | 'pronto'; dados?: T };

const CARD = 'rounded-2xl border border-[#ECEDF3] bg-white';
// Celular: 2 colunas · tablet/desktop: colunas automáticas (mín. 200px)
const GRADE_CATEGORIAS = 'grid grid-cols-2 gap-[10px] md:[grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]';

function plural(n: number, singular: string, pluralTexto: string) {
  return `${n} ${n === 1 ? singular : pluralTexto}`;
}

const ROTULO = 'text-[13px] font-bold uppercase tracking-[0.06em] text-[#5B6478]';

const PASSOS = [
  { titulo: 'Procure o líder', texto: 'Na igreja ou pelo contato que você já tem.' },
  { titulo: 'Ele adiciona você', texto: 'O líder inclui você no ministério pelo app.' },
  { titulo: 'Tudo aparece aqui', texto: 'As páginas do ministério surgem no seu menu.' },
];

function textoPerfil(faltando: Faltando[]) {
  // Um item só: "Adicione sua foto." · Vários: "Adicione telefone, foto e sua empresa."
  const sozinho = { phone: 'seu telefone', photo: 'sua foto', company: 'sua empresa' } as const;
  const lista = { phone: 'telefone', photo: 'foto', company: 'sua empresa' } as const;
  if (faltando.length === 1) return `Adicione ${sozinho[faltando[0]]}.`;
  const itens = faltando.map((f) => lista[f]);
  return `Adicione ${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}.`;
}

function ErroSecao({ onRetry }: { onRetry: () => void }) {
  return (
    <div className={`${CARD} flex flex-col items-center gap-3 px-5 py-6 text-center`}>
      <p className="text-sm text-[#4A5068]">Não foi possível carregar.</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex h-11 items-center rounded-xl border-[1.5px] border-onda-blue px-4 text-[15px] font-semibold text-onda-blue hover:bg-onda-blue/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue"
      >
        Tentar de novo
      </button>
    </div>
  );
}

export default function InicioPage() {
  const router = useRouter();
  const [primeiroNome, setPrimeiroNome] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [lideres, setLideres] = useState<Secao<MinisterioLideres[]>>({ estado: 'carregando' });
  const [categorias, setCategorias] = useState<Secao<ResumoCategorias>>({ estado: 'carregando' });
  // null enquanto carrega; [] = sem ministério
  const [meusMinisterios, setMeusMinisterios] = useState<MinisterioNav[] | null>(null);
  const [faltando, setFaltando] = useState<Faltando[]>([]);

  const carregarCategorias = useCallback(async () => {
    setCategorias({ estado: 'carregando' });
    try {
      const res = await fetch('/api/empresas/categorias');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCategorias({ estado: 'pronto', dados: { totalEmpresas: data.totalEmpresas, categorias: data.categorias } });
    } catch {
      setCategorias({ estado: 'erro' });
    }
  }, []);

  const carregarLideres = useCallback(async () => {
    setLideres({ estado: 'carregando' });
    try {
      const res = await fetch('/api/inicio/lideres');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLideres({ estado: 'pronto', dados: data.ministerios });
    } catch {
      setLideres({ estado: 'erro' });
    }
  }, []);

  useEffect(() => {
    // Hub e perfil em paralelo com a checagem de acesso
    carregarCategorias();
    fetch('/api/inicio/perfil')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setFaltando(data.faltando))
      .catch(() => {});

    checkAuth().then(({ user }) => {
      if (!user) {
        router.replace('/');
        return;
      }
      setPrimeiroNome(user.name.trim().split(/\s+/)[0]);
      setUserId(user.id);
      setMeusMinisterios(user.ministeriosNav);
      // Líderes só para quem ainda não participa de um ministério
      if (!user.temMinisterio) carregarLideres();
    });
  }, [router, carregarCategorias, carregarLideres]);

  const semMinisterio = meusMinisterios !== null && meusMinisterios.length === 0;
  const comMinisterio = meusMinisterios !== null && meusMinisterios.length > 0;

  return (
    <div className="mt-[72px] min-h-[calc(100dvh-72px)] bg-[#F5F6FA]">
      {/* Topo: continuação azul do header */}
      <div className="bg-onda-blue">
        <div className="px-4 pb-7 pt-2 md:px-6">
          <h1 className="text-[28px] font-bold leading-tight text-white lg:text-[32px]">
            {primeiroNome ? `Olá, ${primeiroNome}!` : <span className="invisible">Olá!</span>}
          </h1>
          <p className="mt-1 text-base text-[#D6DAF0]">
            Que bom ter você na Onda.{semMinisterio && ' Sua conta está ativa.'}
          </p>
        </div>
      </div>

      {/* Celular/tablet: uma coluna · Desktop (≥1024px): principal 2/3 + lateral 1/3 (mín. 300px) */}
      <div className="grid gap-6 px-4 pb-6 pt-4 md:px-6 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          {meusMinisterios === null && <Skeleton className="h-40 w-full rounded-2xl" />}

          {/* Seus ministérios: atalho para a página de entrada de cada ministério */}
          {comMinisterio && (
            <section aria-labelledby="meus-ministerios-titulo">
              <h2 id="meus-ministerios-titulo" className={`${ROTULO} mb-3`}>Seus ministérios</h2>
              <ul className={`${CARD} overflow-hidden`}>
                {meusMinisterios.map((m) => {
                  const { icon: Icon, color } = resolverVisualMinisterio(m.icone, m.cor);
                  const entrada = getEntradaMinisterio(m);
                  const conteudo = (
                    <>
                      <span
                        aria-hidden="true"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: color.bg, color: color.fg }}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-bold text-[#0E1024]">{m.nome}</span>
                        {!entrada && (
                          <span className="block truncate text-sm text-[#4A5068]">Nenhuma página liberada ainda</span>
                        )}
                      </span>
                    </>
                  );
                  const linha = 'flex min-h-16 items-center gap-3 px-4 py-3';
                  return (
                    <li key={m.id} className="border-b border-[#ECEDF3] last:border-b-0">
                      {entrada?.href ? (
                        <Link href={entrada.href} className={cn(linha, 'transition-colors hover:bg-[#F8F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-onda-blue/40')}>
                          {conteudo}
                          <ChevronRight aria-hidden="true" className="h-5 w-5 shrink-0 text-[#4A5068]" />
                        </Link>
                      ) : entrada?.externalHref ? (
                        <a href={entrada.externalHref} target="_blank" rel="noopener noreferrer" className={cn(linha, 'transition-colors hover:bg-[#F8F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-onda-blue/40')}>
                          {conteudo}
                          <ChevronRight aria-hidden="true" className="h-5 w-5 shrink-0 text-[#4A5068]" />
                        </a>
                      ) : (
                        <div className={linha}>{conteudo}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Card do ministério — compacto (uma linha); tocar expande o texto e os passos */}
          {semMinisterio && (
            <details className={`${CARD} group`}>
              <summary className="flex min-h-[76px] cursor-pointer list-none items-center gap-3 rounded-2xl p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue/40 [&::-webkit-details-marker]:hidden">
                <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E5F4FE]">
                  <Handshake className="h-[22px] w-[22px] text-onda-medBlue" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-bold leading-snug text-[#0E1024]">
                    Você ainda não está em um ministério
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 text-sm font-bold text-onda-blue">
                    Como ser adicionado
                    <ChevronDown aria-hidden="true" className="h-4 w-4 transition-transform duration-200 group-open:rotate-180" />
                  </span>
                </span>
              </summary>
              <div className="border-t border-[#ECEDF3] px-4 pb-5 pt-4">
                <p className="text-[15px] leading-normal text-[#4A5068]">
                  Se você já serve na Onda, peça ao líder do seu ministério para adicionar você no app.
                </p>
                <ol className="mt-4 flex flex-col gap-4 px-1">
                  {PASSOS.map((passo, i) => (
                    <li key={passo.titulo} className="flex gap-3">
                      <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-onda-blue text-sm font-bold text-white">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-[15px] font-bold text-[#0E1024]">{passo.titulo}</p>
                        <p className="text-sm text-[#4A5068]">{passo.texto}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </details>
          )}

          {/* Empresas por categoria (Opção B): grade com as categorias que mais têm empresas */}
          <section aria-labelledby="categorias-titulo">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 id="categorias-titulo" className="text-lg font-bold text-[#0E1024]">Empresas por categoria</h2>
                {categorias.estado === 'pronto' && (
                  <p className="text-sm text-[#4A5068]">
                    {categorias.dados!.categorias.length > 0
                      ? `${plural(categorias.dados!.totalEmpresas, 'empresa', 'empresas')} · ${plural(categorias.dados!.categorias.length, 'categoria', 'categorias')}`
                      : 'Nenhuma empresa no Hub ainda'}
                  </p>
                )}
              </div>
              {categorias.estado === 'pronto' && categorias.dados!.categorias.length > 0 && (
                <Link
                  href="/empresas"
                  className="inline-flex min-h-11 shrink-0 items-center gap-1 text-[15px] font-bold text-onda-blue"
                >
                  Ver todas <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              )}
            </div>

            {categorias.estado === 'carregando' ? (
              <div className={GRADE_CATEGORIAS}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-[92px] rounded-2xl" />
                ))}
              </div>
            ) : categorias.estado === 'erro' ? (
              <ErroSecao onRetry={carregarCategorias} />
            ) : categorias.dados!.categorias.length > 0 ? (
              <ul aria-label="Categorias de empresas" className={GRADE_CATEGORIAS}>
                {categorias.dados!.categorias.slice(0, 8).map((c, i) => (
                  // Celular: as 5 maiores · tablet/desktop: até 8
                  <li key={c.id} className={cn(i >= 5 && 'hidden md:block')}>
                    <Link
                      href={`/empresas?categoria=${c.id}`}
                      aria-label={`${c.nome}, ${plural(c.total, 'empresa', 'empresas')}`}
                      className="flex h-full min-h-[92px] flex-col justify-between gap-2 rounded-2xl border border-[#ECEDF3] bg-white p-3.5 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue/40"
                    >
                      <span className="line-clamp-2 text-[15px] font-bold leading-snug text-[#0E1024]">{c.nome}</span>
                      <span aria-hidden="true" className="flex items-baseline gap-1">
                        <span className="text-[22px] font-bold leading-none text-onda-blue">{c.total}</span>
                        <span className="text-[13px] text-[#4A5068]">{c.total === 1 ? 'empresa' : 'empresas'}</span>
                      </span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/empresas/categorias"
                    className="flex h-full min-h-[92px] flex-col justify-between gap-2 rounded-2xl bg-onda-blue p-3.5 text-white transition-colors hover:bg-onda-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue focus-visible:ring-offset-2"
                  >
                    <LayoutGrid aria-hidden="true" className="h-[22px] w-[22px]" />
                    <span className="text-[15px] font-bold leading-snug">Ver todas as categorias</span>
                  </Link>
                </li>
              </ul>
            ) : null}
          </section>
        </div>

        <div className="flex min-w-0 flex-col gap-6">

          {/* Líderes dos ministérios — só para quem não tem ministério */}
          {semMinisterio && !(lideres.estado === 'pronto' && lideres.dados!.length === 0) && (
            <section aria-labelledby="lideres-titulo">
              <h2 id="lideres-titulo" className={`${ROTULO} mb-3`}>Líderes dos ministérios</h2>
              {lideres.estado === 'carregando' ? (
                <div className={`${CARD} overflow-hidden`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex min-h-16 items-center gap-3 border-b border-[#ECEDF3] px-4 last:border-b-0">
                      <Skeleton className="h-10 w-10 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3.5 w-44" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : lideres.estado === 'erro' ? (
                <ErroSecao onRetry={carregarLideres} />
              ) : (
                <ul className={`${CARD} overflow-hidden`}>
                  {lideres.dados!.map((m) => {
                    const { icon: Icon, color } = resolverVisualMinisterio(m.icone, m.cor);
                    return (
                      <li key={m.id} className="flex min-h-16 items-center gap-3 border-b border-[#ECEDF3] px-4 py-3 last:border-b-0">
                        <span
                          aria-hidden="true"
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                          style={{ backgroundColor: color.bg, color: color.fg }}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[15px] font-bold text-[#0E1024]">{m.nome}</p>
                          <p className="truncate text-sm text-[#4A5068]">
                            {m.lideres.length ? `Líder: ${m.lideres.join(', ')}` : 'Sem líder definido'}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )}

          {/* Complete seu perfil — no desktop fica acima dos líderes (lg:order-first) */}
          {faltando.length > 0 && userId && (
            <section aria-labelledby="perfil-titulo" className="lg:order-first">
              <Link
                href="/perfil"
                className={`${CARD} flex items-center gap-3 p-4 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue/40`}
              >
                <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F3F4F8]">
                  <User className="h-5 w-5 text-[#4A5068]" />
                </span>
                <span className="min-w-0 flex-1">
                  <h2 id="perfil-titulo" className="text-[15px] font-bold text-[#0E1024]">Complete seu perfil</h2>
                  <span className="block text-sm text-[#4A5068]">{textoPerfil(faltando)}</span>
                </span>
                <ChevronRight aria-hidden="true" className="h-5 w-5 shrink-0 text-[#4A5068]" />
              </Link>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
