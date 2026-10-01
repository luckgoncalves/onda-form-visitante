'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { atualizarMinhaFoto, getMeuPerfil, MeuPerfil } from './actions';

const FORMATOS = ['image/jpeg', 'image/png'];
const MAX_MB = 5;

type PerfilContextValue = {
  perfil: MeuPerfil | null;
  erro: boolean;
  recarregar: () => Promise<void>;
  /** Há alterações não salvas em Dados pessoais (pergunta antes de trocar de seção). */
  temAlteracoes: boolean;
  setTemAlteracoes: (valor: boolean) => void;
  abrirSeletorFoto: () => void;
  removerFoto: () => Promise<void>;
  enviandoFoto: boolean;
};

const PerfilContext = createContext<PerfilContextValue | null>(null);

export function usePerfil() {
  const ctx = useContext(PerfilContext);
  if (!ctx) throw new Error('usePerfil precisa estar dentro de PerfilProvider');
  return ctx;
}

export function PerfilProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const [perfil, setPerfil] = useState<MeuPerfil | null>(null);
  const [erro, setErro] = useState(false);
  const [temAlteracoes, setTemAlteracoes] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const inputFotoRef = useRef<HTMLInputElement>(null);

  const recarregar = useCallback(async () => {
    const res = await getMeuPerfil();
    if (!res.ok) {
      if (res.erro === 'Não autorizado') router.replace('/');
      else setErro(true);
      return;
    }
    setErro(false);
    setPerfil(res.data!);
  }, [router]);

  useEffect(() => {
    recarregar().catch(() => setErro(true));
  }, [recarregar]);

  // A troca de foto salva na hora, sem passar pelo botão Salvar
  const enviarFoto = async (arquivo: File) => {
    if (!FORMATOS.includes(arquivo.type)) {
      toast({ title: 'Formato não aceito', description: 'Use uma imagem JPG ou PNG.', variant: 'destructive' });
      return;
    }
    if (arquivo.size > MAX_MB * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande', description: `O tamanho máximo é ${MAX_MB} MB.`, variant: 'destructive' });
      return;
    }

    setEnviandoFoto(true);
    try {
      const formData = new FormData();
      formData.append('file', arquivo);
      formData.append('folder', 'users/profiles');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      const salvo = await atualizarMinhaFoto(url);
      if (!salvo.ok) throw new Error();
      setPerfil((p) => (p ? { ...p, profileImageUrl: url } : p));
      toast({ title: 'Foto atualizada' });
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível atualizar a foto.', variant: 'destructive' });
    } finally {
      setEnviandoFoto(false);
    }
  };

  const removerFoto = async () => {
    setEnviandoFoto(true);
    try {
      const salvo = await atualizarMinhaFoto(null);
      if (!salvo.ok) throw new Error();
      setPerfil((p) => (p ? { ...p, profileImageUrl: null } : p));
      toast({ title: 'Foto removida' });
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível remover a foto.', variant: 'destructive' });
    } finally {
      setEnviandoFoto(false);
    }
  };

  return (
    <PerfilContext.Provider
      value={{
        perfil,
        erro,
        recarregar,
        temAlteracoes,
        setTemAlteracoes,
        abrirSeletorFoto: () => inputFotoRef.current?.click(),
        removerFoto,
        enviandoFoto,
      }}
    >
      {children}
      <input
        ref={inputFotoRef}
        type="file"
        accept={FORMATOS.join(',')}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          const arquivo = e.target.files?.[0];
          e.target.value = '';
          if (arquivo) enviarFoto(arquivo);
        }}
      />
    </PerfilContext.Provider>
  );
}
