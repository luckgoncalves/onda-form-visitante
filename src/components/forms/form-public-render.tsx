'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormFieldConfig, FieldOption } from '@/types/form';
import { useToast } from '@/hooks/use-toast';
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
import { Loader2, CheckCircle } from 'lucide-react';

interface FormPublicRenderProps {
  formId: string;
  title: string;
  description?: string;
  fields: FormFieldConfig[];
  token: string;
}

export function FormPublicRender({
  formId,
  title,
  description,
  fields,
  token,
}: FormPublicRenderProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [respondentEmail, setRespondentEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleChange = (fieldId: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    // Clear error when user types
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    for (const field of fields) {
      const value = values[field.id!] || '';
      
      if (field.required && !value.trim()) {
        newErrors[field.id!] = 'Este campo é obrigatório';
        continue;
      }

      if (value && field.type === 'EMAIL') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[field.id!] = 'E-mail inválido';
        }
      }

      if (value && field.type === 'PHONE') {
        const phoneRegex = /^[\d\s\-\+\(\)]{8,}$/;
        if (!phoneRegex.test(value)) {
          newErrors[field.id!] = 'Telefone inválido';
        }
      }

      if (value && field.type === 'NUMBER') {
        if (isNaN(Number(value))) {
          newErrors[field.id!] = 'Número inválido';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Erro',
        description: 'Por favor, corrija os erros no formulário',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const answers = fields.map((field) => ({
        fieldId: field.id!,
        value: values[field.id!] || '',
      }));

      const response = await fetch(`/api/forms/public/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId,
          respondentEmail: respondentEmail || undefined,
          answers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar formulário');
      }

      setIsSubmitted(true);
      toast({
        title: 'Sucesso!',
        description: 'Sua resposta foi enviada com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao enviar formulário',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
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
      error: errors[field.id!],
      disabled: isSubmitting,
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
      return part.split('\n').map((line, lineIndex, array) => (
        <span key={`${index}-${lineIndex}`}>
          {line}
          {lineIndex < array.length - 1 && <br />}
        </span>
      ));
    });
  };

  // Success screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Resposta enviada!
          </h2>
          <p className="text-gray-600 mb-6">
            Obrigado por preencher o formulário. Sua resposta foi registrada com sucesso.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setIsSubmitted(false);
              setValues({});
              setRespondentEmail('');
            }}
          >
            Enviar outra resposta
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        {/* Header */}
        <Card className="mb-4 overflow-hidden">
          <div className="h-2 bg-onda-darkBlue" />
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {title}
            </h1>
            {description && (
              <p className="text-gray-600 whitespace-pre-wrap">
                {renderDescription(description)}
              </p>
            )}
            <p className="text-sm text-red-500 mt-4">
              * Campos obrigatórios
            </p>
          </div>
        </Card>

        {/* Email field (optional) */}
        <Card className="mb-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="respondent-email" className="text-base font-medium">
              Seu e-mail
            </Label>
            <Input
              id="respondent-email"
              type="email"
              value={respondentEmail}
              onChange={(e) => setRespondentEmail(e.target.value)}
              placeholder="exemplo@email.com"
              disabled={isSubmitting}
              className="h-12 text-base"
            />
            <p className="text-sm text-gray-500">
              Opcional. Informe para receber uma cópia da sua resposta.
            </p>
          </div>
        </Card>

        {/* Fields */}
        <div className="space-y-4">
          {fields
            .sort((a, b) => a.order - b.order)
            .map((field) => (
              <Card key={field.id} className="p-6">
                {renderField(field)}
              </Card>
            ))}
        </div>

        {/* Submit button */}
        <div className="mt-6">
          <Button
            type="submit"
            className="bg-onda-darkBlue hover:bg-onda-darkBlue/90 h-12 px-8"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
