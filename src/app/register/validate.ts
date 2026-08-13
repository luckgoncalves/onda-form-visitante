import * as z from 'zod';

export const step1Schema = z.object({
   culto: z.string({required_error: 'Selecione um culto'}).min(1, { message: 'Selecione um culto' }), 
//    .min(1, { message: 'Selecione um culto' }), 
});

export const step2Schema = z.object({
    nome: z.string({required_error: 'O nome é obrigatório'}).min(3, { message: 'O nome é muito curto' }),
    genero: z.string({required_error: 'Selecione um genêro'}).min(1, { message: 'Selecione um genêro' }),
    idade: z.string().optional(),
    estado: z.string().optional(),
    cidade: z.string().optional(),
    bairro: z.string().optional(),
    estado_civil: z.string().optional(),
    telefone: z.string({required_error: 'O telefone é obrigatório'}).refine(value => /^\(\d{2}\) \d{4,5}-\d{4}$/.test(value), { message: 'O telefone deve estar no formato (99) 99999-9999 ou (99) 9999-9999' }),
    email: z.string().optional().refine(value => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), { message: 'Informe um e-mail válido' }),
    responsavel_nome: z.string().optional().nullable(),
    responsavel_telefone: z.string().optional().nullable().refine(value => !value || /^\(\d{2}\) \d{4,5}-\d{4}$/.test(value), { message: 'O telefone deve estar no formato (99) 99999-9999 ou (99) 9999-9999' }),
    culto: z.string().optional(),
});

export const step3Schema = z.object({
    como_nos_conheceu: z.string().optional(),
    como_chegou_ate_nos: z.string().optional().nullable(),
    frequenta_igreja: z.string().optional(),
    qual_igreja: z.string().optional(),
    interesse_em_conhecer: z.array(z.string()).optional(),
    observacao: z.string().optional(),
});
