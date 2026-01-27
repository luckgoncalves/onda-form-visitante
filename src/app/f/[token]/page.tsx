'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { FormPublicRender } from '@/components/forms/form-public-render';
import { FormFieldConfig } from '@/types/form';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Lock } from 'lucide-react';
import Link from 'next/link';

interface FormData {
  id: string;
  title: string;
  description?: string;
  fields: FormFieldConfig[];
}

export default function PublicFormPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const token = params.token as string;
  const authRequired = searchParams.get('auth') === 'true';

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requireAuth, setRequireAuth] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);

  useEffect(() => {
    fetchForm();
  }, [token]);

  const fetchForm = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const url = authRequired
        ? `/api/forms/public/${token}?auth=true`
        : `/api/forms/public/${token}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 && data.requireAuth) {
          setRequireAuth(true);
          return;
        }
        throw new Error(data.error || 'Erro ao carregar formulário');
      }

      setFormData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar formulário');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-onda-darkBlue mx-auto mb-4" />
          <p className="text-gray-500">Carregando formulário...</p>
        </div>
      </div>
    );
  }

  // Auth required state
  if (requireAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
              <Lock className="h-8 w-8 text-amber-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-600 mb-6">
            Este formulário requer autenticação. Por favor, faça login para continuar.
          </p>
          <Link href="/">
            <Button className="bg-onda-darkBlue hover:bg-onda-darkBlue/90">
              Fazer Login
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Formulário não disponível
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/">
            <Button variant="outline">Voltar ao início</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Form not found
  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Formulário não encontrado
          </h2>
          <p className="text-gray-600 mb-6">
            O formulário que você está procurando não existe ou foi removido.
          </p>
          <Link href="/">
            <Button variant="outline">Voltar ao início</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Render form
  return (
    <FormPublicRender
      formId={formData.id}
      title={formData.title}
      description={formData.description}
      fields={formData.fields}
      token={token}
    />
  );
}
