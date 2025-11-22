/**
 * New Product Launch Email Template
 */

import { EmailTemplateContext } from '../email-utils';

export interface NewLaunchContext extends Partial<EmailTemplateContext> {
  user: { name: string; email: string; firstName?: string; };
  product: { 
    name: string; description: string; price: number; currency: string; 
    images: string[]; category: string; features: string[]; 
    launchDate: string; earlyBirdDiscount?: number;
  };
}

export const newLaunchTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚀 New Launch: {{product.name}} - {{appName}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa; }
        .container { max-width: 650px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .product-image { width: 100%; max-width: 400px; height: 300px; object-fit: cover; border-radius: 12px; margin: 20px auto; display: block; }
        .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 20px 0; }
        .feature { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #ff6b35; }
        .price-box { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0; }
        .btn { display: inline-block; padding: 16px 32px; background: #ff6b35; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 10px; }
        .countdown { background: #343a40; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .footer { background: #2c3e50; color: white; padding: 30px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 48px; margin-bottom: 15px;">🚀✨</div>
            <h1>New Launch Alert!</h1>
            <p>Introducing {{product.name}}</p>
        </div>
        <div class="content">
            <p>Dear {{user.firstName || user.name}},</p>
            <p>We're thrilled to unveil our latest creation - a premium textile that represents the pinnacle of craftsmanship and innovation!</p>
            
            {{#if product.images.0}}
            <img src="{{product.images.0}}" alt="{{product.name}}" class="product-image" />
            {{/if}}
            
            <h2 style="color: #ff6b35; margin: 30px 0 15px 0; text-align: center;">{{product.name}}</h2>
            <p style="text-align: center; font-size: 16px; color: #666; margin-bottom: 25px;">{{product.description}}</p>
            
            {{#if product.features}}
            <h3 style="margin: 30px 0 20px 0;">🌟 Key Features:</h3>
            <div class="feature-grid">
                {{#each product.features}}
                <div class="feature">
                    <p><strong>✓</strong> {{this}}</p>
                </div>
                {{/each}}
            </div>
            {{/if}}
            
            <div class="price-box">
                {{#if product.earlyBirdDiscount}}
                <h3 style="margin-bottom: 15px;">🎉 Early Bird Special!</h3>
                <div style="font-size: 18px; text-decoration: line-through; opacity: 0.8;">{{product.currency}}{{product.price}}</div>
                <div style="font-size: 32px; font-weight: bold; margin: 10px 0;">{{product.currency}}{{math product.price '-' product.earlyBirdDiscount}}</div>
                <p>Save {{product.currency}}{{product.earlyBirdDiscount}} - Limited Time Only!</p>
                {{else}}
                <h3 style="margin-bottom: 15px;">💎 Premium Quality</h3>
                <div style="font-size: 32px; font-weight: bold;">{{product.currency}}{{product.price}}</div>
                <p>Exceptional value for superior craftsmanship</p>
                {{/if}}
            </div>
            
            <div class="countdown">
                <h4 style="margin-bottom: 10px;">⏰ Launch Date</h4>
                <div style="font-size: 24px; font-weight: bold;">{{product.launchDate}}</div>
                {{#if product.earlyBirdDiscount}}
                <p style="margin-top: 10px; font-size: 14px;">Early bird pricing ends 48 hours after launch!</p>
                {{/if}}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{appUrl}}/products/{{product.name}}" class="btn" style="font-size: 18px; padding: 18px 36px;">🛍️ Shop Now</a>
                <a href="{{appUrl}}/products/category/{{product.category}}" class="btn" style="background: #007bff;">View Collection</a>
            </div>
            
            <div style="background: #e3f2fd; padding: 25px; border-radius: 12px; margin: 30px 0;">
                <h4 style="color: #1976d2; margin-bottom: 15px;">🎁 Launch Week Exclusive Benefits</h4>
                <ul style="margin-left: 20px; line-height: 1.8; color: #1976d2;">
                    <li>Free premium shipping (worth $25)</li>
                    <li>Extended 60-day return policy</li>
                    <li>Complimentary care instructions guide</li>
                    <li>Priority customer support</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <p style="font-size: 14px; color: #666;">
                    🔔 Want to be notified about future launches? 
                    <a href="{{appUrl}}/newsletter/preferences" style="color: #ff6b35;">Update your preferences</a>
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

export const generateNewLaunchEmail = (context: NewLaunchContext) => ({
  subject: `🚀 New Launch: ${context.product.name} - Exclusive Early Access!`,
  html: newLaunchTemplate,
  context: { appName: 'Vardhman Mills', appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', supportEmail: process.env.SUPPORT_EMAIL || 'support@vardhmanmills.com', year: new Date().getFullYear(), ...context },
});

export default { template: newLaunchTemplate, generate: generateNewLaunchEmail };