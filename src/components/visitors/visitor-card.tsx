import { Card, CardContent } from "../ui/card";

import { motion } from "framer-motion";

import { updateMensagemEnviada } from '@/app/actions';
import { formatDate } from "@/lib/utils";
import { useMotionValue, useTransform } from 'framer-motion';
import React from 'react';
import { CheckCircle2, GripVertical, MapPin, MessageCircleMore } from "lucide-react";
import { formatCulto } from "@/lib/utils";
import { AlertDialog, AlertDialogCancel, AlertDialogDescription, AlertDialogTitle, AlertDialogHeader, AlertDialogContent, AlertDialogTrigger, AlertDialogFooter, AlertDialogAction } from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

// Define a more specific type for the visitante prop
interface Visitor {
  id: string;
  nome: string;
  telefone: string;
  culto: string;
  created_at: string | Date;
  mensagem_enviada: boolean;
  registeredBy?: { // Optional user relation
    name: string;
  } | null;
  // Add missing properties from Visitante
  idade: number;
  genero: string;
  estado_civil: string;
  interesse_em_conhecer: string[];
  responsavel_nome?: string | null;
  responsavel_telefone?: string | null;
  etiquetas?: {
    id: string;
    nome: string;
    cor: string;
  }[];
}

function VisitorCard({ visitante, onItemClick, onWhatsAppClick, onMessageStatusChange }: { 
    visitante: Visitor, // Use the defined interface
    onItemClick: (visitante: Visitor) => void,
    onWhatsAppClick: (phone: string, name: string, id: string) => void,
    onMessageStatusChange: (id: string) => void 
  }) {
    const [isUpdating, setIsUpdating] = React.useState(false);
    const x = useMotionValue(0);
    const actionOpacity = useTransform(x, [-100, -32, 0, 32, 100], [1, 0.75, 0, 0.75, 1]);
    const actionScale = useTransform(x, [-100, 0, 100], [1, 0.92, 1]);
    const actionLabel = visitante.mensagem_enviada
      ? "Solte para desmarcar mensagem"
      : "Solte para marcar como enviada";
  
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
      <div className="relative overflow-hidden rounded-lg">
        <motion.div
          style={{ opacity: actionOpacity, scale: actionScale }}
          className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 text-sm font-medium text-emerald-700"
        >
          <CheckCircle2 className="h-5 w-5" />
          <span className="hidden sm:inline">{actionLabel}</span>
        </motion.div>

        <motion.div
          style={{ x }}
          drag={!isUpdating ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          className="relative rounded-lg"
        >
        <Card className={`h-full min-h-32 bg-white ${isUpdating ? 'opacity-50' : ''}`}>
          {isUpdating && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
            </div>
          )}
          <CardContent className="p-4 h-full flex justify-between items-end gap-3">
            <div
              className="flex h-full min-h-20 w-5 shrink-0 items-center justify-center text-gray-500"
              aria-hidden="true"
            >
              <GripVertical className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div className="cursor-pointer flex flex-1 flex-col justify-between h-full" onClick={() => onItemClick(visitante)}>
              <div>
                <h2 className="text-xl font-semibold mb-2">{visitante.nome}</h2>
                {visitante.mensagem_enviada && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Mensagem enviada
                  </span>
                )}
                {visitante.culto === 'new' && (visitante.responsavel_nome || visitante.responsavel_telefone) && (
                  <p className="text-xs text-gray-500 mt-2">
                    Responsável: {visitante.responsavel_nome || '-'}
                    {visitante.responsavel_telefone ? ` • ${visitante.responsavel_telefone}` : ''}
                  </p>
                )}
                {visitante.etiquetas && visitante.etiquetas.length > 0 && (
                  <div className="hidden sm:flex flex-wrap gap-1.5 mt-3">
                    {visitante.etiquetas.map((etiqueta) => (
                      <Badge
                        key={etiqueta.id}
                        variant="outline"
                        className="border-transparent"
                        style={{
                          backgroundColor: `${etiqueta.cor}1A`,
                          color: etiqueta.cor,
                        }}
                      >
                        {etiqueta.nome}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="my-[10px] flex gap-2 items-center text-sm text-gray-600 flex-wrap">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{formatCulto(visitante.culto)}</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <span>{formatDate(new Date(visitante.created_at))}</span>
                {/* Display registered user name if available */}
                {visitante.registeredBy?.name && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span>Registrado por: {visitante.registeredBy.name}</span>
                  </>
                )}
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
      </div>
    );
  }

  export { VisitorCard }