import * as z from "zod";

export const empresaSchema = z.object({
  nomeNegocio: z.string().min(1, "Nome do negócio é obrigatório"),
  ramoAtuacao: z.string().min(1, "Ramo de atuação é obrigatório"),
  detalhesServico: z.string().min(1, "Detalhes do serviço são obrigatórios"),
  whatsapp: z.string().min(1, "WhatsApp é obrigatório"),
  endereco: z.string().optional(),
  site: z.string().url("URL do site inválida").optional().or(z.literal('')),
  instagram: z.string().optional().or(z.literal('')),
  facebook: z.string().optional().or(z.literal('')),
  linkedin: z.string().optional().or(z.literal('')),
  email: z.string().email("Email inválido"),
});

export const createEmpresaSchema = empresaSchema.extend({
  userId: z.string().min(1, "ID do usuário é obrigatório"),
});

export const updateEmpresaSchema = empresaSchema.partial();

export type EmpresaFormData = z.infer<typeof empresaSchema>;
export type CreateEmpresaData = z.infer<typeof createEmpresaSchema>;
export type UpdateEmpresaData = z.infer<typeof updateEmpresaSchema>; 