'use client';

import { Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

// Peças visuais compartilhadas pelas seções do "Meu perfil"

export const CARD = 'rounded-[20px] border border-[#E3E6EF] bg-white';
export const ROTULO_GRUPO = 'text-[13px] font-bold uppercase tracking-[0.06em] text-[#5B6478]';
export const INPUT =
  'h-12 w-full rounded-xl border border-[#D9DCE6] bg-white px-3.5 text-base text-[#0E1024] placeholder:text-[#6B7280] transition-shadow focus:border-onda-blue focus:outline-none focus:shadow-[0_0_0_3px_rgba(17,24,126,.15)] lg:text-[15px]';
export const INPUT_LEITURA = 'bg-[#F5F6FA] text-[#4A5068] focus:border-[#D9DCE6] focus:shadow-none';
export const BOTAO_PRIMARIO =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-onda-blue px-5 font-bold text-white transition-colors hover:bg-onda-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';
export const BOTAO_SECUNDARIO =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-[#D9DCE6] bg-white px-4 font-semibold text-[#0E1024] transition-colors hover:bg-[#F5F6FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue/40 disabled:opacity-60';
export const BOTAO_GHOST =
  'inline-flex items-center justify-center gap-2 rounded-xl px-4 font-semibold text-[#4A5068] transition-colors hover:bg-[#F0F1F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue/40 disabled:opacity-60';
export const BOTAO_PERIGO =
  'inline-flex items-center justify-center gap-2 rounded-xl px-4 font-semibold text-[#B42318] transition-colors hover:bg-[#FEF3F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B42318]/30';

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
export const MESES_COMPLETOS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

/** "2023-06" → "jun 2023" */
export function formatarMembroDesde(valor: string | null | undefined) {
  const m = valor?.match(/^(\d{4})-(\d{2})$/);
  if (!m) return null;
  const mes = MESES[Number(m[2]) - 1];
  return mes ? `${mes} ${m[1]}` : null;
}

export function plural(n: number, singular: string, pluralTexto: string) {
  return `${n} ${n === 1 ? singular : pluralTexto}`;
}

export function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase() || '?';
}

type AvatarProps = {
  nome: string;
  url?: string | null;
  tamanho: number;
  className?: string;
  /** Mostra o botão de câmera no canto (abre o seletor de foto) */
  onCamera?: () => void;
  tamanhoCamera?: number;
  carregando?: boolean;
};

export function AvatarPerfil({ nome, url, tamanho, className, onCamera, tamanhoCamera = 38, carregando }: AvatarProps) {
  return (
    <div className={cn('relative shrink-0', className)} style={{ width: tamanho, height: tamanho }}>
      {url ? (
        <img src={url} alt="" className={cn('h-full w-full rounded-full object-cover', carregando && 'opacity-60')} />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-full w-full items-center justify-center rounded-full bg-[#E8E9F4] font-bold text-onda-blue"
          style={{ fontSize: tamanho * 0.34 }}
        >
          {iniciais(nome)}
        </span>
      )}
      {onCamera && (
        <button
          type="button"
          onClick={onCamera}
          disabled={carregando}
          aria-label="Alterar foto de perfil"
          className="absolute bottom-0 right-0 flex items-center justify-center rounded-full border-[3px] border-white bg-onda-blue text-white transition-colors hover:bg-onda-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue focus-visible:ring-offset-2 disabled:opacity-70"
          style={{ width: tamanhoCamera, height: tamanhoCamera }}
        >
          <Camera aria-hidden="true" style={{ width: tamanhoCamera * 0.45, height: tamanhoCamera * 0.45 }} />
        </button>
      )}
    </div>
  );
}

export function ChipNeutro({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full bg-[#F0F1F6] px-2.5 py-1 text-[13px] text-[#4A5068]', className)}>
      {children}
    </span>
  );
}
