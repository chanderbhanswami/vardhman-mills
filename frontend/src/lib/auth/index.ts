/**
 * Comprehensive Auth Integration
 * Main integration file that combines all authentication features
 */

// Core auth exports
export * from './types';
export * from './jwt';
export * from './oauth';
export * from './providers';
export * from './callbacks';
export * from './session';
export * from './nextauth.config';
export * from './auth';

// Enhanced features exports
export * from './otp';
export * from './recaptcha';
export * from './newsletter';
export * from './email-templates';

// Component exports
export { TermsModal, TermsCheckbox, useTermsModal } from '../../components/modals/TermsModal';
export { PrivacyModal, PrivacyCheckbox, usePrivacyModal } from '../../components/modals/PrivacyModal';
export { NewsletterCheckbox, NewsletterForm } from '../../components/auth/NewsletterCheckbox';

// Re-export NextAuth types and functions
export type { 
  NextAuthOptions,
  Session as NextAuthSession,
  User as NextAuthUser,
  Account as NextAuthAccount,
  Profile as NextAuthProfile,
} from 'next-auth';

export { getServerSession } from 'next-auth/next';
export { signIn, signOut, useSession } from 'next-auth/react';

/**
 * Complete Auth System Configuration
 * All-in-one configuration for the authentication system
 */
export interface CompleteAuthConfig {
  // NextAuth configuration
  nextAuth: {
    secret: string;
    pages?: {
      signIn?: string;
      signUp?: string;
      error?: string;
      verifyRequest?: string;
      newUser?: string;
    };
  };

  // Database configuration
  database: {
    url: string;
    type: 'mongodb' | 'postgresql' | 'mysql';
  };

  // OAuth providers
  oauth: {
    google?: {
      clientId: string;
      clientSecret: string;
    };
    facebook?: {
      clientId: string;
      clientSecret: string;
    };
    github?: {
      clientId: string;
      clientSecret: string;
    };
    linkedin?: {
      clientId: string;
      clientSecret: string;
    };
  };

  // Email configuration
  email: {
    from: string;
    smtp?: {
      host: string;
      port: number;
      auth: {
        user: string;
        pass: string;
      };
    };
    apiKey?: string; // For services like SendGrid
  };

  // reCAPTCHA configuration
  recaptcha: {
    siteKey: string;
    secretKey: string;
    enabled: boolean;
  };

  // OTP configuration
  otp: {
    enabled: boolean;
    expiryMinutes: number;
    maxAttempts: number;
  };

  // Newsletter configuration
  newsletter: {
    enabled: boolean;
    confirmationRequired: boolean;
  };

  // Security configuration
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    passwordMinLength: number;
  };

  // Company/Brand configuration
  brand: {
    name: string;
    logo: string;
    website: string;
    supportEmail: string;
    primaryColor: string;
  };
}

/**
 * Authentication System Status
 */
export interface AuthSystemStatus {
  isConfigured: boolean;
  enabledFeatures: {
    nextAuth: boolean;
    otp: boolean;
    recaptcha: boolean;
    newsletter: boolean;
    socialAuth: string[];
  };
  requiredEnvVars: {
    missing: string[];
    present: string[];
  };
  systemHealth: 'healthy' | 'warning' | 'error';
  lastChecked: Date;
}

/**
 * Complete Auth System Manager
 */
export class CompleteAuthSystem {
  private static instance: CompleteAuthSystem;
  private config: Partial<CompleteAuthConfig> = {};
  private status: AuthSystemStatus = {
    isConfigured: false,
    enabledFeatures: {
      nextAuth: false,
      otp: false,
      recaptcha: false,
      newsletter: false,
      socialAuth: [],
    },
    requiredEnvVars: {
      missing: [],
      present: [],
    },
    systemHealth: 'error',
    lastChecked: new Date(),
  };

  private constructor() {
    this.initializeFromEnv();
  }

  public static getInstance(): CompleteAuthSystem {
    if (!CompleteAuthSystem.instance) {
      CompleteAuthSystem.instance = new CompleteAuthSystem();
    }
    return CompleteAuthSystem.instance;
  }

  /**
   * Initialize configuration from environment variables
   */
  private initializeFromEnv(): void {
    const requiredEnvVars = [
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'DATABASE_URL',
    ];

    const optionalEnvVars = [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'FACEBOOK_CLIENT_ID',
      'FACEBOOK_CLIENT_SECRET',
      'GITHUB_CLIENT_ID',
      'GITHUB_CLIENT_SECRET',
      'LINKEDIN_CLIENT_ID',
      'LINKEDIN_CLIENT_SECRET',
      'NEXT_PUBLIC_RECAPTCHA_SITE_KEY',
      'RECAPTCHA_SECRET_KEY',
      'SMTP_HOST',
      'SMTP_PORT',
      'SMTP_USER',
      'SMTP_PASS',
      'SENDGRID_API_KEY',
    ];

    const missing: string[] = [];
    const present: string[] = [];

    // Check required environment variables
    requiredEnvVars.forEach(envVar => {
      if (process.env[envVar]) {
        present.push(envVar);
      } else {
        missing.push(envVar);
      }
    });

    // Check optional environment variables
    optionalEnvVars.forEach(envVar => {
      if (process.env[envVar]) {
        present.push(envVar);
      }
    });

    this.status.requiredEnvVars = { missing, present };
    this.status.isConfigured = missing.length === 0;

    // Update feature status
    this.updateFeatureStatus();
    
    // Determine system health
    if (missing.length === 0) {
      this.status.systemHealth = 'healthy';
    } else if (missing.some(env => requiredEnvVars.includes(env))) {
      this.status.systemHealth = 'error';
    } else {
      this.status.systemHealth = 'warning';
    }

    this.status.lastChecked = new Date();
  }

  /**
   * Update enabled features status
   */
  private updateFeatureStatus(): void {
    this.status.enabledFeatures = {
      nextAuth: !!(process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_URL),
      otp: true, // OTP is always available
      recaptcha: !!(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && process.env.RECAPTCHA_SECRET_KEY),
      newsletter: true, // Newsletter is always available
      socialAuth: this.getEnabledSocialProviders(),
    };
  }

  /**
   * Get enabled social auth providers
   */
  private getEnabledSocialProviders(): string[] {
    const providers: string[] = [];

    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      providers.push('google');
    }
    if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
      providers.push('facebook');
    }
    if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
      providers.push('github');
    }
    if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
      providers.push('linkedin');
    }

    return providers;
  }

  /**
   * Get current system status
   */
  getStatus(): AuthSystemStatus {
    return { ...this.status };
  }

  /**
   * Get system configuration
   */
  getConfig(): Partial<CompleteAuthConfig> {
    return { ...this.config };
  }

  /**
   * Update system configuration
   */
  updateConfig(config: Partial<CompleteAuthConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Validate system configuration
   */
  validateConfig(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required configuration
    if (!process.env.NEXTAUTH_SECRET) {
      errors.push('NEXTAUTH_SECRET is required');
    }

    if (!process.env.NEXTAUTH_URL) {
      errors.push('NEXTAUTH_URL is required');
    }

    if (!process.env.DATABASE_URL) {
      errors.push('DATABASE_URL is required');
    }

    // Check optional but recommended configuration
    if (!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || !process.env.RECAPTCHA_SECRET_KEY) {
      warnings.push('reCAPTCHA configuration is missing - forms may be vulnerable to spam');
    }

    if (this.getEnabledSocialProviders().length === 0) {
      warnings.push('No social auth providers configured - users can only use email/password');
    }

    if (!process.env.SMTP_HOST && !process.env.SENDGRID_API_KEY) {
      warnings.push('Email service not configured - email features will not work');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Generate setup report
   */
  generateSetupReport(): {
    status: AuthSystemStatus;
    validation: ReturnType<CompleteAuthSystem['validateConfig']>;
    recommendations: string[];
    nextSteps: string[];
  } {
    const validation = this.validateConfig();
    const recommendations: string[] = [];
    const nextSteps: string[] = [];

    // Generate recommendations
    if (!this.status.enabledFeatures.recaptcha) {
      recommendations.push('Enable reCAPTCHA to prevent spam and bot attacks');
    }

    if (this.status.enabledFeatures.socialAuth.length < 2) {
      recommendations.push('Configure multiple social auth providers for better user experience');
    }

    if (!process.env.SMTP_HOST && !process.env.SENDGRID_API_KEY) {
      recommendations.push('Configure email service for OTP, password reset, and notifications');
    }

    // Generate next steps
    if (validation.errors.length > 0) {
      nextSteps.push('Fix configuration errors to enable basic authentication');
    }

    if (validation.warnings.length > 0) {
      nextSteps.push('Address configuration warnings to improve security and user experience');
    }

    if (this.status.systemHealth === 'healthy') {
      nextSteps.push('System is ready for production use');
      nextSteps.push('Consider implementing additional security measures (rate limiting, monitoring)');
    }

    return {
      status: this.getStatus(),
      validation,
      recommendations,
      nextSteps,
    };
  }

  /**
   * Get system health check
   */
  async healthCheck(): Promise<{
    overall: 'healthy' | 'warning' | 'error';
    checks: {
      name: string;
      status: 'pass' | 'warn' | 'fail';
      message: string;
    }[];
  }> {
    const checks: {
      name: string;
      status: 'pass' | 'warn' | 'fail';
      message: string;
    }[] = [];

    // Check NextAuth configuration
    checks.push({
      name: 'NextAuth Configuration',
      status: this.status.enabledFeatures.nextAuth ? 'pass' as const : 'fail' as const,
      message: this.status.enabledFeatures.nextAuth 
        ? 'NextAuth is properly configured' 
        : 'NextAuth configuration is missing',
    });

    // Check database connection (simplified check)
    checks.push({
      name: 'Database Configuration',
      status: process.env.DATABASE_URL ? 'pass' as const : 'fail' as const,
      message: process.env.DATABASE_URL 
        ? 'Database URL is configured' 
        : 'Database URL is missing',
    });

    // Check reCAPTCHA
    checks.push({
      name: 'reCAPTCHA Configuration',
      status: this.status.enabledFeatures.recaptcha ? 'pass' as const : 'warn' as const,
      message: this.status.enabledFeatures.recaptcha 
        ? 'reCAPTCHA is configured' 
        : 'reCAPTCHA is not configured (recommended for security)',
    });

    // Check social auth providers
    const socialProviders = this.status.enabledFeatures.socialAuth.length;
    checks.push({
      name: 'Social Authentication',
      status: socialProviders > 0 ? 'pass' as const : 'warn' as const,
      message: socialProviders > 0 
        ? `${socialProviders} social auth provider(s) configured` 
        : 'No social auth providers configured',
    });

    // Determine overall status
    const failCount = checks.filter(check => check.status === 'fail').length;
    const warnCount = checks.filter(check => check.status === 'warn').length;

    let overall: 'healthy' | 'warning' | 'error';
    if (failCount > 0) {
      overall = 'error';
    } else if (warnCount > 0) {
      overall = 'warning';
    } else {
      overall = 'healthy';
    }

    return { overall, checks };
  }
}

// Export singleton instance
export const completeAuthSystem = CompleteAuthSystem.getInstance();

/**
 * Helper functions for common auth operations
 */
export const AuthHelpers = {
  /**
   * Get system status
   */
  getSystemStatus: () => completeAuthSystem.getStatus(),

  /**
   * Validate auth system
   */
  validateSystem: () => completeAuthSystem.validateConfig(),

  /**
   * Generate setup report
   */
  generateSetupReport: () => completeAuthSystem.generateSetupReport(),

  /**
   * Perform health check
   */
  healthCheck: () => completeAuthSystem.healthCheck(),

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled: (feature: keyof AuthSystemStatus['enabledFeatures']): boolean => {
    const status = completeAuthSystem.getStatus();
    const featureStatus = status.enabledFeatures[feature];
    return Array.isArray(featureStatus) ? featureStatus.length > 0 : !!featureStatus;
  },

  /**
   * Get missing environment variables
   */
  getMissingEnvVars: (): string[] => {
    const status = completeAuthSystem.getStatus();
    return status.requiredEnvVars.missing;
  },

  /**
   * Check if system is ready for production
   */
  isProductionReady: (): boolean => {
    const status = completeAuthSystem.getStatus();
    return status.systemHealth === 'healthy' && status.isConfigured;
  },
};

export default CompleteAuthSystem;