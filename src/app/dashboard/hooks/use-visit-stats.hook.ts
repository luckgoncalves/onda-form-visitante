import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getVisitStats } from '@/app/actions';
import { VisitStats } from '../types';

interface UseVisitStatsProps {
  startDate: Date;
  endDate: Date;
}

export function useVisitStats({ startDate, endDate }: UseVisitStatsProps) {
  const [stats, setStats] = useState<VisitStats[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<VisitStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      try {
        const formattedStartDate = format(startDate, 'yyyy-MM-dd');
        const formattedEndDate = format(endDate, 'yyyy-MM-dd');
        
        const data = await getVisitStats({
          startDate: formattedStartDate,
          endDate: formattedEndDate
        });

        // Format daily stats
        const formattedData = Object.entries(data).map(([date, counts]: [string, any]) => {
          const [year, month, day] = date.split('-');
          const formattedDate = `${day}/${month}/${year}`;
          
          return {
            date: formattedDate,
            'Sábado': counts['sabado'] || 0,
            'Domingo Manhã': counts['domingo-manha'] || 0,
            'Domingo Noite': counts['domingo-noite'] || 0,
            'Evento': counts['evento'] || 0,
            total: counts.total || 0
          };
        });

        // Format monthly stats
        const formattedMonthlyData = Object.entries(data)
          .reduce((acc: any, [date, counts]: [string, any]) => {
            const [year, month] = date.split('-');
            const monthYear = `${month}/${year}`;
            
            if (!acc[monthYear]) {
              acc[monthYear] = {
                'Sábado': 0,
                'Domingo Manhã': 0,
                'Domingo Noite': 0,
                'Evento': 0,
                total: 0
              };
            }

            acc[monthYear]['Sábado'] += counts['sabado'] || 0;
            acc[monthYear]['Domingo Manhã'] += counts['domingo-manha'] || 0;
            acc[monthYear]['Domingo Noite'] += counts['domingo-noite'] || 0;
            acc[monthYear]['Evento'] += counts['evento'] || 0;
            acc[monthYear].total += counts.total || 0;

            return acc;
          }, {});

        // Convert monthly data to array and sort
        const sortedMonthlyData = Object.entries(formattedMonthlyData)
          .map(([date, counts]: [string, any]) => ({
            date,
            ...counts
          }))
          .sort((a, b) => {
            const [monthA, yearA] = a.date.split('/');
            const [monthB, yearB] = b.date.split('/');
            return new Date(`${yearA}-${monthA}`).getTime() - new Date(`${yearB}-${monthB}`).getTime();
          });

        setStats(formattedData);
        setMonthlyStats(sortedMonthlyData);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, [startDate, endDate]);

  return {
    stats,
    monthlyStats,
    isLoading
  };
} 