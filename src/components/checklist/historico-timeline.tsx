'use client';

import { Check, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export type RegistroChecklist = {
  id: string;
  totalItens: number;
  itensVerificados: number;
  createdAt: string;
  responsavel: { id: string; name: string };
};

type GrupoDia = { chave: string; data: Date; registros: RegistroChecklist[] };

const COR_TRILHO = 'bg-[#CDD1EA]';
const TEXTO_SECUNDARIO = 'text-[#4A5070]';

/** Dia local do aparelho (registro de 23:50 e de 00:10 ficam em dias diferentes) */
function chaveDoDia(data: Date) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
}

/** "Domingo, 4 de outubro" (com o ano se não for o ano atual) */
function rotuloDoDia(data: Date) {
  const semana = data.toLocaleDateString('pt-BR', { weekday: 'long' }).replace('-feira', '');
  const diaMes = data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
  const ano = data.getFullYear() !== new Date().getFullYear() ? ` de ${data.getFullYear()}` : '';
  return `${semana.charAt(0).toUpperCase()}${semana.slice(1)}, ${diaMes}${ano}`;
}

function horario(data: Date) {
  return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/** Agrupa a lista (já ordenada do mais recente para o mais antigo) por dia local */
export function agruparPorDia(registros: RegistroChecklist[]): GrupoDia[] {
  const grupos = new Map<string, GrupoDia>();
  for (const registro of registros) {
    const data = new Date(registro.createdAt);
    const chave = chaveDoDia(data);
    const grupo = grupos.get(chave) ?? { chave, data, registros: [] };
    grupo.registros.push(registro);
    grupos.set(chave, grupo);
  }
  return Array.from(grupos.values())
    .sort((a, b) => b.data.getTime() - a.data.getTime())
    .map((g) => ({
      ...g,
      registros: g.registros.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    }));
}

/** Coluna de 20px com o trecho do trilho e o marcador (decorativa) */
function Trilho({ inicio, fim, marcador }: { inicio: boolean; fim: boolean; marcador: 'cheio' | 'vazado' }) {
  return (
    <div aria-hidden="true" className="relative w-5 shrink-0">
      {!inicio && <span className={cn('absolute left-[9px] top-0 h-1/2 w-0.5', COR_TRILHO)} />}
      {!fim && <span className={cn('absolute bottom-0 left-[9px] h-1/2 w-0.5', COR_TRILHO)} />}
      <span
        className={cn(
          'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full',
          marcador === 'cheio'
            ? 'h-3.5 w-3.5 bg-onda-blue'
            : 'h-2.5 w-2.5 border-2 border-onda-blue bg-white'
        )}
      />
    </div>
  );
}

function BadgePlacar({ verificados, total }: { verificados: number; total: number }) {
  const completo = verificados === total;
  const Icone = completo ? Check : Clock;
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-xl px-[9px] py-[3px] text-[13px] font-medium tabular-nums',
        completo ? 'bg-[#E2FBE8] text-[#1F6B36]' : 'bg-[#FFF1CC] text-[#6E4A00]'
      )}
    >
      <Icone className="h-3.5 w-3.5" />
      {verificados}/{total}
    </span>
  );
}

type Props = {
  registros: RegistroChecklist[];
  onAbrir: (id: string) => void;
};

export function HistoricoTimeline({ registros, onAbrir }: Props) {
  const grupos = agruparPorDia(registros);
  const ultimoGrupo = grupos.length - 1;

  return (
    <div>
      {grupos.map((grupo, g) => {
        const tituloId = `historico-dia-${grupo.chave}`;
        const n = grupo.registros.length;
        return (
          <section key={grupo.chave} aria-labelledby={tituloId}>
            {/* Cabeçalho do dia */}
            <div className={cn('flex', g === 0 ? 'h-10' : 'h-12')}>
              <Trilho inicio={g === 0} fim={false} marcador="cheio" />
              <div className="ml-2 flex min-w-0 flex-1 items-center justify-between gap-2">
                <h2 id={tituloId} className="truncate text-[15px] font-bold text-onda-blue">
                  {rotuloDoDia(grupo.data)}
                </h2>
                <span className={cn('shrink-0 text-xs', TEXTO_SECUNDARIO)}>
                  {n} {n === 1 ? 'registro' : 'registros'}
                </span>
              </div>
            </div>

            {/* Registros do dia */}
            <ul>
              {grupo.registros.map((registro, i) => {
                const data = new Date(registro.createdAt);
                const hora = horario(data);
                const ultimo = g === ultimoGrupo && i === n - 1;
                const diaMes = data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
                return (
                  <li key={registro.id} className="flex">
                    <Trilho inicio={false} fim={ultimo} marcador="vazado" />
                    {/* py-1 em vez de margem: o trilho fica contínuo entre os cards (8px entre eles) */}
                    <div className="ml-2 min-w-0 flex-1 py-1">
                      <button
                        type="button"
                        onClick={() => onAbrir(registro.id)}
                        aria-label={`Registro de ${diaMes} às ${hora}, ${registro.responsavel.name}, ${registro.itensVerificados} de ${registro.totalItens} itens`}
                        className="flex min-h-[52px] w-full items-center gap-2 rounded-xl border border-[#E1E4F0] bg-white py-2 pl-3 pr-2 text-left transition-colors hover:bg-[#F8F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onda-blue/40"
                      >
                        <span aria-hidden="true" className="shrink-0 text-[15px] font-bold tabular-nums text-onda-blue">
                          {hora}
                        </span>
                        <span aria-hidden="true" className="min-w-0 flex-1 truncate text-[15px] font-medium text-onda-black">
                          {registro.responsavel.name}
                        </span>
                        <BadgePlacar verificados={registro.itensVerificados} total={registro.totalItens} />
                        <ChevronRight aria-hidden="true" className={cn('h-5 w-5 shrink-0', TEXTO_SECUNDARIO)} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/** Esqueleto: 1 cabeçalho de dia e 3 cards */
export function HistoricoTimelineSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando histórico">
      <div className="flex h-10 items-center gap-2">
        <span className="ml-[3px] h-3.5 w-3.5 rounded-full bg-[#E1E4F0]" />
        <span className="ml-[3px] h-4 w-40 animate-pulse rounded bg-[#E1E4F0]" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex py-1">
          <div className="w-5 shrink-0" />
          <div className="ml-2 h-[52px] flex-1 animate-pulse rounded-xl bg-[#ECEEF6]" />
        </div>
      ))}
    </div>
  );
}
