'use client';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { useEffect, useState } from "react"
import { findAll } from "../actions"
import { MessageCircle, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ButtonForm from "@/components/button-form";
import { useRouter } from "next/navigation";

  
  export default function List() {
    const [visitantes, setVisitantes] = useState<any>([]);
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
    function formatDate(date: Date) {
      return date.toISOString().split('T')[0].split('-').reverse().join('/');
    }

    return (
      <div className="p-4">
        <Card className="bg-white/30 card-glass border-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <h1 className="text-3xl my-3">Lista de visitantes OD</h1>
            <ButtonForm type="button" onClick={() => router.push('/register')} label={`Novo visitante`} />
          </CardHeader>
          <CardContent>
            <Table className="bg-white/30 card-glass">
              <TableCaption>Lista de visitantes da Onda Dura Curitiba.</TableCaption>
              {loading && <p className="p-3">Carregando...</p>}
              <TableHeader>
                <TableRow className="">
                  <TableHead className="text-black">Nome</TableHead>
                  <TableHead className="text-black">Telefone</TableHead>
                  <TableHead className="text-black">Data da Visita</TableHead>
                  <TableHead className="text-black text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="">
                {visitantes.map((visitante: any) => (
                  <TableRow key={visitante.nome}>
                      <TableCell className="font-medium">{visitante.nome}</TableCell>
                      <TableCell className="font-medium">{visitante.telefone}</TableCell>
                      <TableCell className="font-medium">{formatDate(visitante.created_at)}</TableCell>
                      <TableCell className="text-right">
                          <Button title="Enviar Whatsapp" className="text-green-400 bg-transparent hover:bg-transparent "><MessageCircle /></Button>
                      </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {/* <TableFooter>
                <TableRow>
                  <TableCell colSpan={3}>Total</TableCell>
                  <TableCell className="text-right">$2,500.00</TableCell>
                </TableRow>
              </TableFooter> */}
            </Table>
          </CardContent>
        </Card>
      </div>
    )
  }
  