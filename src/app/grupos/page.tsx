'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Users } from 'lucide-react';
import GrupoCard from '@/components/grupos/grupo-card';
import GrupoCardsSkeleton from '@/components/grupos/grupo-cards-skeleton';

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
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadGrupos() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/grupos/public');
        
        if (!response.ok) {
          throw new Error('Erro ao carregar grupos');
        }

        const data = await response.json();
        console.log(data);
        setGrupos(data.grupos);
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

  const groupedByDay = grupos.reduce((acc, grupo) => {
    const day = grupo.diaSemana;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(grupo);
    return acc;
  }, {} as Record<string, Grupo[]>);

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

  return (
    <div className="min-h-screen">
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intro */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Encontre seu Grupo Pequeno
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubra os grupos pequenos disponíveis e encontre o que mais se adequa ao seu perfil e disponibilidade.
          </p>
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