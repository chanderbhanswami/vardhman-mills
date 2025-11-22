/**
 * Delivery Confirmation Email Template
 */

import { EmailTemplateContext } from '../email-utils';

export interface DeliveryConfirmationContext extends Partial<EmailTemplateContext> {
  user: { name: string; email: string; firstName?: string; };
  order: { id: string; number: string; total: number; currency: string; };
  delivery: { date: string; time: string; address: string; driver?: string; };
}

export const deliveryConfirmationTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Delivered - {{appName}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .delivery-box { background: #d4edda; border: 2px solid #28a745; border-radius: 10px; padding: 20px; margin: 20px 0; }
        .btn { display: inline-block; padding: 14px 28px; background: #007bff; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px; }
        .footer { background: #2c3e50; color: white; padding: 30px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 48px; margin-bottom: 15px;">📦✨</div>
            <h1>Order Delivered!</h1>
            <p>Your order #{{order.number}} has been successfully delivered</p>
        </div>
        <div class="content">
            <p>Dear {{user.firstName || user.name}},</p>
            <p>Great news! Your order has been delivered successfully. We hope you love your new textiles!</p>
            
            <div class="delivery-box">
                <h3 style="color: #28a745; margin-bottom: 15px;">🚚 Delivery Details</h3>
                <p><strong>Order Number:</strong> #{{order.number}}</p>
                <p><strong>Delivery Date:</strong> {{delivery.date}}</p>
                <p><strong>Delivery Time:</strong> {{delivery.time}}</p>
                <p><strong>Delivery Address:</strong> {{delivery.address}}</p>
                {{#if delivery.driver}}<p><strong>Delivered by:</strong> {{delivery.driver}}</p>{{/if}}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{appUrl}}/orders/{{order.id}}/review" class="btn" style="background: #ffc107; color: #212529;">Leave a Review</a>
                <a href="{{appUrl}}/products" class="btn" style="background: #28a745;">Shop Again</a>
            </div>
            
            <p style="margin-top: 20px; font-size: 14px; color: #666;">
                Having issues with your order? <a href="{{appUrl}}/support">Contact our support team</a> - we're here to help!
            </p>
        </div>
        <div class="footer">
            <p><strong>{{appName}}</strong></p>
            <p>{{supportEmail}} | &copy; {{year}} {{appName}}</p>
        </div>
    </div>
</body>
</html>
`;

export const generateDeliveryConfirmationEmail = (context: DeliveryConfirmationContext) => ({
  subject: `📦 Delivered! Order #${context.order.number} - {{appName}}`,
  html: deliveryConfirmationTemplate,
  context: { appName: 'Vardhman Mills', appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', supportEmail: process.env.SUPPORT_EMAIL || 'support@vardhmanmills.com', year: new Date().getFullYear(), ...context },
});

export default { template: deliveryConfirmationTemplate, generate: generateDeliveryConfirmationEmail };