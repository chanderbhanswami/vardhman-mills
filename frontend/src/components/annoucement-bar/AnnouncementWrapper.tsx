"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnnouncementBar from './AnnouncementBar';
import AnnouncementSkeleton from './AnnouncementSkeleton';
import { AnnouncementBar as AnnouncementBarType } from '@/types/announcementBar.types';

interface AnnouncementWrapperProps {
  // Data source
  announcements?: AnnouncementBarType[];
  apiEndpoint?: string;
  
  // Display configuration
  position?: 'top' | 'bottom';
  maxVisible?: number;
  stackDirection?: 'newest-first' | 'oldest-first' | 'priority-first';
  
  // Behavior
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
  enablePersistence?: boolean;
  respectUserPreferences?: boolean;
  
  // Loading states
  showSkeleton?: boolean;
  skeletonVariant?: 'compact' | 'standard' | 'detailed';
  
  // Animation
  animationDuration?: number;
  staggerDelay?: number;
  
  // Event handlers
  onAnnouncementView?: (announcement: AnnouncementBarType) => void;
  onAnnouncementClick?: (announcement: AnnouncementBarType, actionId?: string) => void;
  onAnnouncementDismiss?: (announcement: AnnouncementBarType, permanent: boolean) => void;
  onError?: (error: Error) => void;
  
  // Styling
  className?: string;
  containerClassName?: string;
  
  // Development
  debugMode?: boolean;
}

interface AnnouncementState {
  announcements: AnnouncementBarType[];
  loading: boolean;
  error: Error | null;
  lastRefresh: Date | null;
  userPreferences: UserPreferences;
}

interface UserPreferences {
  dismissedIds: string[];
  seenIds: string[];
  frequencyCap: { [announcementId: string]: number };
  lastDismissalTime: { [announcementId: string]: Date };
  globallyDisabled: boolean;
  categoryPreferences: { [category: string]: boolean };
}

const AnnouncementWrapper: React.FC<AnnouncementWrapperProps> = ({
  announcements: propAnnouncements,
  apiEndpoint,
  position = 'top',
  maxVisible = 3,
  stackDirection = 'priority-first',
  autoRefresh = true,
  refreshInterval = 300000, // 5 minutes
  enablePersistence = true,
  respectUserPreferences = true,
  showSkeleton = true,
  skeletonVariant = 'standard',
  animationDuration = 0.3,
  staggerDelay = 0.1,
  onAnnouncementView,
  onError,
  className = "",
  containerClassName = "",
  debugMode = false
}) => {
  const [state, setState] = useState<AnnouncementState>({
    announcements: propAnnouncements || [],
    loading: !propAnnouncements && !!apiEndpoint,
    error: null,
    lastRefresh: null,
    userPreferences: {
      dismissedIds: [],
      seenIds: [],
      frequencyCap: {},
      lastDismissalTime: {},
      globallyDisabled: false,
      categoryPreferences: {}
    }
  });

  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load user preferences from localStorage
  const loadUserPreferences = useCallback((): UserPreferences => {
    if (!enablePersistence || typeof window === 'undefined') {
      return state.userPreferences;
    }

    try {
      const stored = localStorage.getItem('announcementPreferences');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          dismissedIds: parsed.dismissedIds || [],
          seenIds: parsed.seenIds || [],
          frequencyCap: parsed.frequencyCap || {},
          lastDismissalTime: parsed.lastDismissalTime ? 
            Object.fromEntries(
              Object.entries(parsed.lastDismissalTime).map(([k, v]) => [k, new Date(v as string)])
            ) : {},
          globallyDisabled: parsed.globallyDisabled || false,
          categoryPreferences: parsed.categoryPreferences || {}
        };
      }
    } catch (error) {
      if (debugMode) {
        console.error('Failed to load user preferences:', error);
      }
    }

    return state.userPreferences;
  }, [enablePersistence, state.userPreferences, debugMode]);

  // Save user preferences to localStorage
  const saveUserPreferences = useCallback((preferences: UserPreferences) => {
    if (!enablePersistence || typeof window === 'undefined') return;

    try {
      const toStore = {
        ...preferences,
        lastDismissalTime: Object.fromEntries(
          Object.entries(preferences.lastDismissalTime).map(([k, v]) => [k, v.toISOString()])
        )
      };
      localStorage.setItem('announcementPreferences', JSON.stringify(toStore));
    } catch (error) {
      if (debugMode) {
        console.error('Failed to save user preferences:', error);
      }
    }
  }, [enablePersistence, debugMode]);

  // Fetch announcements from API
  const fetchAnnouncements = useCallback(async () => {
    if (!apiEndpoint) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch(apiEndpoint);
      if (!response.ok) {
        throw new Error(`Failed to fetch announcements: ${response.statusText}`);
      }

      const data = await response.json();
      const announcements = Array.isArray(data) ? data : data.announcements || [];

      setState(prev => ({
        ...prev,
        announcements,
        loading: false,
        lastRefresh: new Date()
      }));

      if (debugMode) {
        console.log('Fetched announcements:', announcements);
      }
    } catch (error) {
      const err = error as Error;
      setState(prev => ({ ...prev, loading: false, error: err }));
      onError?.(err);
      
      if (debugMode) {
        console.error('Failed to fetch announcements:', error);
      }
    }
  }, [apiEndpoint, onError, debugMode]);

  // Filter and sort announcements
  const getVisibleAnnouncements = useCallback(() => {
    const filtered = state.announcements.filter(announcement => {
      // Skip if globally disabled
      if (respectUserPreferences && state.userPreferences.globallyDisabled) {
        return false;
      }

      // Skip if dismissed
      if (respectUserPreferences && state.userPreferences.dismissedIds.includes(announcement.id)) {
        return false;
      }

      // Skip if category disabled
      if (respectUserPreferences && 
          announcement.type && 
          state.userPreferences.categoryPreferences[announcement.type] === false) {
        return false;
      }

      // Check frequency cap
      if (respectUserPreferences && announcement.schedule.maxDisplaysPerUser) {
        const displayCount = state.userPreferences.frequencyCap[announcement.id] || 0;
        if (displayCount >= announcement.schedule.maxDisplaysPerUser) {
          return false;
        }
      }

      // Check cooldown period
      if (respectUserPreferences && announcement.schedule.cooldownPeriod) {
        const lastDismissal = state.userPreferences.lastDismissalTime[announcement.id];
        if (lastDismissal) {
          const cooldownMs = announcement.schedule.cooldownPeriod * 60 * 60 * 1000;
          if (Date.now() - lastDismissal.getTime() < cooldownMs) {
            return false;
          }
        }
      }

      // Check if announcement should be active
      const now = new Date();
      const startDate = new Date(announcement.schedule.startDate);
      const endDate = announcement.schedule.endDate ? new Date(announcement.schedule.endDate) : null;

      if (now < startDate || (endDate && now > endDate)) {
        return false;
      }

      return announcement.status === 'active';
    });

    // Sort announcements
    filtered.sort((a, b) => {
      switch (stackDirection) {
        case 'priority-first':
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
          const aPriority = priorityOrder[a.priority] ?? 5;
          const bPriority = priorityOrder[b.priority] ?? 5;
          if (aPriority !== bPriority) return aPriority - bPriority;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

        case 'newest-first':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

        case 'oldest-first':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

        default:
          return 0;
      }
    });

    // Limit to maxVisible
    return filtered.slice(0, maxVisible);
  }, [state.announcements, state.userPreferences, respectUserPreferences, stackDirection, maxVisible]);

  // Handle announcement view (intersection observer)
  const handleAnnouncementView = useCallback((announcement: AnnouncementBarType) => {
    if (respectUserPreferences && !state.userPreferences.seenIds.includes(announcement.id)) {
      const updatedPreferences = {
        ...state.userPreferences,
        seenIds: [...state.userPreferences.seenIds, announcement.id]
      };
      
      setState(prev => ({ ...prev, userPreferences: updatedPreferences }));
      saveUserPreferences(updatedPreferences);
    }

    onAnnouncementView?.(announcement);
  }, [respectUserPreferences, state.userPreferences, saveUserPreferences, onAnnouncementView]);

  // Note: Click and dismissal handlers are managed internally by individual AnnouncementBar components
  // This wrapper focuses on data management, filtering, and orchestration

  // Set up intersection observer for view tracking
  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const announcementId = entry.target.getAttribute('data-announcement-id');
            const announcement = state.announcements.find(a => a.id === announcementId);
            if (announcement) {
              handleAnnouncementView(announcement);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    const elements = containerRef.current.querySelectorAll('[data-announcement-id]');
    elements.forEach(element => observerRef.current?.observe(element));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [state.announcements, handleAnnouncementView]);

  // Load user preferences on mount
  useEffect(() => {
    const preferences = loadUserPreferences();
    setState(prev => ({ ...prev, userPreferences: preferences }));
  }, [loadUserPreferences]);

  // Initial fetch and auto-refresh setup
  useEffect(() => {
    if (apiEndpoint) {
      fetchAnnouncements();

      if (autoRefresh && refreshInterval > 0) {
        refreshTimeoutRef.current = setInterval(fetchAnnouncements, refreshInterval);
      }
    } else if (propAnnouncements) {
      setState(prev => ({ ...prev, announcements: propAnnouncements, loading: false }));
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current);
      }
    };
  }, [apiEndpoint, propAnnouncements, fetchAnnouncements, autoRefresh, refreshInterval]);

  // Update announcements when prop changes
  useEffect(() => {
    if (propAnnouncements && !apiEndpoint) {
      setState(prev => ({ ...prev, announcements: propAnnouncements }));
    }
  }, [propAnnouncements, apiEndpoint]);

  const visibleAnnouncements = getVisibleAnnouncements();

  // Show loading skeleton
  if (state.loading && showSkeleton) {
    return (
      <div className={`${containerClassName} ${className}`}>
        <AnnouncementSkeleton
          position={position}
          variant={skeletonVariant}
        />
      </div>
    );
  }

  // Show error state (only in debug mode)
  if (state.error && debugMode) {
    return (
      <div 
        className={`
          ${position === 'top' ? 'top-0' : 'bottom-0'} 
          left-0 right-0 z-50 bg-red-600 text-white p-2 text-center text-sm
          ${containerClassName} ${className}
        `}
      >
        Error loading announcements: {state.error.message}
      </div>
    );
  }

  // No announcements to show
  if (visibleAnnouncements.length === 0) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={`
        ${position === 'top' ? 'top-0' : 'bottom-0'} 
        left-0 right-0 z-50 
        ${containerClassName} ${className}
      `}
      role="region"
      aria-label="Announcements"
    >
      <AnimatePresence mode="popLayout">
        {visibleAnnouncements.map((announcement, index) => (
          <motion.div
            key={announcement.id}
            data-announcement-id={announcement.id}
            initial={{ 
              opacity: 0, 
              y: position === 'top' ? -50 : 50,
              scale: 0.95
            }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: 1
            }}
            exit={{ 
              opacity: 0, 
              y: position === 'top' ? -50 : 50,
              scale: 0.95
            }}
            transition={{
              duration: animationDuration,
              delay: index * staggerDelay,
              ease: "easeOut"
            }}
            style={{
              zIndex: 50 + (visibleAnnouncements.length - index)
            }}
          >
            <AnnouncementBar
              announcements={[announcement]}
              position={position}
              autoRotate={false}
              showControls={visibleAnnouncements.length > 1}
              className={index > 0 && stackDirection !== 'priority-first' ? 'mt-1' : ''}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Debug info */}
      {debugMode && (
        <div 
          className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs max-w-sm z-[9999] font-mono"
        >
          <div><strong>Announcements Debug</strong></div>
          <div>Total: {state.announcements.length}</div>
          <div>Visible: {visibleAnnouncements.length}</div>
          <div>Dismissed: {state.userPreferences.dismissedIds.length}</div>
          <div>Last Refresh: {state.lastRefresh?.toLocaleTimeString() || 'Never'}</div>
          <div>Loading: {state.loading ? 'Yes' : 'No'}</div>
          <div>Error: {state.error ? state.error.message : 'None'}</div>
        </div>
      )}
    </div>
  );
};

// Utility function to manually refresh announcements
export const useAnnouncementRefresh = () => {
  const [, forceUpdate] = useState({});
  
  const refresh = useCallback(() => {
    forceUpdate({});
  }, []);

  return refresh;
};

// HOC for providing announcement context
export const withAnnouncementProvider = <P extends Record<string, unknown>>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  const WrappedComponent: React.FC<P> = (props) => {
    return <Component {...props} />;
  };
  
  WrappedComponent.displayName = `withAnnouncementProvider(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default AnnouncementWrapper;
