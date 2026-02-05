import * as z from "zod";
import { userSchema } from "@/app/users/validate";
import { empresaSchema } from "./empresa";

// Schema para registro de usuário (estende userSchema com senha, mas omite role pois será sempre 'user')
export const registerUserSchema = userSchema.omit({ role: true }).extend({
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

// Schema completo para registro (usuário + empresas opcionais)
// O role será sempre 'user' para registro público, mas incluímos no schema para validação
export const registerSchema = z.object({
  user: registerUserSchema.extend({
    role: z.literal('user').optional(),
    campusId: z.string().min(1, 'Selecione um campus').optional(),
  }),
  empresas: z.array(empresaSchema).min(0, 'Você pode adicionar empresas opcionalmente'),
});

export type RegisterUserData = z.infer<typeof registerUserSchema>;
export type RegisterData = z.infer<typeof registerSchema>;

