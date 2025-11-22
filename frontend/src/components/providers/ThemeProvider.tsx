'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/localStorage/useLocalStorage';

// Types
export type Theme = 'light' | 'dark' | 'system';
export type ColorScheme = 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'red';
export type FontSize = 'sm' | 'md' | 'lg' | 'xl';
export type Spacing = 'compact' | 'normal' | 'comfortable';

export interface ThemeSettings {
  theme: Theme;
  colorScheme: ColorScheme;
  fontSize: FontSize;
  spacing: Spacing;
  highContrast: boolean;
  reducedMotion: boolean;
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    surface?: string;
    text?: string;
  };
}

export interface ThemeContextType {
  // Current theme state
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  settings: ThemeSettings;
  
  // Theme actions
  setTheme: (theme: Theme) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setFontSize: (size: FontSize) => void;
  setSpacing: (spacing: Spacing) => void;
  toggleTheme: () => void;
  
  // Accessibility
  setHighContrast: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  
  // Custom styling
  setCustomColors: (colors: ThemeSettings['customColors']) => void;
  resetToDefaults: () => void;
  
  // Utilities
  isDark: boolean;
  isLight: boolean;
  isSystemTheme: boolean;
  getThemeClasses: () => string;
  getCSSVariables: () => Record<string, string>;
}

// Default theme settings
const defaultSettings: ThemeSettings = {
  theme: 'system',
  colorScheme: 'default',
  fontSize: 'md',
  spacing: 'normal',
  highContrast: false,
  reducedMotion: false
};

// Color scheme configurations
const colorSchemes = {
  default: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    accent: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  blue: {
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#0ea5e9',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626'
  },
  green: {
    primary: '#059669',
    secondary: '#6b7280',
    accent: '#10b981',
    success: '#22c55e',
    warning: '#eab308',
    error: '#dc2626'
  },
  purple: {
    primary: '#7c3aed',
    secondary: '#6b7280',
    accent: '#a855f7',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  orange: {
    primary: '#ea580c',
    secondary: '#6b7280',
    accent: '#f97316',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  red: {
    primary: '#dc2626',
    secondary: '#6b7280',
    accent: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#f87171'
  }
};

// Font size configurations
const fontSizes = {
  sm: {
    '--font-size-xs': '0.625rem',
    '--font-size-sm': '0.75rem',
    '--font-size-base': '0.875rem',
    '--font-size-lg': '1rem',
    '--font-size-xl': '1.125rem',
    '--font-size-2xl': '1.25rem',
    '--font-size-3xl': '1.5rem'
  },
  md: {
    '--font-size-xs': '0.75rem',
    '--font-size-sm': '0.875rem',
    '--font-size-base': '1rem',
    '--font-size-lg': '1.125rem',
    '--font-size-xl': '1.25rem',
    '--font-size-2xl': '1.5rem',
    '--font-size-3xl': '1.875rem'
  },
  lg: {
    '--font-size-xs': '0.875rem',
    '--font-size-sm': '1rem',
    '--font-size-base': '1.125rem',
    '--font-size-lg': '1.25rem',
    '--font-size-xl': '1.5rem',
    '--font-size-2xl': '1.875rem',
    '--font-size-3xl': '2.25rem'
  },
  xl: {
    '--font-size-xs': '1rem',
    '--font-size-sm': '1.125rem',
    '--font-size-base': '1.25rem',
    '--font-size-lg': '1.5rem',
    '--font-size-xl': '1.875rem',
    '--font-size-2xl': '2.25rem',
    '--font-size-3xl': '3rem'
  }
};

// Spacing configurations
const spacingConfig = {
  compact: {
    '--spacing-xs': '0.25rem',
    '--spacing-sm': '0.5rem',
    '--spacing-md': '0.75rem',
    '--spacing-lg': '1rem',
    '--spacing-xl': '1.5rem',
    '--spacing-2xl': '2rem'
  },
  normal: {
    '--spacing-xs': '0.5rem',
    '--spacing-sm': '0.75rem',
    '--spacing-md': '1rem',
    '--spacing-lg': '1.5rem',
    '--spacing-xl': '2rem',
    '--spacing-2xl': '3rem'
  },
  comfortable: {
    '--spacing-xs': '0.75rem',
    '--spacing-sm': '1rem',
    '--spacing-md': '1.5rem',
    '--spacing-lg': '2rem',
    '--spacing-xl': '3rem',
    '--spacing-2xl': '4rem'
  }
};

// Context Creation
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Hook to use Theme Context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme Provider Component
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  attribute?: string;
  value?: Record<string, string>;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
  enableSystem = true,
  attribute = 'data-theme',
  value = { light: 'light', dark: 'dark' }
}) => {
  // Persistent storage
  const themeStorage = useLocalStorage<ThemeSettings>('theme-settings', { defaultValue: defaultSettings });
  
  // State
  const [settings, setSettings] = useState<ThemeSettings>(() => {
    const stored = themeStorage.value || defaultSettings;
    return {
      ...stored,
      theme: stored.theme || defaultTheme
    };
  });
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Get resolved theme
  const resolvedTheme = settings.theme === 'system' ? systemTheme : settings.theme;
  const isDark = resolvedTheme === 'dark';
  const isLight = resolvedTheme === 'light';
  const isSystemTheme = settings.theme === 'system';

  // Update storage when settings change
  useEffect(() => {
    themeStorage.setValue(settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystem) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [enableSystem]);

  // Listen for system motion preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches && !settings.reducedMotion) {
        setSettings(prev => ({ ...prev, reducedMotion: true }));
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.reducedMotion]);

  // Set mounted after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Actions
  const setTheme = useCallback((theme: Theme) => {
    setSettings(prev => ({ ...prev, theme }));
  }, []);

  const setColorScheme = useCallback((colorScheme: ColorScheme) => {
    setSettings(prev => ({ ...prev, colorScheme }));
  }, []);

  const setFontSize = useCallback((fontSize: FontSize) => {
    setSettings(prev => ({ ...prev, fontSize }));
  }, []);

  const setSpacing = useCallback((spacing: Spacing) => {
    setSettings(prev => ({ ...prev, spacing }));
  }, []);

  const toggleTheme = useCallback(() => {
    if (settings.theme === 'system') {
      setTheme(systemTheme === 'dark' ? 'light' : 'dark');
    } else {
      setTheme(settings.theme === 'dark' ? 'light' : 'dark');
    }
  }, [settings.theme, systemTheme, setTheme]);

  const setHighContrast = useCallback((highContrast: boolean) => {
    setSettings(prev => ({ ...prev, highContrast }));
  }, []);

  const setReducedMotion = useCallback((reducedMotion: boolean) => {
    setSettings(prev => ({ ...prev, reducedMotion }));
  }, []);

  const setCustomColors = useCallback((customColors: ThemeSettings['customColors']) => {
    setSettings(prev => ({ ...prev, customColors }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  // Utilities
  const getThemeClasses = useCallback((): string => {
    const classes = [];
    
    // Base theme
    classes.push(resolvedTheme);
    
    // Color scheme
    if (settings.colorScheme !== 'default') {
      classes.push(`scheme-${settings.colorScheme}`);
    }
    
    // Font size
    if (settings.fontSize !== 'md') {
      classes.push(`text-${settings.fontSize}`);
    }
    
    // Spacing
    if (settings.spacing !== 'normal') {
      classes.push(`spacing-${settings.spacing}`);
    }
    
    // Accessibility
    if (settings.highContrast) {
      classes.push('high-contrast');
    }
    
    if (settings.reducedMotion) {
      classes.push('reduced-motion');
    }
    
    return classes.join(' ');
  }, [resolvedTheme, settings]);

  const getCSSVariables = useCallback((): Record<string, string> => {
    const variables: Record<string, string> = {};
    
    // Color scheme variables
    const scheme = colorSchemes[settings.colorScheme];
    Object.entries(scheme).forEach(([key, value]) => {
      variables[`--color-${key}`] = value;
    });
    
    // Custom colors override
    if (settings.customColors) {
      Object.entries(settings.customColors).forEach(([key, value]) => {
        if (value) {
          variables[`--color-${key}`] = value;
        }
      });
    }
    
    // Font size variables
    Object.assign(variables, fontSizes[settings.fontSize]);
    
    // Spacing variables
    Object.assign(variables, spacingConfig[settings.spacing]);
    
    // High contrast adjustments
    if (settings.highContrast) {
      variables['--contrast-ratio'] = '7:1';
      variables['--border-width'] = '2px';
    } else {
      variables['--contrast-ratio'] = '4.5:1';
      variables['--border-width'] = '1px';
    }
    
    // Motion preferences
    if (settings.reducedMotion) {
      variables['--transition-duration'] = '0ms';
      variables['--animation-duration'] = '0ms';
    } else {
      variables['--transition-duration'] = '200ms';
      variables['--animation-duration'] = '300ms';
    }
    
    return variables;
  }, [settings]);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    // Apply theme attribute
    root.setAttribute(attribute, value[resolvedTheme] || resolvedTheme);
    
    // Apply CSS variables
    const cssVars = getCSSVariables();
    Object.entries(cssVars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });

    // Apply classes
    const classes = getThemeClasses();
    root.className = classes;

  }, [mounted, resolvedTheme, settings, attribute, value, getCSSVariables, getThemeClasses]);

  // Context value
  const contextValue: ThemeContextType = {
    // Current theme state
    theme: settings.theme,
    resolvedTheme,
    settings,
    
    // Theme actions
    setTheme,
    setColorScheme,
    setFontSize,
    setSpacing,
    toggleTheme,
    
    // Accessibility
    setHighContrast,
    setReducedMotion,
    
    // Custom styling
    setCustomColors,
    resetToDefaults,
    
    // Utilities
    isDark,
    isLight,
    isSystemTheme,
    getThemeClasses,
    getCSSVariables,
  };

  // Prevent flash of incorrect theme
  if (!mounted) {
    return <div className="hidden">{children}</div>;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
