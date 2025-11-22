/**
 * Simple Auth Context - Vardhman Mills Frontend
 * Basic authentication management
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// Types
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  role: 'user' | 'admin' | 'moderator';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  preferences: {
    newsletter: boolean;
    sms: boolean;
    pushNotifications: boolean;
  };
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  createdAt: Date;
  lastLoginAt?: Date;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptTerms: boolean;
}

interface PasswordResetData {
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  sessionExpiry?: Date;
  refreshToken?: string;
  permissions: string[];
  loginAttempts: number;
  isAccountLocked: boolean;
}

interface AuthContextType extends AuthState {
  // Authentication methods
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  
  // Password management
  resetPassword: (data: PasswordResetData) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  
  // Profile management
  updateProfile: (updates: Partial<User>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  
  // Email verification
  sendVerificationEmail: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  
  // Phone verification
  sendPhoneVerification: (phone: string) => Promise<void>;
  verifyPhone: (code: string) => Promise<void>;
  
  // Social authentication
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  
  // Session management
  checkSession: () => Promise<boolean>;
  extendSession: () => Promise<void>;
  
  // Utility methods
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
}

// Constants
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';
const MAX_LOGIN_ATTEMPTS = 5;
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

// Mock users database
const mockUsers = {
  'admin@vardhmanmills.com': {
    id: '1',
    email: 'admin@vardhmanmills.com',
    password: 'password',
    firstName: 'Admin',
    lastName: 'User',
    fullName: 'Admin User',
    role: 'admin' as const,
    isEmailVerified: true,
    isPhoneVerified: false,
    preferences: {
      newsletter: true,
      sms: false,
      pushNotifications: true,
    },
    createdAt: new Date('2024-01-01'),
    lastLoginAt: new Date(),
  },
  'user@vardhmanmills.com': {
    id: '2',
    email: 'user@vardhmanmills.com',
    password: 'password',
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    role: 'user' as const,
    isEmailVerified: true,
    isPhoneVerified: true,
    preferences: {
      newsletter: false,
      sms: true,
      pushNotifications: false,
    },
    createdAt: new Date('2024-02-01'),
    lastLoginAt: new Date(),
  }
};

// Mock API calls (replace with real API)
const mockLogin = async (credentials: LoginCredentials): Promise<{ user: User; token: string; refreshToken: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const user = mockUsers[credentials.email as keyof typeof mockUsers];
  if (user && user.password === credentials.password) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userData } = user;
    return {
      user: userData as User,
      token: 'mock-jwt-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
    };
  }
  
  throw new Error('Invalid email or password');
};

const mockRegister = async (data: RegisterData): Promise<{ user: User; token: string; refreshToken: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Check if user already exists
  if (mockUsers[data.email as keyof typeof mockUsers]) {
    throw new Error('User already exists with this email');
  }
  
  const newUser: User = {
    id: Date.now().toString(),
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    fullName: `${data.firstName} ${data.lastName}`,
    phone: data.phone,
    role: 'user',
    isEmailVerified: false,
    isPhoneVerified: false,
    preferences: {
      newsletter: false,
      sms: false,
      pushNotifications: true,
    },
    createdAt: new Date(),
  };
  
  return {
    user: newUser,
    token: 'mock-jwt-token-' + Date.now(),
    refreshToken: 'mock-refresh-token-' + Date.now(),
  };
};

// Context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isInitialized: false,
    error: null,
    permissions: [],
    loginAttempts: 0,
    isAccountLocked: false,
  });
  
  const router = useRouter();

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Session timeout handler
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (state.isAuthenticated && state.sessionExpiry) {
      const timeUntilExpiry = state.sessionExpiry.getTime() - Date.now();
      
      if (timeUntilExpiry > 0) {
        timeoutId = setTimeout(() => {
          toast.error('Session expired. Please login again.');
          logout();
        }, timeUntilExpiry);
      }
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isAuthenticated, state.sessionExpiry]);
  
  const initializeAuth = async (): Promise<void> => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      const userData = localStorage.getItem(USER_KEY);
      
      if (token && userData) {
        const user = JSON.parse(userData);
        const sessionExpiry = new Date(Date.now() + SESSION_TIMEOUT);
        
        setState(prev => ({
          ...prev,
          user,
          isAuthenticated: true,
          sessionExpiry,
          refreshToken: refreshToken || undefined,
          permissions: user.role === 'admin' ? ['admin', 'user'] : ['user'],
          isLoading: false,
          isInitialized: true,
        }));
        
        // Validate token with server in real app
        await checkSession();
      } else {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          isInitialized: true 
        }));
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isInitialized: true,
        error: 'Failed to initialize authentication'
      }));
    }
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Check if account is locked
      if (state.isAccountLocked) {
        throw new Error('Account is temporarily locked due to multiple failed login attempts');
      }
      
      const response = await mockLogin(credentials);
      
      // Store tokens and user data
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      
      const sessionExpiry = new Date(Date.now() + SESSION_TIMEOUT);
      
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
        sessionExpiry,
        refreshToken: response.refreshToken,
        permissions: response.user.role === 'admin' ? ['admin', 'user'] : ['user'],
        loginAttempts: 0,
        isAccountLocked: false,
      });
      
      toast.success(`Welcome back, ${response.user.firstName}!`);
      router.push('/dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      const newAttempts = state.loginAttempts + 1;
      const isLocked = newAttempts >= MAX_LOGIN_ATTEMPTS;
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        loginAttempts: newAttempts,
        isAccountLocked: isLocked,
      }));
      
      if (isLocked) {
        toast.error('Account locked due to multiple failed attempts');
      } else {
        toast.error(errorMessage);
      }
    }
  };
  
  const register = async (data: RegisterData): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await mockRegister(data);
      
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      
      const sessionExpiry = new Date(Date.now() + SESSION_TIMEOUT);
      
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
        sessionExpiry,
        refreshToken: response.refreshToken,
        permissions: ['user'],
        loginAttempts: 0,
        isAccountLocked: false,
      });
      
      toast.success('Registration successful! Please verify your email.');
      router.push('/dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Call logout API to invalidate token
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
        },
      }).catch(() => {});
      
      // Clear local storage
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: null,
        permissions: [],
        loginAttempts: 0,
        isAccountLocked: false,
      });
      
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error during logout');
    }
  };

  const refreshAuth = async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) throw new Error('No refresh token');
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (!response.ok) throw new Error('Token refresh failed');
      
      const data = await response.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      
      setState(prev => ({
        ...prev,
        sessionExpiry: new Date(Date.now() + SESSION_TIMEOUT),
      }));
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
    }
  };
  
  const resetPassword = async (data: PasswordResetData): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Mock API call using the email from data
      console.log('Sending password reset to:', data.email);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password reset link sent to your email');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      setState(prev => ({ ...prev, error: errorMessage }));
      toast.error(errorMessage);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };
  
  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Mock API call using the passwords
      console.log('Changing password from', currentPassword.length, 'to', newPassword.length, 'characters');
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password changed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password change failed';
      setState(prev => ({ ...prev, error: errorMessage }));
      toast.error(errorMessage);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };
  
  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = { ...state.user!, ...updates };
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      
      setState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
      }));
      
      toast.success('Profile updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      toast.error(errorMessage);
    }
  };
  
  const uploadAvatar = async (file: File): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Mock file upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      const avatarUrl = URL.createObjectURL(file);
      
      await updateProfile({ avatar: avatarUrl });
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Avatar upload failed');
    }
  };
  
  const sendVerificationEmail = async (): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Verification email sent');
    } catch (error) {
      console.error('Send verification email error:', error);
      toast.error('Failed to send verification email');
    }
  };
  
  const verifyEmail = async (token: string): Promise<void> => {
    try {
      console.log('Verifying email with token:', token);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await updateProfile({ isEmailVerified: true });
      toast.success('Email verified successfully');
    } catch (error) {
      console.error('Email verification error:', error);
      toast.error('Email verification failed');
    }
  };
  
  const sendPhoneVerification = async (phone: string): Promise<void> => {
    try {
      console.log('Sending verification code to:', phone);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Verification code sent to your phone');
    } catch (error) {
      console.error('Send phone verification error:', error);
      toast.error('Failed to send verification code');
    }
  };
  
  const verifyPhone = async (code: string): Promise<void> => {
    try {
      console.log('Verifying phone with code:', code);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await updateProfile({ isPhoneVerified: true });
      toast.success('Phone verified successfully');
    } catch (error) {
      console.error('Phone verification error:', error);
      toast.error('Phone verification failed');
    }
  };
  
  const loginWithGoogle = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Google login integration coming soon!');
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed');
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };
  
  const loginWithFacebook = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Facebook login integration coming soon!');
    } catch (error) {
      console.error('Facebook login error:', error);
      toast.error('Facebook login failed');
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };
  
  const checkSession = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return false;
      
      // In real app, validate with server
      return true;
    } catch (error) {
      console.error('Session check error:', error);
      return false;
    }
  };
  
  const extendSession = async (): Promise<void> => {
    await refreshAuth();
  };
  
  const clearError = (): void => {
    setState(prev => ({ ...prev, error: null }));
  };
  
  const hasPermission = (permission: string): boolean => {
    return state.permissions.includes(permission);
  };
  
  const isAdmin = (): boolean => {
    return state.user?.role === 'admin' || false;
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshAuth,
    resetPassword,
    changePassword,
    updateProfile,
    uploadAvatar,
    sendVerificationEmail,
    verifyEmail,
    sendPhoneVerification,
    verifyPhone,
    loginWithGoogle,
    loginWithFacebook,
    checkSession,
    extendSession,
    clearError,
    hasPermission,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
export type { User, AuthState };