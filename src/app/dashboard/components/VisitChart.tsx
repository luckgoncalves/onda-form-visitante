import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CustomTooltip } from './CustomTooltip';
import { VisitStats } from '../types';

interface VisitChartProps {
  data: VisitStats[];
  title: string;
  xAxisAngle?: number;
  xAxisHeight?: number;
}

export function VisitChart({ data, title, xAxisAngle = -45, xAxisHeight = 60 }: VisitChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-4">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data}
              margin={{
                top: 20,
                right: 10,
                left: 0,
                bottom: xAxisHeight
              }}
            >
              <XAxis 
                dataKey="date"
                height={xAxisHeight}
                angle={xAxisAngle}
                interval={0}
                textAnchor="end"
                tick={{ fontSize: 11 }}
                stroke="#3F3F46"
                style={{ fontWeight: 300 }}
              />
              <YAxis 
                allowDecimals={false} 
                stroke="#3F3F46"
                style={{ fontWeight: 300 }}
                tick={{ fontSize: 11 }}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              <Legend 
                wrapperStyle={{ 
                  fontSize: '12px',
                  paddingTop: '15px'
                }}
              />
              <Bar dataKey="Sábado" fill="#9562DC" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Domingo Manhã" fill="#FFC857" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Domingo Noite" fill="#B09FF3" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 