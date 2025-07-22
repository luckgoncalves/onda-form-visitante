'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Instagram, 
  Facebook, 
  Linkedin,
  Pencil,
  Trash2,
  User
} from 'lucide-react';
import { Empresa } from '@/types/empresa';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface EmpresaCardProps {
  empresa: Empresa;
  onEdit?: (empresa: Empresa) => void;
  onDelete?: (empresaId: string) => void;
  showActions?: boolean;
  showOwner?: boolean;
  currentUser?: {
    id: string;
    role: string;
  } | null;
}

export default function EmpresaCard({ 
  empresa, 
  onEdit, 
  onDelete, 
  showActions = true,
  showOwner = false,
  currentUser = null
}: EmpresaCardProps) {
  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };
  
  const formatSocialLink = (link: string, platform: string) => {
    if (!link) return '';
    
    // Se já é uma URL completa, retorna como está
    if (link.startsWith('http')) return link;
    
    // Se é apenas o username do Instagram
    if (platform === 'instagram' && link.startsWith('@')) {
      return `https://instagram.com/${link.substring(1)}`;
    }
    
    return link;
  };

  // Verificar se o usuário pode deletar a empresa
  const canDelete = () => {
    if (!currentUser || !onDelete) return false;
    
    // Admin pode deletar qualquer empresa
    if (currentUser.role === 'admin') return true;
    
    // Proprietário pode deletar sua própria empresa
    const isOwner = empresa.usuarios?.some(userEmpresa => userEmpresa.user.id === currentUser.id);
    return isOwner || false;
  };

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{empresa.nomeNegocio}</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {empresa.ramoAtuacao}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Proprietário */}
        {showOwner && empresa.usuarios && empresa.usuarios.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-gray-900 font-medium">{empresa.usuarios[0].user.name}</span>
          </div>
        )}

        {/* Detalhes do Serviço */}
        <p className="text-sm text-muted-foreground line-clamp-3 text-gray-500">
          {empresa.detalhesServico}
        </p>

        {/* Contatos */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4" />
            <span>{formatPhone(empresa.whatsapp)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-4 w-4" />
            <span className="truncate">{empresa.email}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{empresa.endereco}</span>
          </div>
        </div>

        {/* Links Sociais */}
        <div className="flex gap-2 flex-wrap">
          {empresa.site && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 px-2"
            >
              <a 
                href={empresa.site} 
                target="_blank" 
                rel="noopener noreferrer"
                title="Site"
              >
                <Globe className="h-4 w-4" />
              </a>
            </Button>
          )}
          
          {empresa.instagram && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 px-2"
            >
              <a 
                href={formatSocialLink(empresa.instagram, 'instagram')} 
                target="_blank" 
                rel="noopener noreferrer"
                title="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </Button>
          )}
          
          {empresa.facebook && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 px-2"
            >
              <a 
                href={empresa.facebook} 
                target="_blank" 
                rel="noopener noreferrer"
                title="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </Button>
          )}
          
          {empresa.linkedin && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 px-2"
            >
              <a 
                href={empresa.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                title="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>

        {/* Ações */}
        {showActions && (onEdit || onDelete) && (
          <div className="flex gap-2 pt-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(empresa)}
                className="flex-1"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
            
            {canDelete() && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir a empresa &quot;{empresa.nomeNegocio}&quot;? 
                      Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete?.(empresa.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 