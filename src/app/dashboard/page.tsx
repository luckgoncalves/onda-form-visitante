'use client';

import { useEffect, useState, useMemo } from "react";
import { checkAuth, logout, checkIsAdmin } from "../actions";
import { useRouter } from "next/navigation";
import { DatePicker } from "@/components/ui/DatePicker";
import { Header } from "@/components/header";
import { ChartSkeleton } from "@/components/dashboard/skeleton";
import { useExcel, ReportType } from "./hooks/use-excel.hook";
import { useVisitStats } from "./hooks/use-visit-stats.hook";
import { useDemographicStats } from "./hooks/use-demographic-stats.hook";
import { VisitChart } from "./components/VisitChart";
import { DemographicCharts } from "./components/DemographicCharts";
import { StatsCards } from "./components/StatsCards";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const { exportToExcel, isExporting, startDate, setStartDate, endDate, setEndDate } = useExcel();
  
  const { stats, monthlyStats, isLoading: isLoadingVisits } = useVisitStats({ startDate, endDate });
  const { genderStats, ageStats, isLoading: isLoadingDemographics } = useDemographicStats({ startDate, endDate });

  const dashboardStats = useMemo(() => {
    if (!stats.length) return { totalVisits: 0, averageVisitsPerDay: 0, daysWithVisits: 0 };
    
    const totalVisits = stats.reduce((acc, curr) => acc + curr.total, 0);
    return {
      totalVisits,
      averageVisitsPerDay: totalVisits / stats.length,
      daysWithVisits: stats.length
    };
  }, [stats]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function checkAuthentication() {
      const { isAuthenticated, user } = await checkAuth();
      const { isAdmin } = await checkIsAdmin();
      
      if (!isAuthenticated || !user) {
        router.push('/');
        return;
      }

      if (!isAdmin) {
        router.push('/list');
        return;
      }

      setUserName(user.name);
      setUserId(user.id);
    }
    checkAuthentication();
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  }

  const handleExport = (type: ReportType) => {
    exportToExcel(type, dashboardStats.totalVisits);
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Header userId={userId} userName={userName} onLogout={handleLogout} />
      <div className="p-2 sm:p-6 mt-[72px]">
        <div className="flex flex-col gap-2 sm:gap-4 justify-between mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-0">Dashboard de Visitas</h1>
            
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-base font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed gap-2 shadow-sm"
                  disabled={isLoadingVisits || stats.length === 0 || isExporting}
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
                      <span>Exportar</span>
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0">
                <div className="flex flex-col">
                  <button
                    onClick={() => handleExport('detailed')}
                    className="flex items-center px-3 py-2.5 text-sm hover:bg-slate-100 transition-colors"
                  >
                    Relatório Detalhado
                  </button>
                  <button
                    onClick={() => handleExport('daily')}
                    className="flex items-center px-3 py-2.5 text-sm hover:bg-slate-100 transition-colors"
                  >
                    Relatório Diário
                  </button>
                  <button
                    onClick={() => handleExport('age')}
                    className="flex items-center px-3 py-2.5 text-sm hover:bg-slate-100 transition-colors"
                  >
                    Relatório por Idade
                  </button>
                  <button
                    onClick={() => handleExport('gender')}
                    className="flex items-center px-3 py-2.5 text-sm hover:bg-slate-100 transition-colors"
                  >
                    Relatório por Gênero
                  </button>
                </div>
              </PopoverContent>
            </Popover>
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

        <StatsCards stats={dashboardStats} isLoading={isLoadingVisits} />

        {/* Charts container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoadingVisits || isLoadingDemographics ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
              <ChartSkeleton />
              <ChartSkeleton />
            </>
          ) : (
            <>
              <VisitChart 
                data={stats} 
                title="Visitas Dia / Culto" 
              />
              <VisitChart 
                data={monthlyStats} 
                title="Visitas Mês / Culto"
                xAxisAngle={-45}
                xAxisHeight={40}
              />
              <DemographicCharts 
                genderStats={genderStats}
                ageStats={ageStats}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
} 