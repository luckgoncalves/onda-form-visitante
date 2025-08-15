import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getGenderStats, getAgeStats } from '@/app/actions';
import { GenderStats, AgeStats } from '../types';

interface UseDemographicStatsProps {
  startDate: Date;
  endDate: Date;
}

export function useDemographicStats({ startDate, endDate }: UseDemographicStatsProps) {
  const [genderStats, setGenderStats] = useState<GenderStats[]>([]);
  const [ageStats, setAgeStats] = useState<AgeStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      try {
        const formattedStartDate = format(startDate, 'yyyy-MM-dd');
        const formattedEndDate = format(endDate, 'yyyy-MM-dd');
        
        // Fetch gender stats
        const genderData = await getGenderStats({
          startDate: formattedStartDate,
          endDate: formattedEndDate
        });

        const formattedGenderData = [
          {
            culto: 'Sábado',
            Masculino: genderData.sabado?.masculino || 0,
            Feminino: genderData.sabado?.feminino || 0,
            total: (genderData.sabado?.masculino || 0) + (genderData.sabado?.feminino || 0)
          },
          {
            culto: 'Domingo Manhã',
            Masculino: genderData['domingo-manha']?.masculino || 0,
            Feminino: genderData['domingo-manha']?.feminino || 0,
            total: (genderData['domingo-manha']?.masculino || 0) + (genderData['domingo-manha']?.feminino || 0)
          },
          {
            culto: 'Domingo Noite',
            Masculino: genderData['domingo-noite']?.masculino || 0,
            Feminino: genderData['domingo-noite']?.feminino || 0,
            total: (genderData['domingo-noite']?.masculino || 0) + (genderData['domingo-noite']?.feminino || 0)
          }
        ];

        // Fetch age stats
        const ageData = await getAgeStats({
          startDate: formattedStartDate,
          endDate: formattedEndDate
        });

        setGenderStats(formattedGenderData);
        setAgeStats(ageData);
      } catch (error) {
        console.error('Erro ao carregar estatísticas demográficas:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, [startDate, endDate]);

  return {
    genderStats,
    ageStats,
    isLoading
  };
} 