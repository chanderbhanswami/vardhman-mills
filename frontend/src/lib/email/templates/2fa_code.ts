/**
 * Two-Factor Authentication Code Email Template
 * Sends 2FA verification code to users for enhanced security
 */

import { EmailTemplateContext } from '../email-utils';

export interface TwoFactorCodeContext extends Partial<EmailTemplateContext> {
  security: {
    code: string;
    expiresAt: Date;
    ip?: string;
    location?: string;
    device?: string;
  };
  user: {
    name?: string;
    email: string;
  };
}

/**
 * Two-Factor Authentication Code Email Template
 */
export const twoFactorCodeTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Two-Factor Authentication Code - {{appName}}</title>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #2c3e50;
        }
        
        .code-container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        .code-label {
            color: white;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .verification-code {
            background-color: white;
            color: #667eea;
            font-size: 36px;
            font-weight: 800;
            padding: 20px 30px;
            border-radius: 8px;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            display: inline-block;
            margin: 10px 0;
            border: 3px solid #667eea;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .expiry-info {
            color: white;
            font-size: 14px;
            margin-top: 15px;
            opacity: 0.9;
        }
        
        .security-info {
            background-color: #f8f9fa;
            border-left: 4px solid #ffc107;
            padding: 20px;
            margin: 30px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .security-info h3 {
            color: #856404;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }
        
        .security-info p {
            color: #6c757d;
            font-size: 14px;
            margin-bottom: 8px;
        }
        
        .warning-box {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .warning-box h4 {
            color: #856404;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }
        
        .warning-box ul {
            color: #6c757d;
            padding-left: 20px;
        }
        
        .warning-box li {
            margin-bottom: 5px;
            font-size: 14px;
        }
        
        .action-buttons {
            text-align: center;
            margin: 30px 0;
        }
        
        .btn {
            display: inline-block;
            padding: 14px 28px;
            background-color: #28a745;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            margin: 0 10px;
            transition: all 0.3s ease;
        }
        
        .btn:hover {
            background-color: #218838;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
        }
        
        .btn-secondary {
            background-color: #6c757d;
        }
        
        .btn-secondary:hover {
            background-color: #5a6268;
            box-shadow: 0 4px 8px rgba(108, 117, 125, 0.3);
        }
        
        .footer {
            background-color: #2c3e50;
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .footer p {
            margin-bottom: 10px;
            font-size: 14px;
            opacity: 0.9;
        }
        
        .footer .support-info {
            font-size: 13px;
            opacity: 0.7;
            margin-top: 20px;
        }
        
        .icon {
            width: 20px;
            height: 20px;
            margin-right: 8px;
            vertical-align: middle;
        }
        
        @media only screen and (max-width: 600px) {
            .container {
                margin: 0;
                box-shadow: none;
            }
            
            .header, .content, .footer {
                padding: 20px;
            }
            
            .verification-code {
                font-size: 28px;
                padding: 15px 20px;
                letter-spacing: 4px;
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
            <h1>🔐 Two-Factor Authentication</h1>
            <p>Your security verification code</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                {{#if user.name}}
                    Hello {{user.name}},
                {{else}}
                    Hello,
                {{/if}}
            </div>
            
            <p>You've requested two-factor authentication for your {{appName}} account. Please use the verification code below to complete your login:</p>
            
            <div class="code-container">
                <div class="code-label">Your Verification Code</div>
                <div class="verification-code">{{security.code}}</div>
                <div class="expiry-info">
                    ⏱️ This code expires in 10 minutes
                </div>
            </div>
            
            {{#if security.ip}}
            <div class="security-info">
                <h3>🛡️ Security Information</h3>
                <p><strong>IP Address:</strong> {{security.ip}}</p>
                {{#if security.location}}
                <p><strong>Location:</strong> {{security.location}}</p>
                {{/if}}
                {{#if security.device}}
                <p><strong>Device:</strong> {{security.device}}</p>
                {{/if}}
                <p><strong>Time:</strong> {{security.expiresAt}}</p>
            </div>
            {{/if}}
            
            <div class="warning-box">
                <h4>⚠️ Security Guidelines</h4>
                <ul>
                    <li>Never share this code with anyone</li>
                    <li>{{appName}} will never ask for your verification code via email or phone</li>
                    <li>If you didn't request this code, secure your account immediately</li>
                    <li>This code can only be used once and expires in 10 minutes</li>
                </ul>
            </div>
            
            <p>If you're having trouble with two-factor authentication or didn't request this code, please contact our support team immediately.</p>
            
            <div class="action-buttons">
                <a href="{{appUrl}}/account/security" class="btn">Manage Security Settings</a>
                <a href="{{appUrl}}/support" class="btn btn-secondary">Contact Support</a>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>{{appName}}</strong></p>
            <p>Keeping your account secure is our priority</p>
            <div class="support-info">
                <p>If you need help, contact us at {{supportEmail}}</p>
                <p>&copy; {{year}} {{appName}}. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
`;

/**
 * Generate Two-Factor Authentication Code Email
 */
export const generateTwoFactorCodeEmail = (context: TwoFactorCodeContext) => {
  const subject = `🔐 Your {{appName}} Verification Code: ${context.security.code}`;
  
  return {
    subject,
    html: twoFactorCodeTemplate,
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
 * Two-Factor Code Email Configuration
 */
export const twoFactorCodeConfig = {
  templateName: '2fa_code',
  subject: '🔐 Your {{appName}} Verification Code: {{security.code}}',
  priority: 'high' as const,
  category: 'security',
  description: 'Two-factor authentication verification code email',
  requiredContext: ['security.code', 'security.expiresAt', 'user.email'],
  optionalContext: ['user.name', 'security.ip', 'security.location', 'security.device'],
  expiresIn: 600, // 10 minutes in seconds
  rateLimit: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
};

export default {
  template: twoFactorCodeTemplate,
  generate: generateTwoFactorCodeEmail,
  config: twoFactorCodeConfig,
};