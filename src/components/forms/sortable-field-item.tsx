'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FormFieldConfig, FIELD_TYPE_LABELS } from '@/types/form';
import {
  GripVertical,
  Pencil,
  Trash2,
  Copy,
  Type,
  AlignLeft,
  Mail,
  Hash,
  Phone,
  Circle,
  CheckSquare,
  ChevronDown,
} from 'lucide-react';

// Icon mapping
const IconMap = {
  SHORT_TEXT: Type,
  LONG_TEXT: AlignLeft,
  EMAIL: Mail,
  NUMBER: Hash,
  PHONE: Phone,
  RADIO: Circle,
  CHECKBOX: CheckSquare,
  SELECT: ChevronDown,
};

interface SortableFieldItemProps {
  field: FormFieldConfig;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function SortableFieldItem({
  field,
  onEdit,
  onDelete,
  onDuplicate,
}: SortableFieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.9 : 1,
  };

  const Icon = IconMap[field.type];

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-4 ${isDragging ? 'shadow-lg ring-2 ring-onda-darkBlue/20' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <button
          type="button"
          className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {/* Field info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {Icon && <Icon className="h-4 w-4 text-gray-400" />}
            <span className="font-medium text-gray-900 truncate">
              {field.label}
            </span>
            {field.required && (
              <Badge variant="secondary" className="text-xs">
                Obrigatório
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {FIELD_TYPE_LABELS[field.type]}
            {field.placeholder && (
              <span className="text-gray-400"> · {field.placeholder}</span>
            )}
          </p>
          {field.options && field.options.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              {field.options.length} opções
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDuplicate}
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
