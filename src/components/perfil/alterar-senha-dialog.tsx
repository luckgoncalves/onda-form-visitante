'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { alterarMinhaSenha } from '@/app/perfil/actions';
import { BOTAO_GHOST, BOTAO_PRIMARIO, INPUT } from './perfil-ui';

type Props = { aberto: boolean; onAbertoChange: (aberto: boolean) => void };

const VAZIO = { atual: '', nova: '', confirmacao: '' };

/** Fluxo de troca de senha: senha atual, nova e confirmação. Não depende do "Salvar alterações". */
export function AlterarSenhaDialog({ aberto, onAbertoChange }: Props) {
  const { toast } = useToast();
  const [campos, setCampos] = useState(VAZIO);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const fechar = (valor: boolean) => {
    onAbertoChange(valor);
    if (!valor) {
      setCampos(VAZIO);
      setErro(null);
    }
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (campos.nova.length < 6) return setErro('A nova senha precisa ter pelo menos 6 caracteres.');
    if (campos.nova !== campos.confirmacao) return setErro('A confirmação não confere com a nova senha.');

    setSalvando(true);
    try {
      const res = await alterarMinhaSenha({ senhaAtual: campos.atual, novaSenha: campos.nova });
      if (!res.ok) return setErro(res.erro);
      toast({ title: 'Senha alterada' });
      fechar(false);
    } finally {
      setSalvando(false);
    }
  };

  const campo = (id: keyof typeof VAZIO, label: string, autoComplete: string) => (
    <div>
      <label htmlFor={`senha-${id}`} className="mb-2 block text-sm font-semibold text-[#0E1024]">{label}</label>
      <input
        id={`senha-${id}`}
        type="password"
        autoComplete={autoComplete}
        value={campos[id]}
        onChange={(e) => setCampos((c) => ({ ...c, [id]: e.target.value }))}
        className={INPUT}
      />
    </div>
  );

  return (
    <Dialog open={aberto} onOpenChange={fechar}>
      <DialogContent className="max-w-md rounded-[20px]">
        <DialogHeader>
          <DialogTitle>Alterar senha</DialogTitle>
          <DialogDescription>Para sua segurança, confirme a senha atual.</DialogDescription>
        </DialogHeader>
        <form onSubmit={enviar} className="flex flex-col gap-4">
          {campo('atual', 'Senha atual', 'current-password')}
          {campo('nova', 'Nova senha', 'new-password')}
          {campo('confirmacao', 'Confirme a nova senha', 'new-password')}
          {erro && <p role="alert" className="text-sm font-medium text-[#B42318]">{erro}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => fechar(false)} className={cn(BOTAO_GHOST, 'h-11')}>Cancelar</button>
            <button type="submit" disabled={salvando} className={cn(BOTAO_PRIMARIO, 'h-11')}>
              {salvando ? 'Salvando…' : 'Alterar senha'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
