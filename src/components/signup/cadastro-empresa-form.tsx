'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { cn, formatPhone } from '@/lib/utils';
import { empresaSchema, EmpresaFormData } from '@/lib/validations/empresa';
import { INPUT, INPUT_ERRO, LABEL, MensagemCampo } from '@/components/signup/campos';

type Props = {
  token: string;
  onSalva: (nomeNegocio: string) => void;
  onTokenExpirado: (mensagem: string) => void;
  onCancelar: () => void;
};

type Campo = {
  name: keyof EmpresaFormData;
  label: string;
  placeholder?: string;
  ajuda?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete?: string;
};

const OBRIGATORIOS: Campo[] = [
  { name: 'nomeNegocio', label: 'Nome do negócio', placeholder: 'Ex.: Studio de Beleza Maria', autoComplete: 'organization' },
  { name: 'ramoAtuacao', label: 'Ramo de atuação', placeholder: 'Ex.: Beleza e estética' },
  { name: 'whatsapp', label: 'WhatsApp', placeholder: '(41) 99999-9999', type: 'tel', inputMode: 'tel', autoComplete: 'tel' },
  { name: 'email', label: 'E-mail da empresa', placeholder: 'contato@empresa.com', type: 'email', inputMode: 'email', autoComplete: 'email' },
];

const OPCIONAIS: Campo[] = [
  { name: 'endereco', label: 'Endereço (opcional)', placeholder: 'Rua, número, bairro, cidade', autoComplete: 'street-address' },
  { name: 'instagram', label: 'Instagram (opcional)', placeholder: '@empresa' },
  { name: 'site', label: 'Site (opcional)', placeholder: 'https://www.empresa.com', type: 'url', inputMode: 'url' },
];

export function CadastroEmpresaForm({ token, onSalva, onTokenExpirado, onCancelar }: Props) {
  const [erroServidor, setErroServidor] = useState<string | null>(null);

  const form = useForm<EmpresaFormData>({
    resolver: zodResolver(empresaSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    shouldFocusError: true,
    defaultValues: {
      nomeNegocio: '',
      ramoAtuacao: '',
      detalhesServico: '',
      whatsapp: '',
      email: '',
      endereco: '',
      instagram: '',
      site: '',
      facebook: '',
      linkedin: '',
      logoUrl: '',
    },
  });

  const {
    register,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = form.handleSubmit(async (empresa) => {
    setErroServidor(null);
    try {
      const res = await fetch('/api/register/empresa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, empresa }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        onTokenExpirado(data.error);
        return;
      }
      if (!res.ok) {
        setErroServidor(data.error || 'Não foi possível cadastrar a empresa. Tente novamente.');
        return;
      }

      onSalva(data.nomeNegocio || empresa.nomeNegocio);
    } catch {
      setErroServidor('Não foi possível cadastrar a empresa. Verifique sua conexão e tente novamente.');
    }
  });

  const aria = (campo: keyof EmpresaFormData) => ({
    'aria-invalid': errors[campo] ? true : undefined,
    'aria-describedby': errors[campo] ? `empresa-${campo}-mensagem` : undefined,
  });

  const renderCampo = (campo: Campo) => {
    const registro = register(campo.name);
    return (
      <div key={campo.name}>
        <label htmlFor={`empresa-${campo.name}`} className={LABEL}>{campo.label}</label>
        <input
          id={`empresa-${campo.name}`}
          type={campo.type || 'text'}
          inputMode={campo.inputMode}
          autoComplete={campo.autoComplete}
          placeholder={campo.placeholder}
          className={cn(INPUT, errors[campo.name] && INPUT_ERRO)}
          {...aria(campo.name)}
          {...registro}
          onChange={(e) => {
            if (campo.name === 'whatsapp') e.target.value = formatPhone(e.target.value);
            registro.onChange(e);
          }}
        />
        <MensagemCampo id={`empresa-${campo.name}-mensagem`} erro={errors[campo.name]?.message} />
      </div>
    );
  };

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {OBRIGATORIOS.slice(0, 2).map(renderCampo)}

      <div>
        <label htmlFor="empresa-detalhesServico" className={LABEL}>O que a empresa oferece</label>
        <textarea
          id="empresa-detalhesServico"
          rows={3}
          placeholder="Descreva os serviços ou produtos"
          className={cn(INPUT, 'h-auto min-h-[104px] py-3', errors.detalhesServico && INPUT_ERRO)}
          {...aria('detalhesServico')}
          {...register('detalhesServico')}
        />
        <MensagemCampo id="empresa-detalhesServico-mensagem" erro={errors.detalhesServico?.message} />
      </div>

      {OBRIGATORIOS.slice(2).map(renderCampo)}
      {OPCIONAIS.map(renderCampo)}

      {erroServidor && (
        <div role="alert" className="flex gap-2 rounded-[14px] border border-[#B42A08]/30 bg-[#FDF1EE] px-4 py-3 text-sm font-medium text-[#B42A08]">
          <AlertCircle aria-hidden="true" className="mt-px h-4 w-4 shrink-0" />
          {erroServidor}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-1 h-[54px] w-full rounded-[14px] bg-onda-blue text-base font-bold text-white transition-colors hover:bg-onda-blue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? 'Salvando empresa…' : 'Salvar empresa'}
      </button>
      <button
        type="button"
        onClick={onCancelar}
        className="-mt-2 min-h-11 text-[15px] font-semibold text-onda-blue underline underline-offset-2"
      >
        Cancelar
      </button>
    </form>
  );
}
