import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'promotion' | 'update';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  isDismissible: boolean;
  showCloseButton: boolean;
  backgroundColor?: string;
  textColor?: string;
  buttonText?: string;
  buttonLink?: string;
  buttonAction?: () => void;
  icon?: string;
  animation?: 'slide' | 'fade' | 'bounce' | 'none';
  position: 'top' | 'bottom';
  showOnPages?: string[];
  hideOnPages?: string[];
  targetAudience?: string[];
  maxDisplayCount?: number;
  displayCount?: number;
  clickThrough?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnnouncementBarState {
  announcements: Announcement[];
  currentAnnouncement: Announcement | null;
  isVisible: boolean;
  isMinimized: boolean;
  dismissedAnnouncements: string[];
  displayHistory: Record<string, number>;
  userInteractions: Record<string, { clicks: number; dismissals: number; views: number }>;
  settings: AnnouncementBarSettings;
}

export interface AnnouncementBarSettings {
  enableRotation: boolean;
  rotationInterval: number;
  enableAnimations: boolean;
  defaultPosition: 'top' | 'bottom';
  enablePersistence: boolean;
  enableAnalytics: boolean;
  enableKeyboardNavigation: boolean;
  enableAccessibility: boolean;
  maxConcurrentAnnouncements: number;
  defaultAutoHideDelay: number;
}

export interface AnnouncementFilters {
  type?: 'info' | 'warning' | 'success' | 'error' | 'promotion' | 'update';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  isActive?: boolean;
  dateRange?: { start: Date; end: Date };
  position?: 'top' | 'bottom';
  page?: string;
}

const defaultSettings: AnnouncementBarSettings = {
  enableRotation: true,
  rotationInterval: 5000, // 5 seconds
  enableAnimations: true,
  defaultPosition: 'top',
  enablePersistence: true,
  enableAnalytics: true,
  enableKeyboardNavigation: true,
  enableAccessibility: true,
  maxConcurrentAnnouncements: 1,
  defaultAutoHideDelay: 10000, // 10 seconds
};

// Mock data for demonstration
const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Welcome to Vardhman Mills',
    message: 'Discover our premium textile collection with exclusive discounts for new customers!',
    type: 'promotion',
    priority: 'high',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    isActive: true,
    isDismissible: true,
    showCloseButton: true,
    backgroundColor: '#2563eb',
    textColor: '#ffffff',
    buttonText: 'Shop Now',
    buttonLink: '/products',
    icon: '🎉',
    animation: 'slide',
    position: 'top',
    showOnPages: ['/', '/home', '/products'],
    maxDisplayCount: 5,
    displayCount: 0,
    clickThrough: true,
    autoHide: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    title: 'System Maintenance',
    message: 'Scheduled maintenance will occur on Sunday, 2 AM - 4 AM EST. Some features may be temporarily unavailable.',
    type: 'warning',
    priority: 'medium',
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    endDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
    isActive: true,
    isDismissible: true,
    showCloseButton: true,
    backgroundColor: '#f59e0b',
    textColor: '#ffffff',
    icon: '⚠️',
    animation: 'fade',
    position: 'top',
    autoHide: true,
    autoHideDelay: 15000,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'New Collection Launch',
    message: 'Introducing our Spring/Summer 2024 collection. Premium fabrics, modern designs.',
    type: 'info',
    priority: 'medium',
    startDate: new Date(),
    isActive: true,
    isDismissible: true,
    showCloseButton: true,
    backgroundColor: '#059669',
    textColor: '#ffffff',
    buttonText: 'View Collection',
    buttonLink: '/collections/spring-summer-2024',
    icon: '🌸',
    animation: 'bounce',
    position: 'top',
    clickThrough: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const useAnnouncementBar = () => {
  const [state, setState] = useState<AnnouncementBarState>({
    announcements: [],
    currentAnnouncement: null,
    isVisible: false,
    isMinimized: false,
    dismissedAnnouncements: [],
    displayHistory: {},
    userInteractions: {},
    settings: defaultSettings,
  });

  // Load data from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSettings = localStorage.getItem('announcementBarSettings');
        const dismissedIds = localStorage.getItem('dismissedAnnouncements');
        const displayHistory = localStorage.getItem('displayHistory');
        const userInteractions = localStorage.getItem('userInteractions');

        setState(prev => ({
          ...prev,
          announcements: mockAnnouncements,
          settings: savedSettings ? JSON.parse(savedSettings) : defaultSettings,
          dismissedAnnouncements: dismissedIds ? JSON.parse(dismissedIds) : [],
          displayHistory: displayHistory ? JSON.parse(displayHistory) : {},
          userInteractions: userInteractions ? JSON.parse(userInteractions) : {},
        }));
      } catch (error) {
        console.error('Error loading announcement bar state:', error);
        toast.error('Failed to load announcement preferences');
      }
    }
  }, []);

  // Save state to localStorage
  const saveState = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('dismissedAnnouncements', JSON.stringify(state.dismissedAnnouncements));
        localStorage.setItem('displayHistory', JSON.stringify(state.displayHistory));
        localStorage.setItem('userInteractions', JSON.stringify(state.userInteractions));
        localStorage.setItem('announcementBarSettings', JSON.stringify(state.settings));
      } catch (error) {
        console.error('Error saving announcement bar state:', error);
      }
    }
  }, [state.dismissedAnnouncements, state.displayHistory, state.userInteractions, state.settings]);

  // Auto-save state changes
  useEffect(() => {
    saveState();
  }, [saveState]);

  // Get current page path
  const getCurrentPage = useCallback((): string => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  }, []);

  // Filter announcements based on criteria
  const getFilteredAnnouncements = useCallback((filters: AnnouncementFilters = {}): Announcement[] => {
    const currentPage = getCurrentPage();
    const now = new Date();

    return state.announcements.filter(announcement => {
      // Basic filters
      if (filters.type && announcement.type !== filters.type) return false;
      if (filters.priority && announcement.priority !== filters.priority) return false;
      if (filters.position && announcement.position !== filters.position) return false;
      if (filters.isActive !== undefined && announcement.isActive !== filters.isActive) return false;
      
      // Date range filter
      if (filters.dateRange) {
        const start = new Date(announcement.startDate);
        const end = announcement.endDate ? new Date(announcement.endDate) : null;
        
        if (start > filters.dateRange.end) return false;
        if (end && end < filters.dateRange.start) return false;
      }

      // Page filter
      if (filters.page) {
        if (announcement.showOnPages && !announcement.showOnPages.includes(filters.page)) return false;
        if (announcement.hideOnPages && announcement.hideOnPages.includes(filters.page)) return false;
      }

      // Active date range check
      if (announcement.startDate > now) return false;
      if (announcement.endDate && announcement.endDate < now) return false;

      // Dismissal check
      if (state.dismissedAnnouncements.includes(announcement.id)) return false;

      // Max display count check
      if (announcement.maxDisplayCount && 
          state.displayHistory[announcement.id] >= announcement.maxDisplayCount) {
        return false;
      }

      // Page visibility check
      if (announcement.showOnPages && !announcement.showOnPages.includes(currentPage)) return false;
      if (announcement.hideOnPages && announcement.hideOnPages.includes(currentPage)) return false;

      return true;
    });
  }, [state.announcements, state.dismissedAnnouncements, state.displayHistory, getCurrentPage]);

  // Get active announcements for current page
  const activeAnnouncements = useMemo(() => {
    return getFilteredAnnouncements({ 
      isActive: true, 
      page: getCurrentPage() 
    }).sort((a, b) => {
      // Sort by priority: critical > high > medium > low
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [getFilteredAnnouncements, getCurrentPage]);

  // Track user interaction
  const trackInteraction = useCallback((announcementId: string, type: 'click' | 'dismissal' | 'view') => {
    setState(prev => ({
      ...prev,
      userInteractions: {
        ...prev.userInteractions,
        [announcementId]: {
          clicks: (prev.userInteractions[announcementId]?.clicks || 0) + (type === 'click' ? 1 : 0),
          dismissals: (prev.userInteractions[announcementId]?.dismissals || 0) + (type === 'dismissal' ? 1 : 0),
          views: (prev.userInteractions[announcementId]?.views || 0) + (type === 'view' ? 1 : 0),
        },
      },
    }));
  }, []);

  // Increment display count
  const incrementDisplayCount = useCallback((announcementId: string) => {
    setState(prev => ({
      ...prev,
      displayHistory: {
        ...prev.displayHistory,
        [announcementId]: (prev.displayHistory[announcementId] || 0) + 1,
      },
    }));
  }, []);

  // Set current announcement
  const setCurrentAnnouncement = useCallback((announcement: Announcement | null) => {
    setState(prev => ({
      ...prev,
      currentAnnouncement: announcement,
      isVisible: announcement !== null,
    }));

    // Track view
    if (announcement) {
      trackInteraction(announcement.id, 'view');
      incrementDisplayCount(announcement.id);
    }
  }, [trackInteraction, incrementDisplayCount]);

  // Show announcement bar
  const showAnnouncementBar = useCallback(() => {
    if (activeAnnouncements.length > 0 && !state.currentAnnouncement) {
      setCurrentAnnouncement(activeAnnouncements[0]);
    }
    setState(prev => ({ ...prev, isVisible: true }));
  }, [activeAnnouncements, state.currentAnnouncement, setCurrentAnnouncement]);

  // Hide announcement bar
  const hideAnnouncementBar = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isVisible: false,
      currentAnnouncement: null 
    }));
  }, []);

  // Dismiss announcement
  const dismissAnnouncement = useCallback((announcementId: string) => {
    setState(prev => ({
      ...prev,
      dismissedAnnouncements: [...prev.dismissedAnnouncements, announcementId],
      isVisible: false,
      currentAnnouncement: null,
    }));

    trackInteraction(announcementId, 'dismissal');
    toast.success('Announcement dismissed');
  }, [trackInteraction]);

  // Minimize/maximize bar
  const toggleMinimize = useCallback(() => {
    setState(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
  }, []);

  // Handle announcement click
  const handleAnnouncementClick = useCallback((announcement: Announcement) => {
    trackInteraction(announcement.id, 'click');

    if (announcement.buttonAction) {
      announcement.buttonAction();
    } else if (announcement.buttonLink) {
      if (typeof window !== 'undefined') {
        window.open(announcement.buttonLink, announcement.clickThrough ? '_self' : '_blank');
      }
    }
  }, [trackInteraction]);

  // Rotate announcements
  const rotateToNext = useCallback(() => {
    if (activeAnnouncements.length <= 1) return;

    const currentIndex = activeAnnouncements.findIndex(a => a.id === state.currentAnnouncement?.id);
    const nextIndex = (currentIndex + 1) % activeAnnouncements.length;
    
    setCurrentAnnouncement(activeAnnouncements[nextIndex]);
  }, [activeAnnouncements, state.currentAnnouncement, setCurrentAnnouncement]);

  const rotateToPrevious = useCallback(() => {
    if (activeAnnouncements.length <= 1) return;

    const currentIndex = activeAnnouncements.findIndex(a => a.id === state.currentAnnouncement?.id);
    const prevIndex = currentIndex === 0 ? activeAnnouncements.length - 1 : currentIndex - 1;
    
    setCurrentAnnouncement(activeAnnouncements[prevIndex]);
  }, [activeAnnouncements, state.currentAnnouncement, setCurrentAnnouncement]);

  // Auto rotation
  useEffect(() => {
    if (!state.settings.enableRotation || activeAnnouncements.length <= 1 || !state.isVisible) {
      return;
    }

    const interval = setInterval(() => {
      rotateToNext();
    }, state.settings.rotationInterval);

    return () => clearInterval(interval);
  }, [state.settings.enableRotation, state.settings.rotationInterval, activeAnnouncements.length, state.isVisible, rotateToNext]);

  // Auto hide
  useEffect(() => {
    if (state.currentAnnouncement?.autoHide && state.isVisible) {
      const timeout = setTimeout(() => {
        hideAnnouncementBar();
      }, state.currentAnnouncement.autoHideDelay || state.settings.defaultAutoHideDelay);

      return () => clearTimeout(timeout);
    }
  }, [state.currentAnnouncement, state.isVisible, state.settings.defaultAutoHideDelay, hideAnnouncementBar]);

  // Initialize announcement bar
  useEffect(() => {
    if (activeAnnouncements.length > 0) {
      showAnnouncementBar();
    }
  }, [activeAnnouncements.length, showAnnouncementBar]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<AnnouncementBarSettings>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
    toast.success('Settings updated');
  }, []);

  // Clear dismissed announcements
  const clearDismissed = useCallback(() => {
    setState(prev => ({ ...prev, dismissedAnnouncements: [] }));
    toast.success('Dismissed announcements cleared');
  }, []);

  // Clear display history
  const clearDisplayHistory = useCallback(() => {
    setState(prev => ({ ...prev, displayHistory: {} }));
    toast.success('Display history cleared');
  }, []);

  // Clear user interactions
  const clearUserInteractions = useCallback(() => {
    setState(prev => ({ ...prev, userInteractions: {} }));
    toast.success('User interactions cleared');
  }, []);

  // Reset all data
  const resetAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      dismissedAnnouncements: [],
      displayHistory: {},
      userInteractions: {},
      settings: defaultSettings,
      isVisible: false,
      isMinimized: false,
      currentAnnouncement: null,
    }));
    toast.success('All announcement data reset');
  }, []);

  // Get analytics data
  const getAnalytics = useCallback(() => {
    const analytics = {
      totalAnnouncements: state.announcements.length,
      activeAnnouncements: activeAnnouncements.length,
      dismissedCount: state.dismissedAnnouncements.length,
      totalViews: 0,
      totalClicks: 0,
      totalDismissals: 0,
      clickThroughRate: 0,
      dismissalRate: 0,
      popularAnnouncements: [] as { id: string; title: string; views: number; clicks: number }[],
    };

    // Calculate totals
    Object.values(state.userInteractions).forEach(interaction => {
      analytics.totalViews += interaction.views;
      analytics.totalClicks += interaction.clicks;
      analytics.totalDismissals += interaction.dismissals;
    });

    // Calculate rates
    if (analytics.totalViews > 0) {
      analytics.clickThroughRate = (analytics.totalClicks / analytics.totalViews) * 100;
      analytics.dismissalRate = (analytics.totalDismissals / analytics.totalViews) * 100;
    }

    // Get popular announcements
    analytics.popularAnnouncements = state.announcements
      .map(announcement => ({
        id: announcement.id,
        title: announcement.title,
        views: state.userInteractions[announcement.id]?.views || 0,
        clicks: state.userInteractions[announcement.id]?.clicks || 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    return analytics;
  }, [state.announcements, activeAnnouncements.length, state.dismissedAnnouncements.length, state.userInteractions]);

  // Computed values
  const computed = useMemo(() => ({
    hasActiveAnnouncements: activeAnnouncements.length > 0,
    canRotate: activeAnnouncements.length > 1,
    currentIndex: activeAnnouncements.findIndex(a => a.id === state.currentAnnouncement?.id),
    totalActiveCount: activeAnnouncements.length,
    dismissedCount: state.dismissedAnnouncements.length,
    hasNextAnnouncement: activeAnnouncements.length > 1,
    hasPreviousAnnouncement: activeAnnouncements.length > 1,
  }), [activeAnnouncements, state.currentAnnouncement, state.dismissedAnnouncements.length]);

  return {
    // State
    ...state,
    activeAnnouncements,

    // Actions
    showAnnouncementBar,
    hideAnnouncementBar,
    dismissAnnouncement,
    toggleMinimize,
    handleAnnouncementClick,
    rotateToNext,
    rotateToPrevious,
    setCurrentAnnouncement,

    // Settings
    updateSettings,

    // Data management
    clearDismissed,
    clearDisplayHistory,
    clearUserInteractions,
    resetAll,

    // Analytics
    getAnalytics,
    trackInteraction,

    // Utilities
    getFilteredAnnouncements,
    getCurrentPage,

    // Computed values
    ...computed,
  };
};

export default useAnnouncementBar;