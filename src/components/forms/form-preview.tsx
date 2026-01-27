'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormFieldConfig, FieldOption } from '@/types/form';
import { FieldType } from '@/types/form';
import {
  ShortTextField,
  LongTextField,
  EmailField,
  NumberField,
  PhoneField,
  RadioField,
  CheckboxField,
  SelectField,
} from './field-types';

interface FormPreviewProps {
  title: string;
  description?: string;
  fields: FormFieldConfig[];
  isPreviewMode?: boolean;
}

export function FormPreview({
  title,
  description,
  fields,
  isPreviewMode = true,
}: FormPreviewProps) {
  const [values, setValues] = useState<Record<string, string>>({});

  const handleChange = (fieldId: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const renderField = (field: FormFieldConfig) => {
    const commonProps = {
      id: field.id!,
      label: field.label,
      value: values[field.id!] || '',
      onChange: (value: string) => handleChange(field.id!, value),
      required: field.required,
      placeholder: field.placeholder,
      helpText: field.helpText,
      disabled: false,
    };

    switch (field.type) {
      case 'SHORT_TEXT':
        return <ShortTextField {...commonProps} />;
      case 'LONG_TEXT':
        return <LongTextField {...commonProps} />;
      case 'EMAIL':
        return <EmailField {...commonProps} />;
      case 'NUMBER':
        return <NumberField {...commonProps} />;
      case 'PHONE':
        return <PhoneField {...commonProps} />;
      case 'RADIO':
        return <RadioField {...commonProps} options={field.options as FieldOption[]} />;
      case 'CHECKBOX':
        return <CheckboxField {...commonProps} options={field.options as FieldOption[]} />;
      case 'SELECT':
        return <SelectField {...commonProps} options={field.options as FieldOption[]} />;
      default:
        return null;
    }
  };

  // Convert description to HTML with clickable links
  const renderDescription = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-onda-darkBlue hover:underline"
          >
            {part}
          </a>
        );
      }
      // Preserve line breaks
      return part.split('\n').map((line, lineIndex, array) => (
        <span key={`${index}-${lineIndex}`}>
          {line}
          {lineIndex < array.length - 1 && <br />}
        </span>
      ));
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <Card className="mb-4 overflow-hidden">
        <div className="h-2 bg-onda-darkBlue" />
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {title || 'Formulário sem título'}
          </h1>
          {description && (
            <p className="text-gray-600 whitespace-pre-wrap">
              {renderDescription(description)}
            </p>
          )}
        </div>
      </Card>

      {/* Fields */}
      {fields.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          Adicione campos ao formulário para visualizar o preview
        </Card>
      ) : (
        <div className="space-y-4">
          {fields
            .sort((a, b) => a.order - b.order)
            .map((field) => (
              <Card key={field.id} className="p-6">
                {renderField(field)}
              </Card>
            ))}
        </div>
      )}

      {/* Submit button (preview only) */}
      {fields.length > 0 && isPreviewMode && (
        <div className="mt-6">
          <Button
            type="button"
            className="bg-onda-darkBlue hover:bg-onda-darkBlue/90"
            disabled
          >
            Enviar (Preview)
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            * Este é apenas um preview. O botão não está funcional.
          </p>
        </div>
      )}
    </div>
  );
}
