import { z } from 'zod';
import { FieldType, FormStatus, FormVisibility } from '@/types/form';

// Enum values for Zod validation
const fieldTypeValues = ['SHORT_TEXT', 'LONG_TEXT', 'EMAIL', 'NUMBER', 'PHONE', 'RADIO', 'CHECKBOX', 'SELECT'] as const;
const formStatusValues = ['DRAFT', 'PUBLISHED', 'CLOSED'] as const;
const formVisibilityValues = ['PUBLIC', 'PRIVATE'] as const;

// Field option schema
export const fieldOptionSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'Label é obrigatório'),
  value: z.string().min(1, 'Valor é obrigatório'),
});

// Form field schema
export const formFieldSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, 'Label do campo é obrigatório'),
  type: z.enum(fieldTypeValues),
  required: z.boolean().default(false),
  placeholder: z.string().nullish(),
  helpText: z.string().nullish(),
  options: z.array(fieldOptionSchema).nullish(),
  order: z.number().int().min(0),
}).refine(
  (data) => {
    // Validate that options are provided for fields that require them
    const fieldsWithOptions: FieldType[] = ['RADIO', 'CHECKBOX', 'SELECT'];
    if (fieldsWithOptions.includes(data.type)) {
      return data.options !== null && data.options !== undefined && Array.isArray(data.options) && data.options.length >= 2;
    }
    return true;
  },
  {
    message: 'Campos de escolha precisam ter pelo menos 2 opções',
    path: ['options'],
  }
);

// Form schema for creation/update
export const formSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
  description: z.string().nullish(),
  status: z.enum(formStatusValues).default('DRAFT'),
  visibility: z.enum(formVisibilityValues).default('PUBLIC'),
  requireAuth: z.boolean().default(false),
  emailEnabled: z.boolean().default(false),
  emailSubject: z.string().nullish(),
  emailBody: z.string().nullish(),
  fields: z.array(formFieldSchema).min(1, 'Adicione pelo menos um campo'),
}).refine(
  (data) => {
    // If email is enabled, subject is required
    if (data.emailEnabled && (!data.emailSubject || data.emailSubject === null || (typeof data.emailSubject === 'string' && data.emailSubject.trim() === ''))) {
      return false;
    }
    return true;
  },
  {
    message: 'Assunto do e-mail é obrigatório quando e-mail está habilitado',
    path: ['emailSubject'],
  }
);

// Form submission schema
export const formSubmissionSchema = z.object({
  formId: z.string().min(1),
  respondentEmail: z.string().email('E-mail inválido').optional().or(z.literal('')),
  answers: z.array(z.object({
    fieldId: z.string().min(1),
    value: z.string(),
  })),
});

// Schema for updating form status
export const formStatusUpdateSchema = z.object({
  status: z.enum(formStatusValues),
});

// Schema for form filters
export const formFiltersSchema = z.object({
  status: z.enum(formStatusValues).optional(),
  search: z.string().optional(),
});

// Types derived from schemas
export type FieldOptionInput = z.infer<typeof fieldOptionSchema>;
export type FormFieldInput = z.infer<typeof formFieldSchema>;
export type FormInput = z.infer<typeof formSchema>;
export type FormSubmissionInput = z.infer<typeof formSubmissionSchema>;
export type FormStatusUpdateInput = z.infer<typeof formStatusUpdateSchema>;
export type FormFiltersInput = z.infer<typeof formFiltersSchema>;

// Dynamic validation for form submission based on form fields
export function createFormSubmissionValidator(fields: { id: string; label: string; required: boolean; type: FieldType }[]) {
  return z.object({
    formId: z.string().min(1),
    respondentEmail: z.string().email('E-mail inválido').optional().or(z.literal('')),
    answers: z.array(z.object({
      fieldId: z.string().min(1),
      value: z.string(),
    })),
  }).refine(
    (data) => {
      // Check all required fields have answers
      const requiredFieldIds = fields.filter(f => f.required).map(f => f.id);
      const answeredFieldIds = data.answers
        .filter(a => a.value && a.value.trim() !== '')
        .map(a => a.fieldId);
      
      return requiredFieldIds.every(id => answeredFieldIds.includes(id));
    },
    {
      message: 'Preencha todos os campos obrigatórios',
      path: ['answers'],
    }
  ).refine(
    (data) => {
      // Validate email fields
      const emailFields = fields.filter(f => f.type === 'EMAIL');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      for (const field of emailFields) {
        const answer = data.answers.find(a => a.fieldId === field.id);
        if (answer && answer.value && !emailRegex.test(answer.value)) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'E-mail inválido',
      path: ['answers'],
    }
  ).refine(
    (data) => {
      // Validate phone fields (basic validation)
      const phoneFields = fields.filter(f => f.type === 'PHONE');
      const phoneRegex = /^[\d\s\-\+\(\)]{8,}$/;
      
      for (const field of phoneFields) {
        const answer = data.answers.find(a => a.fieldId === field.id);
        if (answer && answer.value && field.required && !phoneRegex.test(answer.value)) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Telefone inválido',
      path: ['answers'],
    }
  ).refine(
    (data) => {
      // Validate number fields
      const numberFields = fields.filter(f => f.type === 'NUMBER');
      
      for (const field of numberFields) {
        const answer = data.answers.find(a => a.fieldId === field.id);
        if (answer && answer.value && isNaN(Number(answer.value))) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Número inválido',
      path: ['answers'],
    }
  );
}
