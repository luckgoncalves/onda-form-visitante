import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CustomTooltip } from './CustomTooltip';
import { GenderStats, AgeStats } from '../types';

const palette = {
  masculine: '#00205b',
  feminine: '#24cead',
  sabado: '#00205b',
  domingoManha: '#24cead',
  domingoNoite: '#32add8',
  evento: '#24cead',
  new: '#c9ced6',
  axis: '#444444',
};

interface DemographicChartsProps {
  genderStats: GenderStats[];
  ageStats: AgeStats[];
}

export function DemographicCharts({ genderStats, ageStats }: DemographicChartsProps) {
  return (
    <>
      {/* Gender Distribution chart */}
      <Card className="bg-[#f4f4f4] border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg text-[#161616]">Distribuição por Gênero / Culto</CardTitle>
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
                  tick={{ fontSize: 12, fill: palette.axis }}
                  stroke={palette.axis}
                  style={{ fontWeight: 300 }}
                />
                <YAxis 
                  allowDecimals={false}
                  stroke={palette.axis}
                  style={{ fontWeight: 300 }}
                  tick={{ fontSize: 11, fill: palette.axis }}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                />
                <Legend 
                  wrapperStyle={{ 
                    fontSize: '12px',
                    paddingTop: '15px',
                    color: palette.axis
                  }}
                />
                <Bar dataKey="Masculino" fill={palette.masculine} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Feminino" fill={palette.feminine} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Age Distribution chart */}
      <Card className="bg-[#f4f4f4] border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg text-[#161616]">Distribuição por Idade / Culto</CardTitle>
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
                  tick={{ fontSize: 12, fill: palette.axis }}
                  stroke={palette.axis}
                  style={{ fontWeight: 300 }}
                />
                <YAxis 
                  allowDecimals={false}
                  stroke={palette.axis}
                  style={{ fontWeight: 300 }}
                  tick={{ fontSize: 11, fill: palette.axis }}
                  label={{ value: 'Número de Visitantes', angle: -90, position: 'insideLeft', offset: 0, fill: palette.axis }}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                />
                <Legend 
                  wrapperStyle={{ 
                    fontSize: '12px',
                    paddingTop: '15px',
                    color: palette.axis
                  }}
                />
                <Bar dataKey="Sábado" fill={palette.sabado} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Domingo Manhã" fill={palette.domingoManha} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Domingo Noite" fill={palette.domingoNoite} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Evento" fill={palette.evento} radius={[4, 4, 0, 0]} />
                <Bar dataKey="New" fill={palette.new} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  );
} 