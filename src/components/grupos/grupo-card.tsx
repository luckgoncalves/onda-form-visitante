import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MapPin, Users, Calendar } from 'lucide-react';

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
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4 mt-0.5" />
            <div className="flex flex-col">
              <span className="font-medium">Líderes:</span>
              <div className="space-y-1">
                {grupo.lideres.map((lider) => (
                  <span key={lider.id} className="block">
                    {lider.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 