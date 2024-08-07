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
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
  
  const invoices = [
    {
      invoice: "INV001",
      paymentStatus: "Paid",
      totalAmount: "$250.00",
      paymentMethod: "Credit Card",
    },
    {
      invoice: "INV002",
      paymentStatus: "Pending",
      totalAmount: "$150.00",
      paymentMethod: "PayPal",
    },
    {
      invoice: "INV003",
      paymentStatus: "Unpaid",
      totalAmount: "$350.00",
      paymentMethod: "Bank Transfer",
    },
    {
      invoice: "INV004",
      paymentStatus: "Paid",
      totalAmount: "$450.00",
      paymentMethod: "Credit Card",
    },
    {
      invoice: "INV005",
      paymentStatus: "Paid",
      totalAmount: "$550.00",
      paymentMethod: "PayPal",
    },
    {
      invoice: "INV006",
      paymentStatus: "Pending",
      totalAmount: "$200.00",
      paymentMethod: "Bank Transfer",
    },
    {
      invoice: "INV007",
      paymentStatus: "Unpaid",
      totalAmount: "$300.00",
      paymentMethod: "Credit Card",
    },
  ]
  
  export default function List() {
    const [visitantes, setVisitantes] = useState<any>([]);
    useEffect(() => {
        async function fetch() {
            const users = await findAll(); 
            setVisitantes(users);
        }
        
        fetch();
    },[])
    console.log(visitantes);
    return (
      <Table className="bg-white/30 card-glass">
        <TableCaption>Lista de visitantes da Onda Dura Curitiba.</TableCaption>
        <TableHeader>
          <TableRow className="">
            <TableHead className="text-black">Nome</TableHead>
            <TableHead className="text-black">Telefone</TableHead>
            <TableHead className="text-black text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="">
          {visitantes.map((visitante: any) => (
            <TableRow key={visitante.nome}>
                <TableCell className="font-medium">{visitante.nome}</TableCell>
                <TableCell className="font-medium">{visitante.telefone}</TableCell>
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
    )
  }
  