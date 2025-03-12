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
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-muted-foreground">Total de Visitas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalVisits}</div>
        </CardContent>
      </Card>

      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-muted-foreground">Média por Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageVisitsPerDay.toFixed(1)}</div>
        </CardContent>
      </Card>

      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-muted-foreground">Dias com Visitas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.daysWithVisits}</div>
        </CardContent>
      </Card>
    </div>
  );
} 