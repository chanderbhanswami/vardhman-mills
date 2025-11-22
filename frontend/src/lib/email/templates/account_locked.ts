/**
 * Account Locked Email Template
 * Security notification when user account is locked due to suspicious activity
 */

import { EmailTemplateContext } from '../email-utils';

export interface AccountLockedContext extends Partial<EmailTemplateContext> {
  user: {
    name: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  security: {
    reason: 'multiple_failed_attempts' | 'suspicious_activity' | 'security_breach' | 'admin_action' | 'other';
    lockedAt: Date;
    unlockProcess: 'automatic' | 'manual' | 'verification_required';
    unlockDate?: Date;
    ip?: string;
    location?: string;
    device?: string;
    attemptCount?: number;
  };
  unlock?: {
    token?: string;
    expiresAt?: Date;
    automaticUnlockHours?: number;
  };
}

/**
 * Account Locked Email Template
 */
export const accountLockedTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Security Alert - {{appName}}</title>
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
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
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
        
        .alert-icon {
            font-size: 48px;
            margin-bottom: 20px;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #2c3e50;
        }
        
        .alert-box {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            border-left: 4px solid #dc3545;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
        }
        
        .alert-box h3 {
            color: #721c24;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        
        .alert-box p {
            color: #721c24;
            font-size: 16px;
            line-height: 1.7;
        }
        
        .reason-box {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .reason-box h4 {
            color: #856404;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .reason-details {
            color: #6c757d;
            font-size: 14px;
            margin-top: 10px;
        }
        
        .security-details {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
        }
        
        .security-details h3 {
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
        
        .unlock-info {
            background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            text-align: center;
        }
        
        .unlock-info h3 {
            color: #2c3e50;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .unlock-info p {
            color: #6c757d;
            font-size: 16px;
            line-height: 1.7;
            margin-bottom: 20px;
        }
        
        .countdown {
            background-color: #007bff;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            font-size: 18px;
            font-weight: 600;
            display: inline-block;
            margin: 10px 0;
        }
        
        .prevention-tips {
            background-color: #d1ecf1;
            border-left: 4px solid #17a2b8;
            border-radius: 0 8px 8px 0;
            padding: 25px;
            margin: 30px 0;
        }
        
        .prevention-tips h3 {
            color: #0c5460;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .tips-list {
            list-style: none;
            padding: 0;
        }
        
        .tip-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 12px;
            color: #0c5460;
            font-size: 14px;
        }
        
        .tip-icon {
            margin-right: 10px;
            font-size: 16px;
            margin-top: 2px;
        }
        
        .action-buttons {
            text-align: center;
            margin: 40px 0;
        }
        
        .btn {
            display: inline-block;
            padding: 16px 32px;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 10px;
            transition: all 0.3s ease;
        }
        
        .btn-primary {
            background-color: #007bff;
            box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }
        
        .btn-primary:hover {
            background-color: #0056b3;
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
        }
        
        .btn-secondary {
            background-color: #6c757d;
            box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
        }
        
        .btn-secondary:hover {
            background-color: #5a6268;
            box-shadow: 0 6px 16px rgba(108, 117, 125, 0.4);
        }
        
        .btn-danger {
            background-color: #dc3545;
            box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
        }
        
        .btn-danger:hover {
            background-color: #c82333;
            box-shadow: 0 6px 16px rgba(220, 53, 69, 0.4);
        }
        
        .emergency-contact {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
            text-align: center;
        }
        
        .emergency-contact h4 {
            color: #721c24;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .emergency-contact p {
            color: #721c24;
            font-size: 14px;
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
        
        .support-info {
            font-size: 13px;
            opacity: 0.7;
            margin-top: 20px;
        }
        
        .icon {
            margin-right: 8px;
            font-size: 18px;
        }
        
        @media only screen and (max-width: 600px) {
            .container {
                margin: 0;
                box-shadow: none;
            }
            
            .header, .content, .footer {
                padding: 20px;
            }
            
            .detail-row {
                flex-direction: column;
                align-items: flex-start;
                gap: 5px;
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
            <div class="alert-icon">🔒</div>
            <h1>Account Security Alert</h1>
            <p>Your account has been temporarily locked</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                {{#if user.firstName}}
                    Dear {{user.firstName}},
                {{else}}
                    Dear {{user.name}},
                {{/if}}
            </div>
            
            <div class="alert-box">
                <h3>🚨 Account Locked for Security</h3>
                <p>
                    Your {{appName}} account has been temporarily locked to protect your information. 
                    This is a security measure to prevent unauthorized access to your account.
                </p>
            </div>
            
            <div class="reason-box">
                <h4>🔍 Reason for Lock</h4>
                {{#if security.reason}}
                    {{#if security.reason === 'multiple_failed_attempts'}}
                        <p>Multiple failed login attempts detected</p>
                        <div class="reason-details">
                            {{#if security.attemptCount}}
                                {{security.attemptCount}} consecutive failed attempts were made to access your account.
                            {{else}}
                                Several consecutive failed attempts were made to access your account.
                            {{/if}}
                        </div>
                    {{else if security.reason === 'suspicious_activity'}}
                        <p>Suspicious account activity detected</p>
                        <div class="reason-details">
                            Our security system detected unusual activity that may indicate unauthorized access attempts.
                        </div>
                    {{else if security.reason === 'security_breach'}}
                        <p>Potential security breach detected</p>
                        <div class="reason-details">
                            Your account was locked as a precautionary measure due to a potential security incident.
                        </div>
                    {{else if security.reason === 'admin_action'}}
                        <p>Administrative action</p>
                        <div class="reason-details">
                            Your account was locked by an administrator for security or policy reasons.
                        </div>
                    {{else}}
                        <p>Security precaution</p>
                        <div class="reason-details">
                            Your account was locked as a security precaution to protect your information.
                        </div>
                    {{/if}}
                {{else}}
                    <p>Security precaution</p>
                    <div class="reason-details">
                        Your account was locked as a security precaution to protect your information.
                    </div>
                {{/if}}
            </div>
            
            <div class="security-details">
                <h3>🛡️ Security Information</h3>
                <div class="detail-row">
                    <span class="detail-label">Account:</span>
                    <span class="detail-value">{{user.email}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Locked At:</span>
                    <span class="detail-value">{{security.lockedAt}}</span>
                </div>
                {{#if security.ip}}
                <div class="detail-row">
                    <span class="detail-label">IP Address:</span>
                    <span class="detail-value">{{security.ip}}</span>
                </div>
                {{/if}}
                {{#if security.location}}
                <div class="detail-row">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">{{security.location}}</span>
                </div>
                {{/if}}
                {{#if security.device}}
                <div class="detail-row">
                    <span class="detail-label">Device:</span>
                    <span class="detail-value">{{security.device}}</span>
                </div>
                {{/if}}
            </div>
            
            <div class="unlock-info">
                <h3>🔓 Account Recovery</h3>
                {{#if security.unlockProcess === 'automatic'}}
                    <p>Your account will be automatically unlocked in:</p>
                    {{#if unlock.automaticUnlockHours}}
                        <div class="countdown">{{unlock.automaticUnlockHours}} hours</div>
                    {{else}}
                        <div class="countdown">24 hours</div>
                    {{/if}}
                    <p>No action is required from your side. You'll be able to log in normally after this time.</p>
                {{else if security.unlockProcess === 'verification_required'}}
                    <p>To unlock your account, you need to verify your identity using the link below:</p>
                {{else}}
                    <p>Please contact our support team to unlock your account manually.</p>
                {{/if}}
            </div>
            
            <div class="action-buttons">
                {{#if security.unlockProcess === 'verification_required' && unlock.token}}
                    <a href="{{appUrl}}/unlock-account?token={{unlock.token}}" class="btn btn-primary">
                        🔓 Unlock My Account
                    </a>
                {{/if}}
                <a href="{{appUrl}}/support" class="btn btn-secondary">Contact Support</a>
                {{#if security.unlockProcess === 'manual'}}
                    <a href="{{appUrl}}/account-recovery" class="btn btn-danger">Request Manual Unlock</a>
                {{/if}}
            </div>
            
            <div class="prevention-tips">
                <h3>🛡️ Security Best Practices</h3>
                <ul class="tips-list">
                    <li class="tip-item">
                        <span class="tip-icon">✅</span>
                        <span>Use a strong, unique password for your account</span>
                    </li>
                    <li class="tip-item">
                        <span class="tip-icon">✅</span>
                        <span>Enable two-factor authentication for added security</span>
                    </li>
                    <li class="tip-item">
                        <span class="tip-icon">✅</span>
                        <span>Never share your login credentials with anyone</span>
                    </li>
                    <li class="tip-item">
                        <span class="tip-icon">✅</span>
                        <span>Log out from shared or public devices</span>
                    </li>
                    <li class="tip-item">
                        <span class="tip-icon">✅</span>
                        <span>Regularly review your account activity</span>
                    </li>
                    <li class="tip-item">
                        <span class="tip-icon">✅</span>
                        <span>Keep your contact information up to date</span>
                    </li>
                </ul>
            </div>
            
            <div class="emergency-contact">
                <h4>🆘 Need Immediate Help?</h4>
                <p>
                    If you believe your account was locked in error or if you suspect unauthorized access, 
                    please contact our security team immediately at {{supportEmail}} or call our emergency hotline.
                </p>
            </div>
            
            <p><strong>Important:</strong> If you did not attempt to access your account recently, 
            please change your password immediately after unlocking your account and consider enabling 
            additional security measures.</p>
        </div>
        
        <div class="footer">
            <p><strong>{{appName}} Security Team</strong></p>
            <p>Protecting your account is our priority</p>
            <div class="support-info">
                <p>Emergency Security Hotline: Available 24/7</p>
                <p>Email: {{supportEmail}}</p>
                <p>&copy; {{year}} {{appName}}. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
`;

/**
 * Generate Account Locked Email
 */
export const generateAccountLockedEmail = (context: AccountLockedContext) => {
  const subject = `🔒 Security Alert: Your {{appName}} account has been locked`;
  
  return {
    subject,
    html: accountLockedTemplate,
    context: {
      appName: 'Vardhman Mills',
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      supportEmail: process.env.SUPPORT_EMAIL || 'security@vardhmanmills.com',
      year: new Date().getFullYear(),
      ...context,
    },
  };
};

/**
 * Account Locked Email Configuration
 */
export const accountLockedConfig = {
  templateName: 'account_locked',
  subject: '🔒 Security Alert: Your {{appName}} account has been locked',
  priority: 'high' as const,
  category: 'security',
  description: 'Security notification when user account is locked',
  requiredContext: [
    'user.name', 
    'user.email', 
    'security.reason', 
    'security.lockedAt', 
    'security.unlockProcess'
  ],
  optionalContext: [
    'user.firstName',
    'user.lastName',
    'security.unlockDate',
    'security.ip',
    'security.location',
    'security.device',
    'security.attemptCount',
    'unlock.token',
    'unlock.expiresAt',
    'unlock.automaticUnlockHours'
  ],
  triggers: ['account.locked', 'security.breach', 'multiple.failed.attempts'],
  urgent: true,
  deliveryMethod: 'immediate',
};

export default {
  template: accountLockedTemplate,
  generate: generateAccountLockedEmail,
  config: accountLockedConfig,
};