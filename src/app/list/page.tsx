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


function DetailView({ item, onBack }: { item: any, onBack: () => void }) {
  return (
    <Card className="w-full m-6 max-w-2xl mx-auto">
      <CardContent className="p-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <h2 className="text-2xl font-bold mb-3">{item.nome}</h2>
        <p className="text-gray-600 mb-3">Estado civil: {item.estado_civil}</p>
        <p className="text-gray-600 mb-3">Bairro: {item.bairro}</p>
        <p className="text-gray-600 mb-3">Como chegou ate nos: {item.como_chegou_ate_nos}</p>
        <p className="text-gray-600 mb-3">Como nos conheceu: {item.como_nos_conheceu}</p>
        <p className="text-gray-600 mb-3">Culto: {item.culto}</p>
        <p className="text-gray-600 mb-3">Estado civil: {item.estado_civil}</p>
        <p className="text-gray-600 mb-3">Frequenta igreja:{item.frequenta_igreja ? 'Sim': 'Não'}</p>
        <p className="text-gray-600 mb-3">Genero: {item.genero}</p>
        <p className="text-gray-600 mb-3">Idade: {item.idade}</p>
        <p className="text-gray-600 mb-3">Interesse em conhecer: {item.interesse_em_conhecer}</p>
        <p className="text-gray-600 mb-3">Observacao: {item.observacao}</p>
        <p className="text-gray-600 mb-3">Telefone: {item.telefone}</p>
        <p className="text-gray-600 mb-3">Qual greja: {item.qual_igreja}</p>
        <p className="text-gray-600 mb-3">Visitou em: {formatDate(item.created_at)}</p>
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

    useEffect(() => {
        async function fetch() {
            setLoading(true);
            const users = await findAll(); 
            setLoading(false);
            setVisitantes(users);
        }
        
        fetch();
    },[])
    

    const handleItemClick = (item: any) => {
      setSelectedItem(item)
    }
  
    const handleBackToList = () => {
      setSelectedItem(null)
    }
  
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
         {visitantes.map((visitante: any) => (
          <Card key={visitante.nome} className="h-full" onClick={() => handleItemClick(visitante)}>
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-2">{visitante.nome}</h2>
              <div className="flex justify-between items-center">
                <p className="text-gray-600">{formatDate(visitante.created_at)}</p>
                <Button className="z-10 rounded-full border w-50 h-50 border-green-300 bg-green-600">
                  <MessageCircleMore color="white" />
                </Button>
              </div>
            </CardContent>
          </Card>
          ))}
          </div>
      </div>
    )
  }
  