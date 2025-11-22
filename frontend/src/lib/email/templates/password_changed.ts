/**
 * Password Changed Email Template
 * Confirmation email sent when user successfully changes their password
 */

import { EmailTemplateContext } from '../email-utils';

export interface PasswordChangedContext extends Partial<EmailTemplateContext> {
  user: {
    name: string;
    email: string;
    firstName?: string;
  };
  security: {
    changedAt: Date;
    ip?: string;
    location?: string;
    device?: string;
  };
}

export const passwordChangedTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Changed - {{appName}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 40px; text-align: center; }
        .content { padding: 40px 30px; }
        .success-box { background: #d4edda; border: 1px solid #c3e6cb; border-left: 4px solid #28a745; padding: 20px; border-radius: 0 8px 8px 0; margin: 20px 0; }
        .security-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .btn { display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .footer { background: #2c3e50; color: white; padding: 30px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 48px; margin-bottom: 15px;">✅</div>
            <h1>Password Updated</h1>
            <p>Your password has been successfully changed</p>
        </div>
        <div class="content">
            <p>Hello {{user.firstName || user.name}},</p>
            <div class="success-box">
                <h3 style="color: #155724; margin-bottom: 10px;">🎉 Password Successfully Updated</h3>
                <p style="color: #155724;">Your {{appName}} account password has been changed successfully. Your account is now more secure.</p>
            </div>
            <div class="security-info">
                <h3 style="color: #2c3e50; margin-bottom: 15px;">🛡️ Change Details</h3>
                <p><strong>Changed:</strong> {{security.changedAt}}</p>
                {{#if security.ip}}<p><strong>IP Address:</strong> {{security.ip}}</p>{{/if}}
                {{#if security.location}}<p><strong>Location:</strong> {{security.location}}</p>{{/if}}
                {{#if security.device}}<p><strong>Device:</strong> {{security.device}}</p>{{/if}}
            </div>
            <div class="warning">
                <h4 style="color: #856404; margin-bottom: 10px;">⚠️ Didn't change your password?</h4>
                <p style="color: #856404;">If you didn't make this change, please contact our support team immediately and secure your account.</p>
            </div>
            <p><strong>What's Next?</strong></p>
            <ul style="margin: 15px 0; padding-left: 20px;">
                <li>You'll need to use your new password for future logins</li>
                <li>Consider enabling two-factor authentication for extra security</li>
                <li>Update your password in any saved browsers or apps</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{appUrl}}/account/security" class="btn">Review Security Settings</a>
                <a href="{{appUrl}}/support" class="btn" style="background: #6c757d;">Contact Support</a>
            </div>
        </div>
        <div class="footer">
            <p><strong>{{appName}} Security Team</strong></p>
            <p>Keeping your account secure</p>
            <p style="font-size: 13px; opacity: 0.7; margin-top: 15px;">{{supportEmail}} | &copy; {{year}} {{appName}}</p>
        </div>
    </div>
</body>
</html>
`;

export const generatePasswordChangedEmail = (context: PasswordChangedContext) => ({
  subject: `✅ Your {{appName}} password has been updated`,
  html: passwordChangedTemplate,
  context: {
    appName: 'Vardhman Mills',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    supportEmail: process.env.SUPPORT_EMAIL || 'security@vardhmanmills.com',
    year: new Date().getFullYear(),
    ...context,
  },
});

export default { template: passwordChangedTemplate, generate: generatePasswordChangedEmail };