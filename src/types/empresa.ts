export interface Empresa {
  id: string;
  nomeNegocio: string;
  ramoAtuacao: string;
  detalhesServico: string;
  whatsapp: string;
  endereco: string;
  site?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  linkedin?: string | null;
  email: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  usuarios?: UserEmpresa[];
}

export const EMPRESA_CONTACT_CHANNELS = ['site', 'instagram', 'facebook', 'linkedin'] as const;
export type EmpresaContactChannel = (typeof EMPRESA_CONTACT_CHANNELS)[number];

export interface UserEmpresa {
  id: string;
  userId: string;
  empresaId: string;
  createdAt: Date | string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
}

export interface EmpresaFormData {
  nomeNegocio: string;
  ramoAtuacao: string;
  detalhesServico: string;
  whatsapp: string;
  endereco: string;
  site?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  email: string;
  userId?: string;
}

export interface EmpresaListResponse {
  empresas: Empresa[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EmpresaFiltersResponse {
  ramos: string[];
  channels: EmpresaContactChannel[];
}

export interface UserEmpresasResponse {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  empresas: Empresa[];
} 