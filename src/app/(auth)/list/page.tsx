'use client';
import { useEffect, useRef, useState, useCallback } from "react"
import { checkAuth, updateMensagemEnviada, checkIsAdmin } from "../../actions"
import { LayoutGrid, LayoutList, MessageCircle, Plus, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import ButtonForm from "@/components/button-form";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { DetailView } from "@/components/visitors/details-view";
import { VisitorCard } from "@/components/visitors/visitor-card";
import { SkeletonCard } from "@/components/visitors/skeleton";
import { SwipeInstruction } from "@/components/visitors/swipe-intruction";
import Image from "next/image";

interface Visitante {
  id: string;
  nome: string;
  telefone: string;
  estado?: string | null;
  cidade?: string | null;
  bairro?: string | null;
  idade: number;
  genero: string;
  estado_civil: string;
  culto: string;
  como_nos_conheceu?: string | null;
  como_chegou_ate_nos?: string | null;
  frequenta_igreja?: string | null | undefined;
  qual_igreja?: string | null;
  interesse_em_conhecer: string[];
  observacao?: string | null;
  mensagem_enviada: boolean;
  created_at: string | Date;
  registeredBy?: {
    name: string;
  } | null;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Custom hook for debounced search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function List() {
  const [isGridView, setIsGridView] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [visitantes, setVisitantes] = useState<Visitante[]>([]);
  const [selectedItem, setSelectedItem] = useState<Visitante | null>(null)
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const isAdminRef = useRef(false);

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    async function fetchData() {
      const { user } = await checkAuth();
      const { isAdmin } = await checkIsAdmin();
      
      // Como já estamos no layout autenticado, só verificamos se é admin
      if (!user) {
        return;
      }

      isAdminRef.current = isAdmin;

      if (!isAdmin) {
        router.push('/register');
        return;
      }

      setUserName(user.name);
    }
    fetchData();
  }, [router]);

  // Fetch visitors from API
  const fetchVisitantes = useCallback(async (page: number = 1, search: string = '', resetList: boolean = true) => {
    if (resetList) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search.trim() && { search: search.trim() })
      });

      const response = await fetch(`/api/visitors?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch visitors');
      }

      const result = await response.json();
      
      if (resetList) {
        setVisitantes(result.visitantes);
        setCurrentPage(1);
      } else {
        setVisitantes(prev => [...prev, ...result.visitantes]);
        setCurrentPage(page);
      }
      
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error fetching visitors:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchVisitantes(1, '', true);
  }, [fetchVisitantes]);

  // Search when debounced term changes
  useEffect(() => {
    fetchVisitantes(1, debouncedSearchTerm, true);
  }, [debouncedSearchTerm, fetchVisitantes]);

  const loadMoreVisitantes = async () => {
    if (!pagination?.hasNext || loadingMore) return;
    
    const nextPage = currentPage + 1;
    await fetchVisitantes(nextPage, debouncedSearchTerm, false);
  };

  const handleItemClick = (item: Visitante) => {
    setSelectedItem(item)
  }
  
  const handleBackToList = () => {
    setSelectedItem(null)
  }

  const handleWhatsAppClick = async (phone: string, name: string, visitorId: string) => {
    try {
      const cleanedPhone = phone.replace(/\D/g, '');
      const message = encodeURIComponent(`Oii ${name}, tudo bem? Aqui é da Igreja Onda Dura Curitiba. Gostaria de dizer que ficamos muito felizes com sua visita na nossa igreja nesse último final de semana.\n\nCremos que Deus tem um propósito com tudo isso!\n\nGostaria muito de saber: como foi para você participar do nosso culto? E você gostaria de conhecer um pouco mais do que nós vivemos como igreja?\n\nDeus te abençoe!`);
      const whatsappUrl = `https://web.whatsapp.com/send?phone=${cleanedPhone}&text=${message}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      
      await updateMensagemEnviada(visitorId);
      
      setVisitantes(visitantes.map((v: any) => 
        v.id === visitorId ? {...v, mensagem_enviada: !v.mensagem_enviada} : v
      ));
    }catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  }


  const handleDeleteVisitor = async (id: string) => {
    setVisitantes((prevVisitantes) => 
      prevVisitantes.filter((visitante) => visitante.id !== id)
    );
    // Update pagination count
    if (pagination) {
      setPagination(prev => prev ? { ...prev, total: prev.total - 1 } : null);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  if (!isAdminRef.current) {
      return (
          <div className="flex justify-center items-center h-full">
            <Image 
              src="/logo.svg" 
              alt="Onda Logo" 
              width={550} 
              height={350} 
              className="m-auto"
          />
        </div>
      );
  }

  if (selectedItem) {
    return (
      <>
        <DetailView 
          item={selectedItem} 
          onBack={handleBackToList}
          onDelete={handleDeleteVisitor}
        />
      </>
    )
  }

  return (
    <>
      <div className="p-2 sm:p-6">
        <div className="mb-4 flex flex-col-reverse sm:flex-row items-end sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <Input
              type="text"
              placeholder="Buscar visitantes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 bg-white rounded-md border-gray-300 focus:border-gray-500 focus:ring-gray-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                ×
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsGridView(!isGridView)}
              className="hidden sm:flex"
              aria-label={isGridView ? "Switch to list view" : "Switch to grid view"}
            >
              {isGridView ? <LayoutList size={20} /> : <LayoutGrid size={20} />}
            </Button>
            <ButtonForm type="button" onClick={() => router.push('/register')} label={`Novo visitante`} icon={<Plus size={20} />} />
          </div>
        </div>
        
        {/* Show search results count */}
        {pagination && (
          <div className="mb-4 text-sm text-gray-600">
            {searchTerm.trim() ? (
              <span>
                {pagination.total} visitante{pagination.total !== 1 ? 's' : ''} encontrado{pagination.total !== 1 ? 's' : ''} para &quot;{searchTerm}&quot;
              </span>
            ) : (
              <span>Mostrando {visitantes.length} de {pagination.total} visitantes</span>
            )}
          </div>
        )}
        
        <SwipeInstruction />
        {loading ? (
          // Show skeleton cards while loading
          <div className={`grid gap-4 ${isGridView ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : visitantes.length > 0 ? (
          <>
            <div className={`grid gap-4 ${isGridView ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {visitantes.map((visitante: any) => (
                <VisitorCard
                  key={visitante.id}
                  visitante={visitante}
                  onItemClick={handleItemClick}
                  onWhatsAppClick={handleWhatsAppClick}
                  onMessageStatusChange={(id) => {
                    setVisitantes(visitantes.map((v: any) => 
                      v.id === id ? {...v, mensagem_enviada: !v.mensagem_enviada} : v
                    ));
                  }}
                />
              ))}
            </div>
            
            {/* Load More Button - only show if not searching and has more results */}
            {pagination?.hasNext && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={loadMoreVisitantes}
                  disabled={loadingMore}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {loadingMore ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                  {loadingMore ? 'Carregando...' : 'Carregar mais'}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10">
            <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-base font-semibold text-gray-900">Nenhum visitante encontrado</h3>
            <p className="mt-1 text-base text-gray-500">
              {searchTerm.trim() !== '' 
                ? <>Não foram encontrados visitantes com o nome &quot;{searchTerm}&quot;.</>
                : "Não há visitantes para exibir no momento."
              }
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
              {searchTerm.trim() !== '' && (
                <Button variant="outline" onClick={handleClearSearch}>
                  Limpar busca
                </Button>
              )}
              <Button onClick={() => router.push('/register')}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar novo visitante
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
