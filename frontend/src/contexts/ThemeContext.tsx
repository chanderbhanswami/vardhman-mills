/**
 * Theme Context - Vardhman Mills Frontend
 * Manages theme, dark mode, and UI preferences
 */

'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

// Types
interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
  fontSize: 'sm' | 'md' | 'lg';
  borderRadius: 'none' | 'sm' | 'md' | 'lg';
  animations: boolean;
  reducedMotion: boolean;
}

interface ThemeState {
  config: ThemeConfig;
  isDark: boolean;
  systemPreference: 'light' | 'dark';
  loading: boolean;
}

type ThemeAction =
  | { type: 'SET_THEME'; payload: Partial<ThemeConfig> }
  | { type: 'SET_DARK'; payload: boolean }
  | { type: 'SET_SYSTEM_PREFERENCE'; payload: 'light' | 'dark' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESET_THEME' };

interface ThemeContextType {
  state: ThemeState;
  setTheme: (theme: Partial<ThemeConfig>) => void;
  toggleDarkMode: () => void;
  resetTheme: () => void;
  applyTheme: () => void;
}

// Default theme
const defaultTheme: ThemeConfig = {
  mode: 'system',
  primaryColor: '#3B82F6',
  accentColor: '#10B981',
  fontSize: 'md',
  borderRadius: 'md',
  animations: true,
  reducedMotion: false,
};

// Initial state
const initialState: ThemeState = {
  config: defaultTheme,
  isDark: false,
  systemPreference: 'light',
  loading: false,
};

// Reducer
const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case 'SET_THEME':
      return {
        ...state,
        config: { ...state.config, ...action.payload },
      };
    
    case 'SET_DARK':
      return { ...state, isDark: action.payload };
    
    case 'SET_SYSTEM_PREFERENCE':
      return { ...state, systemPreference: action.payload };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'RESET_THEME':
      return { ...state, config: defaultTheme };
    
    default:
      return state;
  }
};

// Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);
  
  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme);
        dispatch({ type: 'SET_THEME', payload: theme });
      } catch (error) {
        console.error('Failed to load theme:', error);
      }
    }
  }, []);
  
  // Monitor system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      dispatch({ type: 'SET_SYSTEM_PREFERENCE', payload: e.matches ? 'dark' : 'light' });
    };
    
    dispatch({ type: 'SET_SYSTEM_PREFERENCE', payload: mediaQuery.matches ? 'dark' : 'light' });
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // Update isDark based on mode and system preference
  useEffect(() => {
    let isDark = false;
    
    if (state.config.mode === 'dark') {
      isDark = true;
    } else if (state.config.mode === 'system') {
      isDark = state.systemPreference === 'dark';
    }
    
    dispatch({ type: 'SET_DARK', payload: isDark });
  }, [state.config.mode, state.systemPreference]);
  
  const setTheme = (theme: Partial<ThemeConfig>): void => {
    dispatch({ type: 'SET_THEME', payload: theme });
    
    const newTheme = { ...state.config, ...theme };
    localStorage.setItem('theme', JSON.stringify(newTheme));
    
    toast.success('Theme updated');
  };
  
  const toggleDarkMode = (): void => {
    const newMode = state.isDark ? 'light' : 'dark';
    setTheme({ mode: newMode });
  };
  
  const resetTheme = (): void => {
    dispatch({ type: 'RESET_THEME' });
    localStorage.setItem('theme', JSON.stringify(defaultTheme));
    toast.success('Theme reset to default');
  };
  
  const applyTheme = (): void => {
    const root = document.documentElement;
    
    // Apply dark/light class
    if (state.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Apply CSS variables
    root.style.setProperty('--primary-color', state.config.primaryColor);
    root.style.setProperty('--accent-color', state.config.accentColor);
    
    // Apply font size
    const fontSizes = { sm: '14px', md: '16px', lg: '18px' };
    root.style.setProperty('--base-font-size', fontSizes[state.config.fontSize]);
    
    // Apply border radius
    const radiusValues = { none: '0px', sm: '4px', md: '8px', lg: '12px' };
    root.style.setProperty('--border-radius', radiusValues[state.config.borderRadius]);
    
    // Apply animations
    if (!state.config.animations || state.config.reducedMotion) {
      root.style.setProperty('--animation-duration', '0ms');
    } else {
      root.style.setProperty('--animation-duration', '300ms');
    }
  };
  
  // Apply theme on changes
  useEffect(() => {
    applyTheme();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.config, state.isDark]);
  
  return (
    <ThemeContext.Provider value={{
      state,
      setTheme,
      toggleDarkMode,
      resetTheme,
      applyTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
export type { ThemeConfig, ThemeState };