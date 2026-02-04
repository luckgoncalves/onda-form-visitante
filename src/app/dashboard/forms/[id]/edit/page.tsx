'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { checkAuth, checkIsAdmin, logout } from '@/app/actions';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormBuilder } from '@/components/forms/form-builder';
import { FormPreview } from '@/components/forms/form-preview';
import { EmailVariablesList } from '@/components/forms/email-variables-list';
import { FormFieldConfig, FormStatus, FormVisibility } from '@/types/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Eye, Loader2, Link2, Copy, ExternalLink, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditFormPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params.id as string;
  const { toast } = useToast();

  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('fields');

  // Form data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<FormStatus>('DRAFT');
  const [visibility, setVisibility] = useState<FormVisibility>('PUBLIC');
  const [requireAuth, setRequireAuth] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [fields, setFields] = useState<FormFieldConfig[]>([]);
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [privateToken, setPrivateToken] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuthentication() {
      const { isAuthenticated, user } = await checkAuth();
      const { isAdmin } = await checkIsAdmin();

      if (!isAuthenticated || !user) {
        router.push('/');
        return;
      }

      if (!isAdmin) {
        router.push('/list');
        return;
      }

      setUserName(user.name);
      setUserId(user.id);
      fetchForm();
    }
    checkAuthentication();
  }, [router, formId]);

  const fetchForm = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/forms/${formId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: 'Erro',
            description: 'Formulário não encontrado',
            variant: 'destructive',
          });
          router.push('/dashboard/forms');
          return;
        }
        throw new Error('Erro ao carregar formulário');
      }

      const form = await response.json();
      
      setTitle(form.title);
      setDescription(form.description || '');
      setStatus(form.status);
      setVisibility(form.visibility);
      setRequireAuth(form.requireAuth);
      setEmailEnabled(form.emailEnabled);
      setEmailSubject(form.emailSubject || '');
      setEmailBody(form.emailBody || '');
      setExpiresAt(form.expiresAt ? new Date(form.expiresAt) : null);
      setPublicToken(form.publicToken);
      setPrivateToken(form.privateToken);
      setFields(
        form.fields.map((f: any) => ({
          id: f.id,
          label: f.label,
          type: f.type,
          required: f.required,
          placeholder: f.placeholder,
          helpText: f.helpText,
          options: f.options,
          order: f.order,
        }))
      );
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o formulário',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleSave = async (newStatus?: FormStatus) => {
    if (!title.trim()) {
      toast({
        title: 'Erro',
        description: 'O título do formulário é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    if (fields.length === 0) {
      toast({
        title: 'Erro',
        description: 'Adicione pelo menos um campo ao formulário',
        variant: 'destructive',
      });
      return;
    }

    if (emailEnabled && !emailSubject.trim()) {
      toast({
        title: 'Erro',
        description: 'O assunto do e-mail é obrigatório quando o e-mail está habilitado',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);

      const formData: any = {
        title,
        description: description || null,
        status: newStatus || status,
        visibility,
        requireAuth,
        emailEnabled,
        emailSubject: emailEnabled ? (emailSubject || null) : null,
        emailBody: emailEnabled ? (emailBody || null) : null,
        expiresAt: expiresAt ? expiresAt.toISOString() : null,
        fields: fields.map((field, index) => ({
          ...field,
          order: index,
        })),
      };

      const response = await fetch(`/api/forms/${formId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar formulário');
      }

      if (newStatus) {
        setStatus(newStatus);
      }

      toast({
        title: 'Sucesso',
        description: 'Formulário salvo com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao salvar formulário',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    await handleSave('PUBLISHED');
  };

  const handleCopyLink = (token: string) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/f/${token}`;
    
    navigator.clipboard.writeText(link).then(() => {
      toast({
        title: 'Link copiado!',
        description: 'O link do formulário foi copiado para a área de transferência',
      });
    });
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-700">Rascunho</Badge>;
      case 'PUBLISHED':
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Publicado</Badge>;
      case 'CLOSED':
        return <Badge variant="secondary" className="bg-red-100 text-red-700">Fechado</Badge>;
    }
  };

  if (isLoading) {
    return (
      <>
        <Header userId={userId} userName={userName} onLogout={handleLogout} />
        <div className="p-4 sm:p-6 mt-[72px]">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header userId={userId} userName={userName} onLogout={handleLogout} />

      <div className="p-4 sm:p-6 mt-[72px]">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/forms')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Editar Formulário</h1>
                {getStatusBadge()}
              </div>
              <p className="text-gray-500 mt-1">{title || 'Sem título'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleSave()}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar
            </Button>
            {status !== 'PUBLISHED' && (
              <Button
                onClick={handlePublish}
                disabled={isSaving}
                className="bg-onda-darkBlue hover:bg-onda-darkBlue/90"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Publicar
              </Button>
            )}
          </div>
        </div>

        {/* Share Links (when published) */}
        {status === 'PUBLISHED' && publicToken && (
          <Card className="p-4 mb-6 bg-green-50 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Formulário Publicado</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={`${window.location.origin}/f/${publicToken}`}
                readOnly
                className="bg-white"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyLink(publicToken)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/f/${publicToken}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="fields">Campos</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
            <TabsTrigger value="email">E-mail</TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>

          {/* Fields Tab */}
          <TabsContent value="fields">
            <div className="mb-6">
              <Card className="p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título do Formulário *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Formulário de Inscrição"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="description">
                      Descrição{' '}
                      <span className="text-gray-400 text-sm">(aceita links)</span>
                    </Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descreva o propósito do formulário. URLs serão automaticamente convertidas em links clicáveis."
                      rows={3}
                    />
                  </div>
                </div>
              </Card>
            </div>

            <FormBuilder fields={fields} onFieldsChange={setFields} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="p-6 max-w-2xl">
              <h3 className="text-lg font-semibold mb-4">Configurações do Formulário</h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibilidade</Label>
                  <Select
                    value={visibility}
                    onValueChange={(value) => setVisibility(value as FormVisibility)}
                  >
                    <SelectTrigger id="visibility">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLIC">
                        Público - Qualquer pessoa com o link pode acessar
                      </SelectItem>
                      <SelectItem value="PRIVATE">
                        Privado - Acesso restrito por token
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {visibility === 'PRIVATE' && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label htmlFor="requireAuth" className="font-medium">
                        Exigir autenticação
                      </Label>
                      <p className="text-sm text-gray-500">
                        Usuários precisam estar logados para acessar
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      id="requireAuth"
                      checked={requireAuth}
                      onChange={(e) => setRequireAuth(e.target.checked)}
                      className="h-5 w-5"
                    />
                  </div>
                )}

                {visibility === 'PRIVATE' && privateToken && (
                  <div className="space-y-2">
                    <Label>Link Privado</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={`${window.location.origin}/f/${privateToken}`}
                        readOnly
                        className="bg-gray-50"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(privateToken)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Data de Expiração</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="expiresAt"
                      type="datetime-local"
                      value={expiresAt ? new Date(expiresAt.getTime() - expiresAt.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExpiresAt(val ? new Date(val) : null);
                      }}
                      className="w-full"
                    />
                    {expiresAt && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setExpiresAt(null)}
                        title="Limpar data"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Opcional. O formulário deixará de aceitar respostas após esta data e hora.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email">
            <Card className="p-6 max-w-2xl">
              <h3 className="text-lg font-semibold mb-4">E-mail de Confirmação</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="emailEnabled" className="font-medium">
                      Enviar e-mail de confirmação
                    </Label>
                    <p className="text-sm text-gray-500">
                      Envia um e-mail automático quando o formulário é preenchido
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="emailEnabled"
                    checked={emailEnabled}
                    onChange={(e) => setEmailEnabled(e.target.checked)}
                    className="h-5 w-5"
                  />
                </div>

                {emailEnabled && (
                  <>
                    <EmailVariablesList fields={fields} />
                    
                    <div className="space-y-2">
                      <Label htmlFor="emailSubject">Assunto do E-mail *</Label>
                      <Input
                        id="emailSubject"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Ex: Confirmação de inscrição - {{nome}}"
                      />
                      <p className="text-xs text-gray-500">
                        Use {"{{campo}}"} para incluir respostas no assunto
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emailBody">Corpo do E-mail</Label>
                      <Textarea
                        id="emailBody"
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        placeholder={`Olá {{nome}},\n\nObrigado por preencher o formulário!\n\nSua inscrição foi recebida com sucesso.\n\nAtenciosamente,\nEquipe Onda Dura`}
                        rows={8}
                      />
                      <p className="text-xs text-gray-500">
                        Use {"{{campo}}"} para incluir respostas no corpo do e-mail.
                        Os nomes dos campos são normalizados (sem acentos, minúsculos, espaços viram _).
                      </p>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview">
            <FormPreview
              title={title}
              description={description}
              fields={fields}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
