/**
 * Email Verification Template
 */

import { EmailTemplateContext } from '../email-utils';

export interface VerificationContext extends Partial<EmailTemplateContext> {
  user: { name: string; email: string; firstName?: string; };
  verification: { token: string; expiresAt: Date; };
}

export const verificationTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - {{appName}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); color: white; padding: 40px; text-align: center; }
        .content { padding: 40px 30px; }
        .btn { display: inline-block; padding: 16px 32px; background: #17a2b8; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
        .footer { background: #2c3e50; color: white; padding: 30px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 48px; margin-bottom: 15px;">📧</div>
            <h1>Verify Your Email</h1>
            <p>Complete your {{appName}} registration</p>
        </div>
        <div class="content">
            <p>Hello {{user.firstName || user.name}},</p>
            <p>Thank you for registering with {{appName}}! Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{appUrl}}/verify-email?token={{verification.token}}" class="btn">Verify My Email</a>
            </div>
            <p>This verification link will expire in 24 hours for security purposes.</p>
            <p>If you didn't create this account, please ignore this email.</p>
        </div>
        <div class="footer">
            <p><strong>{{appName}}</strong></p>
            <p>{{supportEmail}} | &copy; {{year}} {{appName}}</p>
        </div>
    </div>
</body>
</html>
`;

export const generateVerificationEmail = (context: VerificationContext) => ({
  subject: `📧 Verify your {{appName}} email address`,
  html: verificationTemplate,
  context: { appName: 'Vardhman Mills', appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', supportEmail: process.env.SUPPORT_EMAIL || 'support@vardhmanmills.com', year: new Date().getFullYear(), ...context },
});

export default { template: verificationTemplate, generate: generateVerificationEmail };