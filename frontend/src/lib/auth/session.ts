import { getServerSession } from 'next-auth';
import { authOptions } from './nextauth.config';
import { ExtendedSession, ExtendedUser, UserProfile } from './types';

/**
 * Session Management Utilities
 * Provides functions for handling user sessions and authentication state
 */

/**
 * Get current session on server side
 */
export async function getSession(): Promise<ExtendedSession | null> {
  try {
    const session = await getServerSession(authOptions);
    return session as ExtendedSession | null;
  } catch (error) {
    console.error('Error getting server session:', error);
    return null;
  }
}

/**
 * Get current user from session
 */
export async function getCurrentUser(): Promise<ExtendedUser | null> {
  try {
    const session = await getSession();
    return session?.user || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await getSession();
    return !!session?.user && !session.error;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: string): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return user?.role === role;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
}

/**
 * Check if user has specific permission
 */
export async function hasPermission(permission: string): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return user?.permissions?.includes(permission) || false;
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
}

/**
 * Check if user has any of the specified permissions
 */
export async function hasAnyPermission(permissions: string[]): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user?.permissions) return false;
    
    return permissions.some(permission => 
      user.permissions?.includes(permission)
    );
  } catch (error) {
    console.error('Error checking user permissions:', error);
    return false;
  }
}

/**
 * Check if user has all specified permissions
 */
export async function hasAllPermissions(permissions: string[]): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user?.permissions) return false;
    
    return permissions.every(permission => 
      user.permissions?.includes(permission)
    );
  } catch (error) {
    console.error('Error checking user permissions:', error);
    return false;
  }
}

/**
 * Get user profile information
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const user = await getCurrentUser();
    return user?.profile || null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Check if session is valid and not expired
 */
export function isSessionValid(session: ExtendedSession | null): boolean {
  if (!session || !session.user) return false;
  
  // Check if session has error
  if (session.error) return false;
  
  // Check if session is expired
  const now = new Date();
  const expires = new Date(session.expires);
  
  return now < expires;
}

/**
 * Check if user is verified
 */
export async function isUserVerified(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return user?.isVerified || false;
  } catch (error) {
    console.error('Error checking user verification:', error);
    return false;
  }
}

/**
 * Get user's authentication provider
 */
export async function getAuthProvider(): Promise<string | null> {
  try {
    const user = await getCurrentUser();
    return user?.provider || null;
  } catch (error) {
    console.error('Error getting auth provider:', error);
    return null;
  }
}

/**
 * Session refresh helper
 */
export async function refreshSession(): Promise<ExtendedSession | null> {
  try {
    // This would typically trigger a token refresh
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      return null;
    }
    
    const session = await response.json();
    return session;
  } catch (error) {
    console.error('Error refreshing session:', error);
    return null;
  }
}

/**
 * Session storage utilities for client-side
 */
export const SessionStorage = {
  /**
   * Get session from localStorage (client-side only)
   */
  getLocalSession(): ExtendedSession | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const sessionData = localStorage.getItem('nextauth.session');
      if (!sessionData) return null;
      
      const session = JSON.parse(sessionData);
      return isSessionValid(session) ? session : null;
    } catch (error) {
      console.error('Error getting local session:', error);
      return null;
    }
  },

  /**
   * Set session in localStorage (client-side only)
   */
  setLocalSession(session: ExtendedSession): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('nextauth.session', JSON.stringify(session));
    } catch (error) {
      console.error('Error setting local session:', error);
    }
  },

  /**
   * Remove session from localStorage (client-side only)
   */
  removeLocalSession(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem('nextauth.session');
    } catch (error) {
      console.error('Error removing local session:', error);
    }
  },

  /**
   * Clear all session data (client-side only)
   */
  clearAllSessionData(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Remove NextAuth session data
      localStorage.removeItem('nextauth.session');
      localStorage.removeItem('nextauth.message');
      
      // Remove session storage data
      sessionStorage.removeItem('nextauth.session');
      sessionStorage.removeItem('nextauth.message');
      
      // Clear cookies (basic approach)
      document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        if (name.trim().startsWith('next-auth')) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      });
    } catch (error) {
      console.error('Error clearing session data:', error);
    }
  }
};

/**
 * Role-based access control helpers
 */
export const RBAC = {
  /**
   * Check if user is admin
   */
  async isAdmin(): Promise<boolean> {
    return await hasRole('admin');
  },

  /**
   * Check if user is manager
   */
  async isManager(): Promise<boolean> {
    return await hasRole('manager');
  },

  /**
   * Check if user is regular user
   */
  async isUser(): Promise<boolean> {
    return await hasRole('user');
  },

  /**
   * Check if user has admin or manager role
   */
  async isAdminOrManager(): Promise<boolean> {
    const user = await getCurrentUser();
    return user?.role === 'admin' || user?.role === 'manager';
  },

  /**
   * Get user permissions
   */
  async getUserPermissions(): Promise<string[]> {
    const user = await getCurrentUser();
    return user?.permissions || [];
  },

  /**
   * Check if user can perform action
   */
  async canPerformAction(action: string): Promise<boolean> {
    const permissions = await this.getUserPermissions();
    return permissions.includes(action) || permissions.includes('*');
  }
};

/**
 * Session event handlers
 */
export const SessionEvents = {
  /**
   * Handle session expiry
   */
  onSessionExpired: (callback: () => void): void => {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('session:expired', callback);
  },

  /**
   * Handle session refresh
   */
  onSessionRefreshed: (callback: (session: ExtendedSession) => void): void => {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('session:refreshed', (event: Event) => {
      const customEvent = event as CustomEvent<ExtendedSession>;
      callback(customEvent.detail);
    });
  },

  /**
   * Emit session expired event
   */
  emitSessionExpired: (): void => {
    if (typeof window === 'undefined') return;
    
    window.dispatchEvent(new CustomEvent('session:expired'));
  },

  /**
   * Emit session refreshed event
   */
  emitSessionRefreshed: (session: ExtendedSession): void => {
    if (typeof window === 'undefined') return;
    
    window.dispatchEvent(new CustomEvent('session:refreshed', {
      detail: session
    }));
  }
};

/**
 * Session monitoring
 */
export class SessionMonitor {
  private checkInterval: NodeJS.Timeout | null = null;
  private warningInterval: NodeJS.Timeout | null = null;

  /**
   * Start monitoring session
   */
  start(options: {
    checkInterval?: number;
    warningTime?: number;
    onExpired?: () => void;
    onWarning?: (timeLeft: number) => void;
  } = {}): void {
    const {
      checkInterval = 60000, // 1 minute
      warningTime = 300000, // 5 minutes
      onExpired,
      onWarning
    } = options;

    this.stop(); // Stop any existing monitoring

    this.checkInterval = setInterval(async () => {
      const session = await getSession();
      
      if (!session || !isSessionValid(session)) {
        this.stop();
        onExpired?.();
        SessionEvents.emitSessionExpired();
        return;
      }

      // Check if session is about to expire
      const now = new Date().getTime();
      const expires = new Date(session.expires).getTime();
      const timeLeft = expires - now;

      if (timeLeft <= warningTime && timeLeft > 0) {
        onWarning?.(timeLeft);
      }
    }, checkInterval);
  }

  /**
   * Stop monitoring session
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    if (this.warningInterval) {
      clearInterval(this.warningInterval);
      this.warningInterval = null;
    }
  }
}

// Export a default session monitor instance
export const sessionMonitor = new SessionMonitor();
