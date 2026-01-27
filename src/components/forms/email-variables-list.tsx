'use client';

import { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getAvailableTemplateVariables } from '@/lib/email/resend';
import { FormFieldConfig } from '@/types/form';
import { useToast } from '@/hooks/use-toast';

interface EmailVariablesListProps {
  fields: FormFieldConfig[];
}

export function EmailVariablesList({ fields }: EmailVariablesListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { toast } = useToast();

  const variables = getAvailableTemplateVariables(fields);

  const handleCopy = (key: string) => {
    const variableText = `{{${key}}}`;
    navigator.clipboard.writeText(variableText).then(() => {
      setCopiedKey(key);
      toast({
        title: 'Variável copiada!',
        description: `${variableText} copiado para a área de transferência`,
      });
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  if (fields.length === 0) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          Adicione campos ao formulário para gerar variáveis disponíveis.
        </p>
      </div>
    );
  }

  return (
    <Card className="p-4 border-2 border-blue-200 bg-blue-50/50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div>
          <h4 className="font-semibold text-gray-900">
            Variáveis Disponíveis
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            Clique em uma variável para copiar. Use no formato {'{{variável}}'}
          </p>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
          {variables.map((variable) => (
            <div
              key={variable.key}
              className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 hover:border-blue-300 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {'{{'}{variable.key}{'}}'}
                  </code>
                  <span className="text-xs text-gray-500 truncate">
                    {variable.label}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 italic">
                  Exemplo: {variable.example}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(variable.key)}
                className="ml-2 h-8 w-8 p-0 flex-shrink-0"
              >
                {copiedKey === variable.key ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
