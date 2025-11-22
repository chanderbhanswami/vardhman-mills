/**
 * Account Created Email Template
 * Welcome email sent when a user successfully creates an account
 */

import { EmailTemplateContext } from '../email-utils';

export interface AccountCreatedContext extends Partial<EmailTemplateContext> {
  user: {
    id: string;
    name: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  verification?: {
    required: boolean;
    token?: string;
    expiresAt?: Date;
  };
  welcome?: {
    message?: string;
    nextSteps?: string[];
  };
}

/**
 * Account Created Email Template
 */
export const accountCreatedTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to {{appName}}!</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 18px;
            opacity: 0.9;
        }
        
        .welcome-icon {
            font-size: 48px;
            margin-bottom: 20px;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 24px;
            margin-bottom: 20px;
            color: #2c3e50;
            text-align: center;
        }
        
        .welcome-message {
            background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            text-align: center;
            border-left: 4px solid #28a745;
        }
        
        .welcome-message h2 {
            color: #2c3e50;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .welcome-message p {
            color: #6c757d;
            font-size: 16px;
            line-height: 1.7;
        }
        
        .account-details {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
        }
        
        .account-details h3 {
            color: #2c3e50;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #e9ecef;
        }
        
        .detail-row:last-child {
            border-bottom: none;
        }
        
        .detail-label {
            font-weight: 600;
            color: #495057;
        }
        
        .detail-value {
            color: #6c757d;
        }
        
        .verification-notice {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        
        .verification-notice h4 {
            color: #856404;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .verification-notice p {
            color: #6c757d;
            font-size: 14px;
        }
        
        .next-steps {
            background-color: #e7f3ff;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
        }
        
        .next-steps h3 {
            color: #0056b3;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .steps-list {
            list-style: none;
            padding: 0;
        }
        
        .step-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
            padding: 15px;
            background-color: white;
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .step-number {
            background-color: #007bff;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 14px;
            margin-right: 15px;
            flex-shrink: 0;
        }
        
        .step-content h4 {
            color: #2c3e50;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 5px;
        }
        
        .step-content p {
            color: #6c757d;
            font-size: 14px;
        }
        
        .action-buttons {
            text-align: center;
            margin: 40px 0;
        }
        
        .btn {
            display: inline-block;
            padding: 16px 32px;
            background-color: #28a745;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 10px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
        }
        
        .btn:hover {
            background-color: #218838;
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(40, 167, 69, 0.4);
        }
        
        .btn-secondary {
            background-color: #6c757d;
            box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
        }
        
        .btn-secondary:hover {
            background-color: #5a6268;
            box-shadow: 0 6px 16px rgba(108, 117, 125, 0.4);
        }
        
        .social-proof {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            margin: 30px 0;
            border-radius: 12px;
            text-align: center;
        }
        
        .social-proof h3 {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .stats {
            display: flex;
            justify-content: space-around;
            margin-top: 20px;
        }
        
        .stat {
            text-align: center;
        }
        
        .stat-number {
            font-size: 24px;
            font-weight: 700;
            display: block;
        }
        
        .stat-label {
            font-size: 14px;
            opacity: 0.9;
        }
        
        .footer {
            background-color: #2c3e50;
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .footer-links {
            margin-bottom: 20px;
        }
        
        .footer-links a {
            color: #20c997;
            text-decoration: none;
            margin: 0 15px;
            font-size: 14px;
        }
        
        .footer-links a:hover {
            text-decoration: underline;
        }
        
        .footer p {
            margin-bottom: 10px;
            font-size: 14px;
            opacity: 0.9;
        }
        
        .support-info {
            font-size: 13px;
            opacity: 0.7;
            margin-top: 20px;
        }
        
        @media only screen and (max-width: 600px) {
            .container {
                margin: 0;
                box-shadow: none;
            }
            
            .header, .content, .footer {
                padding: 20px;
            }
            
            .greeting {
                font-size: 20px;
            }
            
            .detail-row {
                flex-direction: column;
                align-items: flex-start;
                gap: 5px;
            }
            
            .stats {
                flex-direction: column;
                gap: 15px;
            }
            
            .btn {
                display: block;
                margin: 10px 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="welcome-icon">🎉</div>
            <h1>Welcome to {{appName}}!</h1>
            <p>Your account has been successfully created</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                {{#if user.firstName}}
                    Hello {{user.firstName}}!
                {{else}}
                    Hello {{user.name}}!
                {{/if}}
            </div>
            
            <div class="welcome-message">
                <h2>🌟 Your Journey Begins Here</h2>
                <p>
                    {{#if welcome.message}}
                        {{welcome.message}}
                    {{else}}
                        Thank you for joining {{appName}}! We're excited to have you as part of our community. 
                        Your account has been successfully created and you're now ready to explore everything we have to offer.
                    {{/if}}
                </p>
            </div>
            
            <div class="account-details">
                <h3>📋 Account Information</h3>
                <div class="detail-row">
                    <span class="detail-label">Account ID:</span>
                    <span class="detail-value">{{user.id}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">{{user.name}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">{{user.email}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Account Created:</span>
                    <span class="detail-value">{{year}}</span>
                </div>
            </div>
            
            {{#if verification.required}}
            <div class="verification-notice">
                <h4>📧 Email Verification Required</h4>
                <p>Please check your email and click the verification link to activate your account and access all features.</p>
            </div>
            {{/if}}
            
            <div class="next-steps">
                <h3>🚀 What's Next?</h3>
                <ul class="steps-list">
                    {{#if welcome.nextSteps}}
                        {{#each welcome.nextSteps}}
                        <li class="step-item">
                            <div class="step-number">{{@index}}</div>
                            <div class="step-content">
                                <h4>{{this}}</h4>
                            </div>
                        </li>
                        {{/each}}
                    {{else}}
                        <li class="step-item">
                            <div class="step-number">1</div>
                            <div class="step-content">
                                <h4>Complete Your Profile</h4>
                                <p>Add your personal information and preferences to personalize your experience.</p>
                            </div>
                        </li>
                        <li class="step-item">
                            <div class="step-number">2</div>
                            <div class="step-content">
                                <h4>Explore Our Products</h4>
                                <p>Browse our extensive collection of premium textiles and fabrics.</p>
                            </div>
                        </li>
                        <li class="step-item">
                            <div class="step-number">3</div>
                            <div class="step-content">
                                <h4>Set Up Notifications</h4>
                                <p>Choose how you'd like to receive updates about new products and offers.</p>
                            </div>
                        </li>
                    {{/if}}
                </ul>
            </div>
            
            <div class="action-buttons">
                {{#if verification.required}}
                    <a href="{{appUrl}}/verify-email?token={{verification.token}}" class="btn">Verify Email Address</a>
                {{else}}
                    <a href="{{appUrl}}/dashboard" class="btn">Go to Dashboard</a>
                {{/if}}
                <a href="{{appUrl}}/profile/edit" class="btn btn-secondary">Complete Profile</a>
            </div>
            
            <div class="social-proof">
                <h3>Join Thousands of Satisfied Customers</h3>
                <p>You're now part of a growing community of textile enthusiasts and professionals.</p>
                <div class="stats">
                    <div class="stat">
                        <span class="stat-number">10K+</span>
                        <span class="stat-label">Happy Customers</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">500+</span>
                        <span class="stat-label">Premium Products</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">50+</span>
                        <span class="stat-label">Years Experience</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-links">
                <a href="{{appUrl}}/about">About Us</a>
                <a href="{{appUrl}}/products">Products</a>
                <a href="{{appUrl}}/support">Support</a>
                <a href="{{appUrl}}/contact">Contact</a>
            </div>
            <p><strong>{{appName}}</strong></p>
            <p>Thank you for choosing us for your textile needs</p>
            <div class="support-info">
                <p>Need help? Contact us at {{supportEmail}}</p>
                <p>&copy; {{year}} {{appName}}. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
`;

/**
 * Generate Account Created Email
 */
export const generateAccountCreatedEmail = (context: AccountCreatedContext) => {
  const subject = `🎉 Welcome to {{appName}}, ${context.user.firstName || context.user.name}!`;
  
  return {
    subject,
    html: accountCreatedTemplate,
    context: {
      appName: 'Vardhman Mills',
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      supportEmail: process.env.SUPPORT_EMAIL || 'support@vardhmanmills.com',
      year: new Date().getFullYear(),
      ...context,
    },
  };
};

/**
 * Account Created Email Configuration
 */
export const accountCreatedConfig = {
  templateName: 'account_created',
  subject: '🎉 Welcome to {{appName}}, {{user.name}}!',
  priority: 'normal' as const,
  category: 'onboarding',
  description: 'Welcome email sent when a user creates an account',
  requiredContext: ['user.id', 'user.name', 'user.email'],
  optionalContext: [
    'user.firstName',
    'user.lastName', 
    'user.avatar',
    'verification.required',
    'verification.token',
    'verification.expiresAt',
    'welcome.message',
    'welcome.nextSteps'
  ],
  triggers: ['user.created', 'account.registered'],
  delay: 0, // Send immediately
};

export default {
  template: accountCreatedTemplate,
  generate: generateAccountCreatedEmail,
  config: accountCreatedConfig,
};