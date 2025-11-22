/**
 * Cookie Utility Functions
 * Comprehensive client-side cookie management utilities
 */

export interface CookieOptions {
  expires?: Date | number; // Date object or days from now
  maxAge?: number; // seconds
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export interface CookieAttributes {
  name: string;
  value: string;
  expires?: Date;
  maxAge?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Check if we're running in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Set a cookie
 */
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): boolean {
  if (!isBrowser()) return false;

  try {
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    // Handle expires option
    if (options.expires) {
      let expires: Date;
      if (typeof options.expires === 'number') {
        // Number of days from now
        expires = new Date();
        expires.setTime(expires.getTime() + options.expires * 24 * 60 * 60 * 1000);
      } else {
        expires = options.expires;
      }
      cookieString += `; expires=${expires.toUTCString()}`;
    }

    // Handle maxAge option
    if (options.maxAge !== undefined) {
      cookieString += `; max-age=${options.maxAge}`;
    }

    // Handle path option
    if (options.path) {
      cookieString += `; path=${options.path}`;
    }

    // Handle domain option
    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }

    // Handle secure option
    if (options.secure) {
      cookieString += '; secure';
    }

    // Handle httpOnly option (Note: this can't be set via client-side JavaScript)
    if (options.httpOnly) {
      console.warn('httpOnly flag cannot be set via client-side JavaScript');
    }

    // Handle sameSite option
    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }

    document.cookie = cookieString;
    return true;
  } catch (error) {
    console.error('Error setting cookie:', error);
    return false;
  }
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  if (!isBrowser()) return null;

  try {
    const encodedName = encodeURIComponent(name);
    const cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.indexOf(encodedName + '=') === 0) {
        const value = cookie.substring(encodedName.length + 1);
        return decodeURIComponent(value);
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting cookie:', error);
    return null;
  }
}

/**
 * Get all cookies as an object
 */
export function getAllCookies(): Record<string, string> {
  if (!isBrowser()) return {};

  try {
    const cookies: Record<string, string> = {};
    const cookieStrings = document.cookie.split(';');

    cookieStrings.forEach(cookie => {
      const trimmed = cookie.trim();
      if (trimmed) {
        const [encodedName, ...valueParts] = trimmed.split('=');
        const encodedValue = valueParts.join('=');
        if (encodedName && encodedValue !== undefined) {
          try {
            const name = decodeURIComponent(encodedName);
            const value = decodeURIComponent(encodedValue);
            cookies[name] = value;
          } catch (decodeError) {
            console.warn('Error decoding cookie:', encodedName, decodeError);
          }
        }
      }
    });

    return cookies;
  } catch (error) {
    console.error('Error getting all cookies:', error);
    return {};
  }
}

/**
 * Check if a cookie exists
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null;
}

/**
 * Remove a cookie
 */
export function removeCookie(
  name: string,
  options: Pick<CookieOptions, 'path' | 'domain'> = {}
): boolean {
  return setCookie(name, '', {
    ...options,
    expires: new Date(0), // Set expiry to past date
    maxAge: -1
  });
}

/**
 * Set a cookie with JSON value
 */
export function setJSONCookie(
  name: string,
  value: unknown,
  options: CookieOptions = {}
): boolean {
  try {
    const jsonValue = JSON.stringify(value);
    return setCookie(name, jsonValue, options);
  } catch (error) {
    console.error('Error setting JSON cookie:', error);
    return false;
  }
}

/**
 * Get a cookie value and parse as JSON
 */
export function getJSONCookie<T = unknown>(name: string): T | null {
  const value = getCookie(name);
  if (value === null) return null;

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Error parsing JSON cookie:', error);
    return null;
  }
}

/**
 * Set multiple cookies at once
 */
export function setCookies(
  cookies: Array<{ name: string; value: string; options?: CookieOptions }>
): boolean {
  let allSuccessful = true;
  cookies.forEach(({ name, value, options }) => {
    if (!setCookie(name, value, options)) {
      allSuccessful = false;
    }
  });
  return allSuccessful;
}

/**
 * Remove multiple cookies at once
 */
export function removeCookies(
  names: string[],
  options: Pick<CookieOptions, 'path' | 'domain'> = {}
): boolean {
  let allSuccessful = true;
  names.forEach(name => {
    if (!removeCookie(name, options)) {
      allSuccessful = false;
    }
  });
  return allSuccessful;
}

/**
 * Clear all cookies (client-side accessible ones)
 */
export function clearAllCookies(): boolean {
  if (!isBrowser()) return false;

  try {
    const cookies = getAllCookies();
    const names = Object.keys(cookies);
    return removeCookies(names);
  } catch (error) {
    console.error('Error clearing all cookies:', error);
    return false;
  }
}

/**
 * Get cookie size in bytes
 */
export function getCookieSize(name: string): number {
  const value = getCookie(name);
  if (value === null) return 0;
  
  const cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  return new Blob([cookieString]).size;
}

/**
 * Get total size of all cookies
 */
export function getTotalCookieSize(): number {
  if (!isBrowser()) return 0;

  try {
    return new Blob([document.cookie]).size;
  } catch (error) {
    console.error('Error calculating total cookie size:', error);
    return 0;
  }
}

/**
 * Check if cookies are enabled
 */
export function areCookiesEnabled(): boolean {
  if (!isBrowser()) return false;

  try {
    const testName = '__cookietest__';
    const testValue = 'test';
    
    setCookie(testName, testValue);
    const isEnabled = getCookie(testName) === testValue;
    removeCookie(testName);
    
    return isEnabled;
  } catch (error) {
    console.error('Error checking if cookies are enabled:', error);
    return false;
  }
}

/**
 * Set a cookie with automatic expiration
 */
export function setTemporaryCookie(
  name: string,
  value: string,
  minutes: number
): boolean {
  return setCookie(name, value, {
    maxAge: minutes * 60 // Convert minutes to seconds
  });
}

/**
 * Set a session cookie (expires when browser closes)
 */
export function setSessionCookie(name: string, value: string): boolean {
  return setCookie(name, value); // No expires or maxAge = session cookie
}

/**
 * Set a persistent cookie (lasts for specified days)
 */
export function setPersistentCookie(
  name: string,
  value: string,
  days: number
): boolean {
  return setCookie(name, value, {
    expires: days
  });
}

/**
 * Cookie consent management utilities
 */
export const consent = {
  /**
   * Check if user has given consent for cookies
   */
  hasConsent(): boolean {
    return getCookie('cookie_consent') === 'true';
  },

  /**
   * Set cookie consent
   */
  setConsent(granted: boolean): boolean {
    return setPersistentCookie('cookie_consent', granted.toString(), 365);
  },

  /**
   * Get consent categories
   */
  getConsentCategories(): Record<string, boolean> {
    const consent = getJSONCookie<Record<string, boolean>>('cookie_consent_categories');
    return consent || {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    };
  },

  /**
   * Set consent for specific categories
   */
  setConsentCategories(categories: Record<string, boolean>): boolean {
    return setJSONCookie('cookie_consent_categories', categories, {
      expires: 365,
      path: '/',
      sameSite: 'lax'
    });
  },

  /**
   * Check if specific category is consented
   */
  hasConsentFor(category: string): boolean {
    const categories = this.getConsentCategories();
    return categories[category] === true;
  }
};

/**
 * Secure cookie utilities for sensitive data
 */
export const secure = {
  /**
   * Set a secure cookie with recommended security options
   */
  setSecureCookie(
    name: string,
    value: string,
    options: CookieOptions = {}
  ): boolean {
    return setCookie(name, value, {
      ...options,
      secure: true,
      sameSite: 'strict',
      path: '/'
    });
  },

  /**
   * Set an encrypted cookie (simple base64 encoding - use proper encryption in production)
   */
  setEncryptedCookie(
    name: string,
    value: string,
    options: CookieOptions = {}
  ): boolean {
    try {
      const encoded = btoa(value);
      return this.setSecureCookie(name, encoded, options);
    } catch (error) {
      console.error('Error setting encrypted cookie:', error);
      return false;
    }
  },

  /**
   * Get and decrypt a cookie
   */
  getEncryptedCookie(name: string): string | null {
    const encoded = getCookie(name);
    if (!encoded) return null;

    try {
      return atob(encoded);
    } catch (error) {
      console.error('Error decrypting cookie:', error);
      return null;
    }
  }
};

/**
 * Cookie debugging utilities
 */
export const debug = {
  /**
   * Log all cookies to console
   */
  logAllCookies(): void {
    if (!isBrowser()) {
      console.log('Not in browser environment');
      return;
    }

    const cookies = getAllCookies();
    console.table(cookies);
  },

  /**
   * Get detailed cookie information
   */
  getCookieInfo(name: string): CookieAttributes | null {
    const value = getCookie(name);
    if (value === null) return null;

    // Note: We can't get full attributes from document.cookie
    // This is a limitation of the Cookie API
    return {
      name,
      value,
      // Other attributes are not accessible via JavaScript
      path: undefined,
      domain: undefined,
      secure: undefined,
      httpOnly: undefined,
      sameSite: undefined,
      expires: undefined,
      maxAge: undefined
    };
  },

  /**
   * Monitor cookie changes (basic polling approach)
   */
  monitorCookies(
    callback: (changes: { added: string[]; removed: string[]; modified: string[] }) => void,
    interval = 1000
  ): () => void {
    if (!isBrowser()) return () => {};

    let previousCookies = getAllCookies();
    
    const intervalId = setInterval(() => {
      const currentCookies = getAllCookies();
      
      const previousKeys = Object.keys(previousCookies);
      const currentKeys = Object.keys(currentCookies);
      
      const added = currentKeys.filter(key => !previousKeys.includes(key));
      const removed = previousKeys.filter(key => !currentKeys.includes(key));
      const modified = currentKeys.filter(key => 
        previousKeys.includes(key) && previousCookies[key] !== currentCookies[key]
      );
      
      if (added.length > 0 || removed.length > 0 || modified.length > 0) {
        callback({ added, removed, modified });
      }
      
      previousCookies = currentCookies;
    }, interval);

    return () => clearInterval(intervalId);
  }
};

/**
 * Cookie utility for common e-commerce scenarios
 */
export const ecommerce = {
  /**
   * Set user preferences
   */
  setUserPreferences(preferences: Record<string, unknown>): boolean {
    return setJSONCookie('user_preferences', preferences, {
      expires: 365,
      path: '/',
      sameSite: 'lax'
    });
  },

  /**
   * Get user preferences
   */
  getUserPreferences<T = Record<string, unknown>>(): T | null {
    return getJSONCookie<T>('user_preferences');
  },

  /**
   * Set shopping cart ID
   */
  setCartId(cartId: string): boolean {
    return setCookie('cart_id', cartId, {
      expires: 30, // 30 days
      path: '/',
      sameSite: 'lax'
    });
  },

  /**
   * Get shopping cart ID
   */
  getCartId(): string | null {
    return getCookie('cart_id');
  },

  /**
   * Set recently viewed products
   */
  setRecentlyViewed(productIds: string[]): boolean {
    return setJSONCookie('recently_viewed', productIds.slice(0, 10), {
      expires: 30,
      path: '/',
      sameSite: 'lax'
    });
  },

  /**
   * Get recently viewed products
   */
  getRecentlyViewed(): string[] {
    return getJSONCookie<string[]>('recently_viewed') || [];
  },

  /**
   * Add product to recently viewed
   */
  addToRecentlyViewed(productId: string): boolean {
    const current = this.getRecentlyViewed();
    const updated = [productId, ...current.filter(id => id !== productId)].slice(0, 10);
    return this.setRecentlyViewed(updated);
  },

  /**
   * Set user session data
   */
  setSessionData(data: Record<string, unknown>): boolean {
    return setJSONCookie('session_data', data);
  },

  /**
   * Get user session data
   */
  getSessionData<T = Record<string, unknown>>(): T | null {
    return getJSONCookie<T>('session_data');
  }
};

// Export default object with all utilities
const cookieUtils = {
  setCookie,
  getCookie,
  getAllCookies,
  hasCookie,
  removeCookie,
  setJSONCookie,
  getJSONCookie,
  setCookies,
  removeCookies,
  clearAllCookies,
  getCookieSize,
  getTotalCookieSize,
  areCookiesEnabled,
  setTemporaryCookie,
  setSessionCookie,
  setPersistentCookie,
  consent,
  secure,
  debug,
  ecommerce
};

export default cookieUtils;
