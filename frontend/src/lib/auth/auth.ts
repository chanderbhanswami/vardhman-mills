import { getServerSession } from 'next-auth';
import { authOptions } from './nextauth.config';
import { ExtendedSession, ExtendedUser, LoginCredentials, RegisterData, AuthResponse } from './types';

/**
 * Server-side authentication utilities
 */

/**
 * Get current session on server side
 */
export async function getAuthSession(): Promise<ExtendedSession | null> {
  try {
    const session = await getServerSession(authOptions);
    return session as ExtendedSession | null;
  } catch (error) {
    console.error('Error getting auth session:', error);
    return null;
  }
}

/**
 * Get current authenticated user
 */
export async function getAuthUser(): Promise<ExtendedUser | null> {
  try {
    const session = await getAuthSession();
    return session?.user || null;
  } catch (error) {
    console.error('Error getting auth user:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isUserAuthenticated(): Promise<boolean> {
  try {
    const session = await getAuthSession();
    return !!session?.user && !session.error;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

/**
 * Authentication API functions
 */
export const AuthAPI = {
  /**
   * Login with credentials
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      return {
        success: true,
        data: {
          user: data.user,
          token: data.token,
          refreshToken: data.refreshToken,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Login failed. Please check your credentials.',
      };
    }
  },

  /**
   * Register new user
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      return {
        success: true,
        data: {
          user: data.user,
          token: data.token,
          refreshToken: data.refreshToken,
        },
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Registration failed. Please try again.',
      };
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<{ success: boolean }> {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      return { success: response.ok };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false };
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      return {
        success: true,
        data: {
          user: data.user,
          token: data.token,
          refreshToken: data.refreshToken,
        },
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        error: 'Token refresh failed',
      };
    }
  },

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      return {
        success: response.ok,
        message: data.message,
      };
    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        message: 'Email verification failed',
      };
    }
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return {
        success: response.ok,
        message: data.message,
      };
    } catch (error) {
      console.error('Password reset request error:', error);
      return {
        success: false,
        message: 'Password reset request failed',
      };
    }
  },

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();
      return {
        success: response.ok,
        message: data.message,
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        message: 'Password reset failed',
      };
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<ExtendedUser>): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Profile update failed');
      }

      const data = await response.json();
      return {
        success: true,
        data: {
          user: data.user,
          token: data.token,
        },
      };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: 'Profile update failed',
      };
    }
  },

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: 'include',
      });

      const data = await response.json();
      return {
        success: response.ok,
        message: data.message,
      };
    } catch (error) {
      console.error('Password change error:', error);
      return {
        success: false,
        message: 'Password change failed',
      };
    }
  },
};

/**
 * Re-export auth options for API routes
 */
export { authOptions } from './nextauth.config';
export default authOptions;