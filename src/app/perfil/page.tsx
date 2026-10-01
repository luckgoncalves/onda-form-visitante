'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Check, ChevronRight, KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatPhone } from '@/lib/utils';
import { cn } from '@/lib/utils';
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
import {
  AvatarPerfil,
  BOTAO_GHOST,
  BOTAO_PRIMARIO,
  BOTAO_SECUNDARIO,
  CARD,
  INPUT,
  INPUT_LEITURA,
  MESES_COMPLETOS,
  ROTULO_GRUPO,
} from '@/components/perfil/perfil-ui';
import { AlterarSenhaDialog } from '@/components/perfil/alterar-senha-dialog';
import { salvarMeusDados } from './actions';
import { usePerfil } from './perfil-context';

type FormDados = { name: string; phone: string; mes: string; ano: string };

const LABEL = 'mb-2 block text-sm font-semibold text-[#0E1024]';
const AJUDA = 'mt-1.5 text-[13px] text-[#5B6478]';
const ERRO = 'mt-1.5 text-[13px] font-medium text-[#B42318]';

const ANO_ATUAL = new Date().getFullYear();
const ANOS = Array.from({ length: ANO_ATUAL - 1949 }, (_, i) => String(ANO_ATUAL - i));

function valoresIniciais(perfil: { name: string; phone: string | null; dataMembresia: string | null }): FormDados {
  const [ano = '', mes = ''] = perfil.dataMembresia?.split('-') ?? [];
  return { name: perfil.name, phone: perfil.phone ?? '', mes, ano };
}

export default function DadosPessoaisPage() {
  const { toast } = useToast();
  const { perfil, recarregar, setTemAlteracoes, abrirSeletorFoto, removerFoto, enviandoFoto } = usePerfil();
  const [senhaAberta, setSenhaAberta] = useState(false);
  const [confirmarRemoverFoto, setConfirmarRemoverFoto] = useState(false);

  const form = useForm<FormDados>({ defaultValues: valoresIniciais(perfil!) });
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = form;

  useEffect(() => {
    setTemAlteracoes(isDirty);
  }, [isDirty, setTemAlteracoes]);
  useEffect(() => () => setTemAlteracoes(false), [setTemAlteracoes]);

  const onSubmit = handleSubmit(async (dados) => {
    if (dados.name.trim().length < 3) {
      setError('name', { message: 'Digite seu nome completo' }, { shouldFocus: true });
      return;
    }
    if (!!dados.mes !== !!dados.ano) {
      setError(dados.mes ? 'ano' : 'mes', { message: 'Escolha o mês e o ano' }, { shouldFocus: true });
      return;
    }

    const res = await salvarMeusDados({
      name: dados.name,
      phone: dados.phone,
      dataMembresia: dados.mes && dados.ano ? `${dados.ano}-${dados.mes}` : '',
    });
    if (!res.ok) {
      toast({ title: 'Erro', description: res.erro, variant: 'destructive' });
      return;
    }
    await recarregar();
    reset({ ...dados, name: dados.name.trim() });
    toast({ title: 'Alterações salvas' });
  });

  if (!perfil) return null;

  const telefone = register('phone');

  return (
    <>
      <h2 className={cn(ROTULO_GRUPO, 'mb-3 lg:hidden')}>Informações pessoais</h2>

      <form onSubmit={onSubmit} noValidate className={cn(CARD, 'overflow-hidden rounded-[18px] lg:rounded-[20px]')}>
        {/* Cabeçalho (desktop) */}
        <div className="hidden border-b border-[#ECEDF3] px-7 py-5 lg:block">
          <h2 className="text-[19px] font-bold text-[#0E1024]">Informações pessoais</h2>
          <p className="mt-0.5 text-sm text-[#5B6478]">Mantenha seus dados de contato atualizados.</p>
        </div>

        <div className="grid grid-cols-1 gap-[18px] px-4 py-[18px] lg:grid-cols-2 lg:gap-x-6 lg:gap-y-[22px] lg:px-7 lg:py-6 2xl:grid-cols-3">
          {/* Foto (desktop; no celular a câmera fica no bloco de identidade) */}
          <div className="col-span-full hidden items-center gap-4 border-b border-[#ECEDF3] pb-[22px] lg:flex">
            <AvatarPerfil nome={perfil.name} url={perfil.profileImageUrl} tamanho={64} carregando={enviandoFoto} />
            <div className="flex-1">
              <p className="font-semibold text-[#0E1024]">Foto de perfil</p>
              <p className="text-[13px] text-[#5B6478]">JPG ou PNG, até 5 MB.</p>
            </div>
            <button type="button" onClick={abrirSeletorFoto} disabled={enviandoFoto} className={cn(BOTAO_SECUNDARIO, 'h-11')}>
              {enviandoFoto ? 'Enviando…' : 'Alterar foto'}
            </button>
            {perfil.profileImageUrl && (
              <button
                type="button"
                onClick={() => setConfirmarRemoverFoto(true)}
                disabled={enviandoFoto}
                className={cn(BOTAO_GHOST, 'h-11')}
              >
                Remover
              </button>
            )}
          </div>

          <div>
            <label htmlFor="perfil-nome" className={LABEL}>Nome completo</label>
            <input
              id="perfil-nome"
              autoComplete="name"
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? 'perfil-nome-erro' : undefined}
              className={cn(INPUT, errors.name && 'border-[#B42318]')}
              {...register('name')}
            />
            {errors.name && <p id="perfil-nome-erro" className={ERRO}>{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="perfil-telefone" className={LABEL}>Telefone</label>
            <input
              id="perfil-telefone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(00) 00000-0000"
              className={INPUT}
              {...telefone}
              onChange={(e) => {
                e.target.value = formatPhone(e.target.value);
                telefone.onChange(e);
              }}
            />
          </div>

          <div>
            <label htmlFor="perfil-email" className={LABEL}>E-mail</label>
            <div className="relative">
              <input
                id="perfil-email"
                value={perfil.email}
                readOnly
                aria-describedby="perfil-email-ajuda"
                className={cn(INPUT, INPUT_LEITURA, 'pr-11')}
              />
              <Lock aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5B6478]" />
            </div>
            <p id="perfil-email-ajuda" className={AJUDA}>Usado para entrar no app. Não pode ser alterado aqui.</p>
          </div>

          <fieldset>
            <legend className={LABEL}>
              Membro da Onda desde <span className="font-normal text-[#5B6478]">(opcional)</span>
            </legend>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="perfil-mes" className="sr-only">Mês</label>
                <select
                  id="perfil-mes"
                  aria-invalid={errors.mes ? true : undefined}
                  className={cn(INPUT, 'appearance-none', errors.mes && 'border-[#B42318]')}
                  {...register('mes')}
                >
                  <option value="">Mês</option>
                  {MESES_COMPLETOS.map((nome, i) => (
                    <option key={nome} value={String(i + 1).padStart(2, '0')}>{nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="perfil-ano" className="sr-only">Ano</label>
                <select
                  id="perfil-ano"
                  aria-invalid={errors.ano ? true : undefined}
                  className={cn(INPUT, 'appearance-none', errors.ano && 'border-[#B42318]')}
                  {...register('ano')}
                >
                  <option value="">Ano</option>
                  {ANOS.map((ano) => (
                    <option key={ano} value={ano}>{ano}</option>
                  ))}
                </select>
              </div>
            </div>
            {(errors.mes || errors.ano) && <p className={ERRO}>{errors.mes?.message || errors.ano?.message}</p>}
          </fieldset>

          {/* Senha: desktop = campo visual + botão; celular = linha que abre o fluxo */}
          <div className="hidden lg:block">
            <span className={LABEL}>Senha</span>
            <div className={cn(INPUT, INPUT_LEITURA, 'flex items-center gap-2 pr-1')}>
              <KeyRound aria-hidden="true" className="h-4 w-4 shrink-0 text-[#5B6478]" />
              <span aria-hidden="true" className="flex-1 tracking-widest">••••••••</span>
              <button type="button" onClick={() => setSenhaAberta(true)} className={cn(BOTAO_GHOST, 'h-10 px-3 text-onda-blue')}>
                Alterar senha
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSenhaAberta(true)}
            className="flex h-[50px] items-center gap-3 rounded-xl border border-[#D9DCE6] px-3.5 text-left text-base font-semibold text-[#0E1024] lg:hidden"
          >
            <KeyRound aria-hidden="true" className="h-5 w-5 text-[#5B6478]" />
            <span className="flex-1">Alterar senha</span>
            <ChevronRight aria-hidden="true" className="h-5 w-5 text-[#5B6478]" />
          </button>

          <div>
            <span className={cn(LABEL, 'hidden lg:block')}>Papel no app</span>
            <div className="flex items-center gap-3 rounded-xl bg-[#F5F6FA] px-3.5 py-3 lg:h-12 lg:py-0">
              <ShieldCheck aria-hidden="true" className="h-5 w-5 shrink-0 text-[#5B6478]" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#0E1024] lg:hidden">Papel no app</p>
                <p className="text-[13px] text-[#5B6478]">Definido pela administração</p>
              </div>
              <span className="font-bold text-[#0E1024]">{perfil.papelApp}</span>
            </div>
          </div>
        </div>

        {/* Rodapé (desktop) */}
        <div className="hidden justify-end gap-3 border-t border-[#ECEDF3] bg-[#FAFBFD] px-7 py-4 lg:flex">
          <button
            type="button"
            onClick={() => reset(valoresIniciais(perfil))}
            disabled={!isDirty || isSubmitting}
            className={cn(BOTAO_GHOST, 'h-11')}
          >
            Descartar
          </button>
          <button type="submit" disabled={isSubmitting} className={cn(BOTAO_PRIMARIO, 'h-11')}>
            <Check aria-hidden="true" className="h-4 w-4" />
            {isSubmitting ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </div>
      </form>

      {/* Salvar (celular) */}
      <button
        type="button"
        onClick={() => onSubmit()}
        disabled={isSubmitting}
        className={cn(BOTAO_PRIMARIO, 'mt-4 h-[50px] w-full text-base lg:hidden')}
      >
        {isSubmitting ? 'Salvando…' : 'Salvar alterações'}
      </button>

      <AlterarSenhaDialog aberto={senhaAberta} onAbertoChange={setSenhaAberta} />

      <AlertDialog open={confirmarRemoverFoto} onOpenChange={setConfirmarRemoverFoto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover foto de perfil?</AlertDialogTitle>
            <AlertDialogDescription>Suas iniciais vão aparecer no lugar da foto.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => removerFoto()}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
