'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldType } from '@/types/form';

interface NumberFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  error?: string;
  disabled?: boolean;
}

export function NumberField({
  id,
  label,
  value,
  onChange,
  required = false,
  placeholder,
  helpText,
  error,
  disabled = false,
}: NumberFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-base font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`h-12 text-base ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
      />
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

// Editor component for form builder
interface NumberEditorProps {
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  onUpdate: (updates: Partial<{ label: string; placeholder: string; helpText: string; required: boolean }>) => void;
}

export function NumberEditor({
  label,
  placeholder,
  helpText,
  required,
  onUpdate,
}: NumberEditorProps) {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Label do campo</Label>
        <Input
          value={label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="Ex: Idade"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Placeholder</Label>
        <Input
          value={placeholder || ''}
          onChange={(e) => onUpdate({ placeholder: e.target.value })}
          placeholder="Ex: Digite sua idade"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Texto de ajuda</Label>
        <Input
          value={helpText || ''}
          onChange={(e) => onUpdate({ helpText: e.target.value })}
          placeholder="Ex: Informe sua idade em anos"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="required-number"
          checked={required}
          onChange={(e) => onUpdate({ required: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="required-number" className="text-sm font-medium cursor-pointer">
          Campo obrigatório
        </Label>
      </div>
    </div>
  );
}

export const numberFieldConfig = {
  type: 'NUMBER' as FieldType,
  label: 'Número',
  icon: 'Hash',
  defaultLabel: 'Número',
  defaultPlaceholder: 'Digite um número',
};
