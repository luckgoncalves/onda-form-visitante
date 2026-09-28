// Modelo do checklist, como vem de GET /api/checklist/modelo
export type ChecklistItemModelo = {
  id: string;
  texto: string;
  ordem: number;
};

export type ChecklistTopicoModelo = {
  id: string;
  titulo: string;
  ordem: number;
  itens: ChecklistItemModelo[];
};

// Snapshot salvo em cada checklist preenchido. `id` é o número exibido ("1", "1.1").
export type ChecklistSecaoPreenchida = {
  id: string;
  titulo: string;
  observacoes: string;
  itens: { id: string; texto: string; verificado: boolean }[];
};

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
