import { endOfMonth, format, startOfMonth } from "date-fns";
import * as XLSX from 'xlsx';

import { getVisitStatsDetailed } from "@/app/actions";
import { useState } from "react";


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
  

export function useExcel() {
    const [isExporting, setIsExporting] = useState(false);
    const [startDate, setStartDate] = useState(startOfMonth(new Date()));
    const [endDate, setEndDate] = useState(endOfMonth(new Date()));

    const exportToExcel = async (totalVisits: number) => {
        
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

      return {
        exportToExcel,
        isExporting,
        startDate,
        setStartDate,
        endDate,
        setEndDate
      }
}