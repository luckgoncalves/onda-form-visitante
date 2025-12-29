import * as z from "zod";

export const userSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    phone: z.string().optional().or(z.literal('')),
    role: z.string({
      required_error: "Selecione um papel",
    }).refine(value => ['user', 'admin', 'base_pessoal'].includes(value), {
      message: "Papel inválido"
    })
  });
  
export const editUserPageSchema = userSchema.extend({
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").optional().or(z.literal('')),
  });