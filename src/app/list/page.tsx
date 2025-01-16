'use client';
import { useEffect, useState } from "react"
import { findAll, checkAuth, updateMensagemEnviada, logout, deleteVisitante } from "../actions"
import { ArrowLeft, LayoutGrid, LayoutList, MessageCircle, MessageCircleMore, PlusCircle, Search, LogOut, User, ChevronDown, MapPin, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ButtonForm from "@/components/button-form";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { formatCulto, formatDate, formatInteresse } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster"
import { Header } from "@/components/header";

function DetailView({ item, onBack, onDelete }: { 
  item: any, 
  onBack: () => void,
  onDelete: (id: string) => Promise<void> 
}) {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDelete = async () => {
    setIsDeleting(true);
   
    try {
      await deleteVisitante(item.id);
      await onDelete(item.id);
      onBack(); // Return to list view after successful deletion
    } catch (error) {
      console.error('Error deleting visitor:', error);
      toast({
        variant: "destructive",
          title: "Erro ao excluir",
          description: "Erro ao excluir o visitante. Por favor, tente novamente mais tarde.",
      });
      
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="w-full m-6 max-w-2xl mx-auto mt-[80px]">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" onClick={onBack} className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="bg-red-500 hover:bg-red-600"
                disabled={isDeleting}
              >
                {isDeleting ? "Excluindo..." : "Excluir"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="fixed top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] mx-auto max-w-[90%] sm:max-w-[425px] bg-white rounded-lg shadow-lg border-0">
              <AlertDialogHeader className="p-6">
                <AlertDialogTitle className="text-xl text-center">Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription className="text-center text-gray-600">
                  Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center mt-6">
                <AlertDialogCancel className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 border-0">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="w-full sm:w-auto bg-[#9562DC] hover:bg-[#7B4AC0] text-white border-0"
                >
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <h2 className="text-2xl font-bold mb-3">{item.nome}</h2>
        <div>
        <h4 className="text-base font-semibold">Estado cívil</h4>
        <p className="text-gray-600 mb-3"> {item.estado_civil}</p>
        </div>
        <div>
          <h4 className="text-base font-semibold">Bairro</h4>
          <p className="text-gray-600 mb-3"> {item.bairro}</p>
        </div>
        <div>
          <h4 className="text-base font-semibold">Como chegou até nós</h4>
          <p className="text-gray-600 mb-3"> {item?.como_chegou_ate_nos || '-'}</p>
        </div>
        <div>
          <h4 className="text-base font-semibold">Frequenta igreja</h4>
          <p className="text-gray-600 mb-3"> {item.frequenta_igreja ? 'Sim': 'Não'}</p>
        </div>
        <div>
          <h4 className="text-base font-semibold">Gênero</h4>
          <p className="text-gray-600 mb-3"> {item?.genero || '-'}</p>
        </div>
        <div>
          <h4 className="text-base font-semibold">Idade</h4>
          <p className="text-gray-600 mb-3"> {item?.idade || '-'}</p>
        </div>
        <div>
          <h4 className="text-base font-semibold">Interesse em conhecer</h4>
          <p className="text-gray-600 mb-3">
            {item.interesse_em_conhecer.map((interesse: string) => formatInteresse(interesse)).join(', ')}
          </p>
        </div>
        <div>
          <h4 className="text-base font-semibold">Observação</h4>
          <p className="text-gray-600 mb-3"> {item?.observacao || '-'}</p>
        </div>
        <div>
          <h4 className="text-base font-semibold">Telefone</h4>
          <p className="text-gray-600 mb-3"> {item?.telefone || '-'}</p>
        </div>
        <div>
          <h4 className="text-base font-semibold">Qual igreja</h4>
          <p className="text-gray-600 mb-3"> {item?.qual_igreja || '-'}</p>
        </div>
        <div>
          <h4 className="text-base font-semibold">Visitou em</h4>
          <p className="text-gray-600 mb-3"> {`${formatCulto(item?.culto) || '-'} - ${formatDate(item?.created_at || '')}`}</p>
        </div>
      </CardContent>
      <Toaster />
    </Card>
  )
}

// Add this new component before the List component
function VisitorCard({ visitante, onItemClick, onWhatsAppClick, onMessageStatusChange }: { 
  visitante: any, 
  onItemClick: (visitante: any) => void,
  onWhatsAppClick: (phone: string, name: string, id: string) => void,
  onMessageStatusChange: (id: string) => void 
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-100, 0, 100],
    ["rgb(34, 197, 94)", "rgb(255, 255, 255)", "rgb(34, 197, 94)"]
  );

  const handleDragEnd = async (event: any, info: any) => {
    if (Math.abs(info.offset.x) > 100) {
      try {
        setIsUpdating(true);
        await updateMensagemEnviada(visitante.id);
        onMessageStatusChange(visitante.id);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <motion.div
      style={{ x, background }}
      drag={!isUpdating ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="rounded-lg relative"
    >
      <Card className={`h-full min-h-32 bg-transparent ${isUpdating ? 'opacity-50' : ''}`}>
        {isUpdating && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
          </div>
        )}
        <CardContent className="p-4 h-full flex justify-between items-end">
          <div className="cursor-pointer flex flex-col justify-between h-full" onClick={() => onItemClick(visitante)}>
            <div>
              <h2 className="text-xl font-semibold mb-2">{visitante.nome}</h2>
              {visitante.mensagem_enviada && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Mensagem enviada
                </span>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <MapPin className="w-4 h-4" />
              <span className="text-gray-600"> {formatCulto(visitante.culto)}</span>
              <span className="text-gray-600"> {formatDate(visitante.created_at)}</span>
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  className={`z-10 rounded-full w-12 h-12 hover:bg-green-700 transition-colors
                    bg-green-600 text-white`}
                >
                  <MessageCircleMore 
                    className=""
                  />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {visitante.mensagem_enviada 
                      ? 'Desmarcar mensagem enviada para' 
                      : 'Enviar mensagem para'} {visitante.nome}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {visitante.mensagem_enviada
                      ? 'Isso irá desmarcar o contato como já contatado.'
                      : 'Isso abrirá o WhatsApp com uma mensagem pré-preenchida.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onWhatsAppClick(visitante.telefone, visitante.nome, visitante.id)}
                  >
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
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
        router.push('/'); // Redirect to login if not authenticated
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

  const handleWhatsAppClick = async (phone: string, name: string, visitorId: string) => {
    const cleanedPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Oii ${name}, tudo bem? Aqui é da Igreja Onda Dura Curitiba. Gostaria de dizer que ficamos muito felizes com sua visita na nossa igreja nesse último final de semana.\n\nCremos que Deus tem um propósito com tudo isso!\n\nGostaria muito de saber: como foi para você participar do nosso culto? E você gostaria de conhecer um pouco mais do que nós vivemos como igreja?\n\nDeus te abençoe!`);
    const whatsappUrl = `https://web.whatsapp.com/send?phone=${cleanedPhone}&text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    await updateMensagemEnviada(visitorId);
    
    setVisitantes(visitantes.map((v: any) => 
      v.id === visitorId ? {...v, mensagem_enviada: !v.mensagem_enviada} : v
    ));
  }

  // Add this skeleton component
  const SkeletonCard = () => (
    <Card className="h-full">
      <CardContent className="p-2 sm:px-6">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-end mt-2">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );

  const handleLogout = async () => {
    await logout();
    router.push('/');
  }

  // Adicione este componente antes do return principal
  const SwipeInstruction = () => (
    <div className="text-center text-base text-gray-500 mb-4">
      ← Arraste os cards para marcar/desmarcar mensagens como enviadas →
    </div>
  );

  const handleDeleteVisitor = async (id: string) => {
    setVisitantes((prevVisitantes: any[]) => 
      prevVisitantes.filter((visitante: any) => visitante.id !== id)
    );
    setFilteredVisitantes((prevFiltered: any) => 
      prevFiltered.filter((visitante: any) => visitante.id !== id)
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
