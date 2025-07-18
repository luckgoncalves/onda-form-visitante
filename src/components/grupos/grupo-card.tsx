import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Clock, MapPin, Users, Calendar, Phone, ChevronDown, Copy } from 'lucide-react';

interface GrupoCardProps {
  grupo: {
    id: string;
    nome: string;
    categoria: string;
    diaSemana: string;
    horario: string;
    bairro?: {
      id: string;
      nome: string;
    };
    lideres: {
      id: string;
      name: string;
      phone?: string;
    }[];
  };
}

export default function GrupoCard({ grupo }: GrupoCardProps) {
  const formatCategoria = (categoria: string) => {
    const categorias: { [key: string]: string } = {
      HOMENS: 'Homens',
      UNVT: 'UNVT',
      MULHERES: 'Mulheres',
      MISTO: 'Misto',
      NEW: 'New',
      CASAIS: 'Casais',
    };
    return categorias[categoria] || categoria;
  };

  const formatDiaSemana = (dia: string) => {
    const dias: { [key: string]: string } = {
      SEGUNDA: 'Segunda-feira',
      TERCA: 'Terça-feira',
      QUARTA: 'Quarta-feira',
      QUINTA: 'Quinta-feira',
      SEXTA: 'Sexta-feira',
      SABADO: 'Sábado',
      DOMINGO: 'Domingo',
    };
    return dias[dia] || dia;
  };

  const formatHorario = (horario: string) => {
    if (horario.includes(':')) {
      return horario;
    }
    return horario.length === 4 ? `${horario.slice(0, 2)}:${horario.slice(2)}` : horario;
  };

  const getCategoriaColor = (categoria: string) => {
    const colors: { [key: string]: string } = {
      HOMENS: 'bg-blue-100 text-blue-800',
      UNVT: 'bg-purple-100 text-purple-800',
      MULHERES: 'bg-pink-100 text-pink-800',
      MISTO: 'bg-green-100 text-green-800',
      NEW: 'bg-yellow-100 text-yellow-800',
      CASAIS: 'bg-red-100 text-red-800',
    };
    return colors[categoria] || 'bg-gray-100 text-gray-800';
  };

  // Função para extrair apenas o primeiro nome
  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0];
  };

  // Função para formatar os nomes dos líderes
  const formatLideresNames = () => {
    const firstNames = grupo.lideres.map(lider => getFirstName(lider.name));
    return firstNames.join(' & ');
  };

  // Função para obter telefones dos líderes
  const getLideresPhones = () => {
    return grupo.lideres.filter(lider => lider.phone).map(lider => lider.phone);
  };

  // Função para formatar telefone para WhatsApp (remove caracteres especiais)
  const formatPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  // Função para criar link do WhatsApp
  const createWhatsAppLink = (phone: string) => {
    const cleanPhone = formatPhoneForWhatsApp(phone);
    const message = encodeURIComponent(`Olá! Vi o grupo "${grupo.nome}" e gostaria de saber mais informações.`);
    return `https://wa.me/55${cleanPhone}?text=${message}`;
  };

  // Função para criar link de ligação
  const createCallLink = (phone: string) => {
    return `tel:${phone}`;
  };

  // Função para copiar telefone para clipboard
  const copyPhoneToClipboard = (phone: string) => {
    navigator.clipboard.writeText(phone);
    // Você pode adicionar um toast aqui se quiser feedback visual
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
            {grupo.nome}
          </CardTitle>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoriaColor(grupo.categoria)}`}>
            {formatCategoria(grupo.categoria)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-start gap-2 text-sm text-gray-600">
          {/* <Users className="h-4 w-4 mt-0.5" /> */}
          <div className="flex flex-col">
            <span className="text-gray-900 font-medium">
              {formatLideresNames()}
            </span>
          </div>
        </div>
        {/* Dia e Horário */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{formatDiaSemana(grupo.diaSemana)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{formatHorario(grupo.horario)}</span>
        </div>

        {/* Bairro */}
        {grupo.bairro && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{grupo.bairro.nome}</span>
          </div>
        )}

        {/* Líderes */}
        {grupo.lideres.length > 0 && (
          <>
            {/* Telefones dos líderes com dropdown */}
            {getLideresPhones().length > 0 && (
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                <div className="flex flex-col flex-wrap gap-2">
                  {grupo.lideres.filter(lider => lider.phone).map((lider, index, filteredLideres) => (
                    <DropdownMenu key={lider.id}>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 hover:underline transition-colors cursor-pointer">
                          <Phone className="h-4 w-4" />
                          <span>{lider.phone}</span>
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-40 bg-white">
                        <DropdownMenuItem asChild>
                          <a
                            href={createCallLink(lider.phone!)}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Phone className="h-4 w-4" />
                            Ligar
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a
                            href={createWhatsAppLink(lider.phone!)}
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
                          onClick={() => copyPhoneToClipboard(lider.phone!)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Copy className="h-4 w-4" />
                          Copiar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ))}
                </div>
              </div>
            )}
            {/* </div> */}
          </>
        )}
      </CardContent>
    </Card>
  );
} 