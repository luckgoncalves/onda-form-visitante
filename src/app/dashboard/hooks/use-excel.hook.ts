import { endOfMonth, format, startOfMonth } from "date-fns";
import * as XLSX from 'xlsx';
import { useState } from "react";
import { getVisitStatsDetailed } from "@/app/actions";

// Types for different report formats
export type ReportType = 'detailed' | 'daily' | 'age' | 'gender';

interface DetailedVisit {
  created_at: string | Date;
  nome: string;
  telefone: string;
  idade: number;
  genero: string;
  estado_civil: string;
  bairro: string;
  culto: string;
  responsavel_nome?: string | null;
  responsavel_telefone?: string | null;
  como_nos_conheceu: string;
  como_chegou_ate_nos?: string;
  frequenta_igreja: boolean;
  qual_igreja?: string;
  interesse_em_conhecer?: string[];
  observacao?: string;
  mensagem_enviada: boolean;
}

interface DetailedReportRow {
  'Data da Visita': string;
  'Horário': string;
  'Nome': string;
  'Telefone': string;
  'Responsável': string;
  'Telefone Responsável': string;
  'Idade': string;
  'Gênero': string;
  'Estado Civil': string;
  'Bairro': string;
  'Culto': string;
  'Como Conheceu': string;
  'Como Chegou': string;
  'Frequenta Igreja': string;
  'Qual Igreja': string;
  'Interesses': string;
  'Observação': string;
  'Mensagem Enviada': string;
}

interface DailyReportRow {
  'Data': string;
  'Sábado': number;
  'Domingo Manhã': number;
  'Domingo Noite': number;
  'Evento': number;
  'New': number;
  'Total': number;
}

interface AgeReportRow {
  'Faixa Etária': string;
  'Sábado': number;
  'Domingo Manhã': number;
  'Domingo Noite': number;
  'Evento': number;
  'New': number;
  'Total': number;
  'Média de Idade': number;
}

interface GenderReportRow {
  'Gênero': string;
  'Sábado': number;
  'Domingo Manhã': number;
  'Domingo Noite': number;
  'Evento': number;
  'New': number;
  'Total': number;
  'Porcentagem': string;
}

export function useExcel() {
  const [isExporting, setIsExporting] = useState(false);
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));

  const exportToExcel = async (reportType: ReportType, totalVisits: number) => {
    try {
      setIsExporting(true);
      
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      const detailedStats = await getVisitStatsDetailed({
        startDate: formattedStartDate,
        endDate: formattedEndDate
      }) as DetailedVisit[];

      let excelData: DetailedReportRow[] | DailyReportRow[] | AgeReportRow[] | GenderReportRow[];
      let fileName: string;

      switch (reportType) {
        case 'detailed':
          excelData = detailedStats.map((row: DetailedVisit): DetailedReportRow => ({
            'Data da Visita': format(new Date(row.created_at), 'dd/MM/yyyy'),
            'Horário': format(new Date(row.created_at), 'HH:mm'),
            'Nome': row.nome,
            'Telefone': row.telefone,
            'Responsável': row.responsavel_nome || '',
            'Telefone Responsável': row.responsavel_telefone || '',
            'Idade': row.idade?.toString() ?? '',
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
          fileName = `relatorio-detalhado-visitas`;

          // Add totals row
          (excelData as DetailedReportRow[]).push({
            'Data da Visita': 'TOTAL',
            'Horário': '',
            'Nome': totalVisits.toString(),
            'Telefone': '',
            'Responsável': '',
            'Telefone Responsável': '',
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
          });
          break;

        case 'daily':
          // Group by date and culto
          const dailyStats = detailedStats.reduce((acc: { [key: string]: DailyReportRow }, visit) => {
            const date = format(new Date(visit.created_at), 'dd/MM/yyyy');
            if (!acc[date]) {
              acc[date] = {
                'Data': date,
                'Sábado': 0,
                'Domingo Manhã': 0,
                'Domingo Noite': 0,
                'Evento': 0,
                'New': 0,
                'Total': 0
              };
            }
            switch (visit.culto) {
              case 'sabado':
                acc[date]['Sábado']++;
                break;
              case 'domingo-manha':
                acc[date]['Domingo Manhã']++;
                break;
              case 'domingo-noite':
                acc[date]['Domingo Noite']++;
                break;
              case 'evento':
                acc[date]['Evento']++;
                break;
              case 'new':
                acc[date]['New']++;
                break;
            }
            acc[date]['Total']++;
            return acc;
          }, {});

          excelData = Object.values(dailyStats);
          fileName = `relatorio-diario-visitas`;

          // Add totals row
          (excelData as DailyReportRow[]).push({
            'Data': 'TOTAL',
            'Sábado': excelData.reduce((acc, curr: DailyReportRow) => acc + curr['Sábado'], 0),
            'Domingo Manhã': excelData.reduce((acc, curr: DailyReportRow) => acc + curr['Domingo Manhã'], 0),
            'Domingo Noite': excelData.reduce((acc, curr: DailyReportRow) => acc + curr['Domingo Noite'], 0),
            'Evento': excelData.reduce((acc, curr: DailyReportRow) => acc + curr['Evento'], 0),
            'New': excelData.reduce((acc, curr: DailyReportRow) => acc + curr['New'], 0),
            'Total': totalVisits
          });
          break;

        case 'age':
          // Initialize age ranges with service-specific counts
          const ageStats: { [key: string]: { sabado: number[], 'domingo-manha': number[], 'domingo-noite': number[], evento: number[], new: number[] } } = {};

          // Process each visit
          detailedStats.forEach(visit => {
            const age = parseInt(visit.idade);
            const rangeStart = Math.floor(age / 5) * 5;
            const rangeKey = `${rangeStart}-${rangeStart + 4}`;

            if (!ageStats[rangeKey]) {
              ageStats[rangeKey] = {
                sabado: [],
                'domingo-manha': [],
                'domingo-noite': [],
                evento: [],
                new: []
              };
            }

            ageStats[rangeKey][visit.culto as keyof typeof ageStats[string]].push(age);
          });

          // Convert to rows
          excelData = Object.entries(ageStats)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([range, data]): AgeReportRow => {
              const sabadoCount = data.sabado.length;
              const domingoManhaCount = data['domingo-manha'].length;
              const domingoNoiteCount = data['domingo-noite'].length;
              const eventoCount = data.evento.length;
              const newCount = data.new.length;
              const total = sabadoCount + domingoManhaCount + domingoNoiteCount + eventoCount + newCount;

              const allAges = [...data.sabado, ...data['domingo-manha'], ...data['domingo-noite'], ...data.evento, ...data.new];
              const mediaIdade = allAges.length > 0 
                ? Math.round((allAges.reduce((a, b) => a + b, 0) / allAges.length) * 10) / 10
                : 0;

              return {
                'Faixa Etária': `${range} anos`,
                'Sábado': sabadoCount,
                'Domingo Manhã': domingoManhaCount,
                'Domingo Noite': domingoNoiteCount,
                'Evento': eventoCount,
                'New': newCount,
                'Total': total,
                'Média de Idade': mediaIdade
              };
            });

          // Add totals and averages row
          const totalSabado = excelData.reduce((acc, curr) => acc + curr['Sábado'], 0);
          const totalDomingoManha = excelData.reduce((acc, curr) => acc + curr['Domingo Manhã'], 0);
          const totalDomingoNoite = excelData.reduce((acc, curr) => acc + curr['Domingo Noite'], 0);
          const totalEvento = excelData.reduce((acc, curr) => acc + curr['Evento'], 0);
          const totalNew = excelData.reduce((acc, curr) => acc + curr['New'], 0);
          const mediaGeralIdade = Math.round((detailedStats.reduce((acc, curr) => acc + parseInt(curr.idade), 0) / detailedStats.length) * 10) / 10;

          (excelData as AgeReportRow[]).push({
            'Faixa Etária': 'TOTAL',
            'Sábado': totalSabado,
            'Domingo Manhã': totalDomingoManha,
            'Domingo Noite': totalDomingoNoite,
            'Evento': totalEvento,
            'New': totalNew,
            'Total': totalVisits,
            'Média de Idade': mediaGeralIdade
          });

          fileName = `relatorio-idades-visitas`;
          break;

        case 'gender':
          // Initialize gender stats with service-specific counts
          const genderServiceStats: { [key: string]: { sabado: number, 'domingo-manha': number, 'domingo-noite': number, evento: number, new: number, total: number } } = {
            'Masculino': { sabado: 0, 'domingo-manha': 0, 'domingo-noite': 0, evento: 0, new: 0, total: 0 },
            'Feminino': { sabado: 0, 'domingo-manha': 0, 'domingo-noite': 0, evento: 0, new: 0, total: 0 }
          };

          // Process each visit
          detailedStats.forEach(visit => {
            // Normalize gender value
            const gender = visit.genero === 'masculino' ? 'Masculino' : 'Feminino';
            
            // Map culto values
            let serviceKey: 'sabado' | 'domingo-manha' | 'domingo-noite' | 'evento' | 'new';
            switch (visit.culto) {
              case 'Sábado':
              case 'sabado':
                serviceKey = 'sabado';
                break;
              case 'Domingo Manhã':
              case 'domingo-manha':
                serviceKey = 'domingo-manha';
                break;
              case 'Domingo Noite':
              case 'domingo-noite':
                serviceKey = 'domingo-noite';
                break;
              case 'Evento':
              case 'evento':
                serviceKey = 'evento';
                break;
              case 'new':
              case 'New':
                serviceKey = 'new';
                break;
              default:
                console.warn('Culto não reconhecido:', visit.culto);
                return;
            }

            // Update counters
            genderServiceStats[gender][serviceKey]++;
            genderServiceStats[gender].total++;
          });

          // Convert to rows
          excelData = Object.entries(genderServiceStats).map(([gender, data]): GenderReportRow => ({
            'Gênero': gender,
            'Sábado': data.sabado,
            'Domingo Manhã': data['domingo-manha'],
            'Domingo Noite': data['domingo-noite'],
            'Evento': data.evento,
            'New': data.new,
            'Total': data.total,
            'Porcentagem': totalVisits > 0 ? `${Math.round((data.total / totalVisits) * 100)}%` : '0%'
          }));

          // Add totals row
          const totalPorGenero = {
            'Sábado': excelData.reduce((acc, curr) => acc + curr['Sábado'], 0),
            'Domingo Manhã': excelData.reduce((acc, curr) => acc + curr['Domingo Manhã'], 0),
            'Domingo Noite': excelData.reduce((acc, curr) => acc + curr['Domingo Noite'], 0),
            'Evento': excelData.reduce((acc, curr) => acc + curr['Evento'], 0),
            'New': excelData.reduce((acc, curr) => acc + curr['New'], 0)
          };

          (excelData as GenderReportRow[]).push({
            'Gênero': 'TOTAL',
            'Sábado': totalPorGenero['Sábado'],
            'Domingo Manhã': totalPorGenero['Domingo Manhã'],
            'Domingo Noite': totalPorGenero['Domingo Noite'],
            'Evento': totalPorGenero['Evento'],
            'New': totalPorGenero['New'],
            'Total': totalVisits,
            'Porcentagem': '100%'
          });

          fileName = `relatorio-genero-visitas`;
          break;
      }

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Adjust column widths
      const maxWidth = 40;
      const colWidths: { [key: string]: number } = {};
      
      // Calculate column widths based on content
      excelData.forEach(row => {
        Object.entries(row).forEach(([key, value]) => {
          const length = String(value).length;
          colWidths[key] = Math.min(
            maxWidth,
            Math.max(colWidths[key] || 0, length + 2)
          );
        });
      });

      ws['!cols'] = Object.values(colWidths).map(width => ({ wch: width }));

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Relatório');

      // Generate file name with date range
      fileName = `${fileName}-${format(startDate, 'dd-MM-yyyy')}-a-${format(endDate, 'dd-MM-yyyy')}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Erro ao exportar:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportToExcel,
    isExporting,
    startDate,
    setStartDate,
    endDate,
    setEndDate
  }
}