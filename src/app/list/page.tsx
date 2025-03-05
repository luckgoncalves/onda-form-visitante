'use client';
import { useEffect, useState } from "react"
import { findAll, checkAuth, updateMensagemEnviada, logout } from "../actions"
import { LayoutGrid, LayoutList, MessageCircle, PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import ButtonForm from "@/components/button-form";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/header";
import { DetailView } from "@/components/visitors/details-view";
import { VisitorCard } from "@/components/visitors/visitor-card";
import { SkeletonCard } from "@/components/visitors/skeleton";
import { SwipeInstruction } from "@/components/visitors/swipe-intruction";

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
  frequenta_igreja?: string | null;
  qual_igreja?: string | null;
  interesse_em_conhecer: string[];
  observacao?: string | null;
  mensagem_enviada: boolean;
  created_at: string | Date;
}

export default function List() {
  const [isGridView, setIsGridView] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [visitantes, setVisitantes] = useState<Visitante[]>([]);
  const [selectedItem, setSelectedItem] = useState<Visitante | null>(null)
  const [ loading, setLoading] = useState(false);
  const router = useRouter();
  const [filteredVisitantes, setFilteredVisitantes] = useState<Visitante[]>([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    async function fetchData() {
      const { isAuthenticated, user } = await checkAuth();
      if (!isAuthenticated) {
        router.push('/'); // Redirect to login if not authenticated
      } else if (user) {
        setUserName(user.name);
      }
    }
    fetchData();
  }, [router]);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const users = await findAll(); 
      console.log(users);
      setLoading(false);
      setVisitantes(users);
      setFilteredVisitantes(users);
    }
    
    fetch();
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredVisitantes(visitantes);
    } else {
      const filtered = visitantes.filter((visitante: any) =>
        visitante.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVisitantes(filtered);
    }
  }, [searchTerm, visitantes]);

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
    setFilteredVisitantes((prevFiltered) => 
      prevFiltered.filter((visitante) => visitante.id !== id)
    );
  };

  if (selectedItem) {
    return (
      <>
        <Header userName={userName} onLogout={handleLogout} />
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
      <Header userName={userName} onLogout={handleLogout} />
      <div className="p-2 sm:p-6 mt-[72px]">
        <div className="mb-4 flex flex-col-reverse sm:flex-row items-end sm:items-center justify-between gap-4">
          <div className="relative  w-full sm:w-64">
            <Input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white rounded-md border-gray-300 focus:border-gray-500 focus:ring-gray-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
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
            <ButtonForm type="button" onClick={() => router.push('/register')} label={`Novo visitante`} />
          </div>
        </div>
        <SwipeInstruction />
        {loading ? (
          // Show skeleton cards while loading
          <div className={`grid gap-4 ${isGridView ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : filteredVisitantes.length > 0 ? (
          <div className={`grid gap-4 ${isGridView ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredVisitantes.map((visitante: any) => (
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
        ) : (
          <div className="text-center py-10">
            <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-base font-semibold text-gray-900">Nenhum visitante encontrado</h3>
            <p className="mt-1 text-base text-gray-500">
              Não há visitantes para exibir no momento.
            </p>
            <div className="mt-6">
              <Button onClick={() => router.push('/register')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar novo visitante
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
