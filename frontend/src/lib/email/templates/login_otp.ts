/**
 * Login OTP Email Template
 * One-time password for secure login verification
 */

import { EmailTemplateContext } from '../email-utils';

export interface LoginOTPContext extends Partial<EmailTemplateContext> {
  user: {
    name: string;
    email: string;
    firstName?: string;
  };
  security: {
    code: string;
    expiresAt: Date;
    ip?: string;
    location?: string;
  };
}

export const loginOTPTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Verification Code - {{appName}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 40px; text-align: center; }
        .content { padding: 40px 30px; }
        .otp-container { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
        .otp-code { background: white; color: #28a745; font-size: 36px; font-weight: 800; padding: 20px; border-radius: 8px; letter-spacing: 6px; font-family: monospace; margin: 15px 0; }
        .footer { background: #2c3e50; color: white; padding: 30px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔑 Login Verification</h1>
            <p>Your one-time password</p>
        </div>
        <div class="content">
            <p>Hello {{user.firstName || user.name}},</p>
            <p>Please use this verification code to complete your login to {{appName}}:</p>
            <div class="otp-container">
                <p style="color: white; font-weight: 600; margin-bottom: 15px;">YOUR LOGIN CODE</p>
                <div class="otp-code">{{security.code}}</div>
                <p style="color: white; font-size: 14px; margin-top: 15px;">⏱️ Expires in 5 minutes</p>
            </div>
            {{#if security.ip}}
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-bottom: 10px;">🛡️ Login Details</h3>
                <p><strong>IP:</strong> {{security.ip}}</p>
                {{#if security.location}}<p><strong>Location:</strong> {{security.location}}</p>{{/if}}
                <p><strong>Time:</strong> {{security.expiresAt}}</p>
            </div>
            {{/if}}
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="color: #856404;"><strong>Security Notice:</strong> Never share this code with anyone. {{appName}} will never ask for your verification code.</p>
            </div>
        </div>
        <div class="footer">
            <p><strong>{{appName}}</strong></p>
            <p>Secure login verification</p>
            <p style="font-size: 13px; opacity: 0.7; margin-top: 15px;">{{supportEmail}} | &copy; {{year}} {{appName}}</p>
        </div>
    </div>
</body>
</html>
`;

export const generateLoginOTPEmail = (context: LoginOTPContext) => ({
  subject: `🔑 Your {{appName}} login code: ${context.security.code}`,
  html: loginOTPTemplate,
  context: {
    appName: 'Vardhman Mills',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    supportEmail: process.env.SUPPORT_EMAIL || 'support@vardhmanmills.com',
    year: new Date().getFullYear(),
    ...context,
  },
});

export default { template: loginOTPTemplate, generate: generateLoginOTPEmail };