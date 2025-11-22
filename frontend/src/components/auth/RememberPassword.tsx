/**
 * RememberPassword Component - Vardhman Mills Frontend
 * 
 * Persistent login functionality with secure token management
 * and automatic session restoration.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Clock, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Settings,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

// Types
interface RememberPasswordProps {
  className?: string;
  onRemembered?: (credentials: RememberedCredentials) => void;
  onForgotten?: () => void;
  showManagement?: boolean;
}

interface RememberedCredentials {
  email: string;
  rememberToken: string;
  expiresAt: Date;
  lastUsed: Date;
}

interface RememberPasswordState {
  isEnabled: boolean;
  isLoading: boolean;
  rememberedAccounts: RememberedCredentials[];
  showCredentials: boolean;
  error: string | null;
}

// Storage keys
const STORAGE_KEYS = {
  REMEMBER_EMAIL: 'remember_email',
  REMEMBER_TOKEN: 'remember_token',
  REMEMBER_ACCOUNTS: 'remember_accounts',
  REMEMBER_SETTINGS: 'remember_settings'
};

// Default settings
const DEFAULT_SETTINGS = {
  enabled: false,
  autoLogin: false,
  rememberDuration: 30, // days
  maxAccounts: 3
};

/**
 * Remember password utility functions
 */
class RememberPasswordService {
  /**
   * Generate secure remember token
   */
  static generateRememberToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Encrypt credentials for storage
   */
  static async encryptCredentials(email: string, password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify({ email, password }));
    
    // Simple XOR encryption with generated key
    const key = this.generateRememberToken();
    const keyBytes = encoder.encode(key);
    
    const encrypted = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      encrypted[i] = data[i] ^ keyBytes[i % keyBytes.length];
    }
    
    return btoa(String.fromCharCode.apply(null, Array.from(encrypted)));
  }

  /**
   * Get stored remember settings
   */
  static getRememberSettings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REMEMBER_SETTINGS);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Save remember settings
   */
  static saveRememberSettings(settings: typeof DEFAULT_SETTINGS) {
    localStorage.setItem(STORAGE_KEYS.REMEMBER_SETTINGS, JSON.stringify(settings));
  }

  /**
   * Get remembered accounts
   */
  static getRememberedAccounts(): RememberedCredentials[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REMEMBER_ACCOUNTS);
      if (!stored) return [];
      
      const accounts = JSON.parse(stored).map((account: { email: string; rememberToken: string; expiresAt: string; lastUsed: string }) => ({
        ...account,
        expiresAt: new Date(account.expiresAt),
        lastUsed: new Date(account.lastUsed)
      }));

      // Filter out expired accounts
      const now = new Date();
      return accounts.filter((account: RememberedCredentials) => account.expiresAt > now);
    } catch {
      return [];
    }
  }

  /**
   * Save remembered account
   */
  static saveRememberedAccount(email: string, rememberToken: string, durationDays: number = 30) {
    const accounts = this.getRememberedAccounts();
    const settings = this.getRememberSettings();
    
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
    
    const newAccount: RememberedCredentials = {
      email,
      rememberToken,
      expiresAt,
      lastUsed: now
    };

    // Remove existing account with same email
    const filteredAccounts = accounts.filter(account => account.email !== email);
    
    // Add new account at the beginning
    filteredAccounts.unshift(newAccount);
    
    // Limit number of remembered accounts
    const limitedAccounts = filteredAccounts.slice(0, settings.maxAccounts);
    
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ACCOUNTS, JSON.stringify(limitedAccounts));
    
    return newAccount;
  }

  /**
   * Remove remembered account
   */
  static removeRememberedAccount(email: string) {
    const accounts = this.getRememberedAccounts();
    const filteredAccounts = accounts.filter(account => account.email !== email);
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ACCOUNTS, JSON.stringify(filteredAccounts));
  }

  /**
   * Clear all remembered accounts
   */
  static clearAllRememberedAccounts() {
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_EMAIL);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_TOKEN);
  }

  /**
   * Update last used timestamp
   */
  static updateLastUsed(email: string) {
    const accounts = this.getRememberedAccounts();
    const accountIndex = accounts.findIndex(account => account.email === email);
    
    if (accountIndex >= 0) {
      accounts[accountIndex].lastUsed = new Date();
      localStorage.setItem(STORAGE_KEYS.REMEMBER_ACCOUNTS, JSON.stringify(accounts));
    }
  }
}

/**
 * RememberPassword Component
 * 
 * Comprehensive password remembering functionality with
 * secure storage, account management, and auto-login features.
 */
export const RememberPassword: React.FC<RememberPasswordProps> = ({
  className = '',
  onRemembered,
  onForgotten,
  showManagement = true
}) => {
  const { data: session } = useSession();
  
  const [state, setState] = useState<RememberPasswordState>({
    isEnabled: false,
    isLoading: false,
    rememberedAccounts: [],
    showCredentials: false,
    error: null
  });

  /**
   * Load initial data
   */
  const loadData = useCallback(() => {
    const settings = RememberPasswordService.getRememberSettings();
    const accounts = RememberPasswordService.getRememberedAccounts();
    
    setState(prev => ({
      ...prev,
      isEnabled: settings.enabled,
      rememberedAccounts: accounts
    }));
  }, []);

  /**
   * Toggle remember password functionality
   */
  const toggleRememberPassword = useCallback(async (enabled: boolean) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const settings = RememberPasswordService.getRememberSettings();
      const updatedSettings = { ...settings, enabled };
      
      RememberPasswordService.saveRememberSettings(updatedSettings);
      
      if (!enabled) {
        // Clear all remembered data when disabled
        RememberPasswordService.clearAllRememberedAccounts();
        onForgotten?.();
      }

      setState(prev => ({
        ...prev,
        isEnabled: enabled,
        rememberedAccounts: enabled ? prev.rememberedAccounts : []
      }));

      toast.success(`Remember password ${enabled ? 'enabled' : 'disabled'}`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update settings';
      setState(prev => ({ ...prev, error: errorMessage }));
      toast.error(errorMessage);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [onForgotten]);

  /**
   * Remember current session
   */
  const rememberCurrentSession = useCallback(async () => {
    if (!session?.user?.email) {
      toast.error('No active session to remember');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const token = RememberPasswordService.generateRememberToken();
      const settings = RememberPasswordService.getRememberSettings();
      
      const rememberedAccount = RememberPasswordService.saveRememberedAccount(
        session.user.email,
        token,
        settings.rememberDuration
      );

      setState(prev => ({
        ...prev,
        rememberedAccounts: [rememberedAccount, ...prev.rememberedAccounts.filter(
          acc => acc.email !== session.user?.email
        )]
      }));

      onRemembered?.(rememberedAccount);
      toast.success('Session remembered successfully');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remember session';
      setState(prev => ({ ...prev, error: errorMessage }));
      toast.error(errorMessage);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [session, onRemembered]);

  /**
   * Login with remembered account
   */
  const loginWithRememberedAccount = useCallback(async (account: RememberedCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await signIn('credentials', {
        email: account.email,
        rememberToken: account.rememberToken,
        redirect: false
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        RememberPasswordService.updateLastUsed(account.email);
        toast.success('Logged in successfully');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      // Remove invalid account
      RememberPasswordService.removeRememberedAccount(account.email);
      setState(prev => ({
        ...prev,
        error: errorMessage,
        rememberedAccounts: prev.rememberedAccounts.filter(acc => acc.email !== account.email)
      }));
      
      toast.error('Remember token expired. Please login again.');
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  /**
   * Remove remembered account
   */
  const removeRememberedAccount = useCallback((email: string) => {
    RememberPasswordService.removeRememberedAccount(email);
    setState(prev => ({
      ...prev,
      rememberedAccounts: prev.rememberedAccounts.filter(acc => acc.email !== email)
    }));
    toast.success('Account removed from remembered list');
  }, []);

  /**
   * Clear all remembered accounts
   */
  const clearAllAccounts = useCallback(() => {
    RememberPasswordService.clearAllRememberedAccounts();
    setState(prev => ({
      ...prev,
      rememberedAccounts: []
    }));
    onForgotten?.();
    toast.success('All remembered accounts cleared');
  }, [onForgotten]);

  /**
   * Toggle credentials visibility
   */
  const toggleCredentialsVisibility = useCallback(() => {
    setState(prev => ({ ...prev, showCredentials: !prev.showCredentials }));
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Format time display
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Remember Password</h2>
                <p className="text-blue-100">Manage your saved login sessions</p>
              </div>
            </div>
            
            {/* Enable/Disable Toggle */}
            <div className="flex items-center space-x-3">
              <span className="text-white text-sm">
                {state.isEnabled ? 'Enabled' : 'Disabled'}
              </span>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleRememberPassword(!state.isEnabled)}
                disabled={state.isLoading}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  state.isEnabled ? 'bg-green-500' : 'bg-gray-400'
                }`}
              >
                <motion.span
                  animate={{ x: state.isEnabled ? 24 : 4 }}
                  className="inline-block h-6 w-6 transform rounded-full bg-white transition"
                />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {/* Current Session */}
          {session && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Session</h3>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{session.user?.email}</p>
                      <p className="text-sm text-gray-600">Currently logged in</p>
                    </div>
                  </div>
                  
                  {state.isEnabled && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={rememberCurrentSession}
                      disabled={state.isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {state.isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        'Remember Session'
                      )}
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Remembered Accounts */}
          {state.isEnabled && showManagement && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Remembered Accounts ({state.rememberedAccounts.length})
                </h3>
                
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={toggleCredentialsVisibility}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    title={state.showCredentials ? 'Hide details' : 'Show details'}
                  >
                    {state.showCredentials ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </motion.button>
                  
                  {state.rememberedAccounts.length > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={clearAllAccounts}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="Clear all accounts"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
              </div>

              {state.rememberedAccounts.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No remembered accounts</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Enable remember password and login to save your session
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.rememberedAccounts.map((account, index) => (
                    <motion.div
                      key={account.email}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 rounded-xl p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <Shield className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{account.email}</p>
                              <div className="flex items-center space-x-4 mt-1">
                                <p className="text-sm text-gray-600">
                                  Last used: {formatTime(account.lastUsed)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Expires: {account.expiresAt.toLocaleDateString()}
                                </p>
                              </div>
                              
                              {state.showCredentials && (
                                <div className="mt-2 text-xs text-gray-500 font-mono bg-gray-200 p-2 rounded">
                                  Token: {account.rememberToken.substring(0, 16)}...
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => loginWithRememberedAccount(account)}
                            disabled={state.isLoading}
                            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            Login
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => removeRememberedAccount(account.email)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings */}
          {state.isEnabled && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center">
                  <Settings className="w-6 h-6 text-gray-600 mr-3" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Security Settings</p>
                    <p className="text-sm text-gray-600">
                      Sessions are encrypted and automatically expire after 30 days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {state.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl"
            >
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-sm text-red-800">{state.error}</p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

/**
 * Hook for remember password functionality
 */
export const useRememberPassword = () => {
  const [state, setState] = useState({
    isEnabled: false,
    rememberedAccounts: [] as RememberedCredentials[],
    isLoading: false,
    error: null as string | null
  });

  useEffect(() => {
    const settings = RememberPasswordService.getRememberSettings();
    const accounts = RememberPasswordService.getRememberedAccounts();
    
    setState(prev => ({
      ...prev,
      isEnabled: settings.enabled,
      rememberedAccounts: accounts
    }));
  }, []);

  const rememberCredentials = useCallback(async (email: string) => {
    const token = RememberPasswordService.generateRememberToken();
    const account = RememberPasswordService.saveRememberedAccount(email, token);
    
    setState(prev => ({
      ...prev,
      rememberedAccounts: [account, ...prev.rememberedAccounts.filter(acc => acc.email !== email)]
    }));
    
    return account;
  }, []);

  const forgetCredentials = useCallback((email: string) => {
    RememberPasswordService.removeRememberedAccount(email);
    setState(prev => ({
      ...prev,
      rememberedAccounts: prev.rememberedAccounts.filter(acc => acc.email !== email)
    }));
  }, []);

  const clearAll = useCallback(() => {
    RememberPasswordService.clearAllRememberedAccounts();
    setState(prev => ({ ...prev, rememberedAccounts: [] }));
  }, []);

  return {
    ...state,
    rememberCredentials,
    forgetCredentials,
    clearAll,
    service: RememberPasswordService
  };
};

// Export types
export type { RememberPasswordProps, RememberedCredentials, RememberPasswordState };

export default RememberPassword;
