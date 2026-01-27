'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FormListItem } from '@/types/form';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  ExternalLink,
  Eye,
  BarChart2,
  Send,
  Archive,
  FileText,
} from 'lucide-react';

interface FormCardProps {
  form: FormListItem;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onViewResponses: () => void;
  onPublish: () => void;
  onClose: () => void;
  onCopyLink: () => void;
}

export function FormCard({
  form,
  onEdit,
  onDelete,
  onDuplicate,
  onViewResponses,
  onPublish,
  onClose,
  onCopyLink,
}: FormCardProps) {
  const getStatusBadge = () => {
    switch (form.status) {
      case 'DRAFT':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
            Rascunho
          </Badge>
        );
      case 'PUBLISHED':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Publicado
          </Badge>
        );
      case 'CLOSED':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700">
            Fechado
          </Badge>
        );
    }
  };

  const getVisibilityBadge = () => {
    if (form.visibility === 'PRIVATE') {
      return (
        <Badge variant="outline" className="text-xs">
          Privado
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <h3 className="font-semibold text-gray-900 truncate">
              {form.title}
            </h3>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            {getStatusBadge()}
            {getVisibilityBadge()}
          </div>

          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <BarChart2 className="h-4 w-4" />
              {form.responseCount} respostas
            </span>
            <span>
              Atualizado em{' '}
              {format(new Date(form.updatedAt), "dd 'de' MMM", { locale: ptBR })}
            </span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white w-48">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={onViewResponses}>
              <Eye className="h-4 w-4 mr-2" />
              Ver respostas
            </DropdownMenuItem>
            
            {form.status === 'PUBLISHED' && (
              <DropdownMenuItem onClick={onCopyLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar link
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator className="bg-gray-200" />
            
            {form.status === 'DRAFT' && (
              <DropdownMenuItem onClick={onPublish}>
                <Send className="h-4 w-4 mr-2" />
                Publicar
              </DropdownMenuItem>
            )}
            
            {form.status === 'PUBLISHED' && (
              <DropdownMenuItem onClick={onClose}>
                <Archive className="h-4 w-4 mr-2" />
                Fechar formulário
              </DropdownMenuItem>
            )}
            
            {form.status === 'CLOSED' && (
              <DropdownMenuItem onClick={onPublish}>
                <Send className="h-4 w-4 mr-2" />
                Reabrir
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicar
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
