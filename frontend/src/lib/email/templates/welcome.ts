/**
 * Welcome Email Template
 */

import { EmailTemplateContext } from '../email-utils';

export interface WelcomeContext extends Partial<EmailTemplateContext> {
  user: { name: string; email: string; firstName?: string; };
}

export const welcomeTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to {{appName}}!</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 50px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .btn { display: inline-block; padding: 16px 32px; background: #28a745; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px; }
        .footer { background: #2c3e50; color: white; padding: 30px; text-align: center; }
        .feature { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #28a745; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 60px; margin-bottom: 20px;">🎉</div>
            <h1>Welcome to {{appName}}!</h1>
            <p style="font-size: 18px; margin-top: 10px;">Your premium textile journey begins here</p>
        </div>
        <div class="content">
            <h2>Hello {{user.firstName || user.name}}!</h2>
            <p>We're thrilled to welcome you to {{appName}}, your premier destination for high-quality textiles and fabrics.</p>
            
            <div class="feature">
                <h3>🏭 50+ Years of Excellence</h3>
                <p>Experience the finest textiles crafted with decades of expertise and innovation.</p>
            </div>
            
            <div class="feature">
                <h3>🌟 Premium Quality</h3>
                <p>Discover our extensive collection of premium fabrics and textile products.</p>
            </div>
            
            <div class="feature">
                <h3>🚚 Nationwide Delivery</h3>
                <p>Fast and reliable delivery to customers across India.</p>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
                <a href="{{appUrl}}/products" class="btn">Explore Products</a>
                <a href="{{appUrl}}/about" class="btn" style="background: #007bff;">Learn More</a>
            </div>
            
            <p>If you have any questions, our support team is here to help at {{supportEmail}}.</p>
        </div>
        <div class="footer">
            <p><strong>{{appName}}</strong></p>
            <p>Premium Textiles Since 1970</p>
            <p style="font-size: 13px; opacity: 0.7; margin-top: 15px;">{{supportEmail}} | &copy; {{year}} {{appName}}</p>
        </div>
    </div>
</body>
</html>
`;

export const generateWelcomeEmail = (context: WelcomeContext) => ({
  subject: `🎉 Welcome to {{appName}}, ${context.user.firstName || context.user.name}!`,
  html: welcomeTemplate,
  context: { appName: 'Vardhman Mills', appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', supportEmail: process.env.SUPPORT_EMAIL || 'support@vardhmanmills.com', year: new Date().getFullYear(), ...context },
});

export default { template: welcomeTemplate, generate: generateWelcomeEmail };