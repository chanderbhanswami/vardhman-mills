/**
 * Invoice Email Template
 */

import { EmailTemplateContext } from '../email-utils';

export interface InvoiceContext extends Partial<EmailTemplateContext> {
  user: { name: string; email: string; firstName?: string; };
  invoice: { 
    id: string; number: string; date: string; dueDate?: string; 
    items: Array<{ name: string; quantity: number; price: number; total: number; }>;
    subtotal: number; tax: number; total: number; currency: string;
    billingAddress: string; paymentMethod?: string;
  };
}

export const invoiceTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice #{{invoice.number}} - {{appName}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa; }
        .container { max-width: 700px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #343a40 0%, #495057 100%); color: white; padding: 40px 30px; }
        .content { padding: 40px 30px; }
        .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
        .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .invoice-table th, .invoice-table td { padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6; }
        .invoice-table th { background: #f8f9fa; font-weight: 600; }
        .totals { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .btn { display: inline-block; padding: 14px 28px; background: #007bff; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px; }
        .footer { background: #2c3e50; color: white; padding: 30px; text-align: center; }
        @media (max-width: 600px) { .invoice-header { flex-direction: column; gap: 20px; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 48px; margin-bottom: 15px; text-align: center;">🧾</div>
            <h1 style="text-align: center;">Invoice</h1>
            <p style="text-align: center;">Invoice #{{invoice.number}}</p>
        </div>
        <div class="content">
            <div class="invoice-header">
                <div>
                    <h3>Bill To:</h3>
                    <p><strong>{{user.name}}</strong></p>
                    <p>{{user.email}}</p>
                    <p>{{invoice.billingAddress}}</p>
                </div>
                <div style="text-align: right;">
                    <p><strong>Invoice Date:</strong> {{invoice.date}}</p>
                    {{#if invoice.dueDate}}<p><strong>Due Date:</strong> {{invoice.dueDate}}</p>{{/if}}
                    {{#if invoice.paymentMethod}}<p><strong>Payment Method:</strong> {{invoice.paymentMethod}}</p>{{/if}}
                </div>
            </div>
            
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Price</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {{#each invoice.items}}
                    <tr>
                        <td>{{name}}</td>
                        <td style="text-align: center;">{{quantity}}</td>
                        <td style="text-align: right;">{{../invoice.currency}}{{price}}</td>
                        <td style="text-align: right;">{{../invoice.currency}}{{total}}</td>
                    </tr>
                    {{/each}}
                </tbody>
            </table>
            
            <div class="totals">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>Subtotal:</span>
                    <span>{{invoice.currency}}{{invoice.subtotal}}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>Tax:</span>
                    <span>{{invoice.currency}}{{invoice.tax}}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; border-top: 2px solid #dee2e6; padding-top: 10px;">
                    <span>Total:</span>
                    <span>{{invoice.currency}}{{invoice.total}}</span>
                </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{appUrl}}/invoices/{{invoice.id}}" class="btn">📄 View Invoice</a>
                <a href="{{appUrl}}/invoices/{{invoice.id}}/download" class="btn" style="background: #28a745;">📥 Download PDF</a>
            </div>
            
            <div style="background: #e9ecef; padding: 20px; border-radius: 8px; font-size: 14px;">
                <p><strong>Payment Terms:</strong> Payment is due within 30 days of invoice date.</p>
                <p><strong>Questions?</strong> Contact us at {{supportEmail}} or call our billing department.</p>
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

export const generateInvoiceEmail = (context: InvoiceContext) => ({
  subject: `🧾 Invoice #${context.invoice.number} - {{appName}}`,
  html: invoiceTemplate,
  context: { appName: 'Vardhman Mills', appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', supportEmail: process.env.SUPPORT_EMAIL || 'support@vardhmanmills.com', year: new Date().getFullYear(), ...context },
});

export default { template: invoiceTemplate, generate: generateInvoiceEmail };