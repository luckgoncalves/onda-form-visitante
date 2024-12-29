import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date) {
  date.setHours(date.getHours() - 3);
  return date.toISOString().split('T')[0].split('-').reverse().join('/');
}

export function formatPhone(input: string) {
  // Remove todos os caracteres que não são números
  let phone = input.replace(/\D/g, '');

  // Limita o tamanho máximo em 11 dígitos
  if (phone.length > 11) {
    phone = phone.slice(0, 11);
  }

  // Aplica a máscara
  if (phone.length > 10) {
    // Máscara para celular com 9 dígitos: (XX) XXXXX-XXXX
    phone = phone.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (phone.length > 5) {
    // Máscara para fixo: (XX) XXXX-XXXX
    phone = phone.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  } else if (phone.length > 2) {
    // Parcial: (XX) XXXX ou (XX) XXX
    phone = phone.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
  } else if (phone.length > 0) {
    // Apenas DDD
    phone = phone.replace(/^(\d{0,2})/, "($1");
  }

  // Atualiza o valor do input
  return phone;
}

export const formatInteresse = (interesse: string) => {
  const formatMap: { [key: string]: string } = {
    GP: 'GP',
    Familizarizando: 'Familiarizando',
    nao_tem_interesse: 'Não tem interesse'
  };
  
  return formatMap[interesse] || interesse;
};

export const formatCulto = (culto: string) => {
  const formatMap: { [key: string]: string } = {
    sabado: 'Sábado',
    'domingo-noite': 'Domingo à noite',
    'domingo-manha': 'Domingo de manhã'
  };
  
  return formatMap[culto] || culto;
};
