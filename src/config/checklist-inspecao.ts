export type ChecklistItemModelo = {
  id: string;
  texto: string;
};

export type ChecklistSecaoModelo = {
  id: string;
  titulo: string;
  itens: ChecklistItemModelo[];
};

export type ChecklistSecaoPreenchida = {
  id: string;
  titulo: string;
  observacoes: string;
  itens: (ChecklistItemModelo & { verificado: boolean })[];
};

const CONFIRMAR_EQUIPE = 'Confirmar com a equipe responsável pelo serviço se está tudo em pleno funcionamento.';
const NECESSIDADE_REPARO = 'Verificar se há alguma necessidade de manutenção ou reparo.';

export const CHECKLIST_INSPECAO: ChecklistSecaoModelo[] = [
  {
    id: '1',
    titulo: 'Banheiros',
    itens: [
      { id: '1.1', texto: 'Acionar as descargas e verificar se há vazamentos.' },
      { id: '1.2', texto: 'Acionar as torneiras e verificar possíveis vazamentos no sifão.' },
      { id: '1.3', texto: 'Verificar se toda a iluminação está funcionando.' },
      { id: '1.4', texto: 'Verificar se os porta-papéis estão íntegros e sem sinais de danos.' },
    ],
  },
  {
    id: '2',
    titulo: 'Cozinha',
    itens: [
      { id: '2.1', texto: 'Verificar o funcionamento da torneira.' },
      { id: '2.2', texto: 'Acionar a torneira e verificar se há vazamentos no sifão.' },
      { id: '2.3', texto: 'Verificar o funcionamento das tomadas.' },
      { id: '2.4', texto: 'Verificar se a geladeira está funcionando normalmente.' },
    ],
  },
  {
    id: '3',
    titulo: 'Espaço de Culto',
    itens: [
      { id: '3.1', texto: 'Verificar se toda a iluminação está funcionando corretamente.' },
    ],
  },
  {
    id: '4',
    titulo: 'Hall de Entrada',
    itens: [
      { id: '4.1', texto: 'Verificar o funcionamento da iluminação.' },
      { id: '4.2', texto: 'Verificar o funcionamento do bebedouro.' },
      { id: '4.3', texto: 'Verificar as condições e o funcionamento do suporte para copos.' },
    ],
  },
  {
    id: '5',
    titulo: 'Café',
    itens: [
      { id: '5.1', texto: CONFIRMAR_EQUIPE },
      { id: '5.2', texto: NECESSIDADE_REPARO },
    ],
  },
  {
    id: '6',
    titulo: 'Store',
    itens: [
      { id: '6.1', texto: CONFIRMAR_EQUIPE },
      { id: '6.2', texto: NECESSIDADE_REPARO },
    ],
  },
  {
    id: '7',
    titulo: 'Salas do Ministério Infantil',
    itens: [
      { id: '7.1', texto: 'Verificar se a iluminação está funcionando.' },
      { id: '7.2', texto: 'Verificar as condições e o funcionamento dos banheiros.' },
    ],
  },
  {
    id: '8',
    titulo: 'Auditório Shift',
    itens: [
      { id: '8.1', texto: CONFIRMAR_EQUIPE },
      { id: '8.2', texto: NECESSIDADE_REPARO },
    ],
  },
  {
    id: '9',
    titulo: 'Hope (Bazar)',
    itens: [
      { id: '9.1', texto: 'Verificar se todos os equipamentos e instalações estão em pleno funcionamento.' },
      { id: '9.2', texto: NECESSIDADE_REPARO },
    ],
  },
  {
    id: '10',
    titulo: 'Iluminação Externa',
    itens: [
      { id: '10.1', texto: 'Verificar todas as luminárias externas.' },
      { id: '10.2', texto: 'Identificar lâmpadas ou luminárias queimadas ou com defeito.' },
      { id: '10.3', texto: 'Verificar se há algum ponto de iluminação que não esteja funcionando adequadamente.' },
    ],
  },
  {
    id: '11',
    titulo: 'Estrutural / Segurança',
    itens: [
      { id: '11.1', texto: 'Verificar se existem indícios de tentativa de arrombamento.' },
      { id: '11.2', texto: 'Verificar portas, fechaduras e acessos.' },
      { id: '11.3', texto: 'Verificar se existem vidros quebrados ou danificados.' },
      { id: '11.4', texto: 'Registrar qualquer dano estrutural identificado.' },
    ],
  },
];

export const CHECKLIST_PAGE_KEY = '/checklist';

type ChecklistUser = {
  role: string;
  ministerioNavConfig?: { paginasHabilitadas: string[] } | null;
};

/** Admins ou membros de ministérios com a página de checklist habilitada. */
export function canAccessChecklist(user: ChecklistUser | null | undefined): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return !!user.ministerioNavConfig?.paginasHabilitadas.includes(CHECKLIST_PAGE_KEY);
}

const TIMEZONE = 'America/Sao_Paulo';

export function formatDataHora(date: Date | string) {
  const d = new Date(date);
  return {
    data: d.toLocaleDateString('pt-BR', { timeZone: TIMEZONE }),
    hora: d.toLocaleTimeString('pt-BR', { timeZone: TIMEZONE, hour: '2-digit', minute: '2-digit' }),
  };
}
