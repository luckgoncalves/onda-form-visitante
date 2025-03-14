import * as z from "zod";

export const userSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    role: z.string({
      required_error: "Selecione um papel",
    }).refine(value => ['user', 'admin'].includes(value), {
      message: "Papel inválido"
    })
  });
  