'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FieldType } from '@/types/form';
import { Plus, X } from 'lucide-react';
import { nanoid } from 'nanoid';
import { FieldOption } from '@/types/form';

interface CheckboxFieldProps {
  id: string;
  label: string;
  value: string; // JSON stringified array
  onChange: (value: string) => void;
  required?: boolean;
  helpText?: string;
  options?: FieldOption[];
  error?: string;
  disabled?: boolean;
}

export function CheckboxField({
  id,
  label,
  value,
  onChange,
  required = false,
  helpText,
  options = [],
  error,
  disabled = false,
}: CheckboxFieldProps) {
  // Parse value as JSON array
  const selectedValues: string[] = (() => {
    try {
      const parsed = JSON.parse(value || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  const handleChange = (optionValue: string, checked: boolean) => {
    let newValues: string[];
    if (checked) {
      newValues = [...selectedValues, optionValue];
    } else {
      newValues = selectedValues.filter((v) => v !== optionValue);
    }
    onChange(JSON.stringify(newValues));
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.id} className="flex items-center space-x-3">
            <Checkbox
              id={`${id}-${option.id}`}
              checked={selectedValues.includes(option.value)}
              onCheckedChange={(checked) => handleChange(option.value, checked === true)}
              disabled={disabled}
              className="h-5 w-5"
            />
            <Label
              htmlFor={`${id}-${option.id}`}
              className="text-base font-normal cursor-pointer"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </div>
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
interface CheckboxEditorProps {
  label: string;
  helpText?: string;
  required: boolean;
  options?: FieldOption[];
  onUpdate: (updates: Partial<{ label: string; helpText: string; required: boolean; options: FieldOption[] }>) => void;
}

export function CheckboxEditor({
  label,
  helpText,
  required,
  options = [],
  onUpdate,
}: CheckboxEditorProps) {
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
          placeholder="Ex: Interesses"
        />
      </div>
      
      <div className="space-y-2">
        <Label className="text-sm font-medium">Opções</Label>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={option.id} className="flex items-center gap-2">
              <div className="h-4 w-4 rounded border-2 border-gray-300" />
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
          placeholder="Ex: Selecione todas que se aplicam"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="required-checkbox"
          checked={required}
          onChange={(e) => onUpdate({ required: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="required-checkbox" className="text-sm font-medium cursor-pointer">
          Campo obrigatório
        </Label>
      </div>
    </div>
  );
}

export const checkboxFieldConfig = {
  type: 'CHECKBOX' as FieldType,
  label: 'Múltipla Escolha',
  icon: 'CheckSquare',
  defaultLabel: 'Selecione as opções',
  defaultOptions: [
    { id: nanoid(8), label: 'Opção 1', value: 'opcao_1' },
    { id: nanoid(8), label: 'Opção 2', value: 'opcao_2' },
  ],
};
