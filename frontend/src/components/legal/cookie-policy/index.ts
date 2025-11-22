// Cookie Policy components barrel exports
export { default as CookiePolicyContent } from './CookiePolicyContent';

// Cookie-specific types and interfaces
export interface CookieCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  enabled: boolean;
  cookies: CookieDetail[];
}

export interface CookieDetail {
  name: string;
  purpose: string;
  provider: string;
  expiry: string;
  type: 'essential' | 'analytics' | 'marketing' | 'functional';
}

export interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp: string;
  version: string;
}

export interface CookiePolicyData {
  lastUpdated: string;
  version: string;
  categories: CookieCategory[];
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
}

// Cookie management utilities
export const getCookieConsent = (): CookieConsent | null => {
  if (typeof window === 'undefined') return null;
  
  const consent = localStorage.getItem('cookieConsent');
  return consent ? JSON.parse(consent) : null;
};

export const setCookieConsent = (consent: Partial<CookieConsent>) => {
  if (typeof window === 'undefined') return;
  
  const fullConsent: CookieConsent = {
    essential: true, // Always true
    analytics: consent.analytics ?? false,
    marketing: consent.marketing ?? false,
    functional: consent.functional ?? false,
    timestamp: new Date().toISOString(),
    version: '1.0'
  };
  
  localStorage.setItem('cookieConsent', JSON.stringify(fullConsent));
  
  // Dispatch custom event for other components to listen
  window.dispatchEvent(new CustomEvent('cookieConsentChanged', { 
    detail: fullConsent 
  }));
};

export const clearCookieConsent = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('cookieConsent');
};

// Cookie utility functions
export const deleteCookie = (name: string, path: string = '/', domain?: string) => {
  let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path};`;
  if (domain) {
    cookieString += ` domain=${domain};`;
  }
  document.cookie = cookieString;
};

export const deleteAllCookies = (exceptions: string[] = ['cookieConsent']) => {
  const cookies = document.cookie.split(';');
  
  cookies.forEach(cookie => {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    
    if (!exceptions.includes(name)) {
      deleteCookie(name);
    }
  });
};

// Default cookie policy data
export const defaultCookiePolicyData: CookiePolicyData = {
  lastUpdated: '2024-10-01',
  version: '1.0',
  categories: [
    {
      id: 'essential',
      name: 'Essential Cookies',
      description: 'These cookies are necessary for the website to function and cannot be switched off.',
      required: true,
      enabled: true,
      cookies: [
        {
          name: 'session_id',
          purpose: 'Maintains user session state',
          provider: 'Vardhman Mills',
          expiry: 'Session',
          type: 'essential'
        },
        {
          name: 'cookieConsent',
          purpose: 'Stores cookie preference settings',
          provider: 'Vardhman Mills',
          expiry: '1 year',
          type: 'essential'
        }
      ]
    },
    {
      id: 'analytics',
      name: 'Analytics Cookies',
      description: 'These cookies help us understand how visitors interact with our website.',
      required: false,
      enabled: false,
      cookies: [
        {
          name: '_ga',
          purpose: 'Google Analytics tracking',
          provider: 'Google',
          expiry: '2 years',
          type: 'analytics'
        },
        {
          name: '_gid',
          purpose: 'Google Analytics session tracking',
          provider: 'Google',
          expiry: '24 hours',
          type: 'analytics'
        }
      ]
    },
    {
      id: 'marketing',
      name: 'Marketing Cookies',
      description: 'These cookies are used to deliver relevant advertisements and track campaign performance.',
      required: false,
      enabled: false,
      cookies: [
        {
          name: '_fbp',
          purpose: 'Facebook Pixel tracking',
          provider: 'Facebook',
          expiry: '3 months',
          type: 'marketing'
        }
      ]
    },
    {
      id: 'functional',
      name: 'Functional Cookies',
      description: 'These cookies enable enhanced functionality and personalization.',
      required: false,
      enabled: false,
      cookies: [
        {
          name: 'language_preference',
          purpose: 'Stores user language preference',
          provider: 'Vardhman Mills',
          expiry: '1 year',
          type: 'functional'
        }
      ]
    }
  ],
  contactInfo: {
    email: 'privacy@vardhmanmills.com',
    phone: '+91-1234-567890',
    address: 'Vardhman Mills Ltd., Mumbai, India'
  }
};
