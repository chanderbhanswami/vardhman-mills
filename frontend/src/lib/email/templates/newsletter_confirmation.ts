/**
 * Newsletter Confirmation Email Template
 */

import { EmailTemplateContext } from '../email-utils';

export interface NewsletterConfirmationContext extends Partial<EmailTemplateContext> {
  user: { name: string; email: string; firstName?: string; };
  confirmationToken: string;
}

export const newsletterConfirmationTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Newsletter Subscription - {{appName}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #17a2b8 0%, #20c997 100%); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .confirmation-box { background: #d1ecf1; border: 2px solid #bee5eb; border-radius: 10px; padding: 25px; margin: 25px 0; text-align: center; }
        .btn { display: inline-block; padding: 16px 32px; background: #17a2b8; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
        .footer { background: #2c3e50; color: white; padding: 30px; text-align: center; }
        .security-note { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 48px; margin-bottom: 15px;">📧🔐</div>
            <h1>Almost There!</h1>
            <p>Please confirm your newsletter subscription</p>
        </div>
        <div class="content">
            <p>Dear {{user.firstName || user.name}},</p>
            <p>Thank you for subscribing to the Vardhman Mills newsletter! To complete your subscription and start receiving our exclusive textile insights, please confirm your email address.</p>
            
            <div class="confirmation-box">
                <h3 style="color: #0c5460; margin-bottom: 20px;">🎯 One Click to Confirm</h3>
                <p style="margin-bottom: 25px;">Click the button below to confirm your subscription and join thousands of textile enthusiasts:</p>
                <a href="{{appUrl}}/newsletter/confirm/{{confirmationToken}}" class="btn">✅ Confirm Subscription</a>
            </div>
            
            <div class="security-note">
                <h4 style="color: #856404; margin-bottom: 10px;">🔒 Security Note</h4>
                <p style="color: #856404;">This confirmation link will expire in 24 hours. If you didn't subscribe to our newsletter, you can safely ignore this email.</p>
            </div>
            
            <h3 style="margin: 30px 0 15px 0;">📬 What Happens After Confirmation?</h3>
            <ul style="margin-left: 20px; line-height: 1.8;">
                <li>📩 Welcome email with exclusive offers</li>
                <li>🗓️ Weekly newsletter every Tuesday</li>
                <li>🎁 Early access to new collections</li>
                <li>💡 Textile industry insights and trends</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
                <p style="font-size: 14px; color: #666;">
                    Having trouble with the button? Copy and paste this link:<br>
                    <a href="{{appUrl}}/newsletter/confirm/{{confirmationToken}}" style="word-break: break-all; color: #007bff;">{{appUrl}}/newsletter/confirm/{{confirmationToken}}</a>
                </p>
            </div>
        </div>
        <div class="footer">
            <p><strong>{{appName}}</strong></p>
            <p>{{supportEmail}} | &copy; {{year}} {{appName}}</p>
        </div>
    </div>
</body>
</html>
`;

export const generateNewsletterConfirmationEmail = (context: NewsletterConfirmationContext) => ({
  subject: `📧 Please confirm your newsletter subscription - {{appName}}`,
  html: newsletterConfirmationTemplate,
  context: { appName: 'Vardhman Mills', appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', supportEmail: process.env.SUPPORT_EMAIL || 'support@vardhmanmills.com', year: new Date().getFullYear(), ...context },
});

export default { template: newsletterConfirmationTemplate, generate: generateNewsletterConfirmationEmail };