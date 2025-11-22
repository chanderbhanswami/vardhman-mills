import { ExtendedUser } from './types';

/**
 * OTP Configuration
 */
const OTP_CONFIG = {
  length: 6,
  expiryMinutes: 10,
  maxAttempts: 3,
  resendCooldown: 60, // seconds
};

/**
 * OTP Types
 */
export type OTPType = 'email_verification' | 'password_reset' | 'login' | 'two_factor';

/**
 * OTP Data Interface
 */
export interface OTPData {
  email: string;
  code: string;
  type: OTPType;
  attempts: number;
  expiresAt: Date;
  createdAt: Date;
  isUsed: boolean;
}

/**
 * OTP Response Interface
 */
export interface OTPResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
    expiresAt: Date;
    canResendAt?: Date;
  };
  error?: string;
}

/**
 * OTP Verification Response
 */
export interface OTPVerificationResponse {
  success: boolean;
  message: string;
  data?: {
    user?: ExtendedUser;
    token?: string;
    refreshToken?: string;
  };
  error?: string;
}

/**
 * Generate OTP code
 */
export function generateOTPCode(): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < OTP_CONFIG.length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

/**
 * Generate secure OTP with crypto
 */
export function generateSecureOTP(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(OTP_CONFIG.length);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => (byte % 10).toString()).join('');
  }
  
  // Fallback for Node.js
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require('crypto');
    const bytes = crypto.randomBytes(OTP_CONFIG.length);
    return Array.from(bytes, (byte: number) => (byte % 10).toString()).join('');
  } catch {
    return generateOTPCode();
  }
}

/**
 * Validate OTP format
 */
export function isValidOTPFormat(otp: string): boolean {
  const otpRegex = new RegExp(`^\\d{${OTP_CONFIG.length}}$`);
  return otpRegex.test(otp);
}

/**
 * OTP Service Class
 */
export class OTPService {
  private static instance: OTPService;
  private otpStore: Map<string, OTPData> = new Map();

  private constructor() {}

  public static getInstance(): OTPService {
    if (!OTPService.instance) {
      OTPService.instance = new OTPService();
    }
    return OTPService.instance;
  }

  /**
   * Generate and send OTP
   */
  async sendOTP(email: string, type: OTPType): Promise<OTPResponse> {
    try {
      // Check if there's a recent OTP request
      const existingKey = this.getStorageKey(email, type);
      const existingOTP = this.otpStore.get(existingKey);
      
      if (existingOTP && !this.canResendOTP(existingOTP)) {
        const canResendAt = new Date(existingOTP.createdAt.getTime() + OTP_CONFIG.resendCooldown * 1000);
        return {
          success: false,
          message: `Please wait before requesting another OTP. You can resend at ${canResendAt.toLocaleTimeString()}`,
          data: {
            email,
            expiresAt: existingOTP.expiresAt,
            canResendAt,
          },
        };
      }

      // Generate new OTP
      const code = generateSecureOTP();
      const expiresAt = new Date(Date.now() + OTP_CONFIG.expiryMinutes * 60 * 1000);
      
      const otpData: OTPData = {
        email,
        code,
        type,
        attempts: 0,
        expiresAt,
        createdAt: new Date(),
        isUsed: false,
      };

      // Store OTP
      this.otpStore.set(existingKey, otpData);

      // Send OTP via email
      const emailSent = await this.sendOTPEmail(email, code, type);
      
      if (!emailSent) {
        this.otpStore.delete(existingKey);
        return {
          success: false,
          message: 'Failed to send OTP email. Please try again.',
          error: 'EMAIL_SEND_FAILED',
        };
      }

      return {
        success: true,
        message: `OTP sent successfully to ${this.maskEmail(email)}`,
        data: {
          email: this.maskEmail(email),
          expiresAt,
        },
      };
    } catch (error) {
      console.error('OTP send error:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.',
        error: 'OTP_SEND_FAILED',
      };
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(email: string, code: string, type: OTPType): Promise<OTPVerificationResponse> {
    try {
      if (!isValidOTPFormat(code)) {
        return {
          success: false,
          message: `OTP must be ${OTP_CONFIG.length} digits`,
          error: 'INVALID_OTP_FORMAT',
        };
      }

      const storageKey = this.getStorageKey(email, type);
      const otpData = this.otpStore.get(storageKey);

      if (!otpData) {
        return {
          success: false,
          message: 'OTP not found or expired. Please request a new one.',
          error: 'OTP_NOT_FOUND',
        };
      }

      if (otpData.isUsed) {
        return {
          success: false,
          message: 'OTP has already been used. Please request a new one.',
          error: 'OTP_ALREADY_USED',
        };
      }

      if (new Date() > otpData.expiresAt) {
        this.otpStore.delete(storageKey);
        return {
          success: false,
          message: 'OTP has expired. Please request a new one.',
          error: 'OTP_EXPIRED',
        };
      }

      if (otpData.attempts >= OTP_CONFIG.maxAttempts) {
        this.otpStore.delete(storageKey);
        return {
          success: false,
          message: 'Maximum OTP attempts reached. Please request a new one.',
          error: 'MAX_ATTEMPTS_REACHED',
        };
      }

      // Increment attempts
      otpData.attempts++;

      if (otpData.code !== code) {
        this.otpStore.set(storageKey, otpData);
        const remainingAttempts = OTP_CONFIG.maxAttempts - otpData.attempts;
        return {
          success: false,
          message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
          error: 'INVALID_OTP',
        };
      }

      // Mark as used
      otpData.isUsed = true;
      this.otpStore.set(storageKey, otpData);

      // Handle different OTP types
      const result = await this.handleOTPVerification(email, type);
      
      // Clean up used OTP
      setTimeout(() => {
        this.otpStore.delete(storageKey);
      }, 5000);

      return result;
    } catch (error) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        message: 'Failed to verify OTP. Please try again.',
        error: 'OTP_VERIFICATION_FAILED',
      };
    }
  }

  /**
   * Resend OTP
   */
  async resendOTP(email: string, type: OTPType): Promise<OTPResponse> {
    const storageKey = this.getStorageKey(email, type);
    const existingOTP = this.otpStore.get(storageKey);
    
    if (existingOTP) {
      this.otpStore.delete(storageKey);
    }
    
    return this.sendOTP(email, type);
  }

  /**
   * Clean expired OTPs
   */
  cleanExpiredOTPs(): void {
    const now = new Date();
    this.otpStore.forEach((otpData, key) => {
      if (now > otpData.expiresAt) {
        this.otpStore.delete(key);
      }
    });
  }

  /**
   * Get storage key for OTP
   */
  private getStorageKey(email: string, type: OTPType): string {
    return `${email}:${type}`;
  }

  /**
   * Check if OTP can be resent
   */
  private canResendOTP(otpData: OTPData): boolean {
    const now = new Date();
    const canResendAt = new Date(otpData.createdAt.getTime() + OTP_CONFIG.resendCooldown * 1000);
    return now >= canResendAt;
  }

  /**
   * Mask email for display
   */
  private maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    const maskedUsername = username.length > 2 
      ? `${username[0]}${'*'.repeat(username.length - 2)}${username[username.length - 1]}`
      : `${username[0]}*`;
    return `${maskedUsername}@${domain}`;
  }

  /**
   * Send OTP via email
   */
  private async sendOTPEmail(email: string, code: string, type: OTPType): Promise<boolean> {
    try {
      const subject = this.getEmailSubject(type);
      const template = this.getEmailTemplate(code, type);

      const response = await fetch('/api/auth/send-otp-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          subject,
          template,
          code,
          type,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  }

  /**
   * Get email subject based on type
   */
  private getEmailSubject(type: OTPType): string {
    const subjects = {
      email_verification: 'Verify Your Email Address',
      password_reset: 'Reset Your Password',
      login: 'Your Login Verification Code',
      two_factor: 'Two-Factor Authentication Code',
    };
    return subjects[type];
  }

  /**
   * Get email template based on type
   */
  private getEmailTemplate(code: string, type: OTPType): string {
    const templates = {
      email_verification: `
        <h2>Verify Your Email Address</h2>
        <p>Thank you for signing up! Please use the following verification code to verify your email address:</p>
        <div style="font-size: 24px; font-weight: bold; padding: 20px; background: #f5f5f5; text-align: center; margin: 20px 0;">
          ${code}
        </div>
        <p>This code will expire in ${OTP_CONFIG.expiryMinutes} minutes.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
      `,
      password_reset: `
        <h2>Reset Your Password</h2>
        <p>You requested to reset your password. Please use the following code to proceed:</p>
        <div style="font-size: 24px; font-weight: bold; padding: 20px; background: #f5f5f5; text-align: center; margin: 20px 0;">
          ${code}
        </div>
        <p>This code will expire in ${OTP_CONFIG.expiryMinutes} minutes.</p>
        <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
      `,
      login: `
        <h2>Login Verification Code</h2>
        <p>Please use the following code to complete your login:</p>
        <div style="font-size: 24px; font-weight: bold; padding: 20px; background: #f5f5f5; text-align: center; margin: 20px 0;">
          ${code}
        </div>
        <p>This code will expire in ${OTP_CONFIG.expiryMinutes} minutes.</p>
        <p>If you didn't try to login, please secure your account immediately.</p>
      `,
      two_factor: `
        <h2>Two-Factor Authentication</h2>
        <p>Your two-factor authentication code is:</p>
        <div style="font-size: 24px; font-weight: bold; padding: 20px; background: #f5f5f5; text-align: center; margin: 20px 0;">
          ${code}
        </div>
        <p>This code will expire in ${OTP_CONFIG.expiryMinutes} minutes.</p>
      `,
    };
    return templates[type];
  }

  /**
   * Handle OTP verification based on type
   */
  private async handleOTPVerification(email: string, type: OTPType): Promise<OTPVerificationResponse> {
    try {
      const response = await fetch('/api/auth/handle-otp-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, type }),
      });

      if (!response.ok) {
        throw new Error('Verification handling failed');
      }

      const data = await response.json();
      return {
        success: true,
        message: 'OTP verified successfully',
        data: data,
      };
    } catch (error) {
      console.error('OTP verification handling error:', error);
      return {
        success: false,
        message: 'OTP verified but failed to complete the process',
        error: 'VERIFICATION_HANDLING_FAILED',
      };
    }
  }
}

// Export singleton instance
export const otpService = OTPService.getInstance();

// Cleanup expired OTPs every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    otpService.cleanExpiredOTPs();
  }, 5 * 60 * 1000);
}

/**
 * OTP API functions
 */
export const OTPAPI = {
  /**
   * Send email verification OTP
   */
  async sendEmailVerificationOTP(email: string): Promise<OTPResponse> {
    return otpService.sendOTP(email, 'email_verification');
  },

  /**
   * Send password reset OTP
   */
  async sendPasswordResetOTP(email: string): Promise<OTPResponse> {
    return otpService.sendOTP(email, 'password_reset');
  },

  /**
   * Send login OTP
   */
  async sendLoginOTP(email: string): Promise<OTPResponse> {
    return otpService.sendOTP(email, 'login');
  },

  /**
   * Verify email with OTP
   */
  async verifyEmailOTP(email: string, code: string): Promise<OTPVerificationResponse> {
    return otpService.verifyOTP(email, code, 'email_verification');
  },

  /**
   * Verify password reset OTP
   */
  async verifyPasswordResetOTP(email: string, code: string): Promise<OTPVerificationResponse> {
    return otpService.verifyOTP(email, code, 'password_reset');
  },

  /**
   * Verify login OTP
   */
  async verifyLoginOTP(email: string, code: string): Promise<OTPVerificationResponse> {
    return otpService.verifyOTP(email, code, 'login');
  },

  /**
   * Resend OTP
   */
  async resendOTP(email: string, type: OTPType): Promise<OTPResponse> {
    return otpService.resendOTP(email, type);
  },
};