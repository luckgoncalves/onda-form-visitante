'use client';
import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { checkAuth, updateMensagemEnviada, logout, checkIsAdmin } from "../actions"
import { LayoutGrid, LayoutList, MessageCircle, Plus, Search, ChevronDown, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import ButtonForm from "@/components/button-form";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/header";
import { DetailView } from "@/components/visitors/details-view";
import { VisitorCard } from "@/components/visitors/visitor-card";
import { SkeletonCard } from "@/components/visitors/skeleton";
import { SwipeInstruction } from "@/components/visitors/swipe-intruction";
import LoadingOnda from "@/components/loading-onda";
import { DatePicker } from "@/components/ui/DatePicker";
import { Select } from "@/components/ui/select";
import { format } from "date-fns";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";

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
  responsavel_nome?: string | null;
  responsavel_telefone?: string | null;
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
  const [userId, setUserId] = useState("");
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const isAdminRef = useRef(false);
  const [filters, setFilters] = useState({
    culto: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
  });
  const [filtersDraft, setFiltersDraft] = useState({
    culto: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
  });

  const filterParams = useMemo(() => ({
    culto: filters.culto || undefined,
    startDate: filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : undefined,
    endDate: filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : undefined,
  }), [filters]);

  const hasActiveFilters = Boolean(filters.culto || filters.startDate || filters.endDate);
  const hasFiltersApplied = Boolean(searchTerm || hasActiveFilters);

  useEffect(() => {
    setFiltersDraft(filters);
  }, [filters]);

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    async function fetchData() {
      const { isAuthenticated, user } = await checkAuth();
      const { isAdmin } = await checkIsAdmin();
      if (!isAuthenticated || !user) {
        router.push('/');
        return;
      }

      isAdminRef.current = isAdmin;

      if (!isAdmin) {
        router.push('/register');
        return;
      }
      
      if (user.requirePasswordChange) {
        router.push('/change-password');
        return;
      }

      setUserName(user.name);
      setUserId(user.id);
    }
    fetchData();
  }, [router]);

  // Fetch visitors from API
  const fetchVisitantes = useCallback(async (
    page: number = 1,
    search: string = '',
    resetList: boolean = true,
    filters?: { culto?: string; startDate?: string; endDate?: string }
  ) => {
    if (resetList) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search.trim() && { search: search.trim() }),
        ...(filters?.culto && { culto: filters.culto }),
        ...(filters?.startDate && { startDate: filters.startDate }),
        ...(filters?.endDate && { endDate: filters.endDate }),
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

  // Fetch whenever search term or filters change
  useEffect(() => {
    fetchVisitantes(1, debouncedSearchTerm, true, filterParams);
  }, [debouncedSearchTerm, fetchVisitantes, filterParams]);

  const loadMoreVisitantes = async () => {
    if (!pagination?.hasNext || loadingMore) return;
    
    const nextPage = currentPage + 1;
    await fetchVisitantes(nextPage, debouncedSearchTerm, false, filterParams);
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

  const handleLogout = async () => {
    await logout();
    router.push('/');
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

  const handleClearFilters = () => {
    const empty = { culto: '', startDate: null as Date | null, endDate: null as Date | null };
    setFilters(empty);
    setFiltersDraft(empty);
  };

  const handleApplyFilters = () => {
    setFilters(filtersDraft);
  };

  if (!isAdminRef.current) {
      return (
        <LoadingOnda />
      );
  }

  if (selectedItem) {
    return (
      <>
        <Header userId={userId} userName={userName} onLogout={handleLogout} />
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
      <Header userId={userId} userName={userName} onLogout={handleLogout} />
      <div className="p-2 sm:p-6 mt-[72px]">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full">
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
          <div className="flex gap-2 w-full sm:w-auto">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="flex  w-fit items-center justify-center gap-2 text-base"
                >
                  <SlidersHorizontal size={18} />
                  <span className="hidden sm:inline">Filtros</span>
                  {hasFiltersApplied && (
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Filtros da listagem</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6 ">
                  <div className="space-y-2 ">
                    <label className="text-sm font-medium text-gray-700">Buscar visitantes</label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Buscar por nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-10 bg-white border rounded-md border-gray-300 focus:border-onda-darkBlue focus:ring-onda-darkBlue w-full"
                      />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      {searchTerm && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearSearch}
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Culto</label>
                    <div className="relative">
                      <Select
                        value={filtersDraft.culto}
                        onChange={(event) =>
                          setFiltersDraft((prev) => ({ ...prev, culto: event.target.value }))
                        }
                        className="w-full px-4 bg-white border border-gray-300 rounded-md text-left pr-10 h-12 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                      >
                        <option value="">Todos os cultos</option>
                        <option value="sabado">Sábado</option>
                        <option value="domingo-manha">Domingo manhã</option>
                        <option value="domingo-noite">Domingo noite</option>
                        <option value="new">New</option>
                        <option value="evento">Evento</option>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Data inicial</label>
                    <DatePicker
                      date={filtersDraft.startDate}
                      setDate={(date) =>
                        setFiltersDraft((prev) => ({ ...prev, startDate: date }))
                      }
                      placeholder="Selecione uma data"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Data final</label>
                    <DatePicker
                      date={filtersDraft.endDate}
                      setDate={(date) =>
                        setFiltersDraft((prev) => ({ ...prev, endDate: date }))
                      }
                      placeholder="Selecione uma data"
                      className="h-12"
                    />
                  </div>
                </div>
                <SheetFooter className="flex gap-4 sm:gap-0 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleClearFilters();
                      handleClearSearch();
                    }}
                    disabled={!hasFiltersApplied}
                  >
                    Limpar filtros
                  </Button>
                  <SheetClose asChild>
                    <Button className="w-full sm:w-auto bg-onda-darkBlue hover:bg-onda-darkBlue/90 text-white " onClick={handleApplyFilters}>
                      Aplicar filtros
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsGridView(!isGridView)}
              className="hidden sm:flex"
              aria-label={isGridView ? "Switch to list view" : "Switch to grid view"}
            >
              {isGridView ? <LayoutList size={20} /> : <LayoutGrid size={20} />}
            </Button>
            <ButtonForm type="button" onClick={() => router.push('/register')} label={`Visitante`} icon={<Plus size={20} />} />
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
                visitante
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
