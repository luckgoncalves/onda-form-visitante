'use client';
import { useEffect, useState } from "react"
import { findAll } from "../actions"
import { ArrowLeft, LayoutGrid, LayoutList, MessageCircle, MessageCircleMore, PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
        <h4 className="text-sm font-semibold">Estado civil</h4>
        <p className="text-gray-600 mb-3"> {item.estado_civil}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Bairro</h4>
          <p className="text-gray-600 mb-3"> {item.bairro}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Como chegou ate nos</h4>
          <p className="text-gray-600 mb-3"> {item.como_chegou_ate_nos}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Frequenta igreja</h4>
          <p className="text-gray-600 mb-3"> {item.frequenta_igreja ? 'Sim': 'Não'}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Genero</h4>
          <p className="text-gray-600 mb-3"> {item.genero}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Idade</h4>
          <p className="text-gray-600 mb-3"> {item.idade}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Interesse em conhecer</h4>
          <p className="text-gray-600 mb-3"> {item.interesse_em_conhecer}</p>
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
          <p className="text-gray-600 mb-3"> {formatDate(item.created_at)}</p>
        </div>
      </CardContent>
    </Card>
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

  if (selectedItem) {
    return <DetailView item={selectedItem} onBack={handleBackToList} />
  }

  return (
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
      <div className={`grid gap-4 ${isGridView ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {loading ? (
          // Show skeleton cards while loading
          Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))
        ) : (
          // Use filteredVisitantes instead of visitantes
          filteredVisitantes.map((visitante: any) => (
            <Card key={`${visitante.id}`} className="h-full">
              <CardContent className="p-4">
                <div onClick={() => handleItemClick(visitante)}>
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
          ))
        )}
      </div>
    </div>
  )
}
