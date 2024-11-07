'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getVisitStats } from "../actions";
import { formatCulto } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { checkAuth } from "../actions";
import { useRouter } from "next/navigation";
import { DatePicker } from "@/components/ui/DatePicker";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { Header } from "@/components/header";
import { logout } from "../actions";

// Add this custom tooltip component before the Dashboard function
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
    
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border">
        <p className="font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="flex items-center gap-2 text-gray-500">
            <span 
              className="inline-block w-3 h-3 rounded-[2px]" 
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}: {entry.value}
          </p>
        ))}
        <p className="font-medium mt-2 border-t pt-2">
          Total: {total}
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));
  const [userName, setUserName] = useState("");
  const [monthlyStats, setMonthlyStats] = useState<any>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function checkAuthentication() {
      const { isAuthenticated, user } = await checkAuth();
      if (!isAuthenticated) {
        router.push('/');
      } else if (user) {
        setUserName(user.name);
      }
    }
    checkAuthentication();
  }, [router]);

  useEffect(() => {
    async function fetchStats() {
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      const data = await getVisitStats({
        startDate: formattedStartDate,
        endDate: formattedEndDate
      });

      const formattedData = Object.entries(data).map(([date, counts]: [string, any]) => {
        const [year, month, day] = date.split('-');
        const formattedDate = `${day}/${month}/${year}`;
        
        return {
          date: formattedDate,
          'Sábado': counts['sabado'] || 0,
          'Domingo Manhã': counts['domingo-manha'] || 0,
          'Domingo Noite': counts['domingo-noite'] || 0,
          total: counts.total || 0
        };
      });


      setStats(formattedData);
      setLoading(false);
    }
    fetchStats();
  }, [startDate, endDate]);

  useEffect(() => {
    async function fetchMonthlyStats() {
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      const data = await getVisitStats({
        startDate: formattedStartDate,
        endDate: formattedEndDate
      });

      // Sort the data by date to ensure consistent order
      const formattedMonthlyData = Object.entries(data)
        .reduce((acc: any, [date, counts]: [string, any]) => {
          const [year, month] = date.split('-');
          const monthYear = `${month}/${year}`;
          
          if (!acc[monthYear]) {
            acc[monthYear] = {
              'Sábado': 0,
              'Domingo Manhã': 0,
              'Domingo Noite': 0,
              total: 0
            };
          }

          acc[monthYear]['Sábado'] += counts['sabado'] || 0;
          acc[monthYear]['Domingo Manhã'] += counts['domingo-manha'] || 0;
          acc[monthYear]['Domingo Noite'] += counts['domingo-noite'] || 0;
          acc[monthYear].total += counts.total || 0;

          return acc;
        }, {});

      // Convert to array and sort by date
      const sortedData = Object.entries(formattedMonthlyData)
        .map(([date, counts]: [string, any]) => ({
          date,
          ...counts
        }))
        .sort((a, b) => {
          const [monthA, yearA] = a.date.split('/');
          const [monthB, yearB] = b.date.split('/');
          return new Date(`${yearA}-${monthA}`).getTime() - new Date(`${yearB}-${monthB}`).getTime();
        });

      setMonthlyStats(sortedData);
    }
    fetchMonthlyStats();
  }, [startDate, endDate]);

  if (!mounted) {
    return null;
  }

  const totalVisits = loading ? 0 : stats.reduce((acc: number, curr: any) => acc + curr.total, 0);
  const averageVisitsPerDay = loading ? 0 : totalVisits / (stats.length || 1);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  }

  return (
    <>
      <Header userName={userName} onLogout={handleLogout} />
      <div className="p-2 sm:p-6 mt-[72px]">
        <div className="flex flex-col gap-2 sm:gap-4 justify-between mb-6">
          <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-0">Dashboard de Visitas</h1>
          
          {/* Date picker container */}
          <div className="w-full flex flex-col sm:flex-row gap-2">
            <DatePicker
              date={startDate}
              setDate={setStartDate}
              placeholder="Data inicial"
            />
            <DatePicker
              date={endDate}
              setDate={setEndDate}
              placeholder="Data final"
            />
          </div>
        </div>

        {/* Cards - Removido scroll horizontal e ajustado para empilhar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Visitas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVisits}</div>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Média por Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageVisitsPerDay.toFixed(1)}</div>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Dias com Visitas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg">Visitas por Dia e Culto</CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-4">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={stats}
                    margin={{
                      top: 20,
                      right: 10,
                      left: 0,
                      bottom: 60
                    }}
                  >
                    <XAxis 
                      dataKey="date"
                      height={60}
                      angle={-45}
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

          {/* Monthly chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg">Visitas Mensais por Culto</CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-4">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={monthlyStats}
                    margin={{
                      top: 20,
                      right: 10,
                      left: 0,
                      bottom: 40
                    }}
                  >
                    <XAxis 
                      dataKey="date"
                      height={40}
                      angle={-45}
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
        </div>
      </div>
    </>
  );
} 