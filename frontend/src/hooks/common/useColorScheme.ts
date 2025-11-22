import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Color scheme types
 */
export type ColorScheme = 'light' | 'dark' | 'system';
export type ResolvedColorScheme = 'light' | 'dark';

/**
 * Theme configuration
 */
export interface ThemeConfig {
  enableSystemTheme?: boolean;
  enableTransitions?: boolean;
  transitionDuration?: number;
  storageKey?: string;
  defaultScheme?: ColorScheme;
  respectReducedMotion?: boolean;
}

/**
 * Color scheme state
 */
export interface ColorSchemeState {
  scheme: ColorScheme;
  resolvedScheme: ResolvedColorScheme;
  isSystemScheme: boolean;
  isLoading: boolean;
  isSupported: boolean;
}

/**
 * Default theme configuration
 */
const DEFAULT_CONFIG: Required<ThemeConfig> = {
  enableSystemTheme: true,
  enableTransitions: true,
  transitionDuration: 200,
  storageKey: 'color-scheme',
  defaultScheme: 'system',
  respectReducedMotion: true,
};

/**
 * Color scheme management hook
 */
export const useColorScheme = (config: ThemeConfig = {}) => {
  const settings = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  
  const [state, setState] = useState<ColorSchemeState>({
    scheme: settings.defaultScheme,
    resolvedScheme: 'light',
    isSystemScheme: false,
    isLoading: true,
    isSupported: false,
  });

  // Check if system theme is supported
  const isSystemSupported = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return typeof window.matchMedia === 'function';
  }, []);

  // Get system color scheme
  const getSystemScheme = useCallback((): ResolvedColorScheme => {
    if (!isSystemSupported) return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, [isSystemSupported]);

  // Get stored color scheme
  const getStoredScheme = useCallback((): ColorScheme | null => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(settings.storageKey);
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        return stored as ColorScheme;
      }
    } catch {
      // Storage access failed
    }
    return null;
  }, [settings.storageKey]);

  // Store color scheme
  const setStoredScheme = useCallback((scheme: ColorScheme) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(settings.storageKey, scheme);
    } catch {
      // Storage access failed
    }
  }, [settings.storageKey]);

  // Resolve color scheme to actual theme
  const resolveScheme = useCallback((scheme: ColorScheme): ResolvedColorScheme => {
    if (scheme === 'system') {
      return getSystemScheme();
    }
    return scheme;
  }, [getSystemScheme]);

  // Apply theme to document
  const applyTheme = useCallback((resolvedScheme: ResolvedColorScheme) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add new theme class
    root.classList.add(resolvedScheme);
    
    // Set data attribute for CSS
    root.setAttribute('data-theme', resolvedScheme);
    
    // Set color-scheme CSS property
    root.style.colorScheme = resolvedScheme;

    // Apply transition if enabled
    if (settings.enableTransitions && !settings.respectReducedMotion) {
      root.style.transition = `color ${settings.transitionDuration}ms ease-in-out, background-color ${settings.transitionDuration}ms ease-in-out`;
      
      // Remove transition after duration to avoid interfering with other animations
      setTimeout(() => {
        root.style.transition = '';
      }, settings.transitionDuration);
    }

    // Check for reduced motion preference
    if (settings.respectReducedMotion) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion && settings.enableTransitions) {
        root.style.transition = `color ${settings.transitionDuration}ms ease-in-out, background-color ${settings.transitionDuration}ms ease-in-out`;
        setTimeout(() => {
          root.style.transition = '';
        }, settings.transitionDuration);
      }
    }
  }, [settings.enableTransitions, settings.transitionDuration, settings.respectReducedMotion]);

  // Set color scheme
  const setColorScheme = useCallback((newScheme: ColorScheme) => {
    const resolvedScheme = resolveScheme(newScheme);
    const isSystemScheme = newScheme === 'system';
    
    setState(prev => ({
      ...prev,
      scheme: newScheme,
      resolvedScheme,
      isSystemScheme,
    }));
    
    setStoredScheme(newScheme);
    applyTheme(resolvedScheme);
  }, [resolveScheme, setStoredScheme, applyTheme]);

  // Toggle between light and dark
  const toggleColorScheme = useCallback(() => {
    const currentResolved = state.scheme === 'system' ? getSystemScheme() : state.scheme;
    const newScheme: ColorScheme = currentResolved === 'light' ? 'dark' : 'light';
    setColorScheme(newScheme);
  }, [state.scheme, getSystemScheme, setColorScheme]);

  // Reset to default scheme
  const resetColorScheme = useCallback(() => {
    setColorScheme(settings.defaultScheme);
  }, [settings.defaultScheme, setColorScheme]);

  // Initialize theme on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedScheme = getStoredScheme();
    const initialScheme = storedScheme || settings.defaultScheme;
    const resolvedScheme = resolveScheme(initialScheme);
    const isSystemScheme = initialScheme === 'system';

    setState({
      scheme: initialScheme,
      resolvedScheme,
      isSystemScheme,
      isLoading: false,
      isSupported: isSystemSupported,
    });

    applyTheme(resolvedScheme);
  }, [getStoredScheme, settings.defaultScheme, resolveScheme, isSystemSupported, applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (!isSystemSupported || !settings.enableSystemTheme) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (event: MediaQueryListEvent) => {
      if (state.scheme === 'system') {
        const newResolvedScheme = event.matches ? 'dark' : 'light';
        setState(prev => ({ ...prev, resolvedScheme: newResolvedScheme }));
        applyTheme(newResolvedScheme);
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Legacy browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [isSystemSupported, settings.enableSystemTheme, state.scheme, applyTheme]);

  // Computed values
  const isDark = useMemo(() => state.resolvedScheme === 'dark', [state.resolvedScheme]);
  const isLight = useMemo(() => state.resolvedScheme === 'light', [state.resolvedScheme]);
  
  return {
    // State
    scheme: state.scheme,
    resolvedScheme: state.resolvedScheme,
    isSystemScheme: state.isSystemScheme,
    isLoading: state.isLoading,
    isSupported: state.isSupported,
    
    // Computed
    isDark,
    isLight,
    
    // Actions
    setColorScheme,
    toggleColorScheme,
    resetColorScheme,
    
    // Utils
    getSystemScheme,
    resolveScheme,
  };
};

/**
 * Simple hook for theme toggle
 */
export const useThemeToggle = () => {
  const { isDark, toggleColorScheme } = useColorScheme();
  return { isDark, toggle: toggleColorScheme };
};

/**
 * Hook for theme-aware CSS classes
 */
export const useThemeClasses = (lightClass: string, darkClass: string) => {
  const { resolvedScheme } = useColorScheme();
  return resolvedScheme === 'dark' ? darkClass : lightClass;
};

export default useColorScheme;