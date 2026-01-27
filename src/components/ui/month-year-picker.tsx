'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface MonthYearPickerProps {
  value?: string; // Formato "YYYY-MM"
  onChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

const MONTHS = [
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Março' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

const selectClassName = "flex-1 h-10 pl-2 pr-2 rounded-md border border-gray-300 focus:border-onda-darkBlue focus:ring-onda-darkBlue bg-white py-2 text-sm focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50";

export function MonthYearPicker({
  value = '',
  onChange,
  className,
  placeholder = 'Selecione mês e ano',
  disabled = false,
}: MonthYearPickerProps) {
  const currentYear = new Date().getFullYear();
  const startYear = 2000;
  const endYear = currentYear + 1;
  
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i).reverse();

  // Parsear valor atual
  const [year, month] = value ? value.split('-') : ['', ''];

  // Estados locais para rastrear seleções
  const [localMonth, setLocalMonth] = React.useState(month);
  const [localYear, setLocalYear] = React.useState(year);

  // Sincronizar quando value muda externamente
  React.useEffect(() => {
    const [y, m] = value ? value.split('-') : ['', ''];
    setLocalMonth(m);
    setLocalYear(y);
  }, [value]);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMonth = e.target.value;
    setLocalMonth(selectedMonth);
    
    if (selectedMonth && localYear) {
      // Se ambos estão selecionados, atualizar
      onChange?.(`${localYear}-${selectedMonth}`);
    } else if (!selectedMonth) {
      // Se desmarcou o mês, limpar o valor
      onChange?.('');
    }
    // Se só tem mês mas não tem ano, aguarda seleção do ano
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedYear = e.target.value;
    setLocalYear(selectedYear);
    
    if (selectedYear && localMonth) {
      // Se ambos estão selecionados, atualizar
      onChange?.(`${selectedYear}-${localMonth}`);
    } else if (!selectedYear) {
      // Se desmarcou o ano, limpar o valor
      onChange?.('');
    }
    // Se só tem ano mas não tem mês, aguarda seleção do mês
  };

  return (
    <div className={cn('flex gap-2', className)}>
      <select
        value={localMonth}
        onChange={handleMonthChange}
        disabled={disabled}
        className={selectClassName}
      >
        <option value="">Mês</option>
        {MONTHS.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>

      <select
        value={localYear}
        onChange={handleYearChange}
        disabled={disabled}
        className={selectClassName}
      >
        <option value="">Ano</option>
        {years.map((y) => (
          <option key={y} value={y.toString()}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
