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

export default function Dashboard() {
  const [stats, setStats] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));
  const [userName, setUserName] = useState("");

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
      <div className="p-6 mt-[72px]">
        <h1 className="text-2xl font-bold mb-6">Dashboard de Visitas</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
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

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Visitas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVisits}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média por Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageVisitsPerDay.toFixed(1)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dias com Visitas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="p-4">
          <CardHeader>
            <CardTitle>Visitas por Dia e Culto</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats}>
                  <XAxis 
                    dataKey="date"
                    height={50}
                    angle={0}
                    textAnchor="middle"
                    stroke="#3F3F46"
                    style={{ fontWeight: 300 }}
                  />
                  <YAxis 
                    allowDecimals={false} 
                    stroke="#3F3F46"
                    style={{ fontWeight: 300 }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Sábado" fill="#9562DC" />
                  <Bar dataKey="Domingo Manhã" fill="#FFC857" />
                  <Bar dataKey="Domingo Noite" fill="#B09FF3" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 