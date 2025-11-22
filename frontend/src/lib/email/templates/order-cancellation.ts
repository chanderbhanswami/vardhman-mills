/**
 * Order Cancellation Email Template
 */

import { EmailTemplateContext } from '../email-utils';

export interface OrderCancellationContext extends Partial<EmailTemplateContext> {
  user: { name: string; email: string; firstName?: string; };
  order: { id: string; number: string; total: number; currency: string; };
}

export const orderCancellationTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Cancelled - {{appName}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .btn { display: inline-block; padding: 14px 28px; background: #007bff; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px; }
        .footer { background: #2c3e50; color: white; padding: 30px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 48px; margin-bottom: 15px;">❌</div>
            <h1>Order Cancelled</h1>
            <p>Order #{{order.number}} has been cancelled</p>
        </div>
        <div class="content">
            <p>Dear {{user.firstName || user.name}},</p>
            <p>Your order #{{order.number}} has been successfully cancelled. The refund of {{order.currency}}{{order.total}} will be processed within 3-5 business days.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{appUrl}}/orders" class="btn">View All Orders</a>
                <a href="{{appUrl}}/products" class="btn" style="background: #28a745;">Continue Shopping</a>
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

export const generateOrderCancellationEmail = (context: OrderCancellationContext) => ({
  subject: `❌ Order Cancelled #${context.order.number} - {{appName}}`,
  html: orderCancellationTemplate,
  context: { appName: 'Vardhman Mills', appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', supportEmail: process.env.SUPPORT_EMAIL || 'support@vardhmanmills.com', year: new Date().getFullYear(), ...context },
});

export default { template: orderCancellationTemplate, generate: generateOrderCancellationEmail };