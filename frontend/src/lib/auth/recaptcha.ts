/**
 * reCAPTCHA v3 Integration Service
 * Provides client-side and server-side reCAPTCHA validation
 */

/**
 * reCAPTCHA Configuration
 */
const RECAPTCHA_CONFIG = {
  siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
  secretKey: process.env.RECAPTCHA_SECRET_KEY || '',
  minScore: 0.5, // Minimum score for human verification
  actions: {
    login: 'login',
    register: 'register',
    forgot_password: 'forgot_password',
    contact_form: 'contact_form',
    newsletter: 'newsletter',
  } as const,
};

/**
 * reCAPTCHA Response Interface
 */
export interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

/**
 * reCAPTCHA Verification Result
 */
export interface RecaptchaVerificationResult {
  success: boolean;
  score: number;
  action: string;
  isHuman: boolean;
  errors?: string[];
}

/**
 * reCAPTCHA Action Type
 */
export type RecaptchaAction = keyof typeof RECAPTCHA_CONFIG.actions;

/**
 * Load reCAPTCHA script
 */
export function loadRecaptchaScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('reCAPTCHA can only be loaded in browser environment'));
      return;
    }

    // Check if already loaded
    if (window.grecaptcha) {
      resolve();
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="recaptcha"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load reCAPTCHA script')));
      return;
    }

    // Create and load script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_CONFIG.siteKey}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // Wait for grecaptcha to be ready
      if (window.grecaptcha && window.grecaptcha.ready) {
        window.grecaptcha.ready(() => {
          resolve();
        });
      } else {
        reject(new Error('reCAPTCHA failed to initialize'));
      }
    };

    script.onerror = () => {
      reject(new Error('Failed to load reCAPTCHA script'));
    };

    document.head.appendChild(script);
  });
}

/**
 * Execute reCAPTCHA
 */
export async function executeRecaptcha(action: RecaptchaAction): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('reCAPTCHA can only be executed in browser environment');
  }

  if (!RECAPTCHA_CONFIG.siteKey) {
    throw new Error('reCAPTCHA site key is not configured');
  }

  try {
    // Ensure reCAPTCHA is loaded
    await loadRecaptchaScript();

    if (!window.grecaptcha || !window.grecaptcha.execute) {
      throw new Error('reCAPTCHA is not available');
    }

    // Execute reCAPTCHA
    const token = await window.grecaptcha.execute(RECAPTCHA_CONFIG.siteKey, {
      action: RECAPTCHA_CONFIG.actions[action],
    });

    if (!token) {
      throw new Error('Failed to get reCAPTCHA token');
    }

    return token;
  } catch (error) {
    console.error('reCAPTCHA execution error:', error);
    throw error;
  }
}

/**
 * Verify reCAPTCHA token on server side
 */
export async function verifyRecaptchaToken(
  token: string,
  expectedAction?: string,
  userIP?: string
): Promise<RecaptchaVerificationResult> {
  if (!RECAPTCHA_CONFIG.secretKey) {
    throw new Error('reCAPTCHA secret key is not configured');
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: RECAPTCHA_CONFIG.secretKey,
        response: token,
        ...(userIP && { remoteip: userIP }),
      }),
    });

    if (!response.ok) {
      throw new Error('reCAPTCHA verification request failed');
    }

    const data: RecaptchaResponse = await response.json();

    const result: RecaptchaVerificationResult = {
      success: data.success,
      score: data.score || 0,
      action: data.action || '',
      isHuman: data.success && (data.score || 0) >= RECAPTCHA_CONFIG.minScore,
      errors: data['error-codes'],
    };

    // Validate action if expected
    if (expectedAction && data.action !== expectedAction) {
      result.success = false;
      result.isHuman = false;
      result.errors = [...(result.errors || []), 'action-mismatch'];
    }

    return result;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return {
      success: false,
      score: 0,
      action: '',
      isHuman: false,
      errors: ['verification-failed'],
    };
  }
}

/**
 * reCAPTCHA Service Class
 */
export class RecaptchaService {
  private static instance: RecaptchaService;
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): RecaptchaService {
    if (!RecaptchaService.instance) {
      RecaptchaService.instance = new RecaptchaService();
    }
    return RecaptchaService.instance;
  }

  /**
   * Initialize reCAPTCHA
   */
  async initialize(): Promise<void> {
    if (this.isLoaded) return;

    if (this.loadPromise) {
      await this.loadPromise;
      return;
    }

    this.loadPromise = loadRecaptchaScript();
    
    try {
      await this.loadPromise;
      this.isLoaded = true;
    } catch (error) {
      this.loadPromise = null;
      throw error;
    }
  }

  /**
   * Execute reCAPTCHA with automatic initialization
   */
  async execute(action: RecaptchaAction): Promise<string> {
    await this.initialize();
    return executeRecaptcha(action);
  }

  /**
   * Validate form with reCAPTCHA
   */
  async validateForm(action: RecaptchaAction, formData?: Record<string, unknown>): Promise<{
    token: string;
    isValid: boolean;
  }> {
    try {
      const token = await this.execute(action);
      
      // Additional form validation can be added here
      const isValid = this.validateFormData(formData);
      
      return {
        token,
        isValid,
      };
    } catch (error) {
      console.error('Form validation error:', error);
      return {
        token: '',
        isValid: false,
      };
    }
  }

  /**
   * Check if reCAPTCHA is configured
   */
  isConfigured(): boolean {
    return !!(RECAPTCHA_CONFIG.siteKey && RECAPTCHA_CONFIG.secretKey);
  }

  /**
   * Get site key
   */
  getSiteKey(): string {
    return RECAPTCHA_CONFIG.siteKey;
  }

  /**
   * Reset reCAPTCHA
   */
  reset(): void {
    if (typeof window !== 'undefined' && window.grecaptcha && window.grecaptcha.reset) {
      window.grecaptcha.reset();
    }
  }

  /**
   * Basic form data validation
   */
  private validateFormData(formData?: Record<string, unknown>): boolean {
    if (!formData) return true;

    // Add your form validation logic here
    // This is a basic example
    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === 'string' && value.trim() === '') {
        console.warn(`Empty field: ${key}`);
        return false;
      }
    }

    return true;
  }
}

// Export singleton instance
export const recaptchaService = RecaptchaService.getInstance();

/**
 * reCAPTCHA API functions for different actions
 */
export const RecaptchaAPI = {
  /**
   * Validate login form
   */
  async validateLogin(formData: { email: string; password: string }): Promise<{
    token: string;
    isValid: boolean;
  }> {
    return recaptchaService.validateForm('login', formData);
  },

  /**
   * Validate registration form
   */
  async validateRegister(formData: {
    email: string;
    password: string;
    [key: string]: unknown;
  }): Promise<{
    token: string;
    isValid: boolean;
  }> {
    return recaptchaService.validateForm('register', formData);
  },

  /**
   * Validate forgot password form
   */
  async validateForgotPassword(formData: { email: string }): Promise<{
    token: string;
    isValid: boolean;
  }> {
    return recaptchaService.validateForm('forgot_password', formData);
  },

  /**
   * Validate contact form
   */
  async validateContactForm(formData: Record<string, unknown>): Promise<{
    token: string;
    isValid: boolean;
  }> {
    return recaptchaService.validateForm('contact_form', formData);
  },

  /**
   * Validate newsletter subscription
   */
  async validateNewsletter(formData: { email: string }): Promise<{
    token: string;
    isValid: boolean;
  }> {
    return recaptchaService.validateForm('newsletter', formData);
  },
};

/**
 * reCAPTCHA React Hook helper
 */
export function useRecaptcha() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialize = async () => {
    if (isLoaded || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      await recaptchaService.initialize();
      setIsLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reCAPTCHA');
    } finally {
      setIsLoading(false);
    }
  };

  const execute = async (action: RecaptchaAction): Promise<string | null> => {
    try {
      if (!isLoaded) {
        await initialize();
      }
      return await recaptchaService.execute(action);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'reCAPTCHA execution failed');
      return null;
    }
  };

  return {
    isLoaded,
    isLoading,
    error,
    initialize,
    execute,
    reset: recaptchaService.reset.bind(recaptchaService),
  };
}

// Add React import for the hook
function useState<T>(initialState: T): [T, (value: T) => void] {
  // This is a placeholder - in actual React usage, you would import useState from 'react'
  if (typeof window === 'undefined') {
    return [initialState, () => {}];
  }
  
  // Basic state management for non-React environments
  let state = initialState;
  const setState = (newState: T) => {
    state = newState;
  };
  
  return [state, setState];
}

/**
 * Declare global grecaptcha type
 */
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
      reset: () => void;
    };
  }
}