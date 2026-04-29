'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Loader2, Plus, Search, Tag, Trash2 } from 'lucide-react';
import { checkAuth, checkIsAdmin, logout } from '@/app/actions';
import { Header } from '@/components/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

type Etiqueta = {
  id: string;
  nome: string;
  cor: string;
};

type EtiquetaForm = {
  nome: string;
  cor: string;
};

const initialForm: EtiquetaForm = {
  nome: '',
  cor: '#0f766e',
};

export default function EtiquetasPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [campusNome, setCampusNome] = useState<string | null>(null);
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEtiqueta, setEditingEtiqueta] = useState<Etiqueta | null>(null);
  const [deleteEtiquetaId, setDeleteEtiquetaId] = useState<string | null>(null);
  const [form, setForm] = useState<EtiquetaForm>(initialForm);

  const filteredEtiquetas = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    if (!normalizedSearch) {
      return etiquetas;
    }

    return etiquetas.filter((etiqueta) =>
      etiqueta.nome.toLowerCase().includes(normalizedSearch)
    );
  }, [etiquetas, searchQuery]);

  const fetchEtiquetas = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/etiquetas');

      if (!response.ok) {
        throw new Error('Erro ao buscar etiquetas');
      }

      const data = await response.json();
      setEtiquetas(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as etiquetas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    async function checkAuthentication() {
      const { isAuthenticated, user } = await checkAuth();
      const { isAdmin } = await checkIsAdmin();

      if (!isAuthenticated || !user) {
        router.push('/');
        return;
      }

      if (!isAdmin) {
        router.push('/list');
        return;
      }

      setUserName(user.name);
      setUserId(user.id);
      setCampusNome(user.campusNome || null);
      await fetchEtiquetas();
    }

    checkAuthentication();
  }, [fetchEtiquetas, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const openCreateDialog = () => {
    setEditingEtiqueta(null);
    setForm(initialForm);
    setIsDialogOpen(true);
  };

  const openEditDialog = (etiqueta: Etiqueta) => {
    setEditingEtiqueta(etiqueta);
    setForm({
      nome: etiqueta.nome,
      cor: etiqueta.cor,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.nome.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Informe um nome para a etiqueta',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);
      const url = editingEtiqueta ? `/api/etiquetas/${editingEtiqueta.id}` : '/api/etiquetas';
      const response = await fetch(url, {
        method: editingEtiqueta ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar etiqueta');
      }

      toast({
        title: 'Sucesso',
        description: editingEtiqueta ? 'Etiqueta atualizada com sucesso' : 'Etiqueta criada com sucesso',
      });

      setIsDialogOpen(false);
      setEditingEtiqueta(null);
      setForm(initialForm);
      await fetchEtiquetas();
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Não foi possível salvar a etiqueta',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteEtiquetaId) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/etiquetas/${deleteEtiquetaId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao excluir etiqueta');
      }

      toast({
        title: 'Sucesso',
        description: 'Etiqueta excluída com sucesso',
      });

      setEtiquetas((prev) => prev.filter((etiqueta) => etiqueta.id !== deleteEtiquetaId));
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Não foi possível excluir a etiqueta',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteEtiquetaId(null);
    }
  };

  return (
    <>
      <Header userId={userId} userName={userName} campusNome={campusNome} onLogout={handleLogout} />

      <div className="p-4 sm:p-6 mt-[72px]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Etiquetas</h1>
            <p className="text-gray-500 mt-1">
              Cadastre etiquetas para categorizar os visitantes do seu campus
            </p>
          </div>
          <Button
            onClick={openCreateDialog}
            className="bg-onda-darkBlue hover:bg-onda-darkBlue/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Etiqueta
          </Button>
        </div>

        <div className="flex gap-2 mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Buscar etiquetas..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
            ))}
          </div>
        ) : filteredEtiquetas.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Tag className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Nenhuma etiqueta encontrada
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'Tente alterar a busca' : 'Comece criando a primeira etiqueta do campus'}
            </p>
            {!searchQuery && (
              <Button
                onClick={openCreateDialog}
                className="bg-onda-darkBlue hover:bg-onda-darkBlue/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Etiqueta
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredEtiquetas.map((etiqueta) => (
              <Card key={etiqueta.id}>
                <CardContent className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-10 w-10 rounded-full border"
                      style={{ backgroundColor: etiqueta.cor }}
                      aria-hidden="true"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">{etiqueta.nome}</div>
                      <div className="text-sm text-gray-500">{etiqueta.cor}</div>
                    </div>
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: etiqueta.cor,
                        color: etiqueta.cor,
                      }}
                    >
                      Prévia
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(etiqueta)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => setDeleteEtiquetaId(etiqueta.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEtiqueta ? 'Editar etiqueta' : 'Nova etiqueta'}</DialogTitle>
            <DialogDescription>
              Defina o nome e a cor que serão usados para identificar visitantes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={form.nome}
                onChange={(event) => setForm((prev) => ({ ...prev, nome: event.target.value }))}
                placeholder="Ex: Discipulado"
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cor">Cor</Label>
              <div className="flex gap-3">
                <Input
                  id="cor"
                  type="color"
                  value={form.cor}
                  onChange={(event) => setForm((prev) => ({ ...prev, cor: event.target.value }))}
                  className="h-10 w-16 p-1"
                />
                <Input
                  value={form.cor}
                  onChange={(event) => setForm((prev) => ({ ...prev, cor: event.target.value }))}
                  placeholder="#0f766e"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-onda-darkBlue hover:bg-onda-darkBlue/90"
            >
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteEtiquetaId} onOpenChange={() => setDeleteEtiquetaId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir etiqueta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta etiqueta será removida dos visitantes vinculados. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
