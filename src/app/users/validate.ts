import * as z from "zod";

export const userSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    phone: z.string().optional().or(z.literal('')),
    role: z.string({
      required_error: "Selecione um papel",
    }).refine(value => ['user', 'admin', 'base_pessoal'].includes(value), {
      message: "Papel inválido"
    }),
    dataMembresia: z.string().regex(/^\d{4}-\d{2}$/, "Formato inválido. Use YYYY-MM").optional().or(z.literal('')),
    profileImageUrl: z.string().url("URL da imagem inválida").optional().or(z.literal(''))
  });
  
export const editUserPageSchema = userSchema.extend({
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").optional().or(z.literal('')),
  });