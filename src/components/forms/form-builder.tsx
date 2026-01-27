'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FieldType } from '@/types/form';
import { FormFieldConfig, FieldOption } from '@/types/form';
import { allFieldTypes, fieldRequiresOptions, getDefaultOptions } from './field-types';
import { SortableFieldItem } from './sortable-field-item';
import { FieldEditorModal } from './field-editor-modal';
import { nanoid } from 'nanoid';
import {
  Type,
  AlignLeft,
  Mail,
  Hash,
  Phone,
  Circle,
  CheckSquare,
  ChevronDown,
  Plus,
} from 'lucide-react';

// Icon mapping
const IconMap = {
  Type,
  AlignLeft,
  Mail,
  Hash,
  Phone,
  Circle,
  CheckSquare,
  ChevronDown,
};

interface FormBuilderProps {
  fields: FormFieldConfig[];
  onFieldsChange: (fields: FormFieldConfig[]) => void;
}

export function FormBuilder({ fields, onFieldsChange }: FormBuilderProps) {
  const [editingField, setEditingField] = useState<FormFieldConfig | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);

      const newFields = arrayMove(fields, oldIndex, newIndex).map((field, index) => ({
        ...field,
        order: index,
      }));

      onFieldsChange(newFields);
    }
  }, [fields, onFieldsChange]);

  const addField = useCallback((type: FieldType) => {
    const config = allFieldTypes.find((c) => c.type === type);
    if (!config) return;

    const newField: FormFieldConfig = {
      id: nanoid(12),
      label: config.defaultLabel,
      type,
      required: false,
      placeholder: 'defaultPlaceholder' in config ? config.defaultPlaceholder : undefined,
      helpText: undefined,
      options: fieldRequiresOptions(type) ? getDefaultOptions(type) : undefined,
      order: fields.length,
    };

    onFieldsChange([...fields, newField]);
    
    // Open editor for the new field
    setEditingField(newField);
    setEditingIndex(fields.length);
  }, [fields, onFieldsChange]);

  const updateField = useCallback((index: number, updates: Partial<FormFieldConfig>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    onFieldsChange(newFields);
  }, [fields, onFieldsChange]);

  const deleteField = useCallback((index: number) => {
    const newFields = fields.filter((_, i) => i !== index).map((field, i) => ({
      ...field,
      order: i,
    }));
    onFieldsChange(newFields);
  }, [fields, onFieldsChange]);

  const duplicateField = useCallback((index: number) => {
    const field = fields[index];
    const newField: FormFieldConfig = {
      ...field,
      id: nanoid(12),
      label: `${field.label} (cópia)`,
      order: fields.length,
      options: field.options ? field.options.map(opt => ({ ...opt, id: nanoid(8) })) : undefined,
    };
    onFieldsChange([...fields, newField]);
  }, [fields, onFieldsChange]);

  const openEditor = useCallback((field: FormFieldConfig, index: number) => {
    setEditingField(field);
    setEditingIndex(index);
  }, []);

  const closeEditor = useCallback(() => {
    setEditingField(null);
    setEditingIndex(null);
  }, []);

  const saveFieldEdits = useCallback((updates: Partial<FormFieldConfig>) => {
    if (editingIndex !== null) {
      updateField(editingIndex, updates);
      // Update local editing state
      setEditingField((prev) => prev ? { ...prev, ...updates } : null);
    }
  }, [editingIndex, updateField]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Field Type Selector */}
      <div className="lg:w-64 flex-shrink-0">
        <Card className="p-4 sticky top-4">
          <h3 className="font-semibold text-sm text-gray-700 mb-3">
            Adicionar Campo
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {allFieldTypes.map((config) => {
              const Icon = IconMap[config.icon as keyof typeof IconMap];
              return (
                <Button
                  key={config.type}
                  variant="outline"
                  size="sm"
                  onClick={() => addField(config.type)}
                  className="justify-start gap-2 h-10"
                >
                  {Icon && <Icon className="h-4 w-4 text-gray-500" />}
                  <span className="text-sm">{config.label}</span>
                </Button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Fields List */}
      <div className="flex-1 min-w-0">
        {fields.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Plus className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Nenhum campo adicionado</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Clique em um tipo de campo ao lado para começar
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map((f) => f.id!)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <SortableFieldItem
                    key={field.id}
                    field={field}
                    onEdit={() => openEditor(field, index)}
                    onDelete={() => deleteField(index)}
                    onDuplicate={() => duplicateField(index)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Field Editor Modal */}
      {editingField && (
        <FieldEditorModal
          field={editingField}
          onUpdate={saveFieldEdits}
          onClose={closeEditor}
        />
      )}
    </div>
  );
}
