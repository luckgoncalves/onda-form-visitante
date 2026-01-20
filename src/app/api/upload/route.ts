import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, validateImageFile } from '@/lib/firebase/storage';

export const dynamic = 'force-dynamic';
export const maxDuration = 30; // 30 segundos para uploads grandes

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo foi enviado' },
        { status: 400 }
      );
    }

    // Validar arquivo
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Converter File para Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Fazer upload para Firebase Storage
    const result = await uploadImage(buffer, file.name, folder);

    return NextResponse.json({
      url: result.url,
      path: result.path,
    });
  } catch (error) {
    console.error('Error in upload API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer upload da imagem';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
