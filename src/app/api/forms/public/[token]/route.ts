import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { formSubmissionSchema, createFormSubmissionValidator } from '@/lib/validations/form';
import { checkAuth } from '@/app/actions';
import {
  sendFormConfirmationEmail,
  replaceTemplateVariables,
  buildTemplateVariables,
} from '@/lib/email/resend';

interface RouteParams {
  params: Promise<{ token: string }>;
}

// GET /api/forms/public/[token] - Get public form by token
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;
    const searchParams = request.nextUrl.searchParams;
    const authRequired = searchParams.get('auth') === 'true';

    // Find form by public or private token
    const form = await prisma.form.findFirst({
      where: {
        OR: [
          { publicToken: token },
          { privateToken: token },
        ],
        status: 'PUBLISHED',
      },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!form) {
      return NextResponse.json(
        { error: 'Formulário não encontrado ou não está publicado' },
        { status: 404 }
      );
    }

    // Check expiration
    if (form.expiresAt && new Date() > new Date(form.expiresAt)) {
      return NextResponse.json(
        { error: 'Este formulário expirou e não aceita mais respostas.' },
        { status: 410 }
      );
    }

    // Check if auth is required
    const isPrivateToken = form.privateToken === token;
    
    if ((form.requireAuth || authRequired) && isPrivateToken) {
      const { isAuthenticated, user } = await checkAuth();
      
      if (!isAuthenticated || !user) {
        return NextResponse.json(
          { error: 'Autenticação necessária', requireAuth: true },
          { status: 401 }
        );
      }
    }

    // Return form without sensitive data
    return NextResponse.json({
      id: form.id,
      title: form.title,
      description: form.description,
      fields: form.fields.map((field) => ({
        id: field.id,
        label: field.label,
        type: field.type,
        required: field.required,
        placeholder: field.placeholder,
        helpText: field.helpText,
        options: field.options,
        order: field.order,
      })),
    });
  } catch (error) {
    console.error('Error fetching public form:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar formulário' },
      { status: 500 }
    );
  }
}

// POST /api/forms/public/[token] - Submit form response
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;

    // Find form by public or private token
    const form = await prisma.form.findFirst({
      where: {
        OR: [
          { publicToken: token },
          { privateToken: token },
        ],
        status: 'PUBLISHED',
      },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!form) {
      return NextResponse.json(
        { error: 'Formulário não encontrado ou não está publicado' },
        { status: 404 }
      );
    }

    // Check expiration
    if (form.expiresAt && new Date() > new Date(form.expiresAt)) {
      return NextResponse.json(
        { error: 'Este formulário expirou e não aceita mais respostas.' },
        { status: 410 }
      );
    }

    // Check if auth is required for private token
    const isPrivateToken = form.privateToken === token;
    let respondentUserId: string | undefined;

    if (form.requireAuth && isPrivateToken) {
      const { isAuthenticated, user } = await checkAuth();
      
      if (!isAuthenticated || !user) {
        return NextResponse.json(
          { error: 'Autenticação necessária', requireAuth: true },
          { status: 401 }
        );
      }
      
      respondentUserId = user.id;
    }

    const body = await request.json();

    // Basic validation
    const basicValidation = formSubmissionSchema.safeParse(body);
    if (!basicValidation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: basicValidation.error.flatten() },
        { status: 400 }
      );
    }

    // Dynamic validation based on form fields
    const dynamicValidator = createFormSubmissionValidator(
      form.fields.map((f) => ({
        id: f.id,
        label: f.label,
        required: f.required,
        type: f.type,
      }))
    );

    const dynamicValidation = dynamicValidator.safeParse(body);
    if (!dynamicValidation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: dynamicValidation.error.flatten() },
        { status: 400 }
      );
    }

    const { answers, respondentEmail } = dynamicValidation.data;

    // Create response with answers in a transaction
    const response = await prisma.formResponse.create({
      data: {
        formId: form.id,
        respondentEmail: respondentEmail || null,
        respondentUserId: respondentUserId || null,
        answers: {
          create: answers.map((answer) => ({
            fieldId: answer.fieldId,
            value: answer.value,
          })),
        },
      },
      include: {
        answers: {
          include: {
            field: true,
          },
        },
      },
    });

    // Send confirmation email if enabled
    if (form.emailEnabled && respondentEmail && form.emailSubject) {
      const templateVariables = buildTemplateVariables(
        response.answers.map((a) => ({
          fieldLabel: a.field.label,
          value: a.value,
        })),
        respondentEmail
      );

      const emailBody = form.emailBody
        ? replaceTemplateVariables(form.emailBody, templateVariables)
        : `Obrigado por preencher o formulário "${form.title}"!`;

      const emailSubject = replaceTemplateVariables(form.emailSubject, templateVariables);

      // Send email asynchronously (don't wait for it)
      sendFormConfirmationEmail({
        to: respondentEmail,
        subject: emailSubject,
        body: emailBody,
      }).catch((err) => {
        console.error('Failed to send confirmation email:', err);
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Resposta enviada com sucesso!',
      responseId: response.id,
    });
  } catch (error) {
    console.error('Error submitting form response:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar resposta' },
      { status: 500 }
    );
  }
}
