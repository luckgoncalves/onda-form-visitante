'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronDown, ChevronRight, Handshake, User } from 'lucide-react';
import { checkAuth } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { MINISTERIO_CORES, MINISTERIO_COR_KEYS, resolverVisualMinisterio } from '@/config/ministerio-visual';
import { getEntradaMinisterio, MinisterioNav } from '@/config/navigation';

type EmpresaDestaque = { id: string; nomeNegocio: string; ramoAtuacao?: string; logoUrl?: string | null };
type MinisterioLideres = { id: string; nome: string; icone: string | null; cor: string | null; lideres: string[] };
type Faltando = 'phone' | 'photo' | 'company';
type Secao<T> = { estado: 'carregando' | 'erro' | 'pronto'; dados?: T };

const CARD = 'rounded-2xl border border-[#ECEDF3] bg-white';
const ROTULO = 'text-[13px] font-bold uppercase tracking-[0.06em] text-[#5B6478]';

const PASSOS = [
  { titulo: 'Procure o líder', texto: 'Na igreja ou pelo contato que você já tem.' },
  { titulo: 'Ele adiciona você', texto: 'O líder inclui você no ministério pelo app.' },
  { titulo: 'Tudo aparece aqui', texto: 'As páginas do ministério surgem no seu menu.' },
];

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase() || '?';
}

// Cor estável por empresa (sempre a mesma para o mesmo id)
function corDaEmpresa(id: string) {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return MINISTERIO_CORES[MINISTERIO_COR_KEYS[hash % MINISTERIO_COR_KEYS.length]];
}

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
  const [hub, setHub] = useState<Secao<{ total: number; empresas: EmpresaDestaque[] }>>({ estado: 'carregando' });
  const [lideres, setLideres] = useState<Secao<MinisterioLideres[]>>({ estado: 'carregando' });
  // null enquanto carrega; [] = sem ministério
  const [meusMinisterios, setMeusMinisterios] = useState<MinisterioNav[] | null>(null);
  const [faltando, setFaltando] = useState<Faltando[]>([]);

  const carregarHub = useCallback(async () => {
    setHub({ estado: 'carregando' });
    try {
      const res = await fetch('/api/empresas?page=1&limit=10');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setHub({ estado: 'pronto', dados: { total: data.pagination.total, empresas: data.empresas } });
    } catch {
      setHub({ estado: 'erro' });
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
    carregarHub();
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
  }, [router, carregarHub, carregarLideres]);

  const empresas = hub.dados?.empresas ?? [];
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

          {/* Card do ministério (horizontal no desktop) — só para quem não tem ministério */}
          {semMinisterio && (
          <section aria-labelledby="sem-ministerio-titulo" className={`${CARD} flex flex-col gap-[18px] p-5 lg:flex-row lg:gap-5`}>
            <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#E5F4FE] lg:h-14 lg:w-14">
              <Handshake className="h-6 w-6 text-onda-medBlue lg:h-7 lg:w-7" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-[18px]">
              <div>
                <h2 id="sem-ministerio-titulo" className="text-[19px] font-bold leading-snug text-[#0E1024]">
                  Você ainda não está em um ministério
                </h2>
                <p className="mt-1.5 text-[15px] leading-normal text-[#4A5068]">
                  Se você já serve na Onda, peça ao líder do seu ministério para adicionar você no app.
                </p>
              </div>
              <details className="group">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between rounded-xl bg-[#F5F6FA] px-4 text-[15px] font-bold text-onda-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue/40 [&::-webkit-details-marker]:hidden">
                  Como ser adicionado
                  <ChevronDown aria-hidden="true" className="h-5 w-5 transition-transform duration-200 group-open:rotate-180" />
                </summary>
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
              </details>
            </div>
          </section>
          )}

          {/* Destaques do Hub */}
          <section aria-labelledby="hub-titulo">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 id="hub-titulo" className="text-lg font-bold text-[#0E1024]">Destaques do Hub</h2>
                {hub.estado === 'pronto' && (
                  <p className="text-sm text-[#4A5068]">
                    {hub.dados!.total > 0
                      ? `${hub.dados!.total} ${hub.dados!.total === 1 ? 'empresa' : 'empresas'} da comunidade`
                      : 'Nenhuma empresa no Hub ainda'}
                  </p>
                )}
              </div>
              {hub.estado === 'pronto' && hub.dados!.total > 0 && (
                <Link
                  href="/empresas"
                  className="inline-flex min-h-11 shrink-0 items-center gap-1 text-[15px] font-bold text-onda-blue"
                >
                  Ver todas <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              )}
            </div>

            {hub.estado === 'carregando' ? (
              <div className="-mx-4 flex gap-3 overflow-hidden px-4 md:mx-0 md:grid md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] md:px-0">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-[178px] w-[164px] shrink-0 rounded-2xl md:w-auto" />
                ))}
              </div>
            ) : hub.estado === 'erro' ? (
              <ErroSecao onRetry={carregarHub} />
            ) : empresas.length > 0 ? (
              <ul
                aria-label="Empresas em destaque"
                className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:snap-none md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] md:overflow-visible md:px-0 md:pb-0"
              >
                {empresas.map((empresa, i) => {
                  const cor = corDaEmpresa(empresa.id);
                  return (
                    // Grade (tablet/desktop) mostra até 8; o carrossel do celular, até 10
                    <li key={empresa.id} className={cn('w-[164px] shrink-0 snap-start md:w-auto', i >= 8 && 'md:hidden')}>
                      <Link
                        href={`/empresas?busca=${encodeURIComponent(empresa.nomeNegocio)}`}
                        className={`${CARD} flex h-full flex-col p-3.5 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue/40`}
                      >
                        {empresa.logoUrl ? (
                          <img
                            src={empresa.logoUrl}
                            alt=""
                            className="h-[84px] w-full rounded-xl bg-[#F5F6FA] object-contain"
                          />
                        ) : (
                          <span
                            aria-hidden="true"
                            className="flex h-[84px] w-full items-center justify-center rounded-xl text-2xl font-bold"
                            style={{ backgroundColor: cor.bg, color: cor.fg }}
                          >
                            {iniciais(empresa.nomeNegocio)}
                          </span>
                        )}
                        <span className="mt-2.5 line-clamp-2 text-[15px] font-bold leading-snug text-[#0E1024]">
                          {empresa.nomeNegocio}
                        </span>
                        {empresa.ramoAtuacao && (
                          <span className="mt-0.5 truncate text-[13px] text-[#4A5068]">{empresa.ramoAtuacao}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
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
                href={`/users/${userId}`}
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
