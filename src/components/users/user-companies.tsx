'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Building2, X, Search } from 'lucide-react';
import EmpresaCard from '@/components/empresas/empresa-card';
import EmpresaForm from '@/components/empresas/empresa-form';
import { EmpresasGridSkeleton } from '@/components/empresas/empresa-skeleton';
import { Empresa, UserEmpresasResponse } from '@/types/empresa';
import { EmpresaFormData } from '@/lib/validations/empresa';
import ButtonForm from '@/components/button-form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UserCompaniesProps {
  userId: string;
  currentUser: { id: string; role: string } | null;
}

interface AvailableCompany {
  id: string;
  nomeNegocio: string;
  ramoAtuacao: string;
  detalhesServico: string;
  email: string;
  usuarios: Array<{
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

interface CompaniesListResponse {
  empresas: AvailableCompany[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function UserCompanies({ userId, currentUser }: UserCompaniesProps) {
  const { toast } = useToast();
  
  const [user, setUser] = useState<{ id: string; name: string; email: string; phone?: string | null } | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [availableCompanies, setAvailableCompanies] = useState<AvailableCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUserEmpresas();
  }, [userId]);

  useEffect(() => {
    if (isAddDialogOpen) {
      fetchAvailableCompanies();
    }
  }, [isAddDialogOpen, userId]);

  const fetchUserEmpresas = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${userId}/empresas`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar empresas do usuário');
      }

      const data: UserEmpresasResponse = await response.json();
      setUser(data.user);
      setEmpresas(data.empresas);

    } catch (error) {
      console.error('Erro ao buscar empresas do usuário:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar empresas do usuário',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableCompanies = async () => {
    try {
      setIsLoadingAvailable(true);
      const response = await fetch('/api/empresas?limit=100');
      
      if (!response.ok) {
        throw new Error('Erro ao buscar empresas disponíveis');
      }

      const data: CompaniesListResponse = await response.json();
      
      // Filtrar empresas que o usuário ainda não possui
      const userCompanyIds = empresas.map(e => e.id);
      const filtered = data.empresas.filter(company => !userCompanyIds.includes(company.id));
      
      setAvailableCompanies(filtered);

    } catch (error) {
      console.error('Erro ao buscar empresas disponíveis:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar empresas disponíveis',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingAvailable(false);
    }
  };

  const handleCreateEmpresa = async (data: EmpresaFormData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/empresas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          userId: userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar empresa');
      }

      toast({
        title: 'Sucesso',
        description: 'Empresa criada com sucesso!',
      });

      setIsDialogOpen(false);
      fetchUserEmpresas();

    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar empresa',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEmpresa = async (data: EmpresaFormData) => {
    if (!editingEmpresa) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/empresas/${editingEmpresa.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar empresa');
      }

      toast({
        title: 'Sucesso',
        description: 'Empresa atualizada com sucesso!',
      });

      setIsDialogOpen(false);
      setEditingEmpresa(null);
      fetchUserEmpresas();

    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar empresa',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmpresa = async (empresaId: string) => {
    try {
      const response = await fetch(`/api/empresas/${empresaId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar empresa');
      }

      toast({
        title: 'Sucesso',
        description: 'Empresa deletada com sucesso!',
      });

      fetchUserEmpresas();

    } catch (error) {
      console.error('Erro ao deletar empresa:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao deletar empresa',
        variant: 'destructive',
      });
    }
  };

  const handleAddExistingCompany = async (empresaId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/empresas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ empresaId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao adicionar empresa');
      }

      toast({
        title: 'Sucesso',
        description: 'Empresa adicionada ao usuário com sucesso!',
      });

      setIsAddDialogOpen(false);
      fetchUserEmpresas();

    } catch (error) {
      console.error('Erro ao adicionar empresa:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao adicionar empresa',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveCompany = async (empresaId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/empresas?empresaId=${empresaId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao remover empresa');
      }

      toast({
        title: 'Sucesso',
        description: 'Empresa removida do usuário com sucesso!',
      });

      fetchUserEmpresas();

    } catch (error) {
      console.error('Erro ao remover empresa:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover empresa',
        variant: 'destructive',
      });
    }
  };

  const handleEditClick = (empresa: Empresa) => {
    setEditingEmpresa(empresa);
    setIsDialogOpen(true);
  };

  const handleNewClick = () => {
    setEditingEmpresa(null);
    setIsDialogOpen(true);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setEditingEmpresa(null);
  };

  const filteredAvailableCompanies = availableCompanies.filter(company =>
    company.nomeNegocio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.ramoAtuacao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-2 w-full sm:w-auto">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Adicionar Empresa Existente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar empresas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {isLoadingAvailable ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="animate-pulse space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredAvailableCompanies.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'Nenhuma empresa encontrada' : 'Nenhuma empresa disponível'}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredAvailableCompanies.map((company) => (
                      <Card key={company.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{company.nomeNegocio}sadas</h4>
                              <p className="text-sm text-muted-foreground truncate">{company.ramoAtuacao}  ddasdas</p>
                              <p className="text-xs text-muted-foreground truncate">{company.email}</p>
                              {company.usuarios.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {company.usuarios.slice(0, 2).map((userEmpresa) => (
                                    <Badge key={userEmpresa.user.id} variant="secondary" className="text-xs">
                                      {userEmpresa.user.name}
                                    </Badge>
                                  ))}
                                  {company.usuarios.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{company.usuarios.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleAddExistingCompany(company.id)}
                              className="ml-2 flex-shrink-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen}  onOpenChange={setIsDialogOpen}>
            {empresas.length > 0 && (
            <DialogTrigger asChild>
              <ButtonForm 
                label="Nova Empresa"
                icon={<Plus className="h-4 w-4 mr-2" />}
                onClick={handleNewClick}
                // size="sm"
              />
              </DialogTrigger>
            )}
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <EmpresaForm
                onModal={true}
                mode={editingEmpresa ? 'edit' : 'create'}
                initialData={editingEmpresa || undefined}
                userId={userId}
                onSubmit={editingEmpresa ? handleEditEmpresa : handleCreateEmpresa}
                onCancel={handleCancel}
                isLoading={isSubmitting}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Grid de Empresas */}
      {isLoading ? (
        <EmpresasGridSkeleton count={6} />
      ) : empresas.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            Este usuário ainda não possui empresas associadas.
          </p>
          <div className="space-x-2">
            <Button onClick={handleNewClick} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Criar Nova Empresa
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {empresas.map((empresa) => (
            <div key={empresa.id} className="relative">
              <EmpresaCard
                empresa={empresa}
                onEdit={handleEditClick}
                onDelete={handleDeleteEmpresa}
                showActions={true}
                showOwner={false}
                currentUser={currentUser}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
