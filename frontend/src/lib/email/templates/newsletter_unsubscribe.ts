/**
 * Newsletter Unsubscribe Email Template
 */

import { EmailTemplateContext } from '../email-utils';

export interface NewsletterUnsubscribeContext extends Partial<EmailTemplateContext> {
  user: { name: string; email: string; firstName?: string; };
  unsubscribeReason?: string;
  resubscribeToken?: string;
}

export const newsletterUnsubscribeTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You've Been Unsubscribed - {{appName}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #6c757d 0%, #adb5bd 100%); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .feedback-box { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .btn { display: inline-block; padding: 14px 28px; background: #28a745; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px; }
        .footer { background: #2c3e50; color: white; padding: 30px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 48px; margin-bottom: 15px;">👋</div>
            <h1>You've Been Unsubscribed</h1>
            <p>We're sorry to see you go!</p>
        </div>
        <div class="content">
            <p>Dear {{user.firstName || user.name}},</p>
            <p>You have been successfully unsubscribed from the Vardhman Mills newsletter. You will no longer receive our weekly updates and promotional emails.</p>
            
            {{#if unsubscribeReason}}
            <div class="feedback-box">
                <h4 style="margin-bottom: 10px;">📝 Your Feedback</h4>
                <p><strong>Reason for unsubscribing:</strong> {{unsubscribeReason}}</p>
                <p style="margin-top: 10px; font-size: 14px; color: #6c757d;">Thank you for sharing your feedback. We'll use it to improve our newsletter for other subscribers.</p>
            </div>
            {{/if}}
            
            <h3 style="margin: 30px 0 15px 0;">💭 Change of Heart?</h3>
            <p>We understand that inboxes can get overwhelming. If you'd like to stay connected with us in other ways:</p>
            
            <ul style="margin: 15px 0 15px 20px; line-height: 1.8;">
                <li>🛍️ <a href="{{appUrl}}/products">Browse our latest textile collections</a></li>
                <li>📱 <a href="{{appUrl}}/social">Follow us on social media</a></li>
                <li>📞 <a href="{{appUrl}}/contact">Contact us directly</a> for personalized assistance</li>
                <li>🌐 <a href="{{appUrl}}/blog">Read our blog</a> for textile insights</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
                {{#if resubscribeToken}}
                <a href="{{appUrl}}/newsletter/resubscribe/{{resubscribeToken}}" class="btn">📧 Resubscribe</a>
                {{else}}
                <a href="{{appUrl}}/newsletter/subscribe" class="btn">📧 Resubscribe</a>
                {{/if}}
                <a href="{{appUrl}}/products" class="btn" style="background: #007bff;">🛍️ Shop Now</a>
            </div>
            
            <div style="background: #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin-bottom: 10px;">📊 What You'll Miss</h4>
                <ul style="margin-left: 20px; font-size: 14px; line-height: 1.6;">
                    <li>Exclusive discounts (up to 30% off)</li>
                    <li>Early access to new collections</li>
                    <li>Industry trends and insights</li>
                    <li>Styling tips and inspiration</li>
                </ul>
            </div>
            
            <p style="text-align: center; font-size: 14px; color: #6c757d; margin-top: 30px;">
                Note: You may still receive transactional emails related to your orders and account.
            </p>
        </div>
        <div class="footer">
            <p><strong>{{appName}}</strong></p>
            <p>{{supportEmail}} | &copy; {{year}} {{appName}}</p>
            <p style="font-size: 12px; margin-top: 10px;">
                This email was sent to confirm your unsubscription request.
            </p>
        </div>
    </div>
</body>
</html>
`;

export const generateNewsletterUnsubscribeEmail = (context: NewsletterUnsubscribeContext) => ({
  subject: `👋 You've been unsubscribed from Vardhman Mills newsletter`,
  html: newsletterUnsubscribeTemplate,
  context: { appName: 'Vardhman Mills', appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', supportEmail: process.env.SUPPORT_EMAIL || 'support@vardhmanmills.com', year: new Date().getFullYear(), ...context },
});

export default { template: newsletterUnsubscribeTemplate, generate: generateNewsletterUnsubscribeEmail };