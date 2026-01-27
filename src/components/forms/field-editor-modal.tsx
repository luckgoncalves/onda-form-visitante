'use client';

import { FormFieldConfig, FieldOption, FIELD_TYPE_LABELS } from '@/types/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { fieldRequiresOptions } from './field-types';
import { Plus, X } from 'lucide-react';
import { nanoid } from 'nanoid';

interface FieldEditorModalProps {
  field: FormFieldConfig;
  onUpdate: (updates: Partial<FormFieldConfig>) => void;
  onClose: () => void;
}

export function FieldEditorModal({
  field,
  onUpdate,
  onClose,
}: FieldEditorModalProps) {
  const hasOptions = fieldRequiresOptions(field.type);

  const addOption = () => {
    const options = field.options || [];
    const newOption: FieldOption = {
      id: nanoid(8),
      label: `Opção ${options.length + 1}`,
      value: `opcao_${options.length + 1}`,
    };
    onUpdate({ options: [...options, newOption] });
  };

  const updateOption = (index: number, updates: Partial<FieldOption>) => {
    const options = [...(field.options || [])];
    options[index] = { ...options[index], ...updates };
    onUpdate({ options });
  };

  const removeOption = (index: number) => {
    const options = field.options || [];
    if (options.length <= 2) return;
    onUpdate({ options: options.filter((_, i) => i !== index) });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Editar Campo - {FIELD_TYPE_LABELS[field.type]}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="field-label">Label do campo *</Label>
            <Input
              id="field-label"
              value={field.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              placeholder="Ex: Nome completo"
            />
          </div>

          {/* Placeholder (for text-based fields) */}
          {!hasOptions && (
            <div className="space-y-2">
              <Label htmlFor="field-placeholder">Placeholder</Label>
              <Input
                id="field-placeholder"
                value={field.placeholder || ''}
                onChange={(e) => onUpdate({ placeholder: e.target.value })}
                placeholder="Ex: Digite seu nome"
              />
            </div>
          )}

          {/* Help text */}
          <div className="space-y-2">
            <Label htmlFor="field-helptext">Texto de ajuda</Label>
            <Input
              id="field-helptext"
              value={field.helpText || ''}
              onChange={(e) => onUpdate({ helpText: e.target.value })}
              placeholder="Ex: Este campo é opcional"
            />
          </div>

          {/* Options (for radio, checkbox, select) */}
          {hasOptions && (
            <div className="space-y-3">
              <Label>Opções</Label>
              <div className="space-y-2">
                {(field.options || []).map((option, index) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm w-6 flex-shrink-0">
                      {index + 1}.
                    </span>
                    <Input
                      value={option.label}
                      onChange={(e) =>
                        updateOption(index, {
                          label: e.target.value,
                          value: e.target.value
                            .toLowerCase()
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .replace(/\s+/g, '_')
                            .replace(/[^a-z0-9_]/g, ''),
                        })
                      }
                      placeholder={`Opção ${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                      disabled={(field.options || []).length <= 2}
                      className="h-9 w-9 p-0 text-gray-400 hover:text-red-500 flex-shrink-0"
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
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar opção
              </Button>
            </div>
          )}

          {/* Required */}
          <div className="flex items-center gap-3 pt-2">
            <Checkbox
              id="field-required"
              checked={field.required}
              onCheckedChange={(checked) => onUpdate({ required: checked === true })}
            />
            <Label htmlFor="field-required" className="cursor-pointer">
              Campo obrigatório
            </Label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
