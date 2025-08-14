'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { checkAuth } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import ButtonForm from '@/components/button-form';
import GruposTableSkeleton from '@/components/grupos/grupos-table-skeleton';

interface Grupo {
  id: string;
  nome: string;
  categoria: string;
  diaSemana: string;
  horario: string;
  bairro?: {
    id: string;
    nome: string;
  };
  lideres: {
    id: string;
    name: string;
    email: string;
  }[];
  createdAt: string;
}

export default function GruposPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function initializeData() {
      try {
        // Verificar autenticação
        const { user } = await checkAuth();
        if (!user) {
          router.push('/');
          return;
        }
        setUserName(user.name);

        // Carregar grupos
        await loadGrupos();
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar dados iniciais',
          variant: 'destructive',
        });
      }
    }

    initializeData();
  }, [router, toast]);

  const loadGrupos = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/grupos');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar grupos');
      }

      const data = await response.json();
      setGrupos(data.grupos);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar grupos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGrupo = async (id: string) => {
    try {
      const response = await fetch(`/api/grupos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao remover grupo');
      }

      toast({
        title: 'Sucesso',
        description: 'Grupo removido com sucesso!',
      });

      // Recarregar a lista
      await loadGrupos();
    } catch (error) {
      console.error('Erro ao remover grupo:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover grupo',
        variant: 'destructive',
      });
    }
  };

  const formatCategoria = (categoria: string) => {
    const categorias: { [key: string]: string } = {
      HOMENS: 'Homens',
      UNVT: 'UNVT',
      MULHERES: 'Mulheres',
      MISTO: 'Misto',
      NEW: 'New',
      CASAIS: 'Casais',
    };
    return categorias[categoria] || categoria;
  };

  const formatDiaSemana = (dia: string) => {
    const dias: { [key: string]: string } = {
      SEGUNDA: 'Segunda-feira',
      TERCA: 'Terça-feira',
      QUARTA: 'Quarta-feira',
      QUINTA: 'Quinta-feira',
      SEXTA: 'Sexta-feira',
      SABADO: 'Sábado',
      DOMINGO: 'Domingo',
    };
    return dias[dia] || dia;
  };

  const formatHorario = (horario: string) => {
    // Se já está no formato HH:MM, retorna como está
    if (horario.includes(':')) {
      return horario;
    }
    // Caso contrário, formata como HH:MM
    return horario.length === 4 ? `${horario.slice(0, 2)}:${horario.slice(2)}` : horario;
  };

  return (
    <>
      <div className="p-2 sm:p-6">
        {isLoading ? (
          <GruposTableSkeleton />
        ) : (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>GP&apos;s</CardTitle>
                  <CardDescription>
                    Gerencie os grupos pequenos
                  </CardDescription>
                </div>
                <ButtonForm onClick={() => router.push('/dashboard/grupos/new')} label={`Novo GP`} icon={<Plus size={20} />} />
              </div>
            </CardHeader>
            
            <CardContent>
              {grupos.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">Nenhum GP encontrado</div>
                  <Button onClick={() => router.push('/dashboard/grupos/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro GP
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">Nome</th>
                        <th className="text-left p-4 font-medium">Categoria</th>
                        <th className="text-left p-4 font-medium">Dia da Semana</th>
                        <th className="text-left p-4 font-medium">Horário</th>
                        <th className="text-left p-4 font-medium">Bairro</th>
                        <th className="text-left p-4 font-medium">Líderes</th>
                        <th className="text-left p-4 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grupos.map((grupo) => (
                        <tr key={grupo.id} className="border-b hover:bg-gray-50">
                          <td className="p-4 font-medium">{grupo.nome}</td>
                          <td className="p-4">
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {formatCategoria(grupo.categoria)}
                            </span>
                          </td>
                          <td className="p-4">{formatDiaSemana(grupo.diaSemana)}</td>
                          <td className="p-4">{formatHorario(grupo.horario)}</td>
                          <td className="p-4">
                            {grupo.bairro ? grupo.bairro.nome : '-'}
                          </td>
                          <td className="p-4">
                            {grupo.lideres.length > 0 ? (
                              <div className="space-y-1">
                                {grupo.lideres.map((lider) => (
                                  <div key={lider.id} className="text-sm">
                                    {lider.name}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/dashboard/grupos/${grupo.id}/edit`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja remover este grupo? Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteGrupo(grupo.id)}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Remover
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
} 