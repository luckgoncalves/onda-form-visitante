'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ExternalLink, LogOut, MoreHorizontal, MoreVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { resolverVisualMinisterio } from '@/config/ministerio-visual';
import { getEntradaMinisterio } from '@/config/navigation';
import { BOTAO_SECUNDARIO, CARD, ROTULO_GRUPO, plural } from '@/components/perfil/perfil-ui';
import { PerfilMinisterio, sairDoMinisterio } from '../actions';
import { usePerfil } from '../perfil-context';

/** Página de entrada do ministério: href e se é externa (ex.: Grupos) */
function entrada(m: PerfilMinisterio) {
  const item = getEntradaMinisterio(m);
  return {
    href: item?.href ?? item?.externalHref ?? null,
    externa: !item?.href && !!item?.externalHref,
  };
}

const PAPEL_LABEL = { lider: 'Líder', colider: 'Co-líder', membro: 'Membro' } as const;

function ChipPapel({ papel }: { papel: PerfilMinisterio['papel'] }) {
  const lideranca = papel !== 'membro';
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-semibold',
        lideranca ? 'bg-onda-blue text-white' : 'bg-[#F0F1F6] text-[#4A5068]'
      )}
    >
      {PAPEL_LABEL[papel]}
    </span>
  );
}

function subtitulo(m: PerfilMinisterio) {
  if (m.papel === 'lider') return 'Você lidera este ministério';
  return m.liderNome ? `Líder: ${m.liderNome}` : 'Sem líder definido';
}

function IconeMinisterio({ m, tamanho }: { m: PerfilMinisterio; tamanho: 44 | 48 }) {
  const { icon: Icon, color } = resolverVisualMinisterio(m.icone, m.cor);
  return (
    <span
      aria-hidden="true"
      className={cn('flex shrink-0 items-center justify-center', tamanho === 48 ? 'h-12 w-12 rounded-[14px]' : 'h-11 w-11 rounded-xl')}
      style={{ backgroundColor: color.bg, color: color.fg }}
    >
      <Icon className="h-[22px] w-[22px]" />
    </span>
  );
}

/** Link para a página de entrada do ministério (interna ou externa) */
function LinkMinisterio({ m, className, children }: { m: PerfilMinisterio; className?: string; children: React.ReactNode }) {
  const { href, externa } = entrada(m);
  if (!href) return <div className={className}>{children}</div>;
  if (externa) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export default function MinisteriosPerfilPage() {
  const { toast } = useToast();
  const { perfil, recarregar } = usePerfil();
  const [sair, setSair] = useState<PerfilMinisterio | null>(null);
  const [saindo, setSaindo] = useState(false);

  if (!perfil) return null;
  const ministerios = perfil.ministerios;
  const n = ministerios.length;

  const confirmarSaida = async () => {
    if (!sair) return;
    setSaindo(true);
    try {
      const res = await sairDoMinisterio(sair.id);
      if (!res.ok) throw new Error(res.erro);
      toast({ title: `Você saiu de ${sair.nome}` });
      setSair(null);
      await recarregar();
    } catch (e) {
      toast({ title: 'Erro', description: e instanceof Error ? e.message : 'Não foi possível sair do ministério.', variant: 'destructive' });
    } finally {
      setSaindo(false);
    }
  };

  const menu = (m: PerfilMinisterio, vertical: boolean) => {
    const { href, externa } = entrada(m);
    return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Mais opções de ${m.nome}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#4A5068] hover:bg-[#F5F6FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue/40"
        >
          {vertical ? <MoreVertical aria-hidden="true" className="h-5 w-5" /> : <MoreHorizontal aria-hidden="true" className="h-5 w-5" />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[232px] rounded-[14px] p-1.5 shadow-lg">
        {href && (
          <DropdownMenuItem asChild className="min-h-11 cursor-pointer gap-2.5 rounded-lg px-3 text-[15px]">
            {externa ? (
              <a href={href} target="_blank" rel="noopener noreferrer">
                <ExternalLink aria-hidden="true" className="h-4 w-4" />
                Abrir página do ministério
              </a>
            ) : (
              <Link href={href}>
                <ExternalLink aria-hidden="true" className="h-4 w-4" />
                Abrir página do ministério
              </Link>
            )}
          </DropdownMenuItem>
        )}
        {m.podeSair && (
          <>
            {href && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onSelect={() => setSair(m)}
              className="min-h-11 cursor-pointer gap-2.5 rounded-lg px-3 text-[15px] text-[#B42318] focus:bg-[#FEF3F2] focus:text-[#B42318]"
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
              Sair do ministério…
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
    );
  };

  const temMenu = (m: PerfilMinisterio) => !!entrada(m).href || m.podeSair;
  const textoInclusao = 'A inclusão em um ministério é feita pela liderança.';

  return (
    <>
      {/* ── Celular/tablet ── */}
      <div className="lg:hidden">
        <h2 className={cn(ROTULO_GRUPO, 'mb-3')}>Você participa de {n}</h2>
        {n === 0 ? (
          <div className={cn(CARD, 'rounded-[18px] px-5 py-8 text-center text-sm text-[#4A5068]')}>
            Você ainda não participa de nenhum ministério. {textoInclusao}
          </div>
        ) : (
          <>
            <ul className={cn(CARD, 'overflow-hidden rounded-[18px]')}>
              {ministerios.map((m) => (
                <li key={m.id} className="flex min-h-[76px] items-center border-b border-[#ECEDF3] pr-1.5 last:border-b-0">
                  <LinkMinisterio
                    m={m}
                    className="flex min-h-[76px] min-w-0 flex-1 items-center gap-3 py-3 pl-4 pr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-onda-blue/40"
                  >
                    <IconeMinisterio m={m} tamanho={44} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-base font-bold text-[#0E1024]">{m.nome}</span>
                        <ChipPapel papel={m.papel} />
                      </span>
                      <span className="block truncate text-sm text-[#5B6478]">{subtitulo(m)}</span>
                    </span>
                  </LinkMinisterio>
                  {temMenu(m) && menu(m, true)}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-center text-[13px] text-[#5B6478]">
              Toque em um ministério para abrir a página dele. {textoInclusao}
            </p>
          </>
        )}
      </div>

      {/* ── Desktop ── */}
      <section aria-labelledby="meus-ministerios-titulo" className={cn(CARD, 'hidden overflow-hidden lg:block')}>
        <div className="border-b border-[#ECEDF3] px-7 py-5">
          <h2 id="meus-ministerios-titulo" className="text-[19px] font-bold text-[#0E1024]">Meus ministérios</h2>
          <p className="mt-0.5 text-sm text-[#5B6478]">
            {n === 0
              ? `Você ainda não participa de nenhum ministério. ${textoInclusao}`
              : `Você participa de ${plural(n, 'ministério', 'ministérios')}. ${textoInclusao}`}
          </p>
        </div>
        {n > 0 && (
          <ul>
            {ministerios.map((m) => (
              <li key={m.id} className="flex items-center gap-4 border-b border-[#ECEDF3] px-7 py-[18px] last:border-b-0">
                <IconeMinisterio m={m} tamanho={48} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-base font-bold text-[#0E1024]">{m.nome}</span>
                    <ChipPapel papel={m.papel} />
                  </div>
                  <p className="truncate text-sm text-[#5B6478]">{subtitulo(m)}</p>
                </div>
                {entrada(m).href && (
                  <LinkMinisterio m={m} className={cn(BOTAO_SECUNDARIO, 'h-11 shrink-0')}>
                    Abrir
                    <ChevronRight aria-hidden="true" className="h-4 w-4" />
                  </LinkMinisterio>
                )}
                {temMenu(m) && menu(m, false)}
              </li>
            ))}
          </ul>
        )}
      </section>

      <AlertDialog open={!!sair} onOpenChange={(open) => !open && setSair(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair de {sair?.nome}?</AlertDialogTitle>
            <AlertDialogDescription>
              As páginas desse ministério deixam de aparecer no seu menu. Para voltar, a liderança precisa incluir você de novo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saindo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={saindo}
              className="bg-[#B42318] hover:bg-[#B42318]/90"
              onClick={(e) => {
                e.preventDefault();
                confirmarSaida();
              }}
            >
              {saindo ? 'Saindo…' : 'Sair do ministério'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
