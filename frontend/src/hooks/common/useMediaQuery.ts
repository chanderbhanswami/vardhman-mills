import { useState, useEffect, useCallback } from 'react';

export interface MediaQueryOptions {
  defaultMatches?: boolean;
  noSsr?: boolean;
  ssrMatchMedia?: (query: string) => { matches: boolean };
}

export interface MediaQueryReturn {
  matches: boolean;
  media: string;
}

// Common breakpoints
export const breakpoints = {
  xs: '(max-width: 575px)',
  sm: '(min-width: 576px) and (max-width: 767px)',
  md: '(min-width: 768px) and (max-width: 991px)',
  lg: '(min-width: 992px) and (max-width: 1199px)',
  xl: '(min-width: 1200px)',
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  retina: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
  touch: '(pointer: coarse)',
  mouse: '(pointer: fine)',
  darkMode: '(prefers-color-scheme: dark)',
  lightMode: '(prefers-color-scheme: light)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
  highContrast: '(prefers-contrast: high)',
} as const;

export const useMediaQuery = (
  query: string,
  options: MediaQueryOptions = {}
): boolean => {
  const {
    defaultMatches = false,
    noSsr = false,
    ssrMatchMedia,
  } = options;

  const [matches, setMatches] = useState<boolean>(() => {
    if (noSsr && typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    if (ssrMatchMedia) {
      return ssrMatchMedia(query).matches;
    }
    return defaultMatches;
  });

  const updateMatches = useCallback((event: MediaQueryListEvent) => {
    setMatches(event.matches);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQueryList = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQueryList.matches);

    // Add event listener
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', updateMatches);
    } else {
      // Fallback for older browsers
      mediaQueryList.addListener(updateMatches);
    }

    // Cleanup
    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', updateMatches);
      } else {
        // Fallback for older browsers
        mediaQueryList.removeListener(updateMatches);
      }
    };
  }, [query, updateMatches]);

  return matches;
};

// Hook for multiple media queries
export const useMediaQueries = (
  queries: Record<string, string>,
  options: MediaQueryOptions = {}
): Record<string, boolean> => {
  const [matches, setMatches] = useState<Record<string, boolean>>(() => {
    const initialMatches: Record<string, boolean> = {};
    
    Object.entries(queries).forEach(([key, query]) => {
      if (options.noSsr && typeof window !== 'undefined') {
        initialMatches[key] = window.matchMedia(query).matches;
      } else if (options.ssrMatchMedia) {
        initialMatches[key] = options.ssrMatchMedia(query).matches;
      } else {
        initialMatches[key] = options.defaultMatches || false;
      }
    });
    
    return initialMatches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQueryLists: Record<string, MediaQueryList> = {};
    const listeners: Record<string, (event: MediaQueryListEvent) => void> = {};

    Object.entries(queries).forEach(([key, query]) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryLists[key] = mediaQueryList;
      
      // Set initial value
      setMatches(prev => ({ ...prev, [key]: mediaQueryList.matches }));
      
      // Create listener
      listeners[key] = (event: MediaQueryListEvent) => {
        setMatches(prev => ({ ...prev, [key]: event.matches }));
      };
      
      // Add listener
      if (mediaQueryList.addEventListener) {
        mediaQueryList.addEventListener('change', listeners[key]);
      } else {
        mediaQueryList.addListener(listeners[key]);
      }
    });

    // Cleanup
    return () => {
      Object.entries(mediaQueryLists).forEach(([key, mediaQueryList]) => {
        if (mediaQueryList.removeEventListener) {
          mediaQueryList.removeEventListener('change', listeners[key]);
        } else {
          mediaQueryList.removeListener(listeners[key]);
        }
      });
    };
  }, [queries]);

  return matches;
};

// Predefined responsive hooks
export const useBreakpoint = (breakpoint: keyof typeof breakpoints) => {
  return useMediaQuery(breakpoints[breakpoint]);
};

export const useResponsive = () => {
  return useMediaQueries({
    xs: breakpoints.xs,
    sm: breakpoints.sm,
    md: breakpoints.md,
    lg: breakpoints.lg,
    xl: breakpoints.xl,
    mobile: breakpoints.mobile,
    tablet: breakpoints.tablet,
    desktop: breakpoints.desktop,
  });
};

export const useDeviceType = () => {
  const queries = useMediaQueries({
    mobile: breakpoints.mobile,
    tablet: breakpoints.tablet,
    desktop: breakpoints.desktop,
    touch: breakpoints.touch,
    mouse: breakpoints.mouse,
  });

  return {
    isMobile: queries.mobile,
    isTablet: queries.tablet,
    isDesktop: queries.desktop,
    isTouchDevice: queries.touch,
    isMouseDevice: queries.mouse,
  };
};

export const useColorScheme = () => {
  const isDark = useMediaQuery(breakpoints.darkMode);
  const isLight = useMediaQuery(breakpoints.lightMode);
  
  return {
    isDark,
    isLight,
    scheme: isDark ? 'dark' : isLight ? 'light' : 'no-preference',
  };
};

export const useAccessibilityPreferences = () => {
  return useMediaQueries({
    reducedMotion: breakpoints.reducedMotion,
    highContrast: breakpoints.highContrast,
  });
};

export default useMediaQuery;