/**
 * Shipping Update Email Template
 */

import { EmailTemplateContext } from '../email-utils';

export interface ShippingUpdateContext extends Partial<EmailTemplateContext> {
  user: { name: string; email: string; firstName?: string; };
  order: { id: string; number: string; };
  shipping: { status: string; trackingNumber?: string; estimatedDelivery?: string; carrier?: string; location?: string; };
}

export const shippingUpdateTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shipping Update - {{appName}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #6f42c1 0%, #007bff 100%); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .shipping-box { background: #e3f2fd; border: 2px solid #2196f3; border-radius: 10px; padding: 20px; margin: 20px 0; }
        .btn { display: inline-block; padding: 14px 28px; background: #007bff; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px; }
        .progress { background: #e9ecef; height: 8px; border-radius: 4px; margin: 20px 0; position: relative; }
        .progress-bar { background: #007bff; height: 100%; border-radius: 4px; width: 60%; }
        .footer { background: #2c3e50; color: white; padding: 30px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 48px; margin-bottom: 15px;">🚛</div>
            <h1>Shipping Update</h1>
            <p>Your order #{{order.number}} is on its way!</p>
        </div>
        <div class="content">
            <p>Dear {{user.firstName || user.name}},</p>
            <p>Here's the latest update on your order shipment:</p>
            
            <div class="shipping-box">
                <h3 style="color: #2196f3; margin-bottom: 15px;">📊 Shipping Status</h3>
                <p><strong>Current Status:</strong> {{shipping.status}}</p>
                {{#if shipping.trackingNumber}}<p><strong>Tracking Number:</strong> {{shipping.trackingNumber}}</p>{{/if}}
                {{#if shipping.carrier}}<p><strong>Carrier:</strong> {{shipping.carrier}}</p>{{/if}}
                {{#if shipping.location}}<p><strong>Current Location:</strong> {{shipping.location}}</p>{{/if}}
                {{#if shipping.estimatedDelivery}}<p><strong>Estimated Delivery:</strong> {{shipping.estimatedDelivery}}</p>{{/if}}
            </div>
            
            <div class="progress">
                <div class="progress-bar"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-bottom: 20px;">
                <span>Order Placed</span>
                <span>In Transit</span>
                <span>Out for Delivery</span>
                <span>Delivered</span>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                {{#if shipping.trackingNumber}}
                <a href="{{appUrl}}/track/{{shipping.trackingNumber}}" class="btn">🔍 Track Package</a>
                {{/if}}
                <a href="{{appUrl}}/orders/{{order.id}}" class="btn" style="background: #28a745;">View Order</a>
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

export const generateShippingUpdateEmail = (context: ShippingUpdateContext) => ({
  subject: `🚛 Shipping Update: ${context.shipping.status} - Order #${context.order.number}`,
  html: shippingUpdateTemplate,
  context: { appName: 'Vardhman Mills', appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', supportEmail: process.env.SUPPORT_EMAIL || 'support@vardhmanmills.com', year: new Date().getFullYear(), ...context },
});

export default { template: shippingUpdateTemplate, generate: generateShippingUpdateEmail };