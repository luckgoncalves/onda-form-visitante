'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getVisitStats, getVisitStatsDetailed } from "../actions";
import { formatCulto } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { checkAuth } from "../actions";
import { useRouter } from "next/navigation";
import { DatePicker } from "@/components/ui/DatePicker";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { Header } from "@/components/header";
import { logout } from "../actions";
import * as XLSX from 'xlsx';

// Adicione esta interface no topo do arquivo, após os imports
interface DetailedVisit {
  created_at: string;
  nome: string;
  telefone: string;
  idade: string;
  genero: string;
  estado_civil: string;
  bairro: string;
  culto: string;
  como_nos_conheceu: string;
  como_chegou_ate_nos?: string;
  frequenta_igreja: boolean;
  qual_igreja?: string;
  interesse_em_conhecer?: string[];
  observacao?: string;
  mensagem_enviada: boolean;
}

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

// Adicione este componente de loading para os cards
const CardSkeleton = () => (
  <Card className="h-full animate-pulse">
    <CardHeader className="pb-2">
      <div className="h-4 w-24 bg-gray-200 rounded"></div>
    </CardHeader>
    <CardContent>
      <div className="h-8 w-16 bg-gray-200 rounded"></div>
    </CardContent>
  </Card>
);

// Adicione este componente de loading para os gráficos
const ChartSkeleton = () => (
  <Card>
    <CardHeader className="pb-2">
      <div className="h-5 w-32 bg-gray-200 rounded"></div>
    </CardHeader>
    <CardContent className="p-0 sm:p-4">
      <div className="h-[400px] bg-gray-100 rounded animate-pulse flex items-center justify-center">
        <svg className="w-10 h-10 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 4V2M12 22v-2M4 12H2m20 0h-2m-1.645-7.355L17.14 5.86m-10.28 10.28l-1.215 1.215m0-11.495l1.215 1.215m10.28 10.28l1.215 1.215M12 17a5 5 0 100-10 5 5 0 000 10z" />
        </svg>
      </div>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const [stats, setStats] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));
  const [userName, setUserName] = useState("");
  const [monthlyStats, setMonthlyStats] = useState<any>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

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
      setIsLoadingData(true);
      try {
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
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setIsLoadingData(false);
        setLoading(false);
      }
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

  const exportToExcel = async () => {
    try {
      setIsExporting(true);
      
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      const detailedStats = await getVisitStatsDetailed({
        startDate: formattedStartDate,
        endDate: formattedEndDate
      }) as DetailedVisit[];

      const excelData = detailedStats.map((row: DetailedVisit) => ({
        'Data da Visita': format(new Date(row.created_at), 'dd/MM/yyyy'),
        'Horário': format(new Date(row.created_at), 'HH:mm'),
        'Nome': row.nome,
        'Telefone': row.telefone,
        'Idade': row.idade,
        'Gênero': row.genero,
        'Estado Civil': row.estado_civil,
        'Bairro': row.bairro,
        'Culto': row.culto,
        'Como Conheceu': row.como_nos_conheceu,
        'Como Chegou': row.como_chegou_ate_nos || '',
        'Frequenta Igreja': row.frequenta_igreja ? 'Sim' : 'Não',
        'Qual Igreja': row.qual_igreja || '',
        'Interesses': (row.interesse_em_conhecer || []).join(', '),
        'Observação': row.observacao || '',
        'Mensagem Enviada': row.mensagem_enviada ? 'Sim' : 'Não'
      }));

      // Adicionar linha com totais
      const totals = {
        'Data da Visita': 'TOTAL',
        'Horário': '',
        'Nome': totalVisits.toString(),
        'Telefone': '',
        'Idade': '',
        'Gênero': '',
        'Estado Civil': '',
        'Bairro': '',
        'Culto': '',
        'Como Conheceu': '',
        'Como Chegou': '',
        'Frequenta Igreja': '',
        'Qual Igreja': '',
        'Interesses': '',
        'Observação': '',
        'Mensagem Enviada': ''
      };
      excelData.push(totals);

      // Criar workbook e worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData, {
        header: [
          'Data da Visita',
          'Horário',
          'Nome',
          'Telefone',
          'Idade',
          'Gênero',
          'Estado Civil',
          'Bairro',
          'Culto',
          'Como Conheceu',
          'Como Chegou',
          'Frequenta Igreja',
          'Qual Igreja',
          'Interesses',
          'Observação',
          'Mensagem Enviada'
        ]
      });

      // Ajustar largura das colunas
      const colWidths = [
        { wch: 12 }, // Data
        { wch: 8 },  // Horário
        { wch: 30 }, // Nome
        { wch: 15 }, // Telefone
        { wch: 8 },  // Idade
        { wch: 10 }, // Gênero
        { wch: 15 }, // Estado Civil
        { wch: 20 }, // Bairro
        { wch: 15 }, // Culto
        { wch: 20 }, // Como Conheceu
        { wch: 20 }, // Como Chegou
        { wch: 15 }, // Frequenta Igreja
        { wch: 20 }, // Qual Igreja
        { wch: 30 }, // Interesses
        { wch: 40 }, // Observação
        { wch: 15 }  // Mensagem Enviada
      ];
      ws['!cols'] = colWidths;

      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Relatório Detalhado');

      // Gerar arquivo e fazer download
      const fileName = `relatorio-detalhado-visitas-${format(startDate, 'dd-MM-yyyy')}-a-${format(endDate, 'dd-MM-yyyy')}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      // You might want to add some error handling UI here
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Header userName={userName} onLogout={handleLogout} />
      <div className="p-2 sm:p-6 mt-[72px]">
        <div className="flex flex-col gap-2 sm:gap-4 justify-between mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-0">Dashboard de Visitas</h1>
            
            <button
              onClick={exportToExcel}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed gap-2 shadow-sm"
              disabled={loading || stats.length === 0 || isExporting}
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Exportando...</span>
                </>
              ) : (
                <>
                  <svg 
                    className="h-4 w-4" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" 
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Exportar para Excel</span>
                </>
              )}
            </button>
          </div>
          
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

        {/* Cards com loading state */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {isLoadingData ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Charts container com loading state */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoadingData ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
            </>
          ) : (
            <>
              {/* Daily chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base sm:text-lg">Visitas Dia / Culto</CardTitle>
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
                  <CardTitle className="text-base sm:text-lg">Visitas Mês / Culto</CardTitle>
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
            </>
          )}
        </div>
      </div>
    </>
  );
} 