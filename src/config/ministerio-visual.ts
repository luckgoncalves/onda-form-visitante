import {
  Baby,
  BookOpen,
  Camera,
  Car,
  Church,
  Coffee,
  Flower,
  GraduationCap,
  HandHeart,
  Handshake,
  Heart,
  Home,
  LucideIcon,
  Megaphone,
  Mic,
  Monitor,
  Music,
  Palette,
  Shield,
  Sparkles,
  Star,
  Sun,
  Users,
  Utensils,
  Video,
  Wrench,
} from 'lucide-react';

// Ícone e cor fazem parte do cadastro do ministério e são salvos como chaves.
// Este arquivo resolve as chaves para o ícone e as cores usados em todas as telas.

export const MINISTERIO_ICONES: Record<string, { label: string; icon: LucideIcon }> = {
  users: { label: 'Pessoas', icon: Users },
  monitor: { label: 'Tecnologia', icon: Monitor },
  wrench: { label: 'Manutenção', icon: Wrench },
  megaphone: { label: 'Comunicação', icon: Megaphone },
  music: { label: 'Música', icon: Music },
  mic: { label: 'Microfone', icon: Mic },
  video: { label: 'Vídeo', icon: Video },
  camera: { label: 'Fotografia', icon: Camera },
  heart: { label: 'Coração', icon: Heart },
  'hand-heart': { label: 'Cuidado', icon: HandHeart },
  handshake: { label: 'Recepção', icon: Handshake },
  baby: { label: 'Infantil', icon: Baby },
  'graduation-cap': { label: 'Ensino', icon: GraduationCap },
  'book-open': { label: 'Palavra', icon: BookOpen },
  church: { label: 'Igreja', icon: Church },
  home: { label: 'Casa', icon: Home },
  coffee: { label: 'Café', icon: Coffee },
  utensils: { label: 'Cozinha', icon: Utensils },
  shield: { label: 'Segurança', icon: Shield },
  car: { label: 'Estacionamento', icon: Car },
  palette: { label: 'Artes', icon: Palette },
  flower: { label: 'Decoração', icon: Flower },
  sparkles: { label: 'Eventos', icon: Sparkles },
  star: { label: 'Destaque', icon: Star },
  sun: { label: 'Jovens', icon: Sun },
};

export const MINISTERIO_CORES = {
  azul: { label: 'Azul', bg: '#E5F4FE', fg: '#034BBE' },
  lavanda: { label: 'Lavanda', bg: '#E8E9F4', fg: '#11187E' },
  agua: { label: 'Água', bg: '#E3F3F7', fg: '#365683' },
  ceu: { label: 'Céu', bg: '#B0D3E7', fg: '#10175D' },
  verde: { label: 'Verde', bg: '#79CAAB', fg: '#10175D' },
  creme: { label: 'Creme', bg: '#FFFFE6', fg: '#365683' },
} as const;

export type MinisterioCorKey = keyof typeof MINISTERIO_CORES;

export const MINISTERIO_ICONE_KEYS = Object.keys(MINISTERIO_ICONES) as [string, ...string[]];
export const MINISTERIO_COR_KEYS = Object.keys(MINISTERIO_CORES) as [MinisterioCorKey, ...MinisterioCorKey[]];

const FALLBACK_COR = { bg: '#EEF0F5', fg: '#3A4150' };

/** Resolve as chaves salvas para o ícone e as cores; chaves ausentes ou desconhecidas usam o fallback. */
export function resolverVisualMinisterio(icone?: string | null, cor?: string | null) {
  const paleta = cor && cor in MINISTERIO_CORES ? MINISTERIO_CORES[cor as MinisterioCorKey] : FALLBACK_COR;
  return {
    icon: (icone && MINISTERIO_ICONES[icone]?.icon) || Users,
    color: { bg: paleta.bg, fg: paleta.fg },
  };
}
