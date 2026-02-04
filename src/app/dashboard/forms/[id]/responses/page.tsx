'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { checkAuth, checkIsAdmin, logout } from '@/app/actions';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Eye, Download, Loader2, Copy, Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import * as XLSX from 'xlsx';
import { FieldOption } from '@/types/form';

interface FormField {
  id: string;
  label: string;
  type: string;
  order: number;
  options?: FieldOption[];
}

interface FormAnswer {
  id: string;
  fieldId: string;
  value: string;
  field: FormField;
}

interface FormResponse {
  id: string;
  respondentEmail: string | null;
  submittedAt: string;
  answers: FormAnswer[];
  respondentUser: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface FormData {
  id: string;
  title: string;
  fields: FormField[];
}

interface ResponsesData {
  form: FormData;
  responses: FormResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Componente auxiliar para valor copiável
const CopyableValue = ({ value }: { value: string }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar abrir modal se estiver na tabela
    if (value === '-') return;
    
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      description: "Copiado para a área de transferência",
      duration: 2000,
    });
  };

  if (!value || value === '-') return <span>{value}</span>;

  return (
    <div className="flex items-center gap-2 group min-w-0">
      <span className="truncate">{value}</span>
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded text-gray-500 shrink-0"
        title="Copiar"
      >
        {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
      </button>
    </div>
  );
};

export default function FormResponsesPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params.id as string;
  const { toast } = useToast();

  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<ResponsesData | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);
  const [isExporting, setIsExporting] = useState(false);

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
      fetchResponses();
    }
    checkAuthentication();
  }, [router, formId]);

  const fetchResponses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/forms/${formId}/responses`);

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
        throw new Error('Erro ao carregar respostas');
      }

      const responseData = await response.json();
      setData(responseData);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as respostas',
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

  const getAnswerValue = (response: FormResponse, fieldId: string): string => {
    const answer = response.answers.find((a) => a.fieldId === fieldId);
    if (!answer) return '-';

    // Helper to format option value
    const formatOptionValue = (value: string, options?: FieldOption[]) => {
      if (options && options.length > 0) {
        const option = options.find((opt) => opt.value === value);
        if (option) return option.label;
      }
      // Fallback: replace underscores with spaces and capitalize
      return value
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    // Handle checkbox (JSON array)
    try {
      const parsed = JSON.parse(answer.value);
      if (Array.isArray(parsed)) {
        return parsed.map((v) => formatOptionValue(v, answer.field.options)).join(', ');
      }
    } catch {
      // Not JSON, continue
    }

    // Handle single value fields (Radio, Select)
    if (['RADIO', 'SELECT'].includes(answer.field.type)) {
      return formatOptionValue(answer.value, answer.field.options);
    }

    return answer.value || '-';
  };

  const handleExportExcel = () => {
    if (!data) return;

    setIsExporting(true);

    try {
      // Prepare data for Excel
      const excelData = data.responses.map((response) => {
        const row: Record<string, string> = {
          'Data de Envio': format(new Date(response.submittedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
          'E-mail do Respondente': response.respondentEmail || '-',
        };

        // Add each field as a column
        data.form.fields
          .sort((a, b) => a.order - b.order)
          .forEach((field) => {
            row[field.label] = getAnswerValue(response, field.id);
          });

        return row;
      });

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Auto-fit columns
      const colWidths = Object.keys(excelData[0] || {}).map((key) => ({
        wch: Math.max(key.length, 15),
      }));
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Respostas');

      // Save file
      const fileName = `respostas_${data.form.title.replace(/[^a-z0-9]/gi, '_')}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast({
        title: 'Sucesso',
        description: 'Arquivo exportado com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível exportar as respostas',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
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

  if (!data) {
    return null;
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
              <h1 className="text-2xl font-bold text-gray-900">Respostas</h1>
              <p className="text-gray-500 mt-1">{data.form.title}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportExcel}
              disabled={isExporting || data.responses.length === 0}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Exportar Excel
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-gray-500">Total de Respostas</p>
            <p className="text-2xl font-bold">{data.pagination.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500">Campos no Formulário</p>
            <p className="text-2xl font-bold">{data.form.fields.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500">Última Resposta</p>
            <p className="text-2xl font-bold">
              {data.responses.length > 0
                ? format(new Date(data.responses[0].submittedAt), "dd/MM/yyyy", { locale: ptBR })
                : '-'}
            </p>
          </Card>
        </div>

        {/* Responses Table */}
        {data.responses.length === 0 ? (
          <Card className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Nenhuma resposta ainda
            </h3>
            <p className="text-gray-500">
              As respostas aparecerão aqui quando o formulário for preenchido
            </p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Data de Envio</TableHead>
                    <TableHead>E-mail</TableHead>
                    {data.form.fields
                      .sort((a, b) => a.order - b.order)
                      .slice(0, 3)
                      .map((field) => (
                        <TableHead key={field.id} className="max-w-[200px]">
                          {field.label}
                        </TableHead>
                      ))}
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.responses.map((response) => (
                    <TableRow key={response.id}>
                      <TableCell className="text-sm text-gray-500">
                        {format(new Date(response.submittedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-sm">
                        <CopyableValue value={response.respondentEmail || response.respondentUser?.email || '-'} />
                      </TableCell>
                      {data.form.fields
                        .sort((a, b) => a.order - b.order)
                        .slice(0, 3)
                        .map((field) => (
                          <TableCell key={field.id} className="max-w-[200px] text-sm">
                            {['EMAIL', 'PHONE'].includes(field.type) ? (
                              <CopyableValue value={getAnswerValue(response, field.id)} />
                            ) : (
                              <span className="truncate block">
                                {getAnswerValue(response, field.id)}
                              </span>
                            )}
                          </TableCell>
                        ))}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedResponse(response)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>

      {/* Response Detail Dialog */}
      <Dialog open={!!selectedResponse} onOpenChange={() => setSelectedResponse(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle>Detalhes da Resposta</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 pt-4">
            {selectedResponse && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Data de Envio</p>
                  <p className="font-medium">
                    {format(new Date(selectedResponse.submittedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">E-mail</p>
                  <div className="font-medium">
                    <CopyableValue value={selectedResponse.respondentEmail || selectedResponse.respondentUser?.email || '-'} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {data.form.fields
                  .sort((a, b) => a.order - b.order)
                  .map((field) => (
                    <div key={field.id} className="border-b pb-4 last:border-0">
                      <p className="text-sm text-gray-500 mb-1">{field.label}</p>
                      <div className="font-medium whitespace-pre-wrap">
                        {['EMAIL', 'PHONE'].includes(field.type) ? (
                          <CopyableValue value={getAnswerValue(selectedResponse, field.id)} />
                        ) : (
                          getAnswerValue(selectedResponse, field.id)
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
