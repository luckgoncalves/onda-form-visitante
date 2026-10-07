'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, ChevronRight, ChevronUp, Clock, MessageSquare, Play, Send, Trash2 } from 'lucide-react';
import { checkAuth } from '@/app/actions';
import { marcarVisitaAoDetalhe } from '@/lib/chamados-lista-estado';
import { useToast } from '@/hooks/use-toast';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { useKeyboardOffset } from '@/hooks/use-keyboard-offset';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PRIORIDADE_SELO } from '@/components/chamados/chamado-card';
import {
  Avatar, dataHora, dataSemFuso, diaMesHora, FolhaOpcoes, FolhaPrevisao, Opcao, PRIORIDADE_LABEL, STATUS_DETALHE,
} from '@/components/chamados/detalhe-ui';

type Pessoa = { id: string; name: string; profileImageUrl?: string | null };

interface HistoricoEntry {
  id: string;
  tipo: string;
  detalhe: Record<string, string> | null;
  createdAt: string;
  autor: { id: string; name: string };
}

interface Chamado {
  id: string;
  codigo: string;
  titulo: string;
  descricao?: string | null;
  status: string;
  prioridade: string;
  createdAt: string;
  previsaoConclusao?: string | null;
  canManage: boolean;
  ministerio: { id: string; nome: string };
  abertoPor: Pessoa & { email: string };
  responsavel?: Pessoa | null;
  respostas: { id: string; valor: string; campo: { id: string; label: string; tipo: string; ordem: number } }[];
  comentarios: { id: string; texto: string; createdAt: string; autor: Pessoa }[];
  historico: HistoricoEntry[];
}

type Folha = 'status' | 'prioridade' | 'responsavel' | 'previsao' | null;

const VIDEO = /\.(mp4|mov|webm|m4v)(\?|$)/i;

/** Texto da atualização do histórico (valor novo em negrito) */
function TextoHistorico({ entry }: { entry: HistoricoEntry }) {
  const d = entry.detalhe ?? {};
  const nome = <strong className="font-semibold">{entry.autor.name}</strong>;
  const b = (t?: string) => <strong className="font-semibold">{t}</strong>;
  switch (entry.tipo) {
    case 'CRIADO':
      return <>{nome} abriu o chamado</>;
    case 'STATUS_ALTERADO':
      return <>{nome} mudou o status de {STATUS_DETALHE[d.de]?.label ?? d.de} para {b(STATUS_DETALHE[d.para]?.label ?? d.para)}</>;
    case 'PRIORIDADE_ALTERADA':
      return <>{nome} mudou a prioridade de {PRIORIDADE_LABEL[d.de] ?? d.de} para {b(PRIORIDADE_LABEL[d.para] ?? d.para)}</>;
    case 'RESPONSAVEL_ATRIBUIDO': {
      const proprio = d.responsavelId ? d.responsavelId === entry.autor.id : d.responsavel === entry.autor.name;
      return proprio ? <>{nome} assumiu como responsável</> : <>{nome} designou {b(d.responsavel)} como responsável</>;
    }
    case 'RESPONSAVEL_REMOVIDO':
      return <>{nome} removeu o responsável</>;
    case 'PREVISAO_DEFINIDA':
      return <>{nome} definiu a previsão para {b(d.para ? dataSemFuso(d.para) : '')}</>;
    case 'PREVISAO_REMOVIDA':
      return <>{nome} removeu a previsão</>;
    default:
      return <>{nome} atualizou o chamado</>;
  }
}

function anexosDe(chamado: Chamado) {
  return chamado.respostas
    .filter((r) => r.campo.tipo === 'ANEXO')
    .flatMap((r) => {
      try {
        return JSON.parse(r.valor) as string[];
      } catch {
        return [];
      }
    });
}

function valorCampo(valor: string, tipo: string) {
  if (tipo === 'MULTISELECT') {
    try {
      return (JSON.parse(valor) as string[]).join(', ');
    } catch {
      return valor;
    }
  }
  return valor;
}

/** Linha da lista de informações (botão quando editável) */
function LinhaInfo({
  rotulo,
  children,
  onEditar,
  rotuloAcessivel,
}: {
  rotulo: string;
  children: React.ReactNode;
  /** Recebe o botão tocado (o foco volta para ele ao fechar a folha) */
  onEditar?: (origem: HTMLElement) => void;
  rotuloAcessivel?: string;
}) {
  const conteudo = (
    <>
      <span className="shrink-0 text-sm text-[#5B6478]">{rotulo}</span>
      <span className="ml-auto flex min-w-0 items-center gap-2 text-[15px] font-medium text-[#0E1024]">{children}</span>
    </>
  );
  const classe = 'flex min-h-[52px] w-full items-center gap-3 border-b border-[#ECEDF3] px-3.5 py-2 text-left last:border-b-0';
  if (!onEditar) return <li className={classe}>{conteudo}</li>;
  return (
    <li className="border-b border-[#ECEDF3] last:border-b-0">
      <button
        type="button"
        onClick={(e) => onEditar(e.currentTarget)}
        aria-haspopup="dialog"
        aria-label={rotuloAcessivel}
        className={cn(classe, 'border-0 hover:bg-[#F8F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-onda-blue/40')}
      >
        {conteudo}
      </button>
    </li>
  );
}

export default function ChamadoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const tecladoOffset = useKeyboardOffset();

  const [chamado, setChamado] = useState<Chamado | null>(null);
  const [estado, setEstado] = useState<'carregando' | 'erro' | 'nao-encontrado' | 'pronto'>('carregando');
  const [isAdmin, setIsAdmin] = useState(false);
  const [membros, setMembros] = useState<Pessoa[]>([]);
  const [folha, setFolha] = useState<Folha>(null);
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [anuncio, setAnuncio] = useState('');
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  const origemRef = useRef<HTMLElement | null>(null);
  const fimComentariosRef = useRef<HTMLLIElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const carregar = useCallback(async () => {
    try {
      const res = await fetch(`/api/chamados/${params.id}`);
      if (res.status === 404 || res.status === 403) {
        setEstado('nao-encontrado');
        return;
      }
      if (!res.ok) throw new Error();
      setChamado(await res.json());
      setEstado('pronto');
    } catch {
      setEstado((e) => (e === 'pronto' ? e : 'erro'));
    }
  }, [params.id]);

  // Ao voltar para a lista, os filtros dela são mantidos
  useEffect(() => {
    marcarVisitaAoDetalhe();
  }, []);

  useEffect(() => {
    checkAuth().then(({ user }) => {
      if (!user) {
        router.push('/');
        return;
      }
      setIsAdmin(user.role === 'admin');
      carregar();
    });
  }, [router, carregar]);

  // Pessoas do ministério (para designar responsável)
  useEffect(() => {
    if (!chamado?.canManage) return;
    fetch(`/api/ministerios/${chamado.ministerio.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        const todos = [data.lider, data.coLider, ...(data.membros ?? []).map((m: { user: Pessoa }) => m.user)].filter(Boolean) as Pessoa[];
        setMembros(
          Array.from(new Map(todos.map((m) => [m.id, m])).values()).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
        );
      })
      .catch(() => {});
  }, [chamado?.canManage, chamado?.ministerio.id]);

  const { puxando, atualizando } = usePullToRefresh(carregar, folha !== null);

  const abrirFolha = (qual: Folha, origem: HTMLElement | null) => {
    origemRef.current = origem;
    setFolha(qual);
  };

  /** Edição direta: aplica na hora, salva e, se falhar, volta o valor anterior */
  const salvar = async (campo: 'status' | 'prioridade' | 'responsavelId' | 'previsaoConclusao', valor: string | null, aviso: string) => {
    if (!chamado) return;
    setFolha(null);
    const anterior = chamado;
    const otimista: Chamado = { ...chamado };
    if (campo === 'status') otimista.status = valor!;
    if (campo === 'prioridade') otimista.prioridade = valor!;
    if (campo === 'responsavelId') otimista.responsavel = valor ? membros.find((m) => m.id === valor) ?? null : null;
    if (campo === 'previsaoConclusao') otimista.previsaoConclusao = valor;
    setChamado(otimista);
    try {
      const res = await fetch(`/api/chamados/${chamado.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [campo]: valor }),
      });
      if (!res.ok) throw new Error();
      setAnuncio(aviso);
      await carregar(); // traz a nova atualização do histórico
    } catch {
      setChamado(anterior);
      toast({ title: 'Não foi possível salvar. Tente de novo.', variant: 'destructive' });
    }
  };

  const enviarComentario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chamado || !comentario.trim() || enviando) return;
    setEnviando(true);
    try {
      const res = await fetch(`/api/chamados/${chamado.id}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: comentario }),
      });
      if (!res.ok) throw new Error();
      const novo = await res.json();
      setChamado((c) => (c ? { ...c, comentarios: [...c.comentarios, novo] } : c));
      setComentario('');
      setAnuncio('Comentário enviado');
      setTimeout(() => fimComentariosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 50);
    } catch {
      toast({ title: 'Não foi possível enviar o comentário.', variant: 'destructive' });
    } finally {
      setEnviando(false);
    }
  };

  // Campo de comentário cresce até 4 linhas
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 4 * 22 + 20)}px`;
  }, [comentario]);

  const excluir = async () => {
    await fetch(`/api/chamados/${params.id}`, { method: 'DELETE' });
    router.push('/chamados');
  };

  const voltar = (
    <Link href="/chamados" className="-ml-1 inline-flex min-h-11 items-center gap-1.5 px-1 text-[15px] font-medium text-[#0E1024]">
      <ArrowLeft aria-hidden="true" className="h-5 w-5" />
      Chamados
    </Link>
  );

  // ─── Estados ───
  if (estado === 'carregando') {
    return (
      <div className="mt-[72px] px-4 pt-2" aria-busy="true">
        <Skeleton className="h-12 w-32" />
        <div className="mt-2 flex gap-2">
          <Skeleton className="h-10 w-32 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
        <Skeleton className="mt-4 h-6 w-11/12" />
        <Skeleton className="mt-2 h-6 w-2/3" />
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-5/6" />
        <div className="mt-5 overflow-hidden rounded-[14px] border border-[#E3E6EF]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex h-[52px] items-center justify-between border-b border-[#ECEDF3] px-3.5 last:border-b-0">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (estado === 'nao-encontrado' || estado === 'erro' || !chamado) {
    return (
      <div className="mt-[72px] px-4 pt-2">
        {voltar}
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="font-medium text-[#0E1024]">
            {estado === 'nao-encontrado' ? 'Chamado não encontrado' : 'Não foi possível carregar o chamado'}
          </p>
          {estado === 'erro' && (
            <button
              type="button"
              onClick={() => {
                setEstado('carregando');
                carregar();
              }}
              className="h-11 rounded-xl border-[1.5px] border-onda-blue px-4 text-[15px] font-semibold text-onda-blue"
            >
              Tentar de novo
            </button>
          )}
        </div>
      </div>
    );
  }

  const podeEditar = chamado.canManage;
  const status = STATUS_DETALHE[chamado.status] ?? STATUS_DETALHE.PENDENTE;
  const prioridade = PRIORIDADE_SELO[chamado.prioridade] ?? PRIORIDADE_SELO.MEDIA;
  const IconePrioridade = prioridade.icon;
  const anexos = anexosDe(chamado);
  const outrosCampos = chamado.respostas
    .filter((r) => r.campo.tipo !== 'ANEXO' && r.valor)
    .sort((a, b) => a.campo.ordem - b.campo.ordem);
  const previsao = chamado.previsaoConclusao ? chamado.previsaoConclusao.slice(0, 10) : '';
  const ultimaAtualizacao = chamado.historico[chamado.historico.length - 1];
  const nAtualizacoes = chamado.historico.length;
  // Regra que já existia: quem atende sempre comenta; quem abriu, enquanto não estiver concluído/cancelado
  const podeComentar = podeEditar || (chamado.status !== 'CONCLUIDO' && chamado.status !== 'CANCELADO');
  const historicoId = `historico-${chamado.id}`;

  const opcoesStatus: Opcao[] = Object.entries(STATUS_DETALHE).map(([valor, s]) => ({
    valor,
    label: s.label,
    icone: <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.ponto }} />,
  }));
  const opcoesPrioridade: Opcao[] = Object.entries(PRIORIDADE_SELO).map(([valor, p]) => {
    const Icone = p.icon;
    return {
      valor,
      label: p.label,
      icone: (
        <span aria-hidden="true" className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-md', p.classe)}>
          <Icone className="h-3.5 w-3.5" />
        </span>
      ),
    };
  });
  const opcoesResponsavel: Opcao[] = [
    { valor: '', label: 'Sem responsável' },
    ...membros.map((m) => ({ valor: m.id, label: m.name, icone: <Avatar nome={m.name} foto={m.profileImageUrl} tamanho={24} /> })),
  ];

  // Rodapé fixo: acima da barra de navegação; com o teclado aberto, colado acima dele
  const rodapeBottom = tecladoOffset > 0 ? `${tecladoOffset}px` : undefined;

  return (
    <div className="mt-[72px] px-4 pb-40 md:pb-28">
      <p aria-live="polite" className="sr-only">{anuncio}</p>

      {(puxando > 0 || atualizando) && (
        <p role="status" className="py-2 text-center text-xs text-[#5B6478]">
          {atualizando ? 'Atualizando…' : puxando > 70 ? 'Solte para atualizar' : 'Puxe para atualizar'}
        </p>
      )}

      {/* 1. Voltar + código */}
      <div className="flex h-12 items-center justify-between">
        {voltar}
        <span className="font-mono text-xs text-[#5B6478]">{chamado.codigo}</span>
      </div>

      {/* 2. Selos de status e prioridade (único lugar com esses valores) */}
      <div className="flex flex-wrap gap-2">
        {podeEditar ? (
          <button
            type="button"
            aria-haspopup="dialog"
            aria-label={`Status: ${status.label}. Alterar`}
            onClick={(e) => abrirFolha('status', e.currentTarget)}
            className="inline-flex h-10 items-center gap-2 rounded-full pl-3.5 pr-3 text-sm font-semibold"
            style={{ backgroundColor: status.fundo, color: status.texto }}
          >
            <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ backgroundColor: status.ponto }} />
            {status.label}
            <ChevronDown aria-hidden="true" className="h-4 w-4" />
          </button>
        ) : (
          <span className="inline-flex h-10 items-center gap-2 rounded-full px-3.5 text-sm font-semibold" style={{ backgroundColor: status.fundo, color: status.texto }}>
            <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ backgroundColor: status.ponto }} />
            {status.label}
          </span>
        )}
        {podeEditar ? (
          <button
            type="button"
            aria-haspopup="dialog"
            aria-label={`Prioridade: ${prioridade.label}. Alterar`}
            onClick={(e) => abrirFolha('prioridade', e.currentTarget)}
            className={cn('inline-flex h-10 items-center gap-1.5 rounded-full pl-3 pr-3 text-sm font-semibold', prioridade.classe)}
          >
            <IconePrioridade aria-hidden="true" className="h-4 w-4" />
            {prioridade.label}
            <ChevronDown aria-hidden="true" className="h-4 w-4" />
          </button>
        ) : (
          <span className={cn('inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold', prioridade.classe)}>
            <IconePrioridade aria-hidden="true" className="h-4 w-4" />
            {prioridade.label}
          </span>
        )}
      </div>

      {/* 3. Título, descrição e anexos */}
      <h1 className="mt-3.5 text-xl font-bold leading-[26px] text-[#0E1024]">{chamado.titulo}</h1>
      {chamado.descricao && (
        <p className="mt-2 whitespace-pre-line text-[15px] leading-[22px] text-[#0E1024]">{chamado.descricao}</p>
      )}
      {anexos.length > 0 && (
        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {anexos.map((url, i) => {
            const video = VIDEO.test(url);
            const total = anexos.filter((u) => VIDEO.test(u) === video).length;
            const indice = anexos.slice(0, i + 1).filter((u) => VIDEO.test(u) === video).length;
            return (
              <button
                key={url}
                type="button"
                onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                aria-label={`${video ? 'Vídeo' : 'Foto'} ${indice} de ${total}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-[#E3E6EF] bg-[#F8F9FC]"
              >
                {video ? (
                  <span className="flex h-full w-full items-center justify-center text-[#5B6478]">
                    <Play aria-hidden="true" className="h-8 w-8" />
                  </span>
                ) : (
                  <img src={url} alt="" className="h-full w-full object-cover" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 4. Lista de informações */}
      <ul className="mt-5 overflow-hidden rounded-[14px] border border-[#E3E6EF]">
        <LinhaInfo
          rotulo="Responsável"
          onEditar={podeEditar ? (origem) => abrirFolha('responsavel', origem) : undefined}
          rotuloAcessivel={chamado.responsavel ? `Responsável: ${chamado.responsavel.name}. Alterar` : 'Responsável: não designado. Designar'}
        >
          {chamado.responsavel ? (
            <>
              <Avatar nome={chamado.responsavel.name} foto={chamado.responsavel.profileImageUrl} tamanho={24} />
              <span className="truncate">{chamado.responsavel.name}</span>
            </>
          ) : podeEditar ? (
            <span className="font-semibold text-onda-blue">Designar</span>
          ) : (
            <span className="text-[#5B6478]">Não designado</span>
          )}
          {podeEditar && <ChevronRight aria-hidden="true" className="h-[18px] w-[18px] shrink-0 text-[#5B6478]" />}
        </LinhaInfo>
        <LinhaInfo
          rotulo="Previsão de conclusão"
          onEditar={podeEditar ? (origem) => abrirFolha('previsao', origem) : undefined}
          rotuloAcessivel={previsao ? `Previsão de conclusão: ${dataSemFuso(previsao)}. Alterar` : 'Previsão de conclusão: sem previsão. Definir'}
        >
          {previsao ? (
            <span className="whitespace-nowrap">{dataSemFuso(previsao)}</span>
          ) : podeEditar ? (
            <span className="font-semibold text-onda-blue">Definir</span>
          ) : (
            <span className="text-[#5B6478]">Sem previsão</span>
          )}
          {podeEditar && <ChevronRight aria-hidden="true" className="h-[18px] w-[18px] shrink-0 text-[#5B6478]" />}
        </LinhaInfo>
        <LinhaInfo rotulo="Ministério">
          <span className="truncate">{chamado.ministerio.nome}</span>
        </LinhaInfo>
        <LinhaInfo rotulo="Aberto por">
          <Avatar nome={chamado.abertoPor.name} foto={chamado.abertoPor.profileImageUrl} tamanho={24} />
          <span className="truncate">{chamado.abertoPor.name}</span>
        </LinhaInfo>
        <LinhaInfo rotulo="Aberto em">
          <span className="whitespace-nowrap">{dataHora(chamado.createdAt)}</span>
        </LinhaInfo>
        {/* Perguntas do formulário do ministério (somente leitura) */}
        {outrosCampos.map((r) => (
          <LinhaInfo key={r.id} rotulo={r.campo.label}>
            <span className="truncate">{valorCampo(r.valor, r.campo.tipo)}</span>
          </LinhaInfo>
        ))}
      </ul>

      {/* 5. Histórico (só atualizações; carrega sempre fechado) */}
      <section className="mt-5">
        <button
          type="button"
          aria-expanded={historicoAberto}
          aria-controls={historicoId}
          onClick={() => setHistoricoAberto((v) => !v)}
          className="flex min-h-11 w-full items-center gap-2 text-left"
        >
          <Clock aria-hidden="true" className="h-5 w-5 shrink-0 text-[#0E1024]" />
          <h2 className="text-base font-bold text-[#0E1024]">Histórico</h2>
          <span className="text-sm text-[#5B6478]">{nAtualizacoes}</span>
          {!historicoAberto && ultimaAtualizacao && (
            <span className="ml-auto truncate text-[13px] text-[#5B6478]">Última: {diaMesHora(ultimaAtualizacao.createdAt)}</span>
          )}
          {historicoAberto ? (
            <ChevronUp aria-hidden="true" className="ml-auto h-5 w-5 shrink-0 text-[#5B6478]" />
          ) : (
            <ChevronDown aria-hidden="true" className={cn('h-5 w-5 shrink-0 text-[#5B6478]', !ultimaAtualizacao && 'ml-auto')} />
          )}
        </button>
        {historicoAberto && (
          <ul id={historicoId} className="mt-2 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200">
            {chamado.historico.map((h, i) => (
              <li key={h.id} className="flex">
                {/* Trilho: começa no primeiro marcador e termina no último */}
                <div aria-hidden="true" className="relative w-5 shrink-0">
                  {i > 0 && <span className="absolute left-[9px] top-0 h-[13px] w-0.5 bg-[#CDD1EA]" />}
                  {i < nAtualizacoes - 1 && <span className="absolute bottom-0 left-[9px] top-[13px] w-0.5 bg-[#CDD1EA]" />}
                  <span className="absolute left-[5px] top-[8px] h-2.5 w-2.5 rounded-full border-2 border-[#121879] bg-white" />
                </div>
                <div className={cn('ml-2 min-w-0 flex-1', i < nAtualizacoes - 1 && 'pb-3.5')}>
                  <p className="text-[15px] leading-[22px] text-[#0E1024]">
                    <TextoHistorico entry={h} />
                  </p>
                  <p className="text-[13px] text-[#5B6478]">{dataHora(h.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 6. Comentários */}
      <section className="mt-5 border-t border-[#ECEDF3] pt-4">
        <div className="flex items-center gap-2">
          <MessageSquare aria-hidden="true" className="h-5 w-5 text-[#0E1024]" />
          <h2 className="text-base font-bold text-[#0E1024]">Comentários</h2>
          <span className="text-sm text-[#5B6478]">{chamado.comentarios.length}</span>
        </div>
        {chamado.comentarios.length === 0 ? (
          <p className="mt-3 text-sm text-[#5B6478]">Nenhum comentário ainda.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {chamado.comentarios.map((c, i) => (
              <li key={c.id} ref={i === chamado.comentarios.length - 1 ? fimComentariosRef : undefined} className="flex gap-2.5">
                <Avatar nome={c.autor.name} foto={c.autor.profileImageUrl} tamanho={28} />
                <div className="min-w-0 flex-1 rounded-xl border border-[#E3E6EF] bg-[#F8F9FC] px-3 py-2.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-[#0E1024]">{c.autor.name}</span>
                    <span className="shrink-0 text-xs text-[#5B6478]">{diaMesHora(c.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 whitespace-pre-line text-[15px] leading-[22px] text-[#0E1024]">{c.texto}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Exclusão (admin) */}
      {isAdmin && (
        <button
          type="button"
          onClick={() => setConfirmarExclusao(true)}
          className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#B42318]"
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" />
          Excluir chamado
        </button>
      )}

      {/* 7. Campo de comentário fixo */}
      {podeComentar && (
        <form
          onSubmit={enviarComentario}
          className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-40 flex items-end gap-2 border-t border-[#ECEDF3] bg-white px-4 py-2 md:bottom-0"
          style={rodapeBottom ? { bottom: rodapeBottom } : undefined}
        >
          <label htmlFor="novo-comentario" className="sr-only">Escreva um comentário</label>
          <textarea
            ref={textareaRef}
            id="novo-comentario"
            rows={1}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Escreva um comentário…"
            className="max-h-[108px] min-h-11 flex-1 resize-none rounded-[22px] border border-[#E3E6EF] bg-[#F8F9FC] px-4 py-2.5 text-base leading-[22px] text-[#0E1024] placeholder:text-[15px] placeholder:text-[#5B6478] focus:border-onda-blue focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Enviar comentário"
            disabled={!comentario.trim() || enviando}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-onda-blue text-white disabled:bg-[#D5D8E3]"
          >
            <Send aria-hidden="true" className="h-5 w-5" />
          </button>
        </form>
      )}

      {/* 8. Folhas de edição (tocar numa opção salva e fecha) */}
      <FolhaOpcoes
        aberta={folha === 'status'}
        onAbertaChange={(a) => !a && setFolha(null)}
        titulo="Alterar status"
        legenda="Status"
        opcoes={opcoesStatus}
        valor={chamado.status}
        origemRef={origemRef}
        onEscolher={(v) =>
          v === chamado.status ? setFolha(null) : salvar('status', v, `Status alterado para ${STATUS_DETALHE[v]?.label}`)
        }
      />
      <FolhaOpcoes
        aberta={folha === 'prioridade'}
        onAbertaChange={(a) => !a && setFolha(null)}
        titulo="Alterar prioridade"
        legenda="Prioridade"
        opcoes={opcoesPrioridade}
        valor={chamado.prioridade}
        origemRef={origemRef}
        onEscolher={(v) =>
          v === chamado.prioridade ? setFolha(null) : salvar('prioridade', v, `Prioridade alterada para ${PRIORIDADE_LABEL[v]}`)
        }
      />
      <FolhaOpcoes
        aberta={folha === 'responsavel'}
        onAbertaChange={(a) => !a && setFolha(null)}
        titulo="Responsável"
        legenda="Responsável"
        opcoes={opcoesResponsavel}
        valor={chamado.responsavel?.id ?? ''}
        comBusca={membros.length > 8}
        origemRef={origemRef}
        onEscolher={(v) =>
          v === (chamado.responsavel?.id ?? '')
            ? setFolha(null)
            : salvar('responsavelId', v || null, v ? 'Responsável designado' : 'Responsável removido')
        }
      />
      <FolhaPrevisao
        aberta={folha === 'previsao'}
        onAbertaChange={(a) => !a && setFolha(null)}
        valor={previsao}
        origemRef={origemRef}
        onEscolher={(v) =>
          v === previsao ? setFolha(null) : salvar('previsaoConclusao', v || null, v ? 'Previsão definida' : 'Previsão removida')
        }
      />

      <AlertDialog open={confirmarExclusao} onOpenChange={setConfirmarExclusao}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir chamado</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o chamado {chamado.codigo}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={excluir} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
