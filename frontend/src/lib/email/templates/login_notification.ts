/**
 * Login Notification Email Template
 * Security notification sent when user logs into their account
 */

import { EmailTemplateContext } from '../email-utils';

export interface LoginNotificationContext extends Partial<EmailTemplateContext> {
  user: {
    name: string;
    email: string;
    firstName?: string;
  };
  security: {
    ip: string;
    location?: string;
    device?: string;
    browser?: string;
    loginAt: Date;
    isNewDevice?: boolean;
    isNewLocation?: boolean;
  };
}

export const loginNotificationTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Notification - {{appName}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .login-info { background: #e1f5fe; border-left: 4px solid #17a2b8; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
        .btn { display: inline-block; padding: 12px 24px; background: #17a2b8; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; }
        .footer { background: #2c3e50; color: white; padding: 20px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Login Notification</h1>
            <p>Someone just logged into your account</p>
        </div>
        <div class="content">
            <p>Hello {{user.firstName || user.name}},</p>
            <p>We noticed a login to your {{appName}} account. Here are the details:</p>
            <div class="login-info">
                <h3>Login Details</h3>
                <p><strong>Time:</strong> {{security.loginAt}}</p>
                <p><strong>IP Address:</strong> {{security.ip}}</p>
                {{#if security.location}}<p><strong>Location:</strong> {{security.location}}</p>{{/if}}
                {{#if security.device}}<p><strong>Device:</strong> {{security.device}}</p>{{/if}}
                {{#if security.browser}}<p><strong>Browser:</strong> {{security.browser}}</p>{{/if}}
            </div>
            {{#if security.isNewDevice}}
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h4 style="color: #856404;">⚠️ New Device Detected</h4>
                <p style="color: #856404;">This login was from a device we haven't seen before.</p>
            </div>
            {{/if}}
            <p>If this was you, no action is needed. If you don't recognize this activity, please secure your account immediately.</p>
            <a href="{{appUrl}}/account/security" class="btn">Review Security Settings</a>
        </div>
        <div class="footer">
            <p>{{appName}} Security Team</p>
            <p>Contact: {{supportEmail}}</p>
        </div>
    </div>
</body>
</html>
`;

export const generateLoginNotificationEmail = (context: LoginNotificationContext) => ({
  subject: `🔐 New login to your {{appName}} account`,
  html: loginNotificationTemplate,
  context: {
    appName: 'Vardhman Mills',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    supportEmail: process.env.SUPPORT_EMAIL || 'security@vardhmanmills.com',
    year: new Date().getFullYear(),
    ...context,
  },
});

export default { template: loginNotificationTemplate, generate: generateLoginNotificationEmail };