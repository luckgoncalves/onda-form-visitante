import * as z from 'zod';

export const step1Schema = z.object({
   culto: z.string({required_error: 'Selecione um culto'}).min(1, { message: 'Selecione um culto' }), 
//    .min(1, { message: 'Selecione um culto' }), 
});

export const step2Schema = z.object({
    nome: z.string({required_error: 'O nome é obrigatório'}).min(3, { message: 'O nome é muito curto' }),
    genero: z.string({required_error: 'Selecione um genêro'}).min(1, { message: 'Selecione um genêro' }),
    idade: z.string({required_error: 'O valor informado nao é um número'}).min(1, { message: 'A idade é obrigatório' }),
    bairro: z.string({required_error: 'O bairro é obrigatório'}).min(1, { message: 'O bairro é obrigatório' }),
    estado_civil: z.string({required_error: 'Selecione um estado civil'}).min(1, { message: 'Selecione um estado civil' }),
    telefone: z.string({required_error: 'O telefone é obrigatório'}).refine(value => /^\d{2} \d{4,5}-\d{4}$/.test(value), { message: 'O telefone deve estar no formato 99 99999-9999 ou 99 9999-9999' })
});

export const step3Schema = z.object({
    como_nos_conheceu: z.string().optional(),
    como_chegou_ate_nos: z.string().optional(),
    frequenta_igreja: z.string().optional(),
    qual_igreja: z.string().optional(),
    interesse_em_conhecer: z.array(z.string({required_error: 'Selecione pelo menos uma opção'}))
    .min(1, { message: 'Selecione pelo menos uma opção' }),
    observacao: z.string().optional(),
});
