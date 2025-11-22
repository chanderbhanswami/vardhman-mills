import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { SettingsFormData, SettingValue } from '@/types';

interface SettingValueWithMeta {
  value: SettingValue;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  description?: string;
  isGlobal: boolean;
  updatedAt: string;
}

interface CategorySettings {
  [key: string]: SettingValueWithMeta;
}

interface UseSettingsReturn {
  settings: CategorySettings;
  loading: boolean;
  error: string | null;
  updateSettings: (newSettings: SettingsFormData) => Promise<boolean>;
  refreshSettings: () => Promise<void>;
  getSetting: (key: string, defaultValue?: SettingValue) => SettingValue;
  setSetting: (key: string, value: SettingValue, type?: string) => void;
  isDirty: boolean;
  resetChanges: () => void;
}

export const useSettings = (category: string): UseSettingsReturn => {
  const [settings, setSettings] = useState<CategorySettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<SettingsFormData>({});

  // Load settings from API
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getCategorySettings(category);
      
      if (response.success) {
        const loadedSettings: CategorySettings = {};
        // Convert flat settings to categorized format
        Object.entries(response.data.settings).forEach(([key, value]) => {
          loadedSettings[key] = {
            value,
            type: typeof value === 'number' ? 'number' : 
                  typeof value === 'boolean' ? 'boolean' :
                  Array.isArray(value) ? 'array' :
                  typeof value === 'object' ? 'json' : 'string',
            isGlobal: true,
            updatedAt: new Date().toISOString()
          };
        });
        
        setSettings(loadedSettings);
        setPendingChanges({});
        setIsDirty(false);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [category]);

  // Initial load
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Get a specific setting value
  const getSetting = useCallback((key: string, defaultValue: SettingValue | null = null) => {
    if (pendingChanges.hasOwnProperty(key)) {
      return pendingChanges[key];
    }
    return settings[key]?.value ?? defaultValue;
  }, [settings, pendingChanges]);

  // Set a setting value (locally, not persisted until updateSettings is called)
  const setSetting = useCallback((key: string, value: SettingValue) => {
    setPendingChanges(prev => ({
      ...prev,
      [key]: value
    }));
    setIsDirty(true);
  }, []);

  // Update settings on the server
  const updateSettings = useCallback(async (newSettings?: SettingsFormData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const settingsToUpdate = newSettings || pendingChanges;
      
      if (Object.keys(settingsToUpdate).length === 0) {
        return true; // Nothing to update
      }

      const response = await apiClient.updateCategorySettings(category, settingsToUpdate);

      if (response.success) {
        // Merge the updates into current settings
        const updatedSettings = { ...settings };
        Object.entries(settingsToUpdate).forEach(([key, value]) => {
          updatedSettings[key] = {
            value,
            type: typeof value === 'number' ? 'number' : 
                  typeof value === 'boolean' ? 'boolean' :
                  Array.isArray(value) ? 'array' :
                  typeof value === 'object' ? 'json' : 'string',
            isGlobal: true,
            updatedAt: new Date().toISOString()
          };
        });
        
        setSettings(updatedSettings);
        setPendingChanges({});
        setIsDirty(false);
        
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      return false;
    } finally {
      setLoading(false);
    }
  }, [category, settings, pendingChanges]);

  // Refresh settings from server
  const refreshSettings = useCallback(async () => {
    await loadSettings();
  }, [loadSettings]);

  // Reset pending changes
  const resetChanges = useCallback(() => {
    setPendingChanges({});
    setIsDirty(false);
  }, []);

  return {
    settings,
    loading,
    error,
    updateSettings,
    refreshSettings,
    getSetting,
    setSetting,
    isDirty,
    resetChanges
  };
};

// Hook for managing multiple setting categories
export const useMultipleSettings = (categories: string[]) => {
  const [allSettings, setAllSettings] = useState<Record<string, CategorySettings>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAllSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        const promises = categories.map(category => 
          apiClient.getCategorySettings(category)
        );

        const responses = await Promise.all(promises);
        const settingsMap: Record<string, CategorySettings> = {};

        responses.forEach((response, index) => {
          if (response.success) {
            const categorySettings: CategorySettings = {};
            Object.entries(response.data.settings).forEach(([key, value]) => {
              categorySettings[key] = {
                value,
                type: typeof value === 'number' ? 'number' : 
                      typeof value === 'boolean' ? 'boolean' :
                      Array.isArray(value) ? 'array' :
                      typeof value === 'object' ? 'json' : 'string',
                isGlobal: true,
                updatedAt: new Date().toISOString()
              };
            });
            settingsMap[categories[index]] = categorySettings;
          }
        });

        setAllSettings(settingsMap);
      } catch (err) {
        console.error('Error loading multiple settings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    if (categories.length > 0) {
      loadAllSettings();
    }
  }, [categories]);

  return { allSettings, loading, error };
};

// Hook for initializing default settings (admin only)
export const useSettingsInit = () => {
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeSettings = useCallback(async (): Promise<boolean> => {
    try {
      setInitializing(true);
      setError(null);

      // This would need to be implemented in the API client
      // For now, we'll just return true
      return true;
    } catch (err) {
      console.error('Error initializing settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize settings');
      return false;
    } finally {
      setInitializing(false);
    }
  }, []);

  return { initializeSettings, initializing, error };
};
