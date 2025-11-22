/**
 * Global Context - Vardhman Mills Frontend
 * Manages app-wide state and configuration
 */

'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

// Types
interface AppConfig {
  siteName: string;
  version: string;
  apiUrl: string;
  cdnUrl: string;
  supportEmail: string;
  supportPhone: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  features: {
    reviews: boolean;
    wishlist: boolean;
    compare: boolean;
    chat: boolean;
    notifications: boolean;
  };
  maintenance: {
    enabled: boolean;
    message?: string;
    estimatedEnd?: Date;
  };
}

interface GlobalSettings {
  currency: string;
  language: string;
  timezone: string;
  dateFormat: string;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  analytics: {
    enabled: boolean;
    trackingId?: string;
  };
}

interface ConnectivityStatus {
  online: boolean;
  speed: 'slow' | 'medium' | 'fast';
  lastOnline?: Date;
}

interface Performance {
  pageLoadTime: number;
  apiResponseTime: number;
  errorCount: number;
  warningCount: number;
}

interface GlobalState {
  appConfig: AppConfig;
  settings: GlobalSettings;
  connectivity: ConnectivityStatus;
  performance: Performance;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // UI State
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  searchOpen: boolean;
  
  // App State
  initialized: boolean;
  updateAvailable: boolean;
  criticalError: boolean;
}

type GlobalAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_APP_CONFIG'; payload: AppConfig }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<GlobalSettings> }
  | { type: 'SET_CONNECTIVITY'; payload: ConnectivityStatus }
  | { type: 'UPDATE_PERFORMANCE'; payload: Partial<Performance> }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'TOGGLE_MOBILE_MENU' }
  | { type: 'TOGGLE_SEARCH' }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_UPDATE_AVAILABLE'; payload: boolean }
  | { type: 'SET_CRITICAL_ERROR'; payload: boolean }
  | { type: 'RESET_STATE' };

interface GlobalContextType {
  state: GlobalState;
  
  // App operations
  initializeApp: () => Promise<void>;
  updateAppConfig: (config: Partial<AppConfig>) => Promise<void>;
  checkForUpdates: () => Promise<void>;
  
  // Settings operations
  updateSettings: (settings: Partial<GlobalSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => Promise<boolean>;
  
  // UI operations
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  toggleSearch: () => void;
  
  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
  reportError: (error: Error, context?: string) => void;
  
  // Performance monitoring
  recordPageLoad: (loadTime: number) => void;
  recordApiCall: (responseTime: number) => void;
  getPerformanceStats: () => Performance;
  
  // Utility
  isFeatureEnabled: (feature: keyof AppConfig['features']) => boolean;
  getAppInfo: () => { name: string; version: string; buildDate?: string };
  isMaintenanceMode: () => boolean;
}

// Default configuration
const defaultConfig: AppConfig = {
  siteName: 'Vardhman Mills',
  version: '1.0.0',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  cdnUrl: process.env.NEXT_PUBLIC_CDN_URL || '',
  supportEmail: 'support@vardhmanmills.com',
  supportPhone: '+91-11-1234567890',
  socialLinks: {
    facebook: 'https://facebook.com/vardhmanmills',
    twitter: 'https://twitter.com/vardhmanmills',
    instagram: 'https://instagram.com/vardhmanmills',
    linkedin: 'https://linkedin.com/company/vardhman-mills',
  },
  features: {
    reviews: true,
    wishlist: true,
    compare: true,
    chat: true,
    notifications: true,
  },
  maintenance: {
    enabled: false,
  },
};

const defaultSettings: GlobalSettings = {
  currency: 'INR',
  language: 'en',
  timezone: 'Asia/Kolkata',
  dateFormat: 'DD/MM/YYYY',
  theme: 'system',
  notifications: {
    email: true,
    push: true,
    sms: false,
  },
  analytics: {
    enabled: true,
    trackingId: process.env.NEXT_PUBLIC_GA_ID,
  },
};

// Initial state
const initialState: GlobalState = {
  appConfig: defaultConfig,
  settings: defaultSettings,
  connectivity: {
    online: true,
    speed: 'medium',
  },
  performance: {
    pageLoadTime: 0,
    apiResponseTime: 0,
    errorCount: 0,
    warningCount: 0,
  },
  loading: false,
  error: null,
  lastUpdated: null,
  sidebarOpen: false,
  mobileMenuOpen: false,
  searchOpen: false,
  initialized: false,
  updateAvailable: false,
  criticalError: false,
};

// Reducer
const globalReducer = (state: GlobalState, action: GlobalAction): GlobalState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_APP_CONFIG':
      return {
        ...state,
        appConfig: action.payload,
        lastUpdated: new Date(),
      };
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
        lastUpdated: new Date(),
      };
    
    case 'SET_CONNECTIVITY':
      return { ...state, connectivity: action.payload };
    
    case 'UPDATE_PERFORMANCE':
      return {
        ...state,
        performance: { ...state.performance, ...action.payload },
      };
    
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    
    case 'TOGGLE_MOBILE_MENU':
      return { ...state, mobileMenuOpen: !state.mobileMenuOpen };
    
    case 'TOGGLE_SEARCH':
      return { ...state, searchOpen: !state.searchOpen };
    
    case 'SET_INITIALIZED':
      return { ...state, initialized: action.payload };
    
    case 'SET_UPDATE_AVAILABLE':
      return { ...state, updateAvailable: action.payload };
    
    case 'SET_CRITICAL_ERROR':
      return { ...state, criticalError: action.payload };
    
    case 'RESET_STATE':
      return { ...initialState, initialized: true };
    
    default:
      return state;
  }
};

// Context
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// Provider component
interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(globalReducer, initialState);
  
  // Initialize app on mount
  useEffect(() => {
    initializeApp();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Monitor connectivity
  useEffect(() => {
    const handleOnline = () => {
      dispatch({
        type: 'SET_CONNECTIVITY',
        payload: { online: true, speed: 'medium' },
      });
      toast.success('Connection restored');
    };
    
    const handleOffline = () => {
      dispatch({
        type: 'SET_CONNECTIVITY',
        payload: {
          online: false,
          speed: 'slow',
          lastOnline: new Date(),
        },
      });
      toast.error('Connection lost');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Load settings from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('vardhman_settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);
  
  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vardhman_settings', JSON.stringify(state.settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [state.settings]);
  
  // Context methods
  const initializeApp = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Load app configuration
      const configResponse = await fetch('/api/config');
      if (configResponse.ok) {
        const config = await configResponse.json();
        dispatch({ type: 'SET_APP_CONFIG', payload: config });
      }
      
      // Check for updates
      await checkForUpdates();
      
      dispatch({ type: 'SET_INITIALIZED', payload: true });
    } catch (error) {
      console.error('App initialization failed:', error);
      setError('Failed to initialize application');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const updateAppConfig = async (config: Partial<AppConfig>): Promise<void> => {
    try {
      const response = await fetch('/api/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      
      if (!response.ok) throw new Error('Failed to update configuration');
      
      const updatedConfig = await response.json();
      dispatch({ type: 'SET_APP_CONFIG', payload: updatedConfig });
      toast.success('Configuration updated');
    } catch (error) {
      console.error('Failed to update app config:', error);
      toast.error('Failed to update configuration');
    }
  };
  
  const checkForUpdates = async (): Promise<void> => {
    try {
      const response = await fetch('/api/version');
      if (response.ok) {
        const { version: latestVersion } = await response.json();
        if (latestVersion !== state.appConfig.version) {
          dispatch({ type: 'SET_UPDATE_AVAILABLE', payload: true });
        }
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  };
  
  const updateSettings = async (settings: Partial<GlobalSettings>): Promise<void> => {
    try {
      dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
      
      // Sync with server if user is authenticated
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        // Revert on error (optimistic update)
        console.warn('Failed to sync settings with server');
      }
      
      toast.success('Settings updated');
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update settings');
    }
  };
  
  const resetSettings = async (): Promise<void> => {
    try {
      dispatch({ type: 'UPDATE_SETTINGS', payload: defaultSettings });
      localStorage.removeItem('vardhman_settings');
      toast.success('Settings reset to default');
    } catch (error) {
      console.error('Failed to reset settings:', error);
      toast.error('Failed to reset settings');
    }
  };
  
  const exportSettings = (): string => {
    return JSON.stringify(state.settings, null, 2);
  };
  
  const importSettings = async (settingsJson: string): Promise<boolean> => {
    try {
      const settings = JSON.parse(settingsJson);
      await updateSettings(settings);
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      toast.error('Invalid settings format');
      return false;
    }
  };
  
  const toggleSidebar = (): void => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };
  
  const toggleMobileMenu = (): void => {
    dispatch({ type: 'TOGGLE_MOBILE_MENU' });
  };
  
  const toggleSearch = (): void => {
    dispatch({ type: 'TOGGLE_SEARCH' });
  };
  
  const setError = (error: string | null): void => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };
  
  const clearError = (): void => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };
  
  const reportError = async (error: Error, context?: string): Promise<void> => {
    try {
      // Log error locally
      console.error('Error reported:', error, context);
      
      // Update error count
      dispatch({
        type: 'UPDATE_PERFORMANCE',
        payload: { errorCount: state.performance.errorCount + 1 },
      });
      
      // Report to error tracking service
      await fetch('/api/errors/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
          context,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };
  
  const recordPageLoad = (loadTime: number): void => {
    dispatch({
      type: 'UPDATE_PERFORMANCE',
      payload: { pageLoadTime: loadTime },
    });
  };
  
  const recordApiCall = (responseTime: number): void => {
    dispatch({
      type: 'UPDATE_PERFORMANCE',
      payload: { apiResponseTime: responseTime },
    });
  };
  
  const getPerformanceStats = (): Performance => state.performance;
  
  const isFeatureEnabled = (feature: keyof AppConfig['features']): boolean => {
    return state.appConfig.features[feature] ?? false;
  };
  
  const getAppInfo = () => ({
    name: state.appConfig.siteName,
    version: state.appConfig.version,
    buildDate: process.env.NEXT_PUBLIC_BUILD_DATE,
  });
  
  const isMaintenanceMode = (): boolean => {
    return state.appConfig.maintenance.enabled;
  };
  
  const contextValue: GlobalContextType = {
    state,
    initializeApp,
    updateAppConfig,
    checkForUpdates,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
    toggleSidebar,
    toggleMobileMenu,
    toggleSearch,
    setError,
    clearError,
    reportError,
    recordPageLoad,
    recordApiCall,
    getPerformanceStats,
    isFeatureEnabled,
    getAppInfo,
    isMaintenanceMode,
  };
  
  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};

// Hook
export const useGlobal = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
};

export default GlobalContext;
export type { AppConfig, GlobalSettings, ConnectivityStatus, Performance, GlobalState };