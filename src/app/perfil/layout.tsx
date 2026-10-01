'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, Building2, CalendarDays, Church, MapPin, User } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { AvatarPerfil, CARD, ChipNeutro, formatarMembroDesde } from '@/components/perfil/perfil-ui';
import { PerfilProvider, usePerfil } from './perfil-context';

const SECOES = [
  { href: '/perfil', label: 'Dados pessoais', labelCurto: 'Dados', icon: User },
  { href: '/perfil/ministerios', label: 'Ministérios', labelCurto: 'Ministérios', icon: Church },
  { href: '/perfil/empresas', label: 'Empresas', labelCurto: 'Empresas', icon: Building2 },
] as const;

function Badge({ valor, ativo }: { valor: number; ativo: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold',
        ativo ? 'bg-onda-blue text-white' : 'bg-[#F0F1F6] text-[#4A5068]'
      )}
    >
      {valor}
    </span>
  );
}

function PerfilShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { perfil, erro, recarregar, temAlteracoes, setTemAlteracoes, abrirSeletorFoto, enviandoFoto } = usePerfil();
  const [destinoPendente, setDestinoPendente] = useState<string | null>(null);

  const contagem = (href: string) =>
    href === '/perfil/ministerios' ? perfil?.ministerios.length ?? 0 : href === '/perfil/empresas' ? perfil?.empresas.length ?? 0 : null;

  // Com alterações não salvas, pergunta antes de trocar de seção
  const navegar = (e: React.MouseEvent, href: string) => {
    if (href === pathname || !temAlteracoes) return;
    e.preventDefault();
    setDestinoPendente(href);
  };

  if (erro) {
    return (
      <div className="mt-[72px] flex min-h-[calc(100dvh-72px)] flex-col items-center justify-center gap-4 bg-[#F5F6FA] px-4 text-center">
        <p className="text-[#4A5068]">Não foi possível carregar seu perfil.</p>
        <button
          type="button"
          onClick={() => recarregar()}
          className="h-11 rounded-xl border-[1.5px] border-onda-blue px-4 font-semibold text-onda-blue"
        >
          Tentar de novo
        </button>
      </div>
    );
  }

  const membroDesde = formatarMembroDesde(perfil?.dataMembresia);
  const nMinisterios = perfil?.ministerios.length ?? 0;
  const nEmpresas = perfil?.empresas.length ?? 0;

  return (
    <div className="mt-[72px] min-h-[calc(100dvh-72px)] bg-[#F5F6FA]">
      {/* ── Celular/tablet: barra da página, identidade e abas ── */}
      <div className="border-b border-[#ECEDF3] bg-white lg:hidden">
        <div className="flex h-14 items-center gap-1 px-2">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Voltar"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-[#0E1024] hover:bg-[#F5F6FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue/40"
          >
            <ArrowLeft aria-hidden="true" className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold text-[#0E1024]">Meu perfil</h1>
        </div>

        <div className="flex items-center gap-4 px-4 pb-4">
          {perfil ? (
            <AvatarPerfil
              nome={perfil.name}
              url={perfil.profileImageUrl}
              tamanho={76}
              tamanhoCamera={34}
              onCamera={abrirSeletorFoto}
              carregando={enviandoFoto}
            />
          ) : (
            <Skeleton className="h-[76px] w-[76px] rounded-full" />
          )}
          <div className="min-w-0 flex-1">
            {perfil ? (
              <>
                <p className="truncate text-xl font-bold text-[#0E1024]">{perfil.name}</p>
                <p className="truncate text-sm text-[#5B6478]">{perfil.email}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {perfil.cidade && <ChipNeutro className="text-xs">{perfil.cidade}</ChipNeutro>}
                  {membroDesde && <ChipNeutro className="text-xs">Desde {membroDesde}</ChipNeutro>}
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-52" />
              </div>
            )}
          </div>
        </div>

        <nav aria-label="Seções do perfil" className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-1 rounded-[14px] bg-[#EEF0F5] p-1">
            {SECOES.map((s) => {
              const ativo = pathname === s.href;
              const n = contagem(s.href);
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  onClick={(e) => navegar(e, s.href)}
                  aria-current={ativo ? 'page' : undefined}
                  className={cn(
                    'flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-[10px] px-1 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue/40',
                    ativo ? 'bg-white text-onda-blue shadow-sm' : 'text-[#4A5068]'
                  )}
                >
                  <span className="truncate">{s.labelCurto}</span>
                  {n !== null && <Badge valor={n} ativo={ativo} />}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* ── Desktop: título + card lateral + conteúdo ── */}
      <div className="lg:px-8 lg:pb-16 lg:pt-8">
        <div className="mb-6 hidden lg:block">
          <h1 className="text-[30px] font-bold leading-tight text-[#0E1024]">Meu perfil</h1>
          <p className="mt-1 text-[15px] text-[#5B6478]">Seus dados, ministérios e empresas em um só lugar.</p>
        </div>

        <div className="lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start lg:gap-6">
          <aside className={cn(CARD, 'hidden overflow-hidden lg:block')}>
            <div className="h-[88px] bg-onda-blue" />
            <div className="px-6 pb-6">
              {perfil ? (
                <AvatarPerfil
                  nome={perfil.name}
                  url={perfil.profileImageUrl}
                  tamanho={104}
                  onCamera={abrirSeletorFoto}
                  carregando={enviandoFoto}
                  className="-mt-[52px] rounded-full border-4 border-white bg-white"
                />
              ) : (
                <Skeleton className="-mt-[52px] h-[104px] w-[104px] rounded-full border-4 border-white" />
              )}

              {perfil ? (
                <>
                  <p className="mt-3 text-xl font-bold text-[#0E1024]">{perfil.name}</p>
                  <p className="break-all text-sm text-[#5B6478]">{perfil.email}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {perfil.cidade && (
                      <ChipNeutro>
                        <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                        {perfil.cidade}
                      </ChipNeutro>
                    )}
                    {membroDesde && (
                      <ChipNeutro>
                        <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
                        Membro desde {membroDesde}
                      </ChipNeutro>
                    )}
                  </div>

                  {/* Resumo */}
                  <dl className="mt-5 grid grid-cols-3 divide-x divide-[#ECEDF3] border-y border-[#ECEDF3] py-3 text-center">
                    <div className="flex flex-col-reverse px-1">
                      <dt className="text-xs text-[#5B6478]">{nMinisterios === 1 ? 'Ministério' : 'Ministérios'}</dt>
                      <dd className="text-xl font-bold text-onda-blue">{nMinisterios}</dd>
                    </div>
                    <div className="flex flex-col-reverse px-1">
                      <dt className="text-xs text-[#5B6478]">{nEmpresas === 1 ? 'Empresa' : 'Empresas'}</dt>
                      <dd className="text-xl font-bold text-onda-blue">{nEmpresas}</dd>
                    </div>
                    <div className="flex min-w-0 flex-col-reverse px-1">
                      <dt className="text-xs text-[#5B6478]">Papel</dt>
                      <dd className="truncate text-base font-bold leading-[1.75rem] text-onda-blue">{perfil.papelApp}</dd>
                    </div>
                  </dl>
                </>
              ) : (
                <div className="mt-3 space-y-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-52" />
                  <Skeleton className="mt-4 h-16 w-full" />
                </div>
              )}

              <nav aria-label="Seções do perfil" className="mt-4 flex flex-col gap-1">
                {SECOES.map((s) => {
                  const ativo = pathname === s.href;
                  const n = contagem(s.href);
                  const Icon = s.icon;
                  return (
                    <Link
                      key={s.href}
                      href={s.href}
                      onClick={(e) => navegar(e, s.href)}
                      aria-current={ativo ? 'page' : undefined}
                      className={cn(
                        'flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue/40',
                        ativo ? 'bg-[#E8E9F4] font-semibold text-onda-blue' : 'font-medium text-[#0E1024] hover:bg-[#F5F6FA]'
                      )}
                    >
                      <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
                      <span className="flex-1">{s.label}</span>
                      {n !== null && <Badge valor={n} ativo={ativo} />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          <main className="min-w-0 px-4 py-5 lg:p-0">
            {perfil ? children : <Skeleton className="h-96 w-full rounded-[20px]" />}
          </main>
        </div>
      </div>

      <AlertDialog open={!!destinoPendente} onOpenChange={(open) => !open && setDestinoPendente(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
            <AlertDialogDescription>
              Você alterou seus dados pessoais e ainda não salvou. Se sair agora, as alterações serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar editando</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                const destino = destinoPendente!;
                setDestinoPendente(null);
                setTemAlteracoes(false);
                router.push(destino);
              }}
            >
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function PerfilLayout({ children }: { children: React.ReactNode }) {
  return (
    <PerfilProvider>
      <PerfilShell>{children}</PerfilShell>
    </PerfilProvider>
  );
}
