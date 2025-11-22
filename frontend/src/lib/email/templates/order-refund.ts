/**
 * Order Refund Email Template
 */

import { EmailTemplateContext } from '../email-utils';

export interface OrderRefundContext extends Partial<EmailTemplateContext> {
  user: { name: string; email: string; firstName?: string; };
  order: { id: string; number: string; total: number; currency: string; };
  refund: { amount: number; reason: string; refundId: string; };
}

export const orderRefundTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Refund Processed - {{appName}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .refund-box { background: #e7f5e7; border: 2px solid #28a745; border-radius: 10px; padding: 20px; margin: 20px 0; }
        .btn { display: inline-block; padding: 14px 28px; background: #007bff; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px; }
        .footer { background: #2c3e50; color: white; padding: 30px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 48px; margin-bottom: 15px;">💰</div>
            <h1>Refund Processed</h1>
            <p>Your refund has been successfully processed</p>
        </div>
        <div class="content">
            <p>Dear {{user.firstName || user.name}},</p>
            <p>We've processed your refund for order #{{order.number}}.</p>
            
            <div class="refund-box">
                <h3 style="color: #28a745; margin-bottom: 15px;">💸 Refund Details</h3>
                <p><strong>Refund Amount:</strong> {{refund.amount}} {{order.currency}}</p>
                <p><strong>Refund ID:</strong> {{refund.refundId}}</p>
                <p><strong>Reason:</strong> {{refund.reason}}</p>
                <p><strong>Processing Time:</strong> 3-5 business days</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{appUrl}}/orders/{{order.id}}" class="btn">View Order</a>
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

export const generateOrderRefundEmail = (context: OrderRefundContext) => ({
  subject: `💰 Refund Processed #${context.order.number} - {{appName}}`,
  html: orderRefundTemplate,
  context: { appName: 'Vardhman Mills', appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', supportEmail: process.env.SUPPORT_EMAIL || 'support@vardhmanmills.com', year: new Date().getFullYear(), ...context },
});

export default { template: orderRefundTemplate, generate: generateOrderRefundEmail };