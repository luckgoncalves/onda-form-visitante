// Define enums locally to avoid Prisma client issues
export type FormStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';
export type FormVisibility = 'PUBLIC' | 'PRIVATE';
export type FieldType = 'SHORT_TEXT' | 'LONG_TEXT' | 'EMAIL' | 'NUMBER' | 'PHONE' | 'RADIO' | 'CHECKBOX' | 'SELECT';

// Define base types locally
export interface Form {
  id: string;
  title: string;
  description: string | null;
  status: FormStatus;
  visibility: FormVisibility;
  publicToken: string | null;
  privateToken: string | null;
  requireAuth: boolean;
  emailEnabled: boolean;
  emailSubject: string | null;
  emailBody: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
}

export interface FormField {
  id: string;
  formId: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder: string | null;
  helpText: string | null;
  options: unknown;
  order: number;
}

export interface FormResponse {
  id: string;
  formId: string;
  respondentEmail: string | null;
  respondentUserId: string | null;
  submittedAt: Date;
}

export interface FormAnswer {
  id: string;
  responseId: string;
  fieldId: string;
  value: string;
}

// Form with relations
export type FormWithFields = Form & {
  fields: FormField[];
};

export type FormWithFieldsAndResponses = Form & {
  fields: FormField[];
  responses: FormResponseWithAnswers[];
};

export type FormResponseWithAnswers = FormResponse & {
  answers: FormAnswer[];
};

export type FormResponseWithAnswersAndFields = FormResponse & {
  answers: (FormAnswer & {
    field: FormField;
  })[];
};

// Form field options (for radio, checkbox, select)
export interface FieldOption {
  id: string;
  label: string;
  value: string;
}

// Form field configuration for builder
export interface FormFieldConfig {
  id?: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: FieldOption[];
  order: number;
}

// Form configuration for builder
export interface FormConfig {
  id?: string;
  title: string;
  description?: string;
  status: FormStatus;
  visibility: FormVisibility;
  requireAuth: boolean;
  emailEnabled: boolean;
  emailSubject?: string;
  emailBody?: string;
  fields: FormFieldConfig[];
}

// Form submission data
export interface FormSubmission {
  formId: string;
  respondentEmail?: string;
  answers: {
    fieldId: string;
    value: string;
  }[];
}

// API response types
export interface FormListItem {
  id: string;
  title: string;
  status: FormStatus;
  visibility: FormVisibility;
  responseCount: number;
  createdAt: Date;
  updatedAt: Date;
  publicToken?: string | null;
  privateToken?: string | null;
}

// Field type metadata for builder UI
export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  SHORT_TEXT: 'Texto Curto',
  LONG_TEXT: 'Texto Longo',
  EMAIL: 'E-mail',
  NUMBER: 'Número',
  PHONE: 'Telefone',
  RADIO: 'Escolha Única',
  CHECKBOX: 'Múltipla Escolha',
  SELECT: 'Lista Suspensa',
};

export const FIELD_TYPE_ICONS: Record<FieldType, string> = {
  SHORT_TEXT: 'Type',
  LONG_TEXT: 'AlignLeft',
  EMAIL: 'Mail',
  NUMBER: 'Hash',
  PHONE: 'Phone',
  RADIO: 'Circle',
  CHECKBOX: 'CheckSquare',
  SELECT: 'ChevronDown',
};

// Fields that require options
export const FIELDS_WITH_OPTIONS: FieldType[] = ['RADIO', 'CHECKBOX', 'SELECT'];
