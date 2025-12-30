'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Users, Filter } from 'lucide-react';
import GrupoCard from '@/components/grupos/grupo-card';
import GrupoCardsSkeleton from '@/components/grupos/grupo-cards-skeleton';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { HeaderPublic } from '@/components/header-public';
import { checkAuth, logout } from '@/app/actions';

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
    phone?: string;
  }[];
}

export default function GruposPublicPage() {
  const router = useRouter();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [filteredGrupos, setFilteredGrupos] = useState<Grupo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDia, setSelectedDia] = useState<string>('todos');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('todas');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function checkAuthentication() {
      try {
        const { isAuthenticated: auth, user } = await checkAuth();
        setIsAuthenticated(auth);
        if (auth && user) {
          setUserName(user.name);
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    }

    checkAuthentication();
  }, []);

  useEffect(() => {
    async function loadGrupos() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/grupos/public');
        
        if (!response.ok) {
          throw new Error('Erro ao carregar grupos');
        }

        const data = await response.json();
        setGrupos(data.grupos);
        setFilteredGrupos(data.grupos);
      } catch (error) {
        console.error('Erro ao carregar grupos:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar grupos. Tente novamente mais tarde.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadGrupos();
  }, [toast]);

  // Filtrar grupos quando os filtros mudarem
  useEffect(() => {
    let filtered = grupos;

    // Filtro por dia da semana
    if (selectedDia !== 'todos') {
      filtered = filtered.filter(grupo => grupo.diaSemana === selectedDia);
    }

    // Filtro por categoria
    if (selectedCategoria !== 'todas') {
      filtered = filtered.filter(grupo => grupo.categoria === selectedCategoria);
    }

    setFilteredGrupos(filtered);
  }, [grupos, selectedDia, selectedCategoria]);

  // Função para limpar filtros
  const clearFilters = () => {
    setSelectedDia('todos');
    setSelectedCategoria('todas');
  };

  const groupedByDay = filteredGrupos.reduce((acc, grupo) => {
    const day = grupo.diaSemana;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(grupo);
    return acc;
  }, {} as Record<string, Grupo[]>);

  // Obter categorias únicas para o filtro
  const availableCategories = Array.from(new Set(grupos.map(grupo => grupo.categoria)));
  
  // Obter dias únicos para o filtro
  const availableDays = Array.from(new Set(grupos.map(grupo => grupo.diaSemana)));

  const dayOrder = ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO'];
  const sortedDays = dayOrder.filter(day => groupedByDay[day]?.length > 0);

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

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isCheckingAuth) {
    return null; // Ou um loading spinner
  }

  return (
    <div className="min-h-screen">
      {isAuthenticated ? (
        <Header userId={userId} userName={userName} onLogout={handleLogout} />
      ) : (
        <HeaderPublic />
      )}
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-[72px]">
        {/* Intro */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Encontre seu Grupo Pequeno
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubra os grupos pequenos disponíveis e encontre o que mais se adequa ao seu perfil e disponibilidade.
          </p>
        </div>

        {/* Filtros */}
        <div className=" mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Filtro Dia da Semana */}
              <div className="min-w-[200px] ">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dia da Semana
                </label>
                <Select 
                  value={selectedDia} 
                  onChange={(e) => setSelectedDia(e.target.value)}
                  className="w-full max-w-full p-1 bg-white rounded-md border-gray-300 focus:border-gray-500 focus:ring-gray-500 "
                >
                  <option value="todos">Todos os dias</option>
                  {availableDays.map((dia) => (
                    <option key={dia} value={dia}>
                      {formatDiaSemana(dia)}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Filtro Categoria */}
              <div className="min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <Select 
                  value={selectedCategoria} 
                  onChange={(e) => setSelectedCategoria(e.target.value)}
                  className="w-full p-1 bg-white rounded-md border-gray-300 focus:border-gray-500 focus:ring-gray-500 "
                >
                  <option value="todas">Todas as categorias</option>
                  {availableCategories.map((categoria) => {
                    const categorias: { [key: string]: string } = {
                      HOMENS: 'Homens',
                      UNVT: 'UNVT',
                      MULHERES: 'Mulheres',
                      MISTO: 'Misto',
                      NEW: 'New',
                      CASAIS: 'Casais',
                    };
                    return (
                      <option key={categoria} value={categoria}>
                        {categorias[categoria] || categoria}
                      </option>
                    );
                  })}
                </Select>
              </div>
            </div>

            {/* Botão Limpar Filtros */}
            {(selectedDia !== 'todos' || selectedCategoria !== 'todas') && (
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="whitespace-nowrap"
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        </div>

        {/* Loading */}
        {isLoading ? (
          <GrupoCardsSkeleton />
        ) : grupos.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum grupo encontrado
            </h3>
            <p className="text-gray-600">
              Não há grupos cadastrados no momento. Volte mais tarde para conferir as novidades.
            </p>
          </div>
        ) : filteredGrupos.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum grupo encontrado com os filtros aplicados
            </h3>
            <p className="text-gray-600 mb-4">
              Tente ajustar os filtros para encontrar grupos que correspondam aos seus critérios.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {sortedDays.map((day) => (
              <div key={day}>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-1 h-8 bg-[#503387] rounded-full"></div>
                  {formatDiaSemana(day)}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedByDay[day].map((grupo) => (
                    <GrupoCard key={grupo.id} grupo={grupo} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer
      <div className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>
              Para mais informações sobre os grupos, entre em contato conosco.
            </p>
          </div>
        </div>
      </div> */}
    </div>
  );
} 