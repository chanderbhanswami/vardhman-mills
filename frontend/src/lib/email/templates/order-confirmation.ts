/**
 * Order Confirmation Email Template
 */

import { EmailTemplateContext } from '../email-utils';

export interface OrderConfirmationContext extends Partial<EmailTemplateContext> {
  user: { name: string; email: string; firstName?: string; };
  order: {
    id: string;
    number: string;
    total: number;
    currency: string;
    status: string;
    items: Array<{ id: string; name: string; quantity: number; price: number; image?: string; }>;
    shippingAddress?: { street?: string; city?: string; state?: string; pincode?: string; };
    estimatedDelivery?: Date;
  };
}

export const orderConfirmationTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - {{appName}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .order-summary { background: #f8f9fa; border-radius: 8px; padding: 25px; margin: 25px 0; }
        .item { display: flex; padding: 15px 0; border-bottom: 1px solid #e9ecef; align-items: center; }
        .item:last-child { border-bottom: none; }
        .item-image { width: 60px; height: 60px; background: #e9ecef; border-radius: 4px; margin-right: 15px; }
        .item-details { flex: 1; }
        .item-price { font-weight: 600; color: #28a745; }
        .total-row { display: flex; justify-content: space-between; padding: 10px 0; font-weight: 600; font-size: 18px; color: #28a745; border-top: 2px solid #28a745; margin-top: 15px; }
        .btn { display: inline-block; padding: 14px 28px; background: #28a745; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px; }
        .footer { background: #2c3e50; color: white; padding: 30px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 48px; margin-bottom: 15px;">✅</div>
            <h1>Order Confirmed!</h1>
            <p>Thank you for your purchase</p>
        </div>
        <div class="content">
            <p>Dear {{user.firstName || user.name}},</p>
            <p>Your order has been confirmed and is being processed. Here are your order details:</p>
            
            <div class="order-summary">
                <h3 style="color: #2c3e50; margin-bottom: 15px;">📦 Order #{{order.number}}</h3>
                <p><strong>Order ID:</strong> {{order.id}}</p>
                <p><strong>Status:</strong> {{order.status}}</p>
                {{#if order.estimatedDelivery}}<p><strong>Estimated Delivery:</strong> {{order.estimatedDelivery}}</p>{{/if}}
            </div>
            
            <h3 style="margin: 25px 0 15px 0;">🛍️ Order Items</h3>
            <div style="background: white; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px;">
                {{#each order.items}}
                <div class="item">
                    <div class="item-image">{{#if image}}📷{{else}}📦{{/if}}</div>
                    <div class="item-details">
                        <h4 style="color: #2c3e50; margin-bottom: 5px;">{{name}}</h4>
                        <p style="color: #6c757d;">Quantity: {{quantity}}</p>
                    </div>
                    <div class="item-price">{{order.currency}}{{price}}</div>
                </div>
                {{/each}}
                <div class="total-row">
                    <span>Total Amount:</span>
                    <span>{{order.currency}}{{order.total}}</span>
                </div>
            </div>
            
            {{#if order.shippingAddress}}
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #1976d2; margin-bottom: 10px;">🚚 Shipping Address</h3>
                <p>{{order.shippingAddress.street}}</p>
                <p>{{order.shippingAddress.city}}, {{order.shippingAddress.state}} {{order.shippingAddress.pincode}}</p>
            </div>
            {{/if}}
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{appUrl}}/orders/{{order.id}}" class="btn">Track Your Order</a>
                <a href="{{appUrl}}/support" class="btn" style="background: #007bff;">Need Help?</a>
            </div>
            
            <p>We'll send you updates as your order progresses. Thank you for choosing {{appName}}!</p>
        </div>
        <div class="footer">
            <p><strong>{{appName}}</strong></p>
            <p>Premium Textiles & Fabrics</p>
            <p style="font-size: 13px; opacity: 0.7; margin-top: 15px;">{{supportEmail}} | &copy; {{year}} {{appName}}</p>
        </div>
    </div>
</body>
</html>
`;

export const generateOrderConfirmationEmail = (context: OrderConfirmationContext) => ({
  subject: `✅ Order Confirmed #${context.order.number} - {{appName}}`,
  html: orderConfirmationTemplate,
  context: { appName: 'Vardhman Mills', appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', supportEmail: process.env.SUPPORT_EMAIL || 'support@vardhmanmills.com', year: new Date().getFullYear(), ...context },
});

export default { template: orderConfirmationTemplate, generate: generateOrderConfirmationEmail };