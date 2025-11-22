/**
 * Newsletter Welcome Email Template
 */

import { EmailTemplateContext } from '../email-utils';

export interface NewsletterWelcomeContext extends Partial<EmailTemplateContext> {
  user: { name: string; email: string; firstName?: string; };
  preferences?: string[];
}

export const newsletterWelcomeTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Our Newsletter - {{appName}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #e91e63 0%, #f06292 100%); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .benefit { display: flex; align-items: center; margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; }
        .benefit-icon { font-size: 24px; margin-right: 15px; }
        .btn { display: inline-block; padding: 14px 28px; background: #e91e63; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px; }
        .footer { background: #2c3e50; color: white; padding: 30px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 48px; margin-bottom: 15px;">📧✨</div>
            <h1>Welcome to Our Newsletter!</h1>
            <p>You're now part of the Vardhman Mills family</p>
        </div>
        <div class="content">
            <p>Dear {{user.firstName || user.name}},</p>
            <p>Thank you for subscribing to our newsletter! Get ready to discover the finest textiles, exclusive offers, and industry insights delivered straight to your inbox.</p>
            
            <h3 style="margin: 30px 0 20px 0;">🎁 What You'll Receive:</h3>
            
            <div class="benefit">
                <div class="benefit-icon">🏷️</div>
                <div>
                    <h4>Exclusive Offers</h4>
                    <p>Be the first to know about special discounts and promotions</p>
                </div>
            </div>
            
            <div class="benefit">
                <div class="benefit-icon">🧵</div>
                <div>
                    <h4>New Product Launches</h4>
                    <p>Get early access to our latest textile collections</p>
                </div>
            </div>
            
            <div class="benefit">
                <div class="benefit-icon">📈</div>
                <div>
                    <h4>Industry Insights</h4>
                    <p>Stay updated with textile industry trends and tips</p>
                </div>
            </div>
            
            <div class="benefit">
                <div class="benefit-icon">🎨</div>
                <div>
                    <h4>Design Inspiration</h4>
                    <p>Creative ideas and styling tips for your projects</p>
                </div>
            </div>
            
            {{#if preferences}}
            <h4 style="margin: 20px 0 10px 0;">Your Preferences:</h4>
            <ul style="margin-left: 20px;">
                {{#each preferences}}
                <li>{{this}}</li>
                {{/each}}
            </ul>
            {{/if}}
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{appUrl}}/products" class="btn">🛍️ Start Shopping</a>
                <a href="{{appUrl}}/newsletter/preferences" class="btn" style="background: #007bff;">⚙️ Manage Preferences</a>
            </div>
            
            <div style="background: #e1f5fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #0277bd; font-size: 14px; text-align: center;">
                    📅 <strong>Weekly Newsletter:</strong> Every Tuesday at 9 AM<br>
                    🎯 <strong>Special Offers:</strong> As they become available
                </p>
            </div>
        </div>
        <div class="footer">
            <p><strong>{{appName}}</strong></p>
            <p>{{supportEmail}} | <a href="{{appUrl}}/newsletter/unsubscribe" style="color: #adb5bd;">Unsubscribe</a></p>
            <p>&copy; {{year}} {{appName}}</p>
        </div>
    </div>
</body>
</html>
`;

export const generateNewsletterWelcomeEmail = (context: NewsletterWelcomeContext) => ({
  subject: `📧 Welcome to Vardhman Mills Newsletter! Exclusive textile insights await`,
  html: newsletterWelcomeTemplate,
  context: { appName: 'Vardhman Mills', appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', supportEmail: process.env.SUPPORT_EMAIL || 'support@vardhmanmills.com', year: new Date().getFullYear(), ...context },
});

export default { template: newsletterWelcomeTemplate, generate: generateNewsletterWelcomeEmail };