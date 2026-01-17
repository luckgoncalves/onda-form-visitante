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
  User,
  ChevronDown,
  Copy
} from 'lucide-react';
import { Empresa } from '@/types/empresa';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger }  from '@/components/ui/dropdown-menu';
import { copyPhoneToClipboard, createCallLink, createWhatsAppLink } from '@/lib/utils';

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
    <Card className="h-full hover:shadow-lg transition-all border-2 border-onda-darkBlue/20">
      <CardHeader className="pb-3 border-none border-gray-100">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg text-onda-darkBlue font-gotham">{empresa.nomeNegocio}</CardTitle>
          <Badge variant="secondary" className="text-xs bg-onda-darkBlue/10 text-onda-darkBlue border-onda-darkBlue/20">
            {empresa.ramoAtuacao}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Proprietário */}
        {showOwner && empresa.usuarios && empresa.usuarios.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-onda-darkBlue" />
            <span className="text-gray-700 font-medium">{empresa.usuarios[0].user.name}</span>
          </div>
        )}

        {/* Detalhes do Serviço */}
        <p className="text-sm text-muted-foreground line-clamp-3 text-gray-500">
          {empresa.detalhesServico}
        </p>

        {/* Contatos */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">

            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
              <div className="flex flex-col flex-wrap gap-2">
                <DropdownMenu key={empresa.id}>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-onda-darkBlue hover:underline transition-colors cursor-pointer">
                      <Phone className="h-4 w-4 text-onda-darkBlue" />
                      <span>{empresa.whatsapp}</span>
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-40 bg-white">
                    <DropdownMenuItem asChild>
                      <a
                        href={createCallLink(empresa.whatsapp!)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Phone className="h-4 w-4" />
                        Ligar
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a
                        href={createWhatsAppLink(empresa.whatsapp!, `Olá! Vi a empresa "${empresa.nomeNegocio}" e gostaria de saber mais informações.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 cursor-pointer text-green-600"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                        </svg>
                        WhatsApp
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => copyPhoneToClipboard(empresa.whatsapp!)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Copy className="h-4 w-4" />
                      Copiar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-4 w-4 text-onda-darkBlue" />
            <span className="truncate">{empresa.email}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-onda-darkBlue" />
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
              className="h-8 px-2 border-onda-darkBlue/20 hover:bg-onda-darkBlue/10 hover:border-onda-darkBlue/40"
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
              className="h-8 px-2 border-onda-darkBlue/20 hover:bg-onda-darkBlue/10 hover:border-onda-darkBlue/40"
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
              className="h-8 px-2 border-onda-darkBlue/20 hover:bg-onda-darkBlue/10 hover:border-onda-darkBlue/40"
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
              className="h-8 px-2 border-onda-darkBlue/20 hover:bg-onda-darkBlue/10 hover:border-onda-darkBlue/40"
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
                className="flex-1 border-onda-darkBlue/20 hover:bg-onda-darkBlue/10 hover:border-onda-darkBlue/40 text-onda-darkBlue"
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