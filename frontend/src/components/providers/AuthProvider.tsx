'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { SessionProvider, useSession, signIn, signOut, getSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import CryptoJS from 'crypto-js';
import { toast } from 'react-hot-toast';
import { useLocalStorage } from '@/hooks/localStorage/useLocalStorage';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  role: 'customer' | 'admin' | 'moderator';
  emailVerified: boolean;
  phoneVerified: boolean;
  preferences: {
    currency: string;
    language: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
      marketing: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'private';
      activityVisible: boolean;
    };
  };
  addresses: Address[];
  orders: string[];
  wishlist: string[];
  cart: string[];
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
  isBlocked: boolean;
  twoFactorEnabled: boolean;
  sessionToken?: string;
}

export interface Address {
  id: string;
  userId: string;
  type: 'home' | 'work' | 'other';
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  // User State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Session Management
  session: unknown;
  sessionStatus: 'loading' | 'authenticated' | 'unauthenticated';
  
  // Authentication Methods
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{
    success: boolean;
    user?: User;
    error?: string;
    requiresVerification?: boolean;
    requires2FA?: boolean;
  }>;
  register: (userData: RegisterData) => Promise<{
    success: boolean;
    user?: User;
    error?: string;
    requiresVerification?: boolean;
  }>;
  logout: (clearAll?: boolean) => Promise<void>;
  
  // Password & Security
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  enable2FA: () => Promise<{ success: boolean; qrCode?: string; secret?: string; error?: string }>;
  disable2FA: (code: string) => Promise<{ success: boolean; error?: string }>;
  verify2FA: (code: string) => Promise<{ success: boolean; error?: string }>;
  
  // Account Management
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; user?: User; error?: string }>;
  uploadAvatar: (file: File) => Promise<{ success: boolean; avatarUrl?: string; error?: string }>;
  deleteAccount: (password: string) => Promise<{ success: boolean; error?: string }>;
  
  // Address Management
  addAddress: (address: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; address?: Address; error?: string }>;
  updateAddress: (addressId: string, updates: Partial<Address>) => Promise<{ success: boolean; address?: Address; error?: string }>;
  deleteAddress: (addressId: string) => Promise<{ success: boolean; error?: string }>;
  setDefaultAddress: (addressId: string) => Promise<{ success: boolean; error?: string }>;
  
  // Email & Phone Verification
  sendEmailVerification: () => Promise<{ success: boolean; error?: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; error?: string }>;
  sendPhoneVerification: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyPhone: (code: string) => Promise<{ success: boolean; error?: string }>;
  
  // Social Auth
  googleSignIn: () => Promise<void>;
  facebookSignIn: () => Promise<void>;
  appleSignIn: () => Promise<void>;
  
  // Account Status
  refreshUser: () => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
  extendSession: () => Promise<boolean>;
  
  // Guest/Anonymous
  convertGuestToUser: (userData: RegisterData) => Promise<{ success: boolean; user?: User; error?: string }>;
  mergeGuestData: () => Promise<void>;
  
  // Admin Functions (for admin panel)
  impersonateUser: (userId: string) => Promise<{ success: boolean; error?: string }>;
  stopImpersonation: () => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptTerms: boolean;
  acceptMarketing?: boolean;
  referralCode?: string;
}

interface ApiResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

interface ImpersonationData {
  originalUserId: string;
}

// Context Creation
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook to use Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Custom cookie utilities
const setCookie = (name: string, value: string, days = 7) => {
  if (typeof window === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict${process.env.NODE_ENV === 'production' ? ';Secure' : ''}`;
};

const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
};

// Logger utility
const logger = {
  info: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AUTH INFO] ${message}`, ...args);
    }
  },
  error: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[AUTH ERROR] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[AUTH WARN] ${message}`, ...args);
    }
  }
};

// Notification utility
const addNotification = (notification: {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{ label: string; action: () => void }>;
}) => {
  // Fallback to toast if notification provider is not available
  const toastFn = {
    success: toast.success,
    error: toast.error,
    warning: toast,
    info: toast
  }[notification.type];
  
  toastFn(`${notification.title}: ${notification.message}`, {
    duration: notification.duration || 4000
  });
};

// Auth Provider Component
interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProviderInner: React.FC<AuthProviderProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  // State
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Persistent storage using the proper hook
  const rememberUserStorage = useLocalStorage<boolean>('rememberUser', { defaultValue: false });
  const guestIdStorage = useLocalStorage<string | null>('guestId', { defaultValue: null });
  
  // Refs
  const sessionCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);

  // Configuration
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
  const HEARTBEAT_INTERVAL = 2 * 60 * 1000; // 2 minutes
  const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'vardhman-mills-2024';

  // Utility Functions
  const encryptData = useCallback((data: unknown): string => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
  }, [ENCRYPTION_KEY]);

  const decryptData = useCallback((encryptedData: string): unknown => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch {
      return null;
    }
  }, [ENCRYPTION_KEY]);

  // API Request Handler
  const apiRequest = useCallback(async (endpoint: string, options: AxiosRequestConfig = {}): Promise<ApiResponse> => {
    try {
      const token = getCookie('auth_token');
      const config: AxiosRequestConfig = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      };

      const response = await axios(`${API_BASE_URL}${endpoint}`, config);
      return { success: true, data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      logger.error('API Request failed:', axiosError);
      
      return {
        success: false,
        error: axiosError.response?.data?.message || axiosError.message || 'An error occurred'
      };
    }
  }, [API_BASE_URL]);

  // Status & Session Methods
  const refreshUser = useCallback(async () => {
    try {
      const result = await apiRequest('/auth/me');
      
      if (result.success) {
        setUser(result.data as User);
      }
    } catch (error) {
      logger.error('Refresh user error:', error);
    }
  }, [apiRequest]);

  const checkAuthStatus = useCallback(async (): Promise<boolean> => {
    try {
      const result = await apiRequest('/auth/status');
      return result.success && (result.data as { isValid: boolean }).isValid;
    } catch {
      return false;
    }
  }, [apiRequest]);

  const extendSession = useCallback(async (): Promise<boolean> => {
    try {
      const result = await apiRequest('/auth/extend-session', { method: 'POST' });
      
      if (result.success) {
        const { token } = result.data as { token: string };
        setCookie('auth_token', token, rememberUserStorage.value ? 30 : 1);
        return true;
      }
      
      return false;
    } catch {
      return false;
    }
  }, [apiRequest, rememberUserStorage.value]);

  // Session Management
  const startHeartbeat = useCallback(() => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
    }

    heartbeatInterval.current = setInterval(async () => {
      if (user) {
        await extendSession();
      }
    }, HEARTBEAT_INTERVAL);
  }, [user, extendSession, HEARTBEAT_INTERVAL]);

  // Authentication Methods
  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      setIsLoading(true);
      
      const result = await apiRequest('/auth/login', {
        method: 'POST',
        data: { email, password, rememberMe }
      });

      if (result.success) {
        const { user: userData, token, requires2FA, requiresVerification } = result.data as {
          user: User;
          token: string;
          requires2FA?: boolean;
          requiresVerification?: boolean;
        };
        
        if (requires2FA) {
          return { success: true, requires2FA: true };
        }
        
        if (requiresVerification) {
          return { success: true, requiresVerification: true };
        }

        // Store token and user data
        setCookie('auth_token', token, rememberMe ? 30 : 1);
        if (rememberMe) {
          rememberUserStorage.setValue(true);
          setCookie('user_data', encryptData(userData), 30);
        }

        setUser(userData);
        
        // Merge guest data if exists
        if (guestIdStorage.value) {
          await mergeGuestData();
        }

        toast.success(`Welcome back, ${userData.firstName}!`);
        logger.info('User logged in successfully:', userData.email);
        
        return { success: true, user: userData };
      }

      return { success: false, error: result.error };
    } catch (error) {
      logger.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      
      const result = await apiRequest('/auth/register', {
        method: 'POST',
        data: userData
      });

      if (result.success) {
        const { user: newUser, token, requiresVerification } = result.data as {
          user: User;
          token: string;
          requiresVerification?: boolean;
        };
        
        if (requiresVerification) {
          toast.success('Registration successful! Please check your email to verify your account.');
          return { success: true, requiresVerification: true };
        }

        // Auto-login after registration
        setCookie('auth_token', token, 7);
        setUser(newUser);
        
        // Merge guest data if exists
        if (guestIdStorage.value) {
          await mergeGuestData();
        }

        toast.success(`Welcome to Vardhman Mills, ${newUser.firstName}!`);
        logger.info('User registered successfully:', newUser.email);
        
        return { success: true, user: newUser };
      }

      return { success: false, error: result.error };
    } catch (error) {
      logger.error('Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(async (clearAll = false) => {
    try {
      setIsLoading(true);
      
      // Call backend logout
      if (user) {
        await apiRequest('/auth/logout', { method: 'POST' });
      }

      // Clear NextAuth session
      await signOut({ redirect: false });
      
      // Clear local state
      setUser(null);
      
      // Clear cookies and storage
      deleteCookie('auth_token');
      deleteCookie('user_data');
      
      if (clearAll) {
        rememberUserStorage.setValue(false);
        localStorage.clear();
        sessionStorage.clear();
      }

      // Clear intervals
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
      }
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }

      toast.success('Logged out successfully');
      logger.info('User logged out');
      
      // Redirect to login page if on protected route
      const protectedPaths = ['/account', '/orders', '/wishlist', '/checkout'];
      if (pathname && protectedPaths.some(path => pathname.startsWith(path))) {
        router.push('/auth/login');
      }
    } catch (error) {
      logger.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, apiRequest, rememberUserStorage, pathname, router]);

  const startSessionCheck = useCallback(() => {
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
    }

    sessionCheckInterval.current = setInterval(async () => {
      const isValid = await checkAuthStatus();
      if (!isValid && user) {
        await logout();
        addNotification({
          type: 'warning',
          title: 'Session Expired',
          message: 'Your session has expired. Please log in again.',
          duration: 5000
        });
      }
    }, SESSION_CHECK_INTERVAL);
  }, [user, checkAuthStatus, logout, SESSION_CHECK_INTERVAL]);

  // Password & Security Methods
  const forgotPassword = async (email: string) => {
    try {
      const result = await apiRequest('/auth/forgot-password', {
        method: 'POST',
        data: { email }
      });

      if (result.success) {
        toast.success('Password reset link sent to your email');
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      logger.error('Forgot password error:', error);
      return { success: false, error: 'Failed to send reset email' };
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      const result = await apiRequest('/auth/reset-password', {
        method: 'POST',
        data: { token, newPassword }
      });

      if (result.success) {
        toast.success('Password reset successfully');
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      logger.error('Reset password error:', error);
      return { success: false, error: 'Failed to reset password' };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const result = await apiRequest('/auth/change-password', {
        method: 'POST',
        data: { currentPassword, newPassword }
      });

      if (result.success) {
        toast.success('Password changed successfully');
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      logger.error('Change password error:', error);
      return { success: false, error: 'Failed to change password' };
    }
  };

  const enable2FA = async () => {
    try {
      const result = await apiRequest('/auth/2fa/enable', { method: 'POST' });

      if (result.success) {
        const { qrCode, secret } = result.data as { qrCode: string; secret: string };
        return { success: true, qrCode, secret };
      }

      return { success: false, error: result.error };
    } catch (error) {
      logger.error('Enable 2FA error:', error);
      return { success: false, error: 'Failed to enable 2FA' };
    }
  };

  const disable2FA = async (code: string) => {
    try {
      const result = await apiRequest('/auth/2fa/disable', {
        method: 'POST',
        data: { code }
      });

      if (result.success) {
        await refreshUser();
        toast.success('Two-factor authentication disabled');
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      logger.error('Disable 2FA error:', error);
      return { success: false, error: 'Failed to disable 2FA' };
    }
  };

  const verify2FA = async (code: string) => {
    try {
      const result = await apiRequest('/auth/2fa/verify', {
        method: 'POST',
        data: { code }
      });

      if (result.success) {
        const { user: userData, token } = result.data as { user: User; token: string };
        setCookie('auth_token', token, rememberUserStorage.value ? 30 : 1);
        setUser(userData);
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      logger.error('Verify 2FA error:', error);
      return { success: false, error: 'Failed to verify 2FA code' };
    }
  };

  // Account Management Methods
  const updateProfile = async (updates: Partial<User>) => {
    try {
      const result = await apiRequest('/auth/profile', {
        method: 'PATCH',
        data: updates
      });

      if (result.success) {
        const { user: updatedUser } = result.data as { user: User };
        setUser(updatedUser);
        toast.success('Profile updated successfully');
        return { success: true, user: updatedUser };
      }

      return { success: false, error: result.error };
    } catch (error) {
      logger.error('Update profile error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const result = await apiRequest('/auth/avatar', {
        method: 'POST',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (result.success) {
        await refreshUser();
        const { avatarUrl } = result.data as { avatarUrl: string };
        toast.success('Avatar updated successfully');
        return { success: true, avatarUrl };
      }

      return { success: false, error: result.error };
    } catch (error) {
      logger.error('Upload avatar error:', error);
      return { success: false, error: 'Failed to upload avatar' };
    }
  };

  const deleteAccount = async (password: string) => {
    try {
      const result = await apiRequest('/auth/delete-account', {
        method: 'DELETE',
        data: { password }
      });

      if (result.success) {
        await logout(true);
        toast.success('Account deleted successfully');
        router.push('/');
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      logger.error('Delete account error:', error);
      return { success: false, error: 'Failed to delete account' };
    }
  };

  // Address Management Methods
  const addAddress = async (address: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const result = await apiRequest('/auth/addresses', {
        method: 'POST',
        data: address
      });

      if (result.success) {
        await refreshUser();
        const { address: newAddress } = result.data as { address: Address };
        toast.success('Address added successfully');
        return { success: true, address: newAddress };
      }

      return { success: false, error: result.error };
    } catch (error) {
      logger.error('Add address error:', error);
      return { success: false, error: 'Failed to add address' };
    }
  };

  const updateAddress = async (addressId: string, updates: Partial<Address>) => {
    try {
      const result = await apiRequest(`/auth/addresses/${addressId}`, {
        method: 'PATCH',
        data: updates
      });

      if (result.success) {
        await refreshUser();
        const { address: updatedAddress } = result.data as { address: Address };
        toast.success('Address updated successfully');
        return { success: true, address: updatedAddress };
      }

      return { success: false, error: result.error };
    } catch (error) {
      logger.error('Update address error:', error);
      return { success: false, error: 'Failed to update address' };
    }
  };

  const deleteAddress = async (addressId: string) => {
    try {
      const result = await apiRequest(`/auth/addresses/${addressId}`, {
        method: 'DELETE'
      });

      if (result.success) {
        await refreshUser();
        toast.success('Address deleted successfully');
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      logger.error('Delete address error:', error);
      return { success: false, error: 'Failed to delete address' };
    }
  };

  const setDefaultAddress = async (addressId: string) => {
    try {
      const result = await apiRequest(`/auth/addresses/${addressId}/default`, {
        method: 'PATCH'
      });

      if (result.success) {
        await refreshUser();
        toast.success('Default address updated');
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      logger.error('Set default address error:', error);
      return { success: false, error: 'Failed to set default address' };
    }
  };

  // Email & Phone Verification Methods
  const sendEmailVerification = async () => {
    try {
      const result = await apiRequest('/auth/verify-email/send', { method: 'POST' });

      if (result.success) {
        toast.success('Verification email sent');
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      logger.error('Send email verification error:', error);
      return { success: false, error: 'Failed to send verification email' };
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      const result = await apiRequest('/auth/verify-email', {
        method: 'POST',
        data: { token }
      });

      if (result.success) {
        await refreshUser();
        toast.success('Email verified successfully');
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      logger.error('Verify email error:', error);
      return { success: false, error: 'Failed to verify email' };
    }
  };

  const sendPhoneVerification = async (phone: string) => {
    try {
      const result = await apiRequest('/auth/verify-phone/send', {
        method: 'POST',
        data: { phone }
      });

      if (result.success) {
        toast.success('Verification code sent to your phone');
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      logger.error('Send phone verification error:', error);
      return { success: false, error: 'Failed to send verification code' };
    }
  };

  const verifyPhone = async (code: string) => {
    try {
      const result = await apiRequest('/auth/verify-phone', {
        method: 'POST',
        data: { code }
      });

      if (result.success) {
        await refreshUser();
        toast.success('Phone verified successfully');
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      logger.error('Verify phone error:', error);
      return { success: false, error: 'Failed to verify phone' };
    }
  };

  // Social Auth Methods
  const googleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      logger.error('Google sign-in error:', error);
      toast.error('Failed to sign in with Google');
    }
  };

  const facebookSignIn = async () => {
    try {
      await signIn('facebook', { callbackUrl: '/' });
    } catch (error) {
      logger.error('Facebook sign-in error:', error);
      toast.error('Failed to sign in with Facebook');
    }
  };

  const appleSignIn = async () => {
    try {
      await signIn('apple', { callbackUrl: '/' });
    } catch (error) {
      logger.error('Apple sign-in error:', error);
      toast.error('Failed to sign in with Apple');
    }
  };

  // Guest/Anonymous Methods
  const convertGuestToUser = async (userData: RegisterData) => {
    try {
      const result = await apiRequest('/auth/convert-guest', {
        method: 'POST',
        data: { ...userData, guestId: guestIdStorage.value }
      });

      if (result.success) {
        const { user: newUser, token } = result.data as { user: User; token: string };
        setCookie('auth_token', token, 7);
        setUser(newUser);
        
        // Clear guest data
        guestIdStorage.remove();
        
        toast.success(`Welcome to Vardhman Mills, ${newUser.firstName}!`);
        return { success: true, user: newUser };
      }

      return { success: false, error: result.error };
    } catch (error) {
      logger.error('Convert guest error:', error);
      return { success: false, error: 'Failed to create account' };
    }
  };

  const mergeGuestData = async () => {
    try {
      if (!guestIdStorage.value || !user) return;

      await apiRequest('/auth/merge-guest-data', {
        method: 'POST',
        data: { guestId: guestIdStorage.value }
      });

      // Clear guest data after merge
      guestIdStorage.remove();
    } catch (error) {
      logger.error('Merge guest data error:', error);
    }
  };

  // Admin Methods
  const impersonateUser = async (userId: string) => {
    try {
      const result = await apiRequest('/admin/impersonate', {
        method: 'POST',
        data: { userId }
      });

      if (result.success) {
        const { user: impersonatedUser, token } = result.data as { user: User; token: string };
        setCookie('auth_token', token);
        setCookie('impersonation_data', encryptData({ originalUserId: user?.id }));
        setUser(impersonatedUser);
        
        addNotification({
          type: 'info',
          title: 'Impersonation Active',
          message: `You are now viewing as ${impersonatedUser.firstName} ${impersonatedUser.lastName}`,
          duration: 0,
          actions: [
            {
              label: 'Stop Impersonation',
              action: stopImpersonation
            }
          ]
        });
        
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      logger.error('Impersonate user error:', error);
      return { success: false, error: 'Failed to impersonate user' };
    }
  };

  const stopImpersonation = async () => {
    try {
      const impersonationData = getCookie('impersonation_data');
      if (!impersonationData) return;

      const data = decryptData(impersonationData) as ImpersonationData;
      if (!data?.originalUserId) return;

      const result = await apiRequest('/admin/stop-impersonate', { method: 'POST' });

      if (result.success) {
        deleteCookie('impersonation_data');
        await refreshUser();
        
        addNotification({
          type: 'success',
          title: 'Impersonation Stopped',
          message: 'You have returned to your original account',
          duration: 3000
        });
      }
    } catch (error) {
      logger.error('Stop impersonation error:', error);
    }
  };

  // Initialization
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // Check for saved user data
        const savedUserData = getCookie('user_data');
        if (savedUserData && rememberUserStorage.value) {
          const userData = decryptData(savedUserData);
          if (userData) {
            setUser(userData as User);
          }
        }

        // Check session status
        const currentSession = await getSession();
        if (currentSession) {
          // Handle NextAuth session
          const result = await apiRequest('/auth/session', {
            method: 'POST',
            data: { session: currentSession }
          });

          if (result.success) {
            const { user: sessionUser, token } = result.data as { user: User; token: string };
            setUser(sessionUser);
            setCookie('auth_token', token);
          }
        } else {
          // Check token-based auth
          const token = getCookie('auth_token');
          if (token) {
            const isValid = await checkAuthStatus();
            if (isValid) {
              await refreshUser();
            } else {
              // Token invalid, clear auth data
              deleteCookie('auth_token');
              deleteCookie('user_data');
              setUser(null);
            }
          }
        }
      } catch (error) {
        logger.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [apiRequest, checkAuthStatus, refreshUser, rememberUserStorage.value, decryptData]);

  // Start session management when user is authenticated
  useEffect(() => {
    if (user && isInitialized) {
      startSessionCheck();
      startHeartbeat();
    }

    return () => {
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
      }
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
    };
  }, [user, isInitialized, startSessionCheck, startHeartbeat]);

  // Context value
  const contextValue: AuthContextType = {
    // User State
    user,
    isAuthenticated: !!user,
    isLoading,
    isInitialized,
    
    // Session Management
    session,
    sessionStatus: status,
    
    // Authentication Methods
    login,
    register,
    logout,
    
    // Password & Security
    forgotPassword,
    resetPassword,
    changePassword,
    enable2FA,
    disable2FA,
    verify2FA,
    
    // Account Management
    updateProfile,
    uploadAvatar,
    deleteAccount,
    
    // Address Management
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    
    // Email & Phone Verification
    sendEmailVerification,
    verifyEmail,
    sendPhoneVerification,
    verifyPhone,
    
    // Social Auth
    googleSignIn,
    facebookSignIn,
    appleSignIn,
    
    // Account Status
    refreshUser,
    checkAuthStatus,
    extendSession,
    
    // Guest/Anonymous
    convertGuestToUser,
    mergeGuestData,
    
    // Admin Functions
    impersonateUser,
    stopImpersonation,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Main AuthProvider with SessionProvider wrapper
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return (
    <SessionProvider
      refetchInterval={5 * 60} // 5 minutes
      refetchOnWindowFocus={true}
      refetchWhenOffline={false}
    >
      <AuthProviderInner>{children}</AuthProviderInner>
    </SessionProvider>
  );
};

export default AuthProvider;