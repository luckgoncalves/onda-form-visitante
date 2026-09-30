'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, ArrowLeft, Building, Check, ChevronDown, Clock, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { INPUT, INPUT_ERRO, LABEL, LogoBranca, MensagemCampo } from '@/components/signup/campos';
import { CadastroEmpresaForm } from '@/components/signup/cadastro-empresa-form';

// Cadastro pede só os dados obrigatórios; telefone, foto, membresia e empresas
// são completados depois em "Meu perfil". A API (/api/register) não muda.
function buildSchema(exigeCampus: boolean) {
  return z.object({
    name: z.string().trim().min(3, 'Digite seu nome completo'),
    email: z.string().trim().email('Confira o e-mail. Ex.: nome@email.com'),
    campusId: exigeCampus
      ? z.string().min(1, 'Escolha o campus que você frequenta')
      : z.string().optional(),
    password: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres'),
  });
}

type SignupData = z.infer<ReturnType<typeof buildSchema>>;

type Campus = {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
};

export default function SignupPage() {
  const router = useRouter();
  const [campusList, setCampusList] = useState<Campus[]>([]);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erroServidor, setErroServidor] = useState<string | null>(null);
  const [emailCadastrado, setEmailCadastrado] = useState<string | null>(null);
  const [empresaToken, setEmpresaToken] = useState<string | null>(null);
  const [cadastrandoEmpresa, setCadastrandoEmpresa] = useState(false);
  const [empresasCadastradas, setEmpresasCadastradas] = useState<string[]>([]);
  const [avisoEmpresa, setAvisoEmpresa] = useState<string | null>(null);
  const tituloSucessoRef = useRef<HTMLHeadingElement>(null);
  const tituloEmpresaRef = useRef<HTMLHeadingElement>(null);

  const schema = useMemo(() => buildSchema(campusList.length > 0), [campusList.length]);

  const form = useForm<SignupData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    shouldFocusError: true,
    defaultValues: { name: '', email: '', campusId: '', password: '' },
  });

  const {
    register,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  // Buscar lista de campus ao carregar a página
  useEffect(() => {
    async function fetchCampus() {
      try {
        const response = await fetch('/api/campus');
        if (response.ok) {
          const data: Campus[] = await response.json();
          setCampusList(data);
          // Se houver apenas um campus, seleciona automaticamente
          if (data.length === 1) {
            setValue('campusId', data[0].id);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar campus:', error);
      }
    }
    fetchCampus();
  }, [setValue]);

  const temErros = Object.keys(errors).length > 0;

  // Foco no título ao trocar de tela (confirmação ↔ cadastro de empresa)
  useEffect(() => {
    if (!emailCadastrado) return;
    (cadastrandoEmpresa ? tituloEmpresaRef : tituloSucessoRef).current?.focus();
    window.scrollTo({ top: 0 });
  }, [emailCadastrado, cadastrandoEmpresa]);

  const onSubmit = form.handleSubmit(async (dados) => {
    setErroServidor(null);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            name: dados.name.trim(),
            email: dados.email.trim(),
            password: dados.password,
            role: 'user',
            campusId: dados.campusId || undefined,
          },
          empresas: [],
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const mensagem: string = data.error || 'Não foi possível criar sua conta. Tente novamente.';
        // Erro do servidor ligado a um campo aparece no próprio campo
        if (/e-?mail/i.test(mensagem)) {
          form.setError('email', { message: mensagem }, { shouldFocus: true });
        } else {
          setErroServidor(mensagem);
        }
        return;
      }

      setEmpresaToken(data.empresaToken || null);
      setEmailCadastrado(dados.email.trim());
    } catch {
      setErroServidor('Não foi possível criar sua conta. Verifique sua conexão e tente novamente.');
    }
  });

  // ─── Cadastro de empresa (após criar a conta) ─────────────────────────────
  if (emailCadastrado && cadastrandoEmpresa && empresaToken) {
    return (
      <div className="flex min-h-dvh flex-col bg-onda-blue">
        <header className="mx-auto w-full max-w-[440px] px-5 pb-7 pt-[calc(12px+env(safe-area-inset-top))]">
          <div className="relative flex h-11 items-center justify-center">
            <button
              type="button"
              onClick={() => setCadastrandoEmpresa(false)}
              aria-label="Voltar"
              className="absolute left-0 flex h-11 w-11 -translate-x-2.5 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <ArrowLeft aria-hidden="true" className="h-[22px] w-[22px]" />
            </button>
            <LogoBranca />
          </div>
          <h1
            ref={tituloEmpresaRef}
            tabIndex={-1}
            className="mt-5 text-[28px] font-bold leading-tight text-white focus:outline-none"
          >
            Cadastrar empresa
          </h1>
          <p className="mt-1.5 text-[15px] leading-normal text-[#D6DAF0]">
            Ela aparece no Hub da comunidade depois que sua conta for aprovada.
          </p>
        </header>

        <main className="mx-auto w-full max-w-[440px] flex-1 rounded-t-[24px] bg-white px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-6">
          <CadastroEmpresaForm
            token={empresaToken}
            onCancelar={() => setCadastrandoEmpresa(false)}
            onSalva={(nome) => {
              setEmpresasCadastradas((atuais) => [...atuais, nome]);
              setAvisoEmpresa(null);
              setCadastrandoEmpresa(false);
            }}
            onTokenExpirado={(mensagem) => {
              setEmpresaToken(null);
              setAvisoEmpresa(mensagem || 'O prazo para cadastrar empresas por aqui expirou. Você pode cadastrar em Meu perfil depois da aprovação.');
              setCadastrandoEmpresa(false);
            }}
          />
        </main>
      </div>
    );
  }

  // ─── Estado de sucesso ────────────────────────────────────────────────────
  if (emailCadastrado) {
    return (
      <div className="flex min-h-dvh flex-col bg-onda-blue">
        <header className="mx-auto flex w-full max-w-[440px] justify-center px-5 pb-7 pt-[calc(20px+env(safe-area-inset-top))]">
          <LogoBranca />
        </header>

        <main className="mx-auto flex w-full max-w-[440px] flex-1 flex-col rounded-t-[24px] bg-white px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-10">
          <div className="flex flex-1 flex-col items-center text-center">
            <span aria-hidden="true" className="flex h-20 w-20 items-center justify-center rounded-full bg-[#E5F4FE]">
              <Clock className="h-10 w-10 text-onda-blue" />
            </span>
            <h1
              ref={tituloSucessoRef}
              tabIndex={-1}
              className="mt-6 text-[26px] font-bold text-[#0E1024] focus:outline-none"
            >
              Cadastro enviado!
            </h1>
            <p className="mt-3 text-base leading-normal text-[#4A5068]">
              Agora um administrador do seu campus vai aprovar seu acesso. Você recebe um e-mail assim
              que ele for liberado. Depois, é só entrar com o e-mail e a senha que você cadastrou.
            </p>
            <div className="mt-6 w-full rounded-[14px] border-[1.5px] border-[#D5D8E6] px-4 py-3 text-left">
              <p className="text-[13px] text-[#4A5068]">Conta criada com</p>
              <p className="break-all text-base font-semibold text-[#0E1024]">{emailCadastrado}</p>
            </div>
          </div>

          {/* Pergunta: cadastrar empresa */}
          <section aria-labelledby="pergunta-empresa" className="mt-8 rounded-[14px] bg-[#F3F4F8] p-4">
            {empresasCadastradas.length > 0 && (
              <ul className="mb-4 space-y-2">
                {empresasCadastradas.map((nome, i) => (
                  <li key={`${nome}-${i}`} className="flex items-center gap-2 text-sm font-medium text-[#0E1024]">
                    <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-green-700" />
                    <span className="min-w-0 break-words">{nome} cadastrada</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex items-start gap-3">
              <Building aria-hidden="true" className="mt-0.5 h-[22px] w-[22px] shrink-0 text-onda-medBlue" />
              <div>
                <h2 id="pergunta-empresa" className="text-[15px] font-bold text-[#0E1024]">
                  {empresasCadastradas.length > 0
                    ? 'Quer cadastrar outra empresa?'
                    : 'Você tem uma empresa ou negócio?'}
                </h2>
                <p className="mt-0.5 text-sm leading-normal text-[#4A5068]">
                  {avisoEmpresa ||
                    'Cadastre agora para ela aparecer no Hub da comunidade depois da aprovação. Você também pode fazer isso depois, em Meu perfil.'}
                </p>
              </div>
            </div>

            {empresaToken && (
              <button
                type="button"
                onClick={() => setCadastrandoEmpresa(true)}
                className="mt-4 h-[54px] w-full rounded-[14px] bg-onda-blue text-base font-bold text-white transition-colors hover:bg-onda-blue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue focus-visible:ring-offset-2"
              >
                {empresasCadastradas.length > 0 ? 'Cadastrar outra empresa' : 'Sim, cadastrar empresa'}
              </button>
            )}
          </section>

          <Link
            href="/"
            className="mt-3 flex h-[54px] w-full items-center justify-center rounded-[14px] border-[1.5px] border-onda-blue text-base font-semibold text-onda-blue transition-colors hover:bg-onda-blue/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue focus-visible:ring-offset-2"
          >
            {empresasCadastradas.length > 0 || !empresaToken ? 'Concluir' : 'Agora não'}
          </Link>
        </main>
      </div>
    );
  }

  // ─── Formulário ──────────────────────────────────────────────────────────
  const ariaCampo = (campo: keyof SignupData, temAjuda = false) => ({
    'aria-invalid': errors[campo] ? true : undefined,
    'aria-describedby': errors[campo] || temAjuda ? `${campo}-mensagem` : undefined,
  });

  return (
    <div className="flex min-h-dvh flex-col bg-onda-blue">
      <header className="mx-auto w-full max-w-[440px] px-5 pb-7 pt-[calc(12px+env(safe-area-inset-top))]">
        <div className="relative flex h-11 items-center justify-center">
          <button
            type="button"
            onClick={() => router.push('/')}
            aria-label="Voltar"
            className="absolute left-0 flex h-11 w-11 -translate-x-2.5 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <ArrowLeft aria-hidden="true" className="h-[22px] w-[22px]" />
          </button>
          <LogoBranca />
        </div>
        <h1 className="mt-5 text-[28px] font-bold leading-tight text-white">Criar conta</h1>
        <p className="mt-1.5 text-[15px] leading-normal text-[#D6DAF0]">
          Leva menos de um minuto. Depois é só aguardar a aprovação.
        </p>
      </header>

      <main className="mx-auto w-full max-w-[440px] flex-1 rounded-t-[24px] bg-white px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-6">
        {!temErros && (
          <div role="note" className="mb-6 flex gap-3 rounded-[14px] bg-[#E5F4FE] px-4 py-3.5 text-onda-darkNavy">
            <Clock aria-hidden="true" className="h-[22px] w-[22px] shrink-0 text-onda-medBlue" />
            <div>
              <p className="text-[15px] font-bold">Sua conta passa por aprovação</p>
              <p className="mt-0.5 text-sm leading-normal">
                Um administrador libera seu acesso. Telefone, foto e empresas você completa depois, em Meu perfil.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          <div>
            <label htmlFor="name" className={LABEL}>Nome completo</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              autoCapitalize="words"
              placeholder="Seu nome e sobrenome"
              className={cn(INPUT, errors.name && INPUT_ERRO)}
              {...ariaCampo('name')}
              {...register('name')}
            />
            <MensagemCampo id="name-mensagem" erro={errors.name?.message} />
          </div>

          <div>
            <label htmlFor="email" className={LABEL}>E-mail</label>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="voce@email.com"
              className={cn(INPUT, errors.email && INPUT_ERRO)}
              {...ariaCampo('email')}
              {...register('email')}
            />
            <MensagemCampo id="email-mensagem" erro={errors.email?.message} />
          </div>

          {campusList.length > 0 && (
            <div>
              <label htmlFor="campusId" className={LABEL}>Campus</label>
              <div className="relative">
                <select
                  id="campusId"
                  className={cn(INPUT, 'appearance-none pr-11', errors.campusId && INPUT_ERRO)}
                  {...ariaCampo('campusId', true)}
                  {...register('campusId')}
                >
                  <option value="">Selecione seu campus</option>
                  {campusList.map((campus) => (
                    <option key={campus.id} value={campus.id}>
                      {campus.nome}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#4A5068]"
                />
              </div>
              <MensagemCampo
                id="campusId-mensagem"
                erro={errors.campusId?.message}
                ajuda="O campus que você frequenta"
              />
            </div>
          )}

          <div>
            <label htmlFor="password" className={LABEL}>Senha</label>
            <div className="relative">
              <input
                id="password"
                type={mostrarSenha ? 'text' : 'password'}
                autoComplete="new-password"
                className={cn(INPUT, 'pr-14', errors.password && INPUT_ERRO)}
                {...ariaCampo('password', true)}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-[#4A5068] transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue/40"
              >
                {mostrarSenha
                  ? <EyeOff aria-hidden="true" className="h-5 w-5" />
                  : <Eye aria-hidden="true" className="h-5 w-5" />}
              </button>
            </div>
            <MensagemCampo id="password-mensagem" erro={errors.password?.message} ajuda="Mínimo de 6 caracteres" />
          </div>

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
            {isSubmitting ? 'Criando conta…' : 'Criar conta'}
          </button>

          <p className="flex items-center justify-center gap-1 text-[15px] text-[#4A5068]">
            Já tem uma conta?
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center px-1 font-bold text-onda-blue underline underline-offset-2"
            >
              Entrar
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
