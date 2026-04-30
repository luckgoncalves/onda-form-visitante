'use client';

import { useState } from 'react';
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
  User,
  ChevronDown,
  Copy,
  Loader2,
  Trash2,
  Building2,
} from 'lucide-react';
import Image from 'next/image';
import { Empresa } from '@/types/empresa';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  copyPhoneToClipboard,
  createCallLink,
  createWhatsAppLink,
} from '@/lib/utils';

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
  isDeleting?: boolean;
}

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
  </svg>
);

export default function EmpresaCard({
  empresa,
  onEdit,
  onDelete,
  showActions = true,
  showOwner = false,
  currentUser = null,
  isDeleting = false,
}: EmpresaCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const formatSocialLink = (link: string, platform: string) => {
    if (!link) return '';
    if (link.startsWith('http')) return link;
    if (platform === 'instagram' && link.startsWith('@')) {
      return `https://instagram.com/${link.substring(1)}`;
    }
    return link;
  };

  const canDelete = () => {
    if (!currentUser || !onDelete) return false;
    if (currentUser.role === 'admin') return true;
    const isOwner = empresa.usuarios?.some(
      (userEmpresa) => userEmpresa.user.id === currentUser.id
    );
    return isOwner || false;
  };

  const ownerName =
    showOwner && empresa.usuarios && empresa.usuarios.length > 0
      ? empresa.usuarios[0].user.name
      : null;

  const hasSocial = Boolean(
    empresa.site || empresa.instagram || empresa.facebook || empresa.linkedin
  );

  const socialIconClass =
    'inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200 text-gray-500 hover:text-onda-darkBlue hover:border-onda-darkBlue/30 hover:bg-onda-darkBlue/5 transition-colors';

  return (
    <article className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      {/* Top section: Logo + Info */}
      <div className="flex flex-col sm:flex-row gap-4 p-5 sm:p-6">
        <div className="shrink-0 flex justify-start">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
            {empresa.logoUrl ? (
              <Image
                src={empresa.logoUrl}
                alt={`Logo ${empresa.nomeNegocio}`}
                fill
                className="object-cover"
              />
            ) : (
              <Building2 className="h-6 w-6 text-gray-300" />
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-semibold text-onda-darkBlue font-gotham">
                {empresa.nomeNegocio}
              </h3>
              {empresa.ramoAtuacao && (
                <Badge
                  variant="secondary"
                  className="mt-1.5 inline-flex max-w-full text-xs font-medium bg-onda-teal/10 text-onda-teal border-onda-teal/20 rounded-full px-2.5 py-0.5"
                >
                  <span className="truncate">{empresa.ramoAtuacao}</span>
                </Badge>
              )}
            </div>

            {showActions && canDelete() && (
              <AlertDialog
                open={dialogOpen || isDeleting}
                onOpenChange={(open) => {
                  if (!isDeleting) setDialogOpen(open);
                }}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Excluir empresa"
                    className="shrink-0 h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir a empresa &quot;
                      {empresa.nomeNegocio}&quot;? Esta ação não pode ser
                      desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      disabled={isDeleting}
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        if (onDelete) {
                          await onDelete(empresa.id);
                          setDialogOpen(false);
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Excluindo...
                        </>
                      ) : (
                        'Excluir'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {empresa.detalhesServico && (
            <p className="mt-3 text-sm text-gray-500 line-clamp-3 leading-relaxed">
              {empresa.detalhesServico}
            </p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 mx-5 sm:mx-6" />

      {/* Bottom section: Contacts + Address/Social */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 p-5 sm:p-6">
        <div className="space-y-2.5 min-w-0">
          {ownerName && (
            <div className="flex items-center gap-2 text-sm text-gray-700 min-w-0">
              <User className="h-4 w-4 text-onda-darkBlue shrink-0" />
              <span className="truncate">{ownerName}</span>
            </div>
          )}
          {empresa.whatsapp && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Phone className="h-4 w-4 text-onda-darkBlue shrink-0" />
              <DropdownMenu key={empresa.id}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 hover:underline transition-colors cursor-pointer">
                    <span>{empresa.whatsapp}</span>
                    <WhatsAppIcon className="h-4 w-4 text-green-500" />
                    <ChevronDown className="h-3 w-3 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40 bg-white">
                  <DropdownMenuItem asChild>
                    <a
                      href={createCallLink(empresa.whatsapp)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Phone className="h-4 w-4" />
                      Ligar
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a
                      href={createWhatsAppLink(
                        empresa.whatsapp,
                        `Olá! Vi a empresa "${empresa.nomeNegocio}" e gostaria de saber mais informações.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 cursor-pointer text-green-600"
                    >
                      <WhatsAppIcon className="h-4 w-4" />
                      WhatsApp
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => copyPhoneToClipboard(empresa.whatsapp)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          {empresa.email && (
            <div className="flex items-center gap-2 text-sm text-gray-700 min-w-0">
              <Mail className="h-4 w-4 text-onda-darkBlue shrink-0" />
              <a
                href={`mailto:${empresa.email}`}
                className="truncate hover:underline"
                title={empresa.email}
              >
                {empresa.email}
              </a>
            </div>
          )}
        </div>

        <div className="space-y-3 min-w-0">
          {empresa.endereco && (
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <MapPin className="h-4 w-4 text-onda-darkBlue shrink-0 mt-0.5" />
              <span className="leading-relaxed">{empresa.endereco}</span>
            </div>
          )}
          {hasSocial && (
            <div className="flex flex-wrap gap-2">
              {empresa.site && (
                <a
                  href={empresa.site}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Site"
                  aria-label="Site"
                  className={socialIconClass}
                >
                  <Globe className="h-4 w-4" />
                </a>
              )}
              {empresa.instagram && (
                <a
                  href={formatSocialLink(empresa.instagram, 'instagram')}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Instagram"
                  aria-label="Instagram"
                  className={socialIconClass}
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {empresa.facebook && (
                <a
                  href={empresa.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Facebook"
                  aria-label="Facebook"
                  className={socialIconClass}
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {empresa.linkedin && (
                <a
                  href={empresa.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="LinkedIn"
                  aria-label="LinkedIn"
                  className={socialIconClass}
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {showActions && onEdit && (
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 -mt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(empresa)}
            className="border-onda-darkBlue/20 hover:bg-onda-darkBlue/10 hover:border-onda-darkBlue/40 text-onda-darkBlue"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      )}
    </article>
  );
}
