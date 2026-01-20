'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string; // URL da imagem atual
  onChange: (url: string | null) => void;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  label?: string;
  className?: string;
  folder?: string; // Pasta no Firebase Storage
}

const DEFAULT_MAX_SIZE_MB = 5;
const DEFAULT_ACCEPTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png'];

export function ImageUpload({
  value,
  onChange,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  acceptedFormats = DEFAULT_ACCEPTED_FORMATS,
  label = 'Imagem',
  className,
  folder = 'uploads',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar preview com value quando mudar externamente
  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const validateFile = (file: File): string | null => {
    // Validar tipo
    if (!acceptedFormats.includes(file.type)) {
      return 'Formato não suportado. Use apenas JPG ou PNG.';
    }

    // Validar tamanho
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`;
    }

    return null;
  };

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);

    // Validação local
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload para o servidor
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao fazer upload da imagem');
      }

      const data = await response.json();
      onChange(data.url);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer upload da imagem';
      setError(errorMessage);
      setPreview(value || null); // Reverter preview
    } finally {
      setIsUploading(false);
    }
  }, [onChange, folder, value, maxSizeMB, acceptedFormats]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && <label className="text-sm font-medium">{label}</label>}
      
      <div className="flex items-center gap-4">
        {preview ? (
          <div className="relative">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-300">
              {preview.startsWith('data:') || preview.startsWith('blob:') ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized={preview.includes('storage.googleapis.com')}
                />
              )}
            </div>
            {!isUploading && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={handleRemove}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ) : (
          <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            ) : (
              <Upload className="h-6 w-6 text-gray-400" />
            )}
          </div>
        )}

        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            disabled={isUploading}
            className="w-full sm:w-auto"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : preview ? (
              'Alterar imagem'
            ) : (
              'Selecionar imagem'
            )}
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <p className="text-xs text-gray-500">
        Formatos aceitos: JPG, PNG. Tamanho máximo: {maxSizeMB}MB
      </p>
    </div>
  );
}
