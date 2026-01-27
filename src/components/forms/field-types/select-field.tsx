'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FieldType } from '@/types/form';
import { Plus, X } from 'lucide-react';
import { nanoid } from 'nanoid';
import { FieldOption } from '@/types/form';

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: FieldOption[];
  error?: string;
  disabled?: boolean;
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  required = false,
  placeholder,
  helpText,
  options = [],
  error,
  disabled = false,
}: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-base font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          className={`h-12 text-base ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
        >
          <SelectValue placeholder={placeholder || 'Selecione uma opção'} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.value} className="text-base">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
interface SelectEditorProps {
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: FieldOption[];
  onUpdate: (updates: Partial<{ label: string; placeholder: string; helpText: string; required: boolean; options: FieldOption[] }>) => void;
}

export function SelectEditor({
  label,
  placeholder,
  helpText,
  required,
  options = [],
  onUpdate,
}: SelectEditorProps) {
  const addOption = () => {
    const newOption: FieldOption = {
      id: nanoid(8),
      label: `Opção ${options.length + 1}`,
      value: `option_${options.length + 1}`,
    };
    onUpdate({ options: [...options, newOption] });
  };

  const updateOption = (index: number, updates: Partial<FieldOption>) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], ...updates };
    onUpdate({ options: newOptions });
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return; // Keep minimum 2 options
    const newOptions = options.filter((_, i) => i !== index);
    onUpdate({ options: newOptions });
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Label do campo</Label>
        <Input
          value={label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="Ex: Estado"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Placeholder</Label>
        <Input
          value={placeholder || ''}
          onChange={(e) => onUpdate({ placeholder: e.target.value })}
          placeholder="Ex: Selecione seu estado"
        />
      </div>
      
      <div className="space-y-2">
        <Label className="text-sm font-medium">Opções</Label>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={option.id} className="flex items-center gap-2">
              <span className="text-gray-400 text-sm w-6">{index + 1}.</span>
              <Input
                value={option.label}
                onChange={(e) => updateOption(index, { label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                placeholder={`Opção ${index + 1}`}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeOption(index)}
                disabled={options.length <= 2}
                className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addOption}
          className="w-full mt-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar opção
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Texto de ajuda</Label>
        <Input
          value={helpText || ''}
          onChange={(e) => onUpdate({ helpText: e.target.value })}
          placeholder="Ex: Escolha uma das opções"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="required-select"
          checked={required}
          onChange={(e) => onUpdate({ required: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="required-select" className="text-sm font-medium cursor-pointer">
          Campo obrigatório
        </Label>
      </div>
    </div>
  );
}

export const selectFieldConfig = {
  type: 'SELECT' as FieldType,
  label: 'Lista Suspensa',
  icon: 'ChevronDown',
  defaultLabel: 'Selecione uma opção',
  defaultPlaceholder: 'Selecione...',
  defaultOptions: [
    { id: nanoid(8), label: 'Opção 1', value: 'opcao_1' },
    { id: nanoid(8), label: 'Opção 2', value: 'opcao_2' },
  ],
};
