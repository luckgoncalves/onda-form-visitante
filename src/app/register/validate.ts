import * as z from 'zod';

export const step1Schema = z.object({
   culto: z.string().min(1, 'Selecione um culto'), 
});

export const step2Schema = z.object({
    nome: z.string().min(1, 'O nome é obrigatório'),
    genero: z.string().min(1, 'Selecione um genero'),
    idade: z.string().min(1, 'A idade é obrigatório'),
    estado_civil: z.string().min(1, 'Selecione um estado civil'),
    telefone: z.string().min(1, 'O telefone é obrigatório')
});

export const step3Schema = z.object({
    como_nos_conheceu: z.string().min(1, 'Selecione uma opção'),
    como_chegou_ate_nos: z.string().min(1, 'Selecione uma opção'),
    frequenta_igreja: z.string().min(1, 'Selecione uma opção'),
    qual_igreja: z.string().min(1, 'Selecione uma opção'),
    interesse_em_conhecer: z.string().min(1, 'Selecione uma opção'),
    observacao: z.string().min(1, 'O campo é obrigatório'),
});