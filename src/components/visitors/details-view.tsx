import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { deleteVisitante } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "../ui/toaster";
import { formatCulto, formatDate, formatInteresse } from "@/lib/utils";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";

// Define a more specific type for the item prop
interface VisitorDetails {
  id: string;
  nome: string;
  telefone: string;
  estado_civil: string;
  bairro?: string | null;
  como_nos_conheceu?: string | null;
  frequenta_igreja?: string | null | undefined;
  genero?: string | null;
  idade?: number | null;
  interesse_em_conhecer: string[];
  observacao?: string | null;
  qual_igreja?: string | null;
  culto: string;
  created_at: string | Date;
  registeredBy?: { // Optional user relation
    name: string;
  } | null;
  responsavel_nome?: string | null;
  responsavel_telefone?: string | null;
}

function DetailView({ item, onBack, onDelete }: { 
    item: VisitorDetails, // Use the defined interface
    onBack: () => void,
    onDelete: (id: string) => Promise<void> 
  }) {
    const { toast } = useToast()
    const [isDeleting, setIsDeleting] = React.useState(false);
  
    React.useEffect(() => {
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
                    className="w-full sm:w-auto bg-onda-darkBlue hover:bg-onda-darkBlue/90 text-white border-0"
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
            <h4 className="text-base font-semibold">Como nos conheceu</h4>
            <p className="text-gray-600 mb-3"> {item?.como_nos_conheceu || '-'}</p>
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
          {item.culto === 'new' && (item.responsavel_nome || item.responsavel_telefone) && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <h4 className="text-base font-semibold">Responsável</h4>
                <p className="text-gray-600 mb-3">{item?.responsavel_nome || '-'}</p>
              </div>
              <div>
                <h4 className="text-base font-semibold">Telefone do responsável</h4>
                <p className="text-gray-600 mb-3">{item?.responsavel_telefone || '-'}</p>
              </div>
            </div>
          )}
          <div>
            <h4 className="text-base font-semibold">Qual igreja</h4>
            <p className="text-gray-600 mb-3"> {item?.qual_igreja || '-'}</p>
          </div>
          <div>
            <h4 className="text-base font-semibold">Visitou em</h4>
            <p className="text-gray-600 mb-3"> {`${formatCulto(item?.culto) || '-'} - ${formatDate(new Date(item.created_at))}`}</p>
          </div>
          {item.registeredBy?.name && (
            <div>
              <h4 className="text-base font-semibold">Registrado por</h4>
              <p className="text-gray-600 mb-3">{item.registeredBy.name}</p>
            </div>
          )}
        </CardContent>
        <Toaster />
      </Card>
    )
  }
  
  export { DetailView }