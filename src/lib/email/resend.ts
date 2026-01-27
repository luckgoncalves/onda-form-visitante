import { Resend } from 'resend';

// Initialize Resend client only if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  fromName?: string;
}

// Template variables that can be used in email body
export interface EmailTemplateVariables {
  [key: string]: string;
}

/**
 * Replace template variables in email body
 * Variables are in format {{variableName}}
 */
export function replaceTemplateVariables(
  template: string,
  variables: EmailTemplateVariables
): string {
  let result = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
    result = result.replace(regex, value);
  }
  
  return result;
}

/**
 * Send confirmation email to form respondent
 */
export async function sendFormConfirmationEmail({
  to,
  subject,
  body,
  fromName = 'Onda Dura',
}: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  // Skip if Resend is not configured
  if (!resend) {
    console.warn('Resend API key not configured. Skipping email send.');
    return { success: true }; // Return success to not block form submission
  }

  try {
    // Use Resend's default domain or your verified domain
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    
    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject: subject,
      html: formatEmailBody(body),
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log('Email sent successfully:', data?.id);
    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao enviar e-mail' 
    };
  }
}

/**
 * Format email body with basic HTML styling
 */
function formatEmailBody(body: string): string {
  // Convert line breaks to <br> tags
  const formattedBody = body.replace(/\n/g, '<br>');
  
  // Convert URLs to clickable links
  const urlRegex = /(https?:\/\/[^\s<]+)/g;
  const withLinks = formattedBody.replace(urlRegex, '<a href="$1" style="color: #06234f;">$1</a>');
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #e5e5e5;">
                    <img src="${process.env.NEXT_PUBLIC_APP_URL || 'https://app.ondaduracuritiba.com.br'}/onda.png" alt="Onda Dura" style="max-width: 150px; height: auto;">
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 32px; color: #333333; font-size: 16px; line-height: 1.6;">
                    ${withLinks}
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 32px; text-align: center; border-top: 1px solid #e5e5e5; color: #666666; font-size: 14px;">
                    <p style="margin: 0;">Este é um e-mail automático enviado pela Onda Dura.</p>
                    <p style="margin: 8px 0 0;">© ${new Date().getFullYear()} Onda Dura. Todos os direitos reservados.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

/**
 * Normalize field label to variable key
 */
export function normalizeFieldLabelToVariable(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

/**
 * Get available template variables based on form fields
 */
export function getAvailableTemplateVariables(fields: { label: string }[]): Array<{ key: string; label: string; example: string }> {
  const variables: Array<{ key: string; label: string; example: string }> = [];
  
  // Add email variable
  variables.push({
    key: 'email',
    label: 'E-mail do respondente',
    example: 'usuario@email.com'
  });
  
  // Add variables from each field
  for (const field of fields) {
    const key = normalizeFieldLabelToVariable(field.label);
    variables.push({
      key,
      label: field.label,
      example: `Valor de "${field.label}"`
    });
  }
  
  return variables;
}

/**
 * Build template variables from form answers
 */
export function buildTemplateVariables(
  answers: { fieldLabel: string; value: string }[],
  respondentEmail?: string
): EmailTemplateVariables {
  const variables: EmailTemplateVariables = {};
  
  // Add respondent email
  if (respondentEmail) {
    variables['email'] = respondentEmail;
  }
  
  // Add each answer as a variable (using field label as key)
  for (const answer of answers) {
    const key = normalizeFieldLabelToVariable(answer.fieldLabel);
    variables[key] = answer.value;
  }
  
  return variables;
}
