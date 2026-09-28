import prisma from '@/lib/prisma';
import { CHECKLIST_PAGE_KEY } from '@/config/checklist-inspecao';

type Usuario = { id: string; role: string };

export async function getModeloChecklist() {
  return prisma.checklistTopico.findMany({
    orderBy: [{ ordem: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      titulo: true,
      ordem: true,
      itens: {
        orderBy: [{ ordem: 'asc' }, { createdAt: 'asc' }],
        select: { id: true, texto: true, ordem: true },
      },
    },
  });
}

/**
 * Pode editar o modelo: admin, ou líder/co-líder de um ministério
 * que tenha a página de checklist habilitada.
 */
export async function podeEditarModeloChecklist(user: Usuario | null | undefined): Promise<boolean> {
  if (!user) return false;
  if (user.role === 'admin') return true;

  const ministerios = await prisma.ministerio.findMany({
    where: { OR: [{ liderId: user.id }, { coLiderId: user.id }] },
    select: { navConfig: { select: { paginasHabilitadas: true } } },
  });

  return ministerios.some((m) => {
    const raw = m.navConfig?.paginasHabilitadas;
    const paginas: unknown = typeof raw === 'string' ? JSON.parse(raw || '[]') : raw;
    return Array.isArray(paginas) && paginas.includes(CHECKLIST_PAGE_KEY);
  });
}

/** Troca a posição de um registro com o vizinho (acima/abaixo) na lista ordenada. */
export function calcularTroca<T extends { id: string }>(lista: T[], id: string, direcao: 'cima' | 'baixo') {
  const indice = lista.findIndex((r) => r.id === id);
  const alvo = direcao === 'cima' ? indice - 1 : indice + 1;
  if (indice < 0 || alvo < 0 || alvo >= lista.length) return null;
  const nova = [...lista];
  [nova[indice], nova[alvo]] = [nova[alvo], nova[indice]];
  return nova.map((r, ordem) => ({ id: r.id, ordem }));
}
