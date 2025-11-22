/**
 * Reset Password Email Template
 */

import { EmailTemplateContext } from '../email-utils';

export interface ResetPasswordContext extends Partial<EmailTemplateContext> {
  user: { name: string; email: string; firstName?: string; };
  security: { token: string; expiresAt: Date; ip?: string; };
}

export const resetPasswordTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - {{appName}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 40px; text-align: center; }
        .content { padding: 40px 30px; }
        .btn { display: inline-block; padding: 16px 32px; background: #007bff; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; text-align: center; margin: 20px 0; }
        .footer { background: #2c3e50; color: white; padding: 30px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 48px; margin-bottom: 15px;">🔐</div>
            <h1>Reset Your Password</h1>
            <p>Secure password reset for your account</p>
        </div>
        <div class="content">
            <p>Hello {{user.firstName || user.name}},</p>
            <p>We received a request to reset your {{appName}} account password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{appUrl}}/reset-password?token={{security.token}}" class="btn">Reset My Password</a>
            </div>
            <p><strong>Important:</strong> This link expires in 1 hour for security reasons.</p>
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="color: #856404;"><strong>Didn't request this?</strong> If you didn't request a password reset, please ignore this email. Your password won't be changed.</p>
            </div>
            <p>For security, this request came from IP: {{security.ip}}</p>
        </div>
        <div class="footer">
            <p><strong>{{appName}} Security</strong></p>
            <p>{{supportEmail}} | &copy; {{year}} {{appName}}</p>
        </div>
    </div>
</body>
</html>
`;

export const generateResetPasswordEmail = (context: ResetPasswordContext) => ({
  subject: `🔐 Reset your {{appName}} password`,
  html: resetPasswordTemplate,
  context: { appName: 'Vardhman Mills', appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', supportEmail: process.env.SUPPORT_EMAIL || 'support@vardhmanmills.com', year: new Date().getFullYear(), ...context },
});

export default { template: resetPasswordTemplate, generate: generateResetPasswordEmail };