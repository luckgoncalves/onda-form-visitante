'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, GripVertical, X } from 'lucide-react';

type TipoCampo = 'TEXTO' | 'TEXTAREA' | 'SELECT' | 'MULTISELECT' | 'ANEXO';

interface Campo {
  id: string;
  label: string;
  tipo: TipoCampo;
  opcoes: string[] | null;
  obrigatorio: boolean;
  ordem: number;
}

interface CamposEditorProps {
  ministerioId: string;
  ministerioNome: string;
}

const TIPOS: { value: TipoCampo; label: string }[] = [
  { value: 'TEXTO', label: 'Texto curto' },
  { value: 'TEXTAREA', label: 'Texto longo' },
  { value: 'SELECT', label: 'Seleção única' },
  { value: 'MULTISELECT', label: 'Múltipla escolha' },
  { value: 'ANEXO', label: 'Anexo / Foto' },
];

export default function CamposEditor({ ministerioId, ministerioNome }: CamposEditorProps) {
  const [campos, setCampos] = useState<Campo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Form state para novo campo
  const [novoLabel, setNovoLabel] = useState('');
  const [novoTipo, setNovoTipo] = useState<TipoCampo>('TEXTO');
  const [novoObrigatorio, setNovoObrigatorio] = useState(false);
  const [novasOpcoes, setNovasOpcoes] = useState<string[]>([]);
  const [novaOpcaoInput, setNovaOpcaoInput] = useState('');

  useEffect(() => {
    fetchCampos();
  }, [ministerioId]);

  const fetchCampos = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/ministerios/${ministerioId}/campos`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCampos(data);
    } catch {
      toast({ title: 'Erro', description: 'Erro ao carregar campos', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOpcao = () => {
    const trimmed = novaOpcaoInput.trim();
    if (!trimmed || novasOpcoes.includes(trimmed)) return;
    setNovasOpcoes((prev) => [...prev, trimmed]);
    setNovaOpcaoInput('');
  };

  const handleRemoveOpcao = (opcao: string) => {
    setNovasOpcoes((prev) => prev.filter((o) => o !== opcao));
  };

  const handleSaveCampo = async () => {
    if (!novoLabel.trim()) {
      toast({ title: 'Erro', description: 'Informe o nome do campo', variant: 'destructive' });
      return;
    }
    if ((novoTipo === 'SELECT' || novoTipo === 'MULTISELECT') && novasOpcoes.length < 2) {
      toast({ title: 'Erro', description: 'Adicione pelo menos 2 opções', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/ministerios/${ministerioId}/campos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: novoLabel.trim(),
          tipo: novoTipo,
          opcoes: ['SELECT', 'MULTISELECT'].includes(novoTipo) ? novasOpcoes : null,
          obrigatorio: novoObrigatorio,
        }),
      });
      if (!res.ok) throw new Error();
      toast({ title: 'Sucesso', description: 'Campo adicionado!' });
      setNovoLabel('');
      setNovoTipo('TEXTO');
      setNovoObrigatorio(false);
      setNovasOpcoes([]);
      setNovaOpcaoInput('');
      setShowForm(false);
      fetchCampos();
    } catch {
      toast({ title: 'Erro', description: 'Erro ao salvar campo', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCampo = async (campoId: string) => {
    try {
      const res = await fetch(`/api/ministerios/${ministerioId}/campos/${campoId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();
      toast({ title: 'Sucesso', description: 'Campo removido' });
      fetchCampos();
    } catch {
      toast({ title: 'Erro', description: 'Erro ao remover campo', variant: 'destructive' });
    }
  };

  const tipoLabel = (tipo: TipoCampo) => TIPOS.find((t) => t.value === tipo)?.label ?? tipo;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Lista de campos existentes */}
      {campos.length === 0 && !showForm ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Nenhum campo personalizado. Adicione campos para customizar o formulário deste ministério.
        </div>
      ) : (
        <div className="space-y-2">
          {campos.map((campo) => (
            <div
              key={campo.id}
              className="flex items-start gap-3 p-3 border rounded-md bg-white"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{campo.label}</span>
                  <span className="text-xs text-muted-foreground bg-gray-100 px-1.5 py-0.5 rounded">
                    {tipoLabel(campo.tipo)}
                  </span>
                  {campo.obrigatorio && (
                    <span className="text-xs text-red-600 font-medium">Obrigatório</span>
                  )}
                </div>
                {campo.opcoes && campo.opcoes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {campo.opcoes.map((op) => (
                      <span key={op} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                        {op}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-500 hover:text-red-600 shrink-0"
                onClick={() => handleDeleteCampo(campo.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Formulário de novo campo */}
      {showForm ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Novo Campo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Nome do campo</label>
              <Input
                placeholder="Ex: Tipo de material"
                value={novoLabel}
                onChange={(e) => setNovoLabel(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Tipo</label>
              <select
                value={novoTipo}
                onChange={(e) => setNovoTipo(e.target.value as TipoCampo)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {(novoTipo === 'SELECT' || novoTipo === 'MULTISELECT') && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Opções</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite uma opção e pressione Enter"
                    value={novaOpcaoInput}
                    onChange={(e) => setNovaOpcaoInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddOpcao(); } }}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleAddOpcao}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {novasOpcoes.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {novasOpcoes.map((op) => (
                      <span key={op} className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full">
                        {op}
                        <button onClick={() => handleRemoveOpcao(op)}>
                          <X className="h-3 w-3 text-gray-500" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="obrigatorio"
                checked={novoObrigatorio}
                onChange={(e) => setNovoObrigatorio(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="obrigatorio" className="text-sm font-medium cursor-pointer">
                Campo obrigatório
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleSaveCampo} disabled={saving}>
                {saving ? 'Salvando...' : 'Adicionar Campo'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Campo
        </Button>
      )}
    </div>
  );
}
