/**
 * Delivered Items Review Request Email Template
 */

import { EmailTemplateContext } from '../email-utils';

export interface DeliveredItemsReviewContext extends Partial<EmailTemplateContext> {
  user: { name: string; email: string; firstName?: string; };
  order: { id: string; number: string; items: Array<{ name: string; quantity: number; image?: string; }> };
}

export const deliveredItemsReviewTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>How was your experience? - {{appName}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .item { display: flex; align-items: center; padding: 15px; border: 1px solid #e9ecef; border-radius: 8px; margin: 10px 0; }
        .item img { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 15px; }
        .stars { font-size: 24px; margin: 20px 0; text-align: center; }
        .btn { display: inline-block; padding: 14px 28px; background: #ffa726; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px; }
        .footer { background: #2c3e50; color: white; padding: 30px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 48px; margin-bottom: 15px;">⭐</div>
            <h1>How was your experience?</h1>
            <p>We'd love to hear your feedback on order #{{order.number}}</p>
        </div>
        <div class="content">
            <p>Dear {{user.firstName || user.name}},</p>
            <p>We hope you're loving your new textiles! Your opinion matters to us, and we'd appreciate if you could take a moment to review your recent purchase.</p>
            
            <div class="stars">⭐⭐⭐⭐⭐</div>
            
            <h3 style="margin: 30px 0 20px 0;">📦 Items to Review:</h3>
            {{#each order.items}}
            <div class="item">
                {{#if image}}<img src="{{image}}" alt="{{name}}" />{{/if}}
                <div>
                    <h4>{{name}}</h4>
                    <p style="color: #666;">Quantity: {{quantity}}</p>
                </div>
            </div>
            {{/each}}
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{appUrl}}/orders/{{order.id}}/review" class="btn">⭐ Leave a Review</a>
                <a href="{{appUrl}}/products" class="btn" style="background: #007bff;">Shop More</a>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h4 style="color: #856404; margin-bottom: 10px;">💡 Why Reviews Matter</h4>
                <p style="color: #856404; font-size: 14px;">Your reviews help other customers make informed decisions and help us improve our products and services. Plus, you might help someone find their perfect textile!</p>
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

export const generateDeliveredItemsReviewEmail = (context: DeliveredItemsReviewContext) => ({
  subject: `⭐ How was your experience with order #${context.order.number}? - {{appName}}`,
  html: deliveredItemsReviewTemplate,
  context: { appName: 'Vardhman Mills', appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', supportEmail: process.env.SUPPORT_EMAIL || 'support@vardhmanmills.com', year: new Date().getFullYear(), ...context },
});

export default { template: deliveredItemsReviewTemplate, generate: generateDeliveredItemsReviewEmail };