'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronRight, LayoutList, ListChecks, MoreHorizontal, Pencil, Trash2, X } from 'lucide-react';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export type AcaoMinisterio = {
  key: string;
  titulo: string;
  descricao: string;
  icon: typeof Pencil;
  perigo?: boolean;
  onSelect: () => void;
};

type Props = {
  nome: string;
  lideres: string;
  identidade: React.ReactNode; // ícone do ministério já com as cores
  acoes: AcaoMinisterio[];
};

export const ICONES_ACOES = { editar: Pencil, campos: ListChecks, paginas: LayoutList, excluir: Trash2 };

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return isDesktop;
}

/** Botão ⋯ com as ações do ministério: folha inferior no celular, menu suspenso no desktop. */
export function MinisterioAcoes({ nome, lideres, identidade, acoes }: Props) {
  const isDesktop = useIsDesktop();
  const [aberta, setAberta] = useState(false);
  const botaoRef = useRef<HTMLButtonElement>(null);

  const botao = (
    <button
      ref={botaoRef}
      type="button"
      aria-label={`Mais ações de ${nome}`}
      aria-haspopup={isDesktop ? 'menu' : 'dialog'}
      onClick={isDesktop ? undefined : () => setAberta(true)}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#4A5068] transition-colors hover:bg-[#F3F4F8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue/40"
    >
      <MoreHorizontal aria-hidden="true" className="h-5 w-5" />
    </button>
  );

  if (isDesktop) {
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>{botao}</DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72 rounded-xl p-1.5">
          {acoes.map((acao, i) => {
            const Icon = acao.icon;
            return (
              <div key={acao.key}>
                {acao.perigo && i > 0 && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  onSelect={acao.onSelect}
                  className={cn('flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5', acao.perigo && 'text-red-700 focus:text-red-700')}
                >
                  <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>
                    <span className="block text-[15px] font-semibold">{acao.titulo}</span>
                    <span className="block text-[13px] text-[#4A5068]">{acao.descricao}</span>
                  </span>
                </DropdownMenuItem>
              </div>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      {botao}
      {/* noBodyStyles: evita o scroll da página ao fechar a folha e navegar (Safari/iOS) */}
      <Drawer open={aberta} onOpenChange={setAberta} noBodyStyles>
        <DrawerContent
          hideCloseButton
          overlayClassName="bg-[rgba(12,14,40,0.55)]"
          className="gap-0 rounded-t-[22px] border-0 p-0 pb-[calc(32px+env(safe-area-inset-bottom))]"
          onCloseAutoFocus={(e) => {
            // Devolve o foco ao ⋯ que abriu a folha
            e.preventDefault();
            botaoRef.current?.focus();
          }}
        >
          <div aria-hidden="true" className="mx-auto mt-3 h-1 w-10 rounded-full bg-[#D5D8E6]" />

          <div className="flex items-center gap-3 px-5 pb-3 pt-4">
            {identidade}
            <div className="min-w-0 flex-1">
              <DrawerTitle className="truncate text-lg font-bold text-[#0E1024]">{nome}</DrawerTitle>
              <DrawerDescription className="truncate text-sm text-[#4A5068]">{lideres}</DrawerDescription>
            </div>
            <DrawerClose asChild>
              <button
                type="button"
                aria-label="Fechar"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#4A5068] transition-colors hover:bg-[#F3F4F8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue/40"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </DrawerClose>
          </div>

          <ul className="px-3">
            {acoes.map((acao) => {
              const Icon = acao.icon;
              return (
                <li key={acao.key} className={cn(acao.perigo && 'mt-1 border-t border-[#ECEDF3] pt-1')}>
                  <button
                    type="button"
                    onClick={() => {
                      setAberta(false);
                      acao.onSelect();
                    }}
                    className={cn(
                      'flex min-h-[60px] w-full items-center gap-3.5 rounded-xl px-3 text-left transition-colors hover:bg-[#F3F4F8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue/40',
                      acao.perigo ? 'text-red-700' : 'text-[#0E1024]'
                    )}
                  >
                    <Icon aria-hidden="true" className="h-[22px] w-[22px] shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-semibold">{acao.titulo}</span>
                      <span className="block text-[13px] text-[#4A5068]">{acao.descricao}</span>
                    </span>
                    {!acao.perigo && <ChevronRight aria-hidden="true" className="h-5 w-5 shrink-0 text-[#4A5068]" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </DrawerContent>
      </Drawer>
    </>
  );
}
