import { adminStorage } from './config';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Valida o arquivo antes do upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Validar tipo MIME
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato de arquivo não suportado. Use apenas JPG ou PNG.',
    };
  }

  // Validar tamanho
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${MAX_FILE_SIZE_MB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Faz upload de uma imagem para o Firebase Storage
 */
export async function uploadImage(
  file: Buffer,
  fileName: string,
  folder: string = 'uploads'
): Promise<UploadResult> {
  try {
    const bucket = adminStorage.bucket();
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    // Detectar tipo MIME baseado na extensão do arquivo
    const extension = fileName.split('.').pop()?.toLowerCase();
    let contentType = 'image/jpeg';
    if (extension === 'png') {
      contentType = 'image/png';
    } else if (extension === 'jpg' || extension === 'jpeg') {
      contentType = 'image/jpeg';
    }
    
    const filePath = `${folder}/${timestamp}_${sanitizedFileName}`;
    const fileRef = bucket.file(filePath);

    // Upload do arquivo
    await fileRef.save(file, {
      metadata: {
        contentType,
      },
    });

    // Tornar o arquivo público
    await fileRef.makePublic();

    // Obter URL pública
    const url = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    return {
      url,
      path: filePath,
    };
  } catch (error) {
    console.error('Error uploading image to Firebase Storage:', error);
    throw new Error('Falha ao fazer upload da imagem');
  }
}

/**
 * Deleta uma imagem do Firebase Storage
 */
export async function deleteImage(url: string): Promise<void> {
  try {
    const bucket = adminStorage.bucket();
    
    // Extrair o path da URL
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/([^?]+)/);
    
    if (!pathMatch) {
      throw new Error('URL inválida');
    }

    const filePath = decodeURIComponent(pathMatch[1]);
    const fileRef = bucket.file(filePath);

    // Verificar se o arquivo existe antes de deletar
    const [exists] = await fileRef.exists();
    if (exists) {
      await fileRef.delete();
    }
  } catch (error) {
    console.error('Error deleting image from Firebase Storage:', error);
    throw new Error('Falha ao deletar a imagem');
  }
}
