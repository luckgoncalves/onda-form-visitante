import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from '../types';
import { CardSkeleton } from "@/components/dashboard/skeleton";

interface StatsCardsProps {
  stats: DashboardStats;
  isLoading: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      <Card className="h-full bg-[#f4f4f4] border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-[#c9ced6] uppercase tracking-wide">
            Total de Visitas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-[#161616]">{stats.totalVisits}</div>
        </CardContent>
      </Card>

      <Card className="h-full bg-[#f4f4f4] border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-[#c9ced6] uppercase tracking-wide">
            Média por Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-[#161616]">{stats.averageVisitsPerDay.toFixed(1)}</div>
        </CardContent>
      </Card>

      <Card className="h-full bg-[#f4f4f4] border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-[#c9ced6] uppercase tracking-wide">
            Dias com Visitas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-[#161616]">{stats.daysWithVisits}</div>
        </CardContent>
      </Card>
    </div>
  );
} 