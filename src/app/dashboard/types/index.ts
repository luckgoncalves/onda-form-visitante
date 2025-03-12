export interface VisitStats {
  date: string;
  'Sábado': number;
  'Domingo Manhã': number;
  'Domingo Noite': number;
  total: number;
}

export interface GenderStats {
  culto: string;
  Masculino: number;
  Feminino: number;
  total: number;
}

export interface AgeStats {
  range: string;
  'Sábado': number;
  'Domingo Manhã': number;
  'Domingo Noite': number;
}

export interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export interface DashboardStats {
  totalVisits: number;
  averageVisitsPerDay: number;
  daysWithVisits: number;
} 