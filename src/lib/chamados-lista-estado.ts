// Estado da lista de chamados mantido durante a sessão do app (memória do módulo).
// Ao voltar do detalhe de um chamado, a lista restaura os filtros; vindo de outra área, abre no padrão.

export type OrdemLista = 'prioridade' | 'recentes' | 'antigos';
export type PeriodoLista = 0 | 7 | 30;

export type EstadoListaChamados = {
  escopo: 'meus' | 'ministerio';
  status: string; // '' = Todos
  busca: string;
  ordem: OrdemLista;
  prioridades: string[];
  dias: PeriodoLista;
  ministerioId: string; // '' = todos os ministérios
};

export const ESTADO_PADRAO: EstadoListaChamados = {
  escopo: 'meus',
  status: 'PENDENTE',
  busca: '',
  ordem: 'prioridade',
  prioridades: [],
  dias: 0,
  ministerioId: '',
};

let ultimoEstado: EstadoListaChamados | null = null;
let voltandoDoDetalhe = false;

export function salvarEstadoLista(estado: EstadoListaChamados) {
  ultimoEstado = estado;
}

/** Chamado pelo detalhe do chamado: a próxima abertura da lista restaura os filtros */
export function marcarVisitaAoDetalhe() {
  voltandoDoDetalhe = true;
}

export function estadoInicialLista(): EstadoListaChamados {
  const restaurar = voltandoDoDetalhe && ultimoEstado;
  voltandoDoDetalhe = false;
  return restaurar ? ultimoEstado! : ESTADO_PADRAO;
}
