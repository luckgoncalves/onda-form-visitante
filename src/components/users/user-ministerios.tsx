'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Church, Plus, Search, Trash2, ExternalLink } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface MinisterioDoUsuario {
  id: string;
  nome: string;
  descricao?: string;
  papel: 'Líder' | 'Co-Líder' | 'Membro';
  lider: { id: string; name: string };
  coLider?: { id: string; name: string } | null;
}

interface MinisterioDisponivel {
  id: string;
  nome: string;
  descricao?: string;
  lider: { id: string; name: string };
  membros: { userId: string }[];
}

interface UserMinisteriosProps {
  userId: string;
}

const papelColors: Record<string, string> = {
  Líder: 'bg-amber-100 text-amber-800',
  'Co-Líder': 'bg-blue-100 text-blue-800',
  Membro: 'bg-gray-100 text-gray-700',
};

export default function UserMinisterios({ userId }: UserMinisteriosProps) {
  const { toast } = useToast();

  const [ministerios, setMinisterios] = useState<MinisterioDoUsuario[]>([]);
  const [disponiveis, setDisponiveis] = useState<MinisterioDisponivel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDisponiveis, setIsLoadingDisponiveis] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState<string | null>(null);

  useEffect(() => {
    fetchMinisterios();
  }, [userId]);

  useEffect(() => {
    if (isDialogOpen) fetchDisponiveis();
  }, [isDialogOpen]);

  const fetchMinisterios = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${userId}/ministerios`);
      if (!response.ok) throw new Error('Erro ao buscar ministérios');
      const data = await response.json();
      setMinisterios(data.ministerios);
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro', description: 'Erro ao carregar ministérios', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDisponiveis = async () => {
    try {
      setIsLoadingDisponiveis(true);
      const response = await fetch('/api/ministerios?limit=100');
      if (!response.ok) throw new Error();
      const data = await response.json();

      // Excluir os que o usuário já está (como membro, líder ou co-líder)
      const vinculadosIds = ministerios.map((m) => m.id);
      setDisponiveis(data.ministerios.filter((m: MinisterioDisponivel) => !vinculadosIds.includes(m.id)));
    } catch {
      toast({ title: 'Erro', description: 'Erro ao carregar ministérios disponíveis', variant: 'destructive' });
    } finally {
      setIsLoadingDisponiveis(false);
    }
  };

  const handleAdd = async (ministerioId: string) => {
    setIsAdding(ministerioId);
    try {
      const response = await fetch(`/api/users/${userId}/ministerios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ministerioId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao vincular ministério');
      }

      toast({ title: 'Sucesso', description: 'Membro adicionado ao ministério!' });
      setIsDialogOpen(false);
      fetchMinisterios();
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao vincular ministério',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(null);
    }
  };

  const handleRemove = async (ministerioId: string) => {
    try {
      const response = await fetch(
        `/api/users/${userId}/ministerios?ministerioId=${ministerioId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Erro ao remover do ministério');

      toast({ title: 'Sucesso', description: 'Membro removido do ministério!' });
      fetchMinisterios();
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao remover do ministério', variant: 'destructive' });
    }
  };

  const filtrados = disponiveis.filter(
    (m) =>
      m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.lider.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {ministerios.length} ministério{ministerios.length !== 1 ? 's' : ''} vinculado{ministerios.length !== 1 ? 's' : ''}
        </p>
        <Button size="sm" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Vincular Ministério
        </Button>
      </div>

      {/* Lista de ministérios do usuário */}
      {ministerios.length === 0 ? (
        <div className="text-center py-12">
          <Church className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Este membro não está vinculado a nenhum ministério.</p>
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Vincular Ministério
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {ministerios.map((ministerio) => (
            <Card key={ministerio.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium">{ministerio.nome}</h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${papelColors[ministerio.papel]}`}
                      >
                        {ministerio.papel}
                      </span>
                    </div>
                    {ministerio.descricao && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {ministerio.descricao}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Líder: {ministerio.lider.name}
                      {ministerio.coLider && ` · Co-líder: ${ministerio.coLider.name}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        (window.location.href = `/dashboard/ministerios/${ministerio.id}/edit`)
                      }
                      title="Ir para o ministério"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>

                    {/* Só permite remover se for membro (não líder/co-líder) */}
                    {ministerio.papel === 'Membro' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover do ministério</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover este membro de &quot;{ministerio.nome}&quot;?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemove(ministerio.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para vincular a um ministério existente */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Vincular a um Ministério</DialogTitle>
          </DialogHeader>

          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar ministério..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="overflow-y-auto flex-1 space-y-2 pr-1">
            {isLoadingDisponiveis ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="space-y-2 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filtrados.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {searchTerm ? 'Nenhum ministério encontrado' : 'Não há ministérios disponíveis para vincular'}
              </div>
            ) : (
              filtrados.map((ministerio) => (
                <Card key={ministerio.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{ministerio.nome}</p>
                        <p className="text-sm text-muted-foreground">Líder: {ministerio.lider.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {ministerio.membros.length} membro{ministerio.membros.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAdd(ministerio.id)}
                        disabled={isAdding === ministerio.id}
                        className="flex-shrink-0"
                      >
                        {isAdding === ministerio.id ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
