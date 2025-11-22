import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';

export interface NotificationPreferences {
  email: {
    orderUpdates: boolean;
    promotions: boolean;
    newsletter: boolean;
    security: boolean;
    newProducts: boolean;
    priceDrops: boolean;
    backInStock: boolean;
  };
  sms: {
    orderUpdates: boolean;
    promotions: boolean;
    security: boolean;
    deliveryUpdates: boolean;
  };
  push: {
    orderUpdates: boolean;
    promotions: boolean;
    newProducts: boolean;
    priceDrops: boolean;
    backInStock: boolean;
    flashSales: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
}

export interface PrivacyPreferences {
  profileVisibility: 'public' | 'private' | 'friends';
  showEmail: boolean;
  showPhone: boolean;
  showAddress: boolean;
  allowDataCollection: boolean;
  allowMarketing: boolean;
  allowThirdPartySharing: boolean;
  cookieConsent: 'essential' | 'functional' | 'analytics' | 'all';
}

export interface DisplayPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'hi' | 'mr' | 'gu' | 'ta' | 'te' | 'kn' | 'ml' | 'bn' | 'pa';
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  timezone: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  productsPerPage: 12 | 24 | 48 | 96;
  sortBy: 'newest' | 'price-low' | 'price-high' | 'rating' | 'popularity';
  showPricesWithTax: boolean;
}

export interface ShoppingPreferences {
  defaultCategory: string;
  favoriteCategories: string[];
  preferredBrands: string[];
  priceRange: {
    min: number;
    max: number;
  };
  sizePreferences: {
    clothing?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
    shoes?: string;
  };
  autoAddToWishlist: boolean;
  quickBuyEnabled: boolean;
  showRecommendations: boolean;
  trackViewHistory: boolean;
}

export interface AccessibilityPreferences {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
  voiceCommands: boolean;
  colorBlindFriendly: boolean;
}

export interface UserPreferences {
  id: string;
  userId: string;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  display: DisplayPreferences;
  shopping: ShoppingPreferences;
  accessibility: AccessibilityPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePreferencesData {
  notifications?: Partial<NotificationPreferences>;
  privacy?: Partial<PrivacyPreferences>;
  display?: Partial<DisplayPreferences>;
  shopping?: Partial<ShoppingPreferences>;
  accessibility?: Partial<AccessibilityPreferences>;
}

export interface UsePreferencesOptions {
  autoSave?: boolean;
  saveDelay?: number;
  syncAcrossDevices?: boolean;
}

const DEFAULT_PREFERENCES: Omit<UserPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  notifications: {
    email: {
      orderUpdates: true,
      promotions: false,
      newsletter: false,
      security: true,
      newProducts: false,
      priceDrops: false,
      backInStock: false,
    },
    sms: {
      orderUpdates: true,
      promotions: false,
      security: true,
      deliveryUpdates: true,
    },
    push: {
      orderUpdates: true,
      promotions: false,
      newProducts: false,
      priceDrops: false,
      backInStock: false,
      flashSales: false,
    },
    frequency: 'immediate',
  },
  privacy: {
    profileVisibility: 'private',
    showEmail: false,
    showPhone: false,
    showAddress: false,
    allowDataCollection: true,
    allowMarketing: false,
    allowThirdPartySharing: false,
    cookieConsent: 'essential',
  },
  display: {
    theme: 'system',
    language: 'en',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    productsPerPage: 24,
    sortBy: 'newest',
    showPricesWithTax: true,
  },
  shopping: {
    defaultCategory: 'all',
    favoriteCategories: [],
    preferredBrands: [],
    priceRange: {
      min: 0,
      max: 50000,
    },
    sizePreferences: {},
    autoAddToWishlist: false,
    quickBuyEnabled: false,
    showRecommendations: true,
    trackViewHistory: true,
  },
  accessibility: {
    fontSize: 'medium',
    highContrast: false,
    reducedMotion: false,
    screenReaderOptimized: false,
    keyboardNavigation: false,
    voiceCommands: false,
    colorBlindFriendly: false,
  },
};

export const usePreferences = (options: UsePreferencesOptions = {}) => {
  const {
    autoSave = false,
    saveDelay = 1000,
    syncAcrossDevices = true,
  } = options;

  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [pendingChanges, setPendingChanges] = useState<UpdatePreferencesData>({});
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fetch preferences
  const {
    data: preferences,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['preferences', user?.id],
    queryFn: async (): Promise<UserPreferences> => {
      if (!isAuthenticated || !user) {
        throw new Error('User not authenticated');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Return user preferences or defaults
      const userPreferences: UserPreferences = {
        id: 'pref_1',
        userId: user.id,
        ...DEFAULT_PREFERENCES,
        // Override with any saved preferences
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      };

      return userPreferences;
    },
    enabled: isAuthenticated && !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: UpdatePreferencesData): Promise<UserPreferences> => {
      if (!isAuthenticated || !user) {
        throw new Error('You must be logged in to update preferences');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedPreferences: UserPreferences = {
        ...preferences!,
        ...updates,
        notifications: { ...preferences!.notifications, ...updates.notifications },
        privacy: { ...preferences!.privacy, ...updates.privacy },
        display: { ...preferences!.display, ...updates.display },
        shopping: { ...preferences!.shopping, ...updates.shopping },
        accessibility: { ...preferences!.accessibility, ...updates.accessibility },
        updatedAt: new Date().toISOString(),
      };

      return updatedPreferences;
    },
    onSuccess: (updatedPreferences) => {
      queryClient.setQueryData(['preferences', user?.id], updatedPreferences);
      
      if (syncAcrossDevices) {
        queryClient.invalidateQueries({ queryKey: ['preferences'] });
      }

      toast.success('Preferences updated successfully!', { duration: 2000, icon: '⚙️' });
      setPendingChanges({});
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update preferences',
        { duration: 4000 }
      );
    },
  });

  // Reset preferences mutation
  const resetPreferencesMutation = useMutation({
    mutationFn: async (section?: keyof UpdatePreferencesData): Promise<UserPreferences> => {
      if (!isAuthenticated || !user) {
        throw new Error('You must be logged in to reset preferences');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));

      const resetPreferences = { ...preferences! };

      if (section) {
        // Reset specific section based on section type
        switch (section) {
          case 'notifications':
            resetPreferences.notifications = DEFAULT_PREFERENCES.notifications;
            break;
          case 'privacy':
            resetPreferences.privacy = DEFAULT_PREFERENCES.privacy;
            break;
          case 'display':
            resetPreferences.display = DEFAULT_PREFERENCES.display;
            break;
          case 'shopping':
            resetPreferences.shopping = DEFAULT_PREFERENCES.shopping;
            break;
          case 'accessibility':
            resetPreferences.accessibility = DEFAULT_PREFERENCES.accessibility;
            break;
        }
      } else {
        // Reset all preferences
        Object.assign(resetPreferences, DEFAULT_PREFERENCES);
      }

      resetPreferences.updatedAt = new Date().toISOString();
      return resetPreferences;
    },
    onSuccess: (resetPreferences) => {
      queryClient.setQueryData(['preferences', user?.id], resetPreferences);
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
      toast.success('Preferences reset successfully!', { duration: 2000, icon: '🔄' });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to reset preferences',
        { duration: 4000 }
      );
    },
  });

  // Auto-save logic
  const scheduleAutoSave = useCallback((updates: UpdatePreferencesData) => {
    if (!autoSave) return;

    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const timeout = setTimeout(() => {
      updatePreferencesMutation.mutate(updates);
    }, saveDelay);

    setAutoSaveTimeout(timeout);
  }, [autoSave, saveDelay, updatePreferencesMutation, autoSaveTimeout]);

  // Helper functions
  const updateNotificationPreferences = useCallback((updates: Partial<NotificationPreferences>) => {
    const newPreferences = { notifications: updates };
    setPendingChanges(prev => ({ ...prev, ...newPreferences }));
    
    if (autoSave) {
      scheduleAutoSave(newPreferences);
    }
  }, [autoSave, scheduleAutoSave]);

  const updatePrivacyPreferences = useCallback((updates: Partial<PrivacyPreferences>) => {
    const newPreferences = { privacy: updates };
    setPendingChanges(prev => ({ ...prev, ...newPreferences }));
    
    if (autoSave) {
      scheduleAutoSave(newPreferences);
    }
  }, [autoSave, scheduleAutoSave]);

  const updateDisplayPreferences = useCallback((updates: Partial<DisplayPreferences>) => {
    const newPreferences = { display: updates };
    setPendingChanges(prev => ({ ...prev, ...newPreferences }));
    
    if (autoSave) {
      scheduleAutoSave(newPreferences);
    }
  }, [autoSave, scheduleAutoSave]);

  const updateShoppingPreferences = useCallback((updates: Partial<ShoppingPreferences>) => {
    const newPreferences = { shopping: updates };
    setPendingChanges(prev => ({ ...prev, ...newPreferences }));
    
    if (autoSave) {
      scheduleAutoSave(newPreferences);
    }
  }, [autoSave, scheduleAutoSave]);

  const updateAccessibilityPreferences = useCallback((updates: Partial<AccessibilityPreferences>) => {
    const newPreferences = { accessibility: updates };
    setPendingChanges(prev => ({ ...prev, ...newPreferences }));
    
    if (autoSave) {
      scheduleAutoSave(newPreferences);
    }
  }, [autoSave, scheduleAutoSave]);

  // Computed values
  const currentPreferences = useMemo(() => {
    if (!preferences) return DEFAULT_PREFERENCES;
    
    return {
      ...preferences,
      notifications: { ...preferences.notifications, ...pendingChanges.notifications },
      privacy: { ...preferences.privacy, ...pendingChanges.privacy },
      display: { ...preferences.display, ...pendingChanges.display },
      shopping: { ...preferences.shopping, ...pendingChanges.shopping },
      accessibility: { ...preferences.accessibility, ...pendingChanges.accessibility },
    };
  }, [preferences, pendingChanges]);

  const hasUnsavedChanges = useMemo(() => {
    return Object.keys(pendingChanges).length > 0;
  }, [pendingChanges]);

  const isNotificationEnabled = useCallback((type: 'email' | 'sms' | 'push', setting: string): boolean => {
    const notifications = currentPreferences.notifications[type] as Record<string, boolean>;
    return notifications[setting] || false;
  }, [currentPreferences.notifications]);

  const getPreferencesBySection = useCallback((section: keyof UpdatePreferencesData) => {
    return currentPreferences[section];
  }, [currentPreferences]);

  // Action functions
  const updatePreferences = useCallback(async (updates: UpdatePreferencesData) => {
    return updatePreferencesMutation.mutateAsync(updates);
  }, [updatePreferencesMutation]);

  const savePreferences = useCallback(async () => {
    if (!hasUnsavedChanges) return;
    return updatePreferencesMutation.mutateAsync(pendingChanges);
  }, [updatePreferencesMutation, pendingChanges, hasUnsavedChanges]);

  const resetPreferences = useCallback(async (section?: keyof UpdatePreferencesData) => {
    return resetPreferencesMutation.mutateAsync(section);
  }, [resetPreferencesMutation]);

  const discardChanges = useCallback(() => {
    setPendingChanges({});
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
      setAutoSaveTimeout(null);
    }
  }, [autoSaveTimeout]);

  const refreshPreferences = useCallback(() => {
    return refetch();
  }, [refetch]);

  // Preference validation
  const validatePreferences = useCallback((prefs: Partial<UpdatePreferencesData>): string[] => {
    const errors: string[] = [];

    // Validate display preferences
    if (prefs.display?.productsPerPage && ![12, 24, 48, 96].includes(prefs.display.productsPerPage)) {
      errors.push('Invalid products per page value');
    }

    // Validate price range
    if (prefs.shopping?.priceRange) {
      const { min, max } = prefs.shopping.priceRange;
      if (min < 0 || max < 0 || min >= max) {
        errors.push('Invalid price range');
      }
    }

    return errors;
  }, []);

  // Export/Import preferences
  const exportPreferences = useCallback(() => {
    const exportData = {
      ...currentPreferences,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vardhman-mills-preferences.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    toast.success('Preferences exported successfully!', { duration: 2000, icon: '📥' });
  }, [currentPreferences]);

  return {
    // Data
    preferences: currentPreferences,
    rawPreferences: preferences,
    
    // State
    isLoading,
    isFetching,
    error,
    hasUnsavedChanges,
    pendingChanges,

    // Getters
    getPreferencesBySection,
    isNotificationEnabled,

    // Section updaters
    updateNotificationPreferences,
    updatePrivacyPreferences,
    updateDisplayPreferences,
    updateShoppingPreferences,
    updateAccessibilityPreferences,

    // Actions
    updatePreferences,
    savePreferences,
    resetPreferences,
    discardChanges,
    refreshPreferences,
    exportPreferences,

    // Validation
    validatePreferences,

    // Loading states
    isUpdating: updatePreferencesMutation.isPending,
    isResetting: resetPreferencesMutation.isPending,

    // Defaults
    defaultPreferences: DEFAULT_PREFERENCES,

    // Stats
    stats: {
      notificationsEnabled: Object.values(currentPreferences.notifications.email).filter(Boolean).length +
                           Object.values(currentPreferences.notifications.sms).filter(Boolean).length +
                           Object.values(currentPreferences.notifications.push).filter(Boolean).length,
      privacySettingsEnabled: Object.values(currentPreferences.privacy).filter(Boolean).length,
      lastUpdated: preferences?.updatedAt,
    },
  };
};

export default usePreferences;
