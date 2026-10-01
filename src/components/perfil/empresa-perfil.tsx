'use client';

import { Building2, ChevronRight, ExternalLink, Globe, Instagram, Mail, MoreHorizontal, Pencil, Phone, Plus, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { MINISTERIO_CORES, MINISTERIO_COR_KEYS } from '@/config/ministerio-visual';
import type { PerfilEmpresa } from '@/app/perfil/actions';
import { BOTAO_PERIGO, BOTAO_SECUNDARIO } from './perfil-ui';

/** Cor estável por categoria (mesma categoria, mesma cor) */
export function corCategoria(categoria: string) {
  let hash = 0;
  for (const ch of categoria.trim().toLowerCase()) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return MINISTERIO_CORES[MINISTERIO_COR_KEYS[hash % MINISTERIO_COR_KEYS.length]];
}

export function linkSite(site: string) {
  return /^https?:\/\//i.test(site) ? site : `https://${site}`;
}

export function linkInstagram(instagram: string) {
  if (/^https?:\/\//i.test(instagram)) return instagram;
  return `https://instagram.com/${instagram.replace(/^@/, '').trim()}`;
}

export function linkWhatsapp(telefone: string) {
  const digitos = telefone.replace(/\D/g, '');
  return `https://wa.me/${digitos.length <= 11 ? `55${digitos}` : digitos}`;
}

export function ChipCategoria({ categoria }: { categoria: string }) {
  const cor = corCategoria(categoria);
  return (
    <span
      className="inline-flex max-w-full items-center truncate rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: cor.bg, color: cor.fg }}
    >
      {categoria}
    </span>
  );
}

export function LogoEmpresa({ empresa, tamanho }: { empresa: PerfilEmpresa; tamanho: 48 | 56 }) {
  const cor = corCategoria(empresa.ramoAtuacao);
  const classe = cn('shrink-0 rounded-[14px]', tamanho === 56 ? 'h-14 w-14' : 'h-12 w-12');
  if (empresa.logoUrl) {
    return <img src={empresa.logoUrl} alt="" className={cn(classe, 'border border-[#ECEDF3] bg-white object-contain')} />;
  }
  return (
    <span aria-hidden="true" className={cn(classe, 'flex items-center justify-center')} style={{ backgroundColor: cor.bg, color: cor.fg }}>
      <Building2 className="h-6 w-6" />
    </span>
  );
}

const SELO_WHATSAPP = 'rounded-full bg-[#E7F6F0] px-2 py-0.5 text-xs font-semibold text-[#1F6B4F]';

type AcoesEmpresa = { onEditar: () => void; onExcluir: () => void };

/** Card completo da empresa no desktop */
export function CardEmpresaDesktop({ empresa, onEditar, onExcluir }: { empresa: PerfilEmpresa } & AcoesEmpresa) {
  return (
    <article className="flex flex-col rounded-[18px] border border-[#E3E6EF] bg-white p-5">
      <div className="flex items-start gap-3.5">
        <LogoEmpresa empresa={empresa} tamanho={56} />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-[17px] font-bold leading-snug text-onda-blue">{empresa.nomeNegocio}</h3>
          <div className="mt-1.5">
            <ChipCategoria categoria={empresa.ramoAtuacao} />
          </div>
        </div>
      </div>

      {empresa.detalhesServico && (
        <p className="mt-3.5 text-sm leading-[1.55] text-[#4A5068]">{empresa.detalhesServico}</p>
      )}

      <div className="mt-4 flex flex-col gap-2 border-t border-[#ECEDF3] pt-4 text-sm text-[#0E1024]">
        {empresa.whatsapp && (
          <div className="flex flex-wrap items-center gap-2">
            <Phone aria-hidden="true" className="h-4 w-4 shrink-0 text-[#5B6478]" />
            <a href={linkWhatsapp(empresa.whatsapp)} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap hover:underline">
              {empresa.whatsapp}
            </a>
            <span className={SELO_WHATSAPP}>WhatsApp</span>
          </div>
        )}
        {empresa.email && (
          <div className="flex items-start gap-2">
            <Mail aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#5B6478]" />
            <span className="break-all">{empresa.email}</span>
          </div>
        )}
      </div>

      {(empresa.site || empresa.instagram) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {empresa.site && (
            <a
              href={linkSite(empresa.site)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#D9DCE6] px-3 text-sm font-semibold text-[#0E1024] hover:bg-[#F5F6FA]"
            >
              <Globe aria-hidden="true" className="h-4 w-4" />
              Site
            </a>
          )}
          {empresa.instagram && (
            <a
              href={linkInstagram(empresa.instagram)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#D9DCE6] px-3 text-sm font-semibold text-[#0E1024] hover:bg-[#F5F6FA]"
            >
              <Instagram aria-hidden="true" className="h-4 w-4" />
              Instagram
            </a>
          )}
        </div>
      )}

      <div className="mt-auto flex gap-2 pt-5">
        <button type="button" onClick={onEditar} className={cn(BOTAO_SECUNDARIO, 'h-11 flex-1')}>
          <Pencil aria-hidden="true" className="h-4 w-4" />
          Editar
        </button>
        <button type="button" onClick={onExcluir} className={cn(BOTAO_PERIGO, 'h-11')}>
          <Trash2 aria-hidden="true" className="h-4 w-4" />
          Excluir
        </button>
      </div>
    </article>
  );
}

/** Card completo da empresa no celular (contatos como linhas tocáveis) */
export function CardEmpresaMobile({ empresa, onEditar, onExcluir }: { empresa: PerfilEmpresa } & AcoesEmpresa) {
  const linha =
    'flex min-h-12 items-center gap-3 border-b border-[#ECEDF3] px-1 text-[15px] text-[#0E1024] last:border-b-0';
  return (
    <article className="rounded-[18px] border border-[#E3E6EF] bg-white p-4">
      <div className="flex items-center gap-3">
        <LogoEmpresa empresa={empresa} tamanho={56} />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-[17px] font-bold leading-snug text-onda-blue">{empresa.nomeNegocio}</h3>
          <div className="mt-1">
            <ChipCategoria categoria={empresa.ramoAtuacao} />
          </div>
        </div>
      </div>
      {empresa.detalhesServico && (
        <p className="mt-3 text-sm leading-[1.55] text-[#4A5068]">{empresa.detalhesServico}</p>
      )}

      <div className="mt-3 border-t border-[#ECEDF3]">
        {empresa.whatsapp && (
          <a href={linkWhatsapp(empresa.whatsapp)} target="_blank" rel="noopener noreferrer" className={linha}>
            <Phone aria-hidden="true" className="h-[18px] w-[18px] shrink-0 text-[#5B6478]" />
            <span className="flex-1 whitespace-nowrap">{empresa.whatsapp}</span>
            <span className={SELO_WHATSAPP}>WhatsApp</span>
          </a>
        )}
        {empresa.email && (
          <a href={`mailto:${empresa.email}`} className={linha}>
            <Mail aria-hidden="true" className="h-[18px] w-[18px] shrink-0 text-[#5B6478]" />
            <span className="min-w-0 flex-1 break-all py-2">{empresa.email}</span>
          </a>
        )}
        {empresa.site && (
          <a href={linkSite(empresa.site)} target="_blank" rel="noopener noreferrer" className={linha}>
            <Globe aria-hidden="true" className="h-[18px] w-[18px] shrink-0 text-[#5B6478]" />
            <span className="flex-1">Site</span>
            <ExternalLink aria-hidden="true" className="h-4 w-4 text-[#5B6478]" />
          </a>
        )}
        {empresa.instagram && (
          <a href={linkInstagram(empresa.instagram)} target="_blank" rel="noopener noreferrer" className={linha}>
            <Instagram aria-hidden="true" className="h-[18px] w-[18px] shrink-0 text-[#5B6478]" />
            <span className="flex-1">Instagram</span>
            <ExternalLink aria-hidden="true" className="h-4 w-4 text-[#5B6478]" />
          </a>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button type="button" onClick={onEditar} className={cn(BOTAO_SECUNDARIO, 'h-12 flex-1 text-base')}>
          <Pencil aria-hidden="true" className="h-4 w-4" />
          Editar empresa
        </button>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`Mais opções de ${empresa.nomeNegocio}`}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#D9DCE6] text-[#4A5068]"
            >
              <MoreHorizontal aria-hidden="true" className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-[14px] p-1.5">
            <DropdownMenuItem
              onSelect={onExcluir}
              className="min-h-11 cursor-pointer gap-2.5 rounded-lg px-3 text-[15px] text-[#B42318] focus:bg-[#FEF3F2] focus:text-[#B42318]"
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}

/** Linha compacta da lista de empresas no celular (2 ou mais) */
export function LinhaEmpresa({ empresa, onAbrir }: { empresa: PerfilEmpresa; onAbrir: () => void }) {
  return (
    <button
      type="button"
      onClick={onAbrir}
      className="flex min-h-[76px] w-full items-center gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-onda-blue/40"
    >
      <LogoEmpresa empresa={empresa} tamanho={48} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-bold text-[#0E1024]">{empresa.nomeNegocio}</span>
        <span className="mt-1 block">
          <ChipCategoria categoria={empresa.ramoAtuacao} />
        </span>
      </span>
      <ChevronRight aria-hidden="true" className="h-5 w-5 shrink-0 text-[#5B6478]" />
    </button>
  );
}

/** Bloco "Adicionar empresa" (sempre o primeiro item) */
export function AdicionarEmpresa({ onClick, compacto }: { onClick: () => void; compacto?: boolean }) {
  if (compacto) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-[18px] border-[1.5px] border-dashed border-[#C9CDE0] bg-[#FAFBFD] p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue/40"
      >
        <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E8E9F4] text-onda-blue">
          <Plus className="h-5 w-5" />
        </span>
        <span>
          <span className="block text-base font-bold text-onda-blue">Adicionar empresa</span>
          <span className="block text-sm text-[#5B6478]">Divulgue outro negócio para a comunidade.</span>
        </span>
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-[18px] border-[1.5px] border-dashed border-[#C9CDE0] bg-[#FAFBFD] p-6 text-center transition-colors hover:bg-[#F3F4F8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue/40"
    >
      <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8E9F4] text-onda-blue">
        <Plus className="h-6 w-6" />
      </span>
      <span className="text-base font-bold text-onda-blue">Adicionar outra empresa</span>
      <span className="max-w-[240px] text-sm text-[#5B6478]">Cadastre outro negócio para divulgar à comunidade.</span>
    </button>
  );
}
