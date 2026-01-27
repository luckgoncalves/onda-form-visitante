// Field components exports
export { ShortTextField, ShortTextEditor, shortTextFieldConfig } from './short-text';
export { LongTextField, LongTextEditor, longTextFieldConfig } from './long-text';
export { EmailField, EmailEditor, emailFieldConfig } from './email-field';
export { NumberField, NumberEditor, numberFieldConfig } from './number-field';
export { PhoneField, PhoneEditor, phoneFieldConfig } from './phone-field';
export { RadioField, RadioEditor, radioFieldConfig } from './radio-field';
export { CheckboxField, CheckboxEditor, checkboxFieldConfig } from './checkbox-field';
export { SelectField, SelectEditor, selectFieldConfig } from './select-field';

import { FieldType } from '@/types/form';
import { FieldOption } from '@/types/form';
import { nanoid } from 'nanoid';

// Field type configurations
export const fieldTypeConfigs = {
  SHORT_TEXT: {
    type: 'SHORT_TEXT' as FieldType,
    label: 'Texto Curto',
    icon: 'Type',
    defaultLabel: 'Texto curto',
    defaultPlaceholder: 'Digite sua resposta',
  },
  LONG_TEXT: {
    type: 'LONG_TEXT' as FieldType,
    label: 'Texto Longo',
    icon: 'AlignLeft',
    defaultLabel: 'Texto longo',
    defaultPlaceholder: 'Digite sua resposta detalhada',
  },
  EMAIL: {
    type: 'EMAIL' as FieldType,
    label: 'E-mail',
    icon: 'Mail',
    defaultLabel: 'E-mail',
    defaultPlaceholder: 'exemplo@email.com',
  },
  NUMBER: {
    type: 'NUMBER' as FieldType,
    label: 'Número',
    icon: 'Hash',
    defaultLabel: 'Número',
    defaultPlaceholder: 'Digite um número',
  },
  PHONE: {
    type: 'PHONE' as FieldType,
    label: 'Telefone',
    icon: 'Phone',
    defaultLabel: 'Telefone',
    defaultPlaceholder: '(00) 00000-0000',
  },
  RADIO: {
    type: 'RADIO' as FieldType,
    label: 'Escolha Única',
    icon: 'Circle',
    defaultLabel: 'Escolha uma opção',
    defaultOptions: (): FieldOption[] => [
      { id: nanoid(8), label: 'Opção 1', value: 'opcao_1' },
      { id: nanoid(8), label: 'Opção 2', value: 'opcao_2' },
    ],
  },
  CHECKBOX: {
    type: 'CHECKBOX' as FieldType,
    label: 'Múltipla Escolha',
    icon: 'CheckSquare',
    defaultLabel: 'Selecione as opções',
    defaultOptions: (): FieldOption[] => [
      { id: nanoid(8), label: 'Opção 1', value: 'opcao_1' },
      { id: nanoid(8), label: 'Opção 2', value: 'opcao_2' },
    ],
  },
  SELECT: {
    type: 'SELECT' as FieldType,
    label: 'Lista Suspensa',
    icon: 'ChevronDown',
    defaultLabel: 'Selecione uma opção',
    defaultPlaceholder: 'Selecione...',
    defaultOptions: (): FieldOption[] => [
      { id: nanoid(8), label: 'Opção 1', value: 'opcao_1' },
      { id: nanoid(8), label: 'Opção 2', value: 'opcao_2' },
    ],
  },
};

// Get all field types as array
export const allFieldTypes = Object.values(fieldTypeConfigs);

// Check if field type requires options
export function fieldRequiresOptions(type: FieldType): boolean {
  return ['RADIO', 'CHECKBOX', 'SELECT'].includes(type);
}

// Get default options for a field type
export function getDefaultOptions(type: FieldType): FieldOption[] | undefined {
  const config = fieldTypeConfigs[type];
  if ('defaultOptions' in config && typeof config.defaultOptions === 'function') {
    return config.defaultOptions();
  }
  return undefined;
}
