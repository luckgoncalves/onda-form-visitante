'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerClose, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
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
import EmpresaForm from '@/components/empresas/empresa-form';
import type { Empresa } from '@/types/empresa';
import type { EmpresaFormData } from '@/lib/validations/empresa';
import { CARD, ROTULO_GRUPO } from '@/components/perfil/perfil-ui';
import {
  AdicionarEmpresa,
  CardEmpresaDesktop,
  CardEmpresaMobile,
  LinhaEmpresa,
} from '@/components/perfil/empresa-perfil';
import { criarMinhaEmpresa, editarMinhaEmpresa, excluirMinhaEmpresa, PerfilEmpresa } from '../actions';
import { usePerfil } from '../perfil-context';

export default function EmpresasPerfilPage() {
  const { toast } = useToast();
  const { perfil, recarregar } = usePerfil();
  // null = fechado · 'nova' = criar · empresa = editar
  const [formulario, setFormulario] = useState<'nova' | PerfilEmpresa | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [excluir, setExcluir] = useState<PerfilEmpresa | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [detalhe, setDetalhe] = useState<PerfilEmpresa | null>(null);

  if (!perfil) return null;
  const empresas = perfil.empresas;
  const n = empresas.length;

  const salvar = async (dados: EmpresaFormData) => {
    setSalvando(true);
    try {
      const res = formulario === 'nova' ? await criarMinhaEmpresa(dados) : await editarMinhaEmpresa((formulario as PerfilEmpresa).id, dados);
      if (!res.ok) throw new Error(res.erro);
      toast({ title: formulario === 'nova' ? 'Empresa cadastrada' : 'Empresa atualizada' });
      setFormulario(null);
      setDetalhe(null);
      await recarregar();
    } catch (e) {
      toast({ title: 'Erro', description: e instanceof Error ? e.message : 'Não foi possível salvar a empresa.', variant: 'destructive' });
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExclusao = async () => {
    if (!excluir) return;
    setExcluindo(true);
    try {
      const res = await excluirMinhaEmpresa(excluir.id);
      if (!res.ok) throw new Error(res.erro);
      toast({ title: 'Empresa excluída' });
      setExcluir(null);
      setDetalhe(null);
      await recarregar();
    } catch (e) {
      toast({ title: 'Erro', description: e instanceof Error ? e.message : 'Não foi possível excluir a empresa.', variant: 'destructive' });
    } finally {
      setExcluindo(false);
    }
  };

  const acoes = (empresa: PerfilEmpresa) => ({
    onEditar: () => setFormulario(empresa),
    onExcluir: () => setExcluir(empresa),
  });

  return (
    <>
      {/* ── Celular/tablet ── */}
      <div className="flex flex-col gap-3 lg:hidden">
        <h2 className={ROTULO_GRUPO}>Minhas empresas{n > 1 && ` · ${n}`}</h2>
        <AdicionarEmpresa compacto onClick={() => setFormulario('nova')} />

        {n === 1 && <CardEmpresaMobile empresa={empresas[0]} {...acoes(empresas[0])} />}

        {n > 1 && (
          <>
            <ul className={cn(CARD, 'overflow-hidden rounded-[18px]')}>
              {empresas.map((empresa) => (
                <li key={empresa.id} className="border-b border-[#ECEDF3] last:border-b-0">
                  <LinhaEmpresa empresa={empresa} onAbrir={() => setDetalhe(empresa)} />
                </li>
              ))}
            </ul>
            <p className="text-center text-[13px] text-[#5B6478]">Toque em uma empresa para ver os detalhes e editar.</p>
          </>
        )}
      </div>

      {/* ── Desktop ── */}
      <section aria-labelledby="minhas-empresas-titulo" className={cn(CARD, 'hidden lg:block')}>
        <div className="border-b border-[#ECEDF3] px-7 py-5">
          <h2 id="minhas-empresas-titulo" className="text-[19px] font-bold text-[#0E1024]">Minhas empresas</h2>
          <p className="mt-0.5 text-sm text-[#5B6478]">Negócios seus que aparecem no guia de Empresas da Onda.</p>
        </div>
        <div className="grid gap-5 p-7 [grid-template-columns:repeat(auto-fill,minmax(360px,1fr))]">
          <AdicionarEmpresa onClick={() => setFormulario('nova')} />
          {empresas.map((empresa) => (
            <CardEmpresaDesktop key={empresa.id} empresa={empresa} {...acoes(empresa)} />
          ))}
        </div>
      </section>

      {/* Detalhe da empresa (celular, lista com 2+) */}
      <Drawer open={!!detalhe} onOpenChange={(open) => !open && setDetalhe(null)} noBodyStyles>
        <DrawerContent
          hideCloseButton
          overlayClassName="bg-[rgba(12,14,40,0.55)]"
          className="max-h-[90dvh] gap-0 overflow-y-auto rounded-t-[22px] border-0 bg-[#F5F6FA] p-0 pb-[calc(16px+env(safe-area-inset-bottom))]"
        >
          <div aria-hidden="true" className="mx-auto mt-3 h-1 w-10 rounded-full bg-[#D5D8E6]" />
          <div className="flex items-center justify-between px-4 pb-2 pt-3">
            <DrawerTitle className="text-lg font-bold text-[#0E1024]">Detalhes da empresa</DrawerTitle>
            <DrawerClose asChild>
              <button type="button" aria-label="Fechar" className="flex h-11 w-11 items-center justify-center rounded-xl text-[#4A5068]">
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </DrawerClose>
          </div>
          <div className="px-4">{detalhe && <CardEmpresaMobile empresa={detalhe} {...acoes(detalhe)} />}</div>
        </DrawerContent>
      </Drawer>

      {/* Cadastro / edição (formulário existente de empresa) */}
      <Dialog open={!!formulario} onOpenChange={(open) => !open && !salvando && setFormulario(null)}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogTitle className="sr-only">{formulario === 'nova' ? 'Cadastrar empresa' : 'Editar empresa'}</DialogTitle>
          {formulario && (
            <EmpresaForm
              onModal
              mode={formulario === 'nova' ? 'create' : 'edit'}
              initialData={formulario === 'nova' ? undefined : (formulario as unknown as Empresa)}
              userId={perfil.id}
              onSubmit={salvar}
              onCancel={() => setFormulario(null)}
              isLoading={salvando}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!excluir} onOpenChange={(open) => !open && setExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {excluir?.nomeNegocio}?</AlertDialogTitle>
            <AlertDialogDescription>
              A empresa deixa de aparecer no guia de Empresas da Onda. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={excluindo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={excluindo}
              className="bg-[#B42318] hover:bg-[#B42318]/90"
              onClick={(e) => {
                e.preventDefault();
                confirmarExclusao();
              }}
            >
              {excluindo ? 'Excluindo…' : 'Excluir empresa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
