import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CustomTooltip } from './CustomTooltip';
import { GenderStats, AgeStats } from '../types';

interface DemographicChartsProps {
  genderStats: GenderStats[];
  ageStats: AgeStats[];
}

export function DemographicCharts({ genderStats, ageStats }: DemographicChartsProps) {
  return (
    <>
      {/* Gender Distribution chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg">Distribuição por Gênero / Culto</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-4">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={genderStats}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 40
                }}
              >
                <XAxis 
                  dataKey="culto"
                  height={40}
                  tick={{ fontSize: 12 }}
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
                <Bar dataKey="Masculino" fill="#FFC857" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Feminino" fill="#9562DC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Age Distribution chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg">Distribuição por Idade / Culto</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-4">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={ageStats}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 40
                }}
              >
                <XAxis 
                  dataKey="range"
                  height={40}
                  tick={{ fontSize: 12 }}
                  stroke="#3F3F46"
                  style={{ fontWeight: 300 }}
                />
                <YAxis 
                  allowDecimals={false}
                  stroke="#3F3F46"
                  style={{ fontWeight: 300 }}
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Número de Visitantes', angle: -90, position: 'insideLeft', offset: 0 }}
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
    </>
  );
} 