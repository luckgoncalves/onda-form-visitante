'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldType } from '@/types/form';

interface PhoneFieldProps {
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

export function PhoneField({
  id,
  label,
  value,
  onChange,
  required = false,
  placeholder,
  helpText,
  error,
  disabled = false,
}: PhoneFieldProps) {
  // Format phone number as user types
  const formatPhone = (input: string) => {
    // Remove non-digits
    const digits = input.replace(/\D/g, '');
    
    // Format as (XX) XXXXX-XXXX
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 7) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else if (digits.length <= 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    onChange(formatted);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-base font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={id}
        type="tel"
        value={value}
        onChange={handleChange}
        placeholder={placeholder || '(00) 00000-0000'}
        disabled={disabled}
        maxLength={16}
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
interface PhoneEditorProps {
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  onUpdate: (updates: Partial<{ label: string; placeholder: string; helpText: string; required: boolean }>) => void;
}

export function PhoneEditor({
  label,
  placeholder,
  helpText,
  required,
  onUpdate,
}: PhoneEditorProps) {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Label do campo</Label>
        <Input
          value={label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="Ex: Telefone"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Placeholder</Label>
        <Input
          value={placeholder || ''}
          onChange={(e) => onUpdate({ placeholder: e.target.value })}
          placeholder="Ex: (00) 00000-0000"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Texto de ajuda</Label>
        <Input
          value={helpText || ''}
          onChange={(e) => onUpdate({ helpText: e.target.value })}
          placeholder="Ex: Informe seu WhatsApp"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="required-phone"
          checked={required}
          onChange={(e) => onUpdate({ required: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="required-phone" className="text-sm font-medium cursor-pointer">
          Campo obrigatório
        </Label>
      </div>
    </div>
  );
}

export const phoneFieldConfig = {
  type: 'PHONE' as FieldType,
  label: 'Telefone',
  icon: 'Phone',
  defaultLabel: 'Telefone',
  defaultPlaceholder: '(00) 00000-0000',
};
