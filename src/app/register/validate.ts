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
    telefone: z.string({required_error: 'O telefone é obrigatório'}).min(1, { message: 'O telefone é obrigatório' })
});

export const step3Schema = z.object({
    como_nos_conheceu: z.string({required_error: 'Campo obrigatório'}).min(1, { message: 'Campo obrigatório' }),
    como_chegou_ate_nos: z.string({required_error: 'Campo obrigatório'}).min(1, { message: 'Campo obrigatório' }),
    frequenta_igreja: z.string({required_error: 'Selecione uma opção'}).min(1, { message: 'Selecione uma opção' }),
    qual_igreja: z.string({required_error: 'Selecione uma opção'}).min(1, { message: 'Selecione uma opção' }),
    interesse_em_conhecer: z.array(z.string({required_error: 'Selecione pelo menos uma opção'}))
    .min(1, { message: 'Selecione pelo menos uma opção' }),
    observacao: z.string({required_error: 'O campo é obrigatório'}).min(1, { message: 'O campo é obrigatório' }),
});
