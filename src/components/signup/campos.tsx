import Image from 'next/image';
import { AlertCircle } from 'lucide-react';

// Estilos e peças compartilhadas das telas de cadastro
export const LABEL = 'mb-2 block text-sm font-semibold text-[#0E1024]';
export const INPUT =
  'h-[52px] w-full rounded-xl border-[1.5px] border-[#D5D8E6] bg-white px-4 text-base text-[#0E1024] placeholder:text-[#6B7280] transition-colors focus:border-onda-blue focus:outline-none focus:ring-2 focus:ring-onda-blue/20';
export const INPUT_ERRO = 'border-2 border-[#B42A08] focus:border-[#B42A08] focus:ring-[#B42A08]/20';

export function MensagemCampo({ id, erro, ajuda }: { id: string; erro?: string; ajuda?: string }) {
  if (erro) {
    return (
      <p id={id} className="mt-2 flex items-start gap-1.5 text-[13px] font-medium text-[#B42A08]">
        <AlertCircle aria-hidden="true" className="mt-px h-4 w-4 shrink-0" />
        {erro}
      </p>
    );
  }
  if (ajuda) {
    return (
      <p id={id} className="mt-2 text-[13px] text-[#4A5068]">
        {ajuda}
      </p>
    );
  }
  return null;
}

export function LogoBranca() {
  return (
    <Image
      src="/logos/logo-principal-branco.png"
      alt="igreja onda"
      width={192}
      height={40}
      className="h-[22px] w-auto"
      priority
    />
  );
}
