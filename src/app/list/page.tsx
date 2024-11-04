'use client';
import { useEffect, useState } from "react"
import { findAll, checkAuth } from "../actions"
import { ArrowLeft, LayoutGrid, LayoutList, MessageCircle, MessageCircleMore, PlusCircle, Search, LogOut, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ButtonForm from "@/components/button-form";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"


function DetailView({ item, onBack }: { item: any, onBack: () => void }) {
  return (
    <Card className="w-full m-6 max-w-2xl mx-auto">
      <CardContent className="p-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <h2 className="text-2xl font-bold mb-3">{item.nome}</h2>
        <div>
        <h4 className="text-sm font-semibold">Estado cívil</h4>
        <p className="text-gray-600 mb-3"> {item.estado_civil}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Bairro</h4>
          <p className="text-gray-600 mb-3"> {item.bairro}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Como chegou até nós</h4>
          <p className="text-gray-600 mb-3"> {item.como_chegou_ate_nos}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Frequenta igreja</h4>
          <p className="text-gray-600 mb-3"> {item.frequenta_igreja ? 'Sim': 'Não'}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Gênero</h4>
          <p className="text-gray-600 mb-3"> {item.genero}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Idade</h4>
          <p className="text-gray-600 mb-3"> {item.idade}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Interesse em conhecer</h4>
          <p className="text-gray-600 mb-3"> {item.interesse_em_conhecer.join(', ')}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Observação</h4>
          <p className="text-gray-600 mb-3"> {item.observacao}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Telefone</h4>
          <p className="text-gray-600 mb-3"> {item.telefone}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Qual igreja</h4>
          <p className="text-gray-600 mb-3"> {item.qual_igreja}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Visitou em</h4>
          <p className="text-gray-600 mb-3"> {`${item.culto} - ${formatDate(item.created_at)}`}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function Header({ userName, onLogout }: { userName: string, onLogout: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center">
          {/* Replace with your actual logo */}
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-xl mr-4">
            L
          </div>
          <h1 className="hidden sm:block text-xl font-semibold text-gray-900">Onda Dura</h1>
        </div>
        <div className="relative">
          <Button
            variant="ghost"
            className="flex items-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <User className="h-5 w-5 text-gray-400 mr-2" />
            <span className="hidden sm:block text-sm font-medium text-gray-700">{userName}</span>
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
          {isMenuOpen && (
            <Card className="absolute right-0 mt-2 w-48 py-1 bg-white rounded-md shadow-lg z-10">
              <Button
                variant="ghost"
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setIsMenuOpen(false);
                  onLogout();
                }}
              >
                <LogOut className="h-4 w-4 mr-2 inline" />
                Logout
              </Button>
            </Card>
          )}
        </div>
      </div>
    </header>
  )
}

export default function List() {
  const [isGridView, setIsGridView] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [visitantes, setVisitantes] = useState<any>([]);
  const [selectedItem, setSelectedItem] = useState(null)
  const [ loading, setLoading] = useState(false);
  const router = useRouter();
  const [filteredVisitantes, setFilteredVisitantes] = useState<any>([]);
  const [userName, setUserName] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { isAuthenticated, user } = await checkAuth();
      if (!isAuthenticated) {
        router.push('/login'); // Redirect to login if not authenticated
      } else if (user) {
        setUserName(user.name);
        setIsAuthenticated(true);
      }
    }
    fetchData();
  }, [router]);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const users = await findAll(); 
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

  const handleItemClick = (item: any) => {
    setSelectedItem(item)
  }
  
  const handleBackToList = () => {
    setSelectedItem(null)
  }

  const handleWhatsAppClick = (phone: string, name: string) => {
    // Remove all non-digit characters from the phone number
    const cleanedPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá ${name}, tudo bem? Aqui é da Igreja...`);
    const whatsappUrl = `https://wa.me/${cleanedPhone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }

  // Add this skeleton component
  const SkeletonCard = () => (
    <Card className="h-full">
      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-end mt-2">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );

  const handleLogout = () => {
    // Implement logout logic here
    console.log("Logout clicked");
    // For example: router.push('/login');
  }

  if (selectedItem) {
    return (
      <>
        <Header userName={userName} onLogout={handleLogout} />
        <DetailView item={selectedItem} onBack={handleBackToList} />
      </>
    )
  }

  return (
    <>
      <Header userName={userName} onLogout={handleLogout} />
      <div className="p-4">
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
              <Card key={`${visitante.id}`} className="h-full">
                <CardContent className="p-4">
                  <div className="cursor-pointer" onClick={() => handleItemClick(visitante)}>
                    <h2 className="text-xl font-semibold mb-2">{visitante.nome}</h2>
                    <p className="text-gray-600">{formatDate(visitante.created_at)}</p>
                  </div>
                  <div className="flex justify-end mt-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="z-10 rounded-full border w-50 h-50 border-green-300 bg-green-600">
                          <MessageCircleMore color="white" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Enviar mensagem para {visitante.nome}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Isso abrirá o WhatsApp com uma mensagem pré-preenchida.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleWhatsAppClick(visitante.telefone, visitante.nome)}>
                            Confirmar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum visitante encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
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
