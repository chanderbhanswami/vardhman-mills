/**
 * NotificationSettings Component
 * Advanced settings panel for managing notification preferences and configurations
 * Features: Comprehensive settings, profiles, import/export, real-time preview
 */
'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  X, 
  Download, 
  Upload, 
  RotateCcw, 
  Save, 
  Palette,
  Zap,
  Shield,
  Layers,
  FileText,
  Play
} from 'lucide-react';
import { uiLogger } from '@/lib/utils/logger';
import { useToast } from './ToastNotifications/ToastProvider';
import { ToastType, ToastPosition, ToastAnimation, ToastStyle } from './ToastNotifications/Toast';

// Types
export interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (settings: NotificationSettingsConfig) => void;
  onReset?: () => void;
  onImport?: (settings: NotificationSettingsConfig) => void;
  onExport?: (settings: NotificationSettingsConfig) => void;
  currentSettings?: NotificationSettingsConfig;
  className?: string;
}

export interface NotificationSettingsConfig {
  // General settings
  enabled: boolean;
  volume: number;
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  
  // Display settings
  position: ToastPosition;
  animation: ToastAnimation;
  style: ToastStyle;
  theme: 'light' | 'dark' | 'auto';
  maxToasts: number;
  duration: number;
  
  // Behavior settings
  enableQueue: boolean;
  queueLimit: number;
  enableStacking: boolean;
  enableGrouping: boolean;
  enableDuplicateDetection: boolean;
  pauseOnHover: boolean;
  pauseOnFocus: boolean;
  closeOnClick: boolean;
  
  // Accessibility settings
  enableA11y: boolean;
  enableKeyboardNavigation: boolean;
  enableScreenReader: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
  
  // Type-specific settings
  typeSettings: Record<ToastType, {
    enabled: boolean;
    duration: number;
    sound: string | false;
    vibration: number[] | false;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    showIcon: boolean;
    showProgress: boolean;
  }>;
  
  // Advanced settings
  enablePersistence: boolean;
  enableAnalytics: boolean;
  enableDebug: boolean;
  enablePreview: boolean;
  
  // Custom sounds
  customSounds: Record<string, {
    name: string;
    url: string;
    volume: number;
  }>;
  
  // Filters and rules
  filters: Array<{
    id: string;
    name: string;
    enabled: boolean;
    conditions: Array<{
      field: string;
      operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'regex';
      value: string;
    }>;
    actions: Array<{
      type: 'block' | 'modify' | 'redirect';
      parameters: Record<string, unknown>;
    }>;
  }>;
  
  // Profiles
  profiles: Record<string, Partial<NotificationSettingsConfig>>;
  activeProfile: string;
}

// Default settings
const defaultSettings: NotificationSettingsConfig = {
  enabled: true,
  volume: 0.7,
  vibrationEnabled: true,
  soundEnabled: true,
  position: 'top-right',
  animation: 'slide',
  style: 'filled',
  theme: 'auto',
  maxToasts: 5,
  duration: 5000,
  enableQueue: true,
  queueLimit: 10,
  enableStacking: true,
  enableGrouping: false,
  enableDuplicateDetection: true,
  pauseOnHover: true,
  pauseOnFocus: true,
  closeOnClick: false,
  enableA11y: true,
  enableKeyboardNavigation: true,
  enableScreenReader: true,
  highContrast: false,
  reducedMotion: false,
  fontSize: 'medium',
  typeSettings: {
    success: {
      enabled: true,
      duration: 4000,
      sound: 'success',
      vibration: [100],
      priority: 'normal',
      showIcon: true,
      showProgress: true
    },
    error: {
      enabled: true,
      duration: 0,
      sound: 'error',
      vibration: [200, 100, 200],
      priority: 'high',
      showIcon: true,
      showProgress: false
    },
    warning: {
      enabled: true,
      duration: 6000,
      sound: 'warning',
      vibration: [150],
      priority: 'normal',
      showIcon: true,
      showProgress: true
    },
    info: {
      enabled: true,
      duration: 5000,
      sound: 'info',
      vibration: [100],
      priority: 'normal',
      showIcon: true,
      showProgress: true
    },
    loading: {
      enabled: true,
      duration: 0,
      sound: false,
      vibration: false,
      priority: 'normal',
      showIcon: true,
      showProgress: false
    },
    custom: {
      enabled: true,
      duration: 3000,
      sound: false,
      vibration: false,
      priority: 'normal',
      showIcon: true,
      showProgress: false
    }
  },
  enablePersistence: true,
  enableAnalytics: true,
  enableDebug: false,
  enablePreview: true,
  customSounds: {},
  filters: [],
  profiles: {
    default: {},
    silent: {
      soundEnabled: false,
      vibrationEnabled: false
    },
    urgent: {
      duration: 0,
      soundEnabled: true,
      vibrationEnabled: true,
      volume: 1.0
    },
    minimal: {
      style: 'minimal',
      enableStacking: false
    }
  },
  activeProfile: 'default'
};

// Position options
const positionOptions: Array<{ value: ToastPosition; label: string }> = [
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-center', label: 'Top Center' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-center', label: 'Bottom Center' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'center', label: 'Center' }
];

// Animation options
const animationOptions: Array<{ value: ToastAnimation; label: string }> = [
  { value: 'slide', label: 'Slide' },
  { value: 'fade', label: 'Fade' },
  { value: 'scale', label: 'Scale' },
  { value: 'bounce', label: 'Bounce' },
  { value: 'flip', label: 'Flip' },
  { value: 'swing', label: 'Swing' }
];

// Style options
const styleOptions: Array<{ value: ToastStyle; label: string }> = [
  { value: 'filled', label: 'Filled' },
  { value: 'outlined', label: 'Outlined' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'glass', label: 'Glass' },
  { value: 'gradient', label: 'Gradient' }
];

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  isOpen,
  onClose,
  onSave,
  onReset,
  onImport,
  onExport,
  currentSettings,
  className = ''
}) => {
  const [settings, setSettings] = useState<NotificationSettingsConfig>(
    currentSettings || defaultSettings
  );
  const [activeTab, setActiveTab] = useState<'general' | 'display' | 'behavior' | 'accessibility' | 'types' | 'advanced' | 'profiles'>('general');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings update handler
  const updateSettings = useCallback((updates: Partial<NotificationSettingsConfig>) => {
    setSettings((prev: NotificationSettingsConfig) => {
      const newSettings = { ...prev, ...updates };
      setHasUnsavedChanges(true);
      return newSettings;
    });
  }, []);

  // Type-specific settings update
  const updateTypeSettings = useCallback((type: ToastType, updates: Partial<NotificationSettingsConfig['typeSettings'][ToastType]>) => {
    updateSettings({
      typeSettings: {
        ...settings.typeSettings,
        [type]: {
          ...settings.typeSettings[type],
          ...updates
        }
      }
    });
  }, [settings.typeSettings, updateSettings]);

  // Test notification for each type
  const testNotification = useCallback((type: ToastType) => {
    const typeConfig = settings.typeSettings[type];
    if (!typeConfig.enabled) return;
    
    if (type === 'success') {
      toast.success(`Test ${type} notification`);
    } else if (type === 'error') {
      toast.error(`Test ${type} notification`);
    } else if (type === 'warning') {
      toast.warning(`Test ${type} notification`);
    } else if (type === 'info') {
      toast.info(`Test ${type} notification`);
    } else {
      toast.info(`Test ${type} notification`);
    }
  }, [settings, toast]);

  // Import/Export functionality
  const handleExport = useCallback(() => {
    try {
      const dataStr = JSON.stringify(settings, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `notification-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Settings exported successfully');
      onExport?.(settings);
    } catch (error) {
      uiLogger.error('Failed to export settings:', error);
      toast.error('Failed to export settings');
    }
  }, [settings, toast, onExport]);

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        setSettings(importedSettings);
        toast.success('Settings imported successfully');
        onImport?.(importedSettings);
      } catch (error) {
        uiLogger.error('Failed to import settings:', error);
        toast.error('Invalid settings file');
      }
    };
    reader.readAsText(file);
  }, [toast, onImport]);

  // Reset to defaults
  const handleReset = useCallback(() => {
    setSettings(defaultSettings);
    toast.info('Settings reset to defaults');
    onReset?.();
  }, [toast, onReset]);

  // Save settings
  const handleSave = useCallback(() => {
    onSave?.(settings);
    setHasUnsavedChanges(false);
    toast.success('Settings saved successfully');
  }, [settings, onSave, toast]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'display', label: 'Display', icon: Palette },
    { id: 'behavior', label: 'Behavior', icon: Zap },
    { id: 'accessibility', label: 'Accessibility', icon: Shield },
    { id: 'types', label: 'Types', icon: Layers },
    { id: 'advanced', label: 'Advanced', icon: FileText }
  ] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={`bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] 
                       flex flex-col overflow-hidden ${className}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <Settings className="w-6 h-6 text-blue-500" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Notification Settings
                </h2>
                {hasUnsavedChanges && (
                  <span className="text-sm text-orange-500 bg-orange-100 dark:bg-orange-900/20 px-2 py-1 rounded">
                    Unsaved changes
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                title="Close settings"
                aria-label="Close settings"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    title={`${tab.label} settings tab`}
                    aria-label={`${tab.label} settings tab`}
                    className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 
                               transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      General Settings
                    </h3>
                    
                    <div className="space-y-4">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.enabled}
                          onChange={(e) => updateSettings({ enabled: e.target.checked })}
                          className="rounded"
                          title="Enable notifications"
                          aria-label="Enable notifications"
                        />
                        <span className="text-sm font-medium">Enable notifications</span>
                      </label>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Volume ({Math.round(settings.volume * 100)}%)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={settings.volume}
                          title={`Volume: ${Math.round(settings.volume * 100)}%`}
                          aria-label={`Volume: ${Math.round(settings.volume * 100)}%`}
                          onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
                          className="w-full"
                        />
                      </div>

                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.soundEnabled}
                          onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                          className="rounded"
                          title="Enable sound"
                          aria-label="Enable sound"
                        />
                        <span className="text-sm font-medium">Enable sound</span>
                      </label>

                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.vibrationEnabled}
                          onChange={(e) => updateSettings({ vibrationEnabled: e.target.checked })}
                          className="rounded"
                          title="Enable vibration"
                          aria-label="Enable vibration"
                        />
                        <span className="text-sm font-medium">Enable vibration</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'display' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Display Settings
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Position</label>
                        <select
                          value={settings.position}
                          title="Toast notification position"
                          aria-label="Toast notification position"
                          onChange={(e) => updateSettings({ position: e.target.value as ToastPosition })}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          {positionOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Animation</label>
                        <select
                          value={settings.animation}
                          title="Toast animation style"
                          aria-label="Toast animation style"
                          onChange={(e) => updateSettings({ animation: e.target.value as ToastAnimation })}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          {animationOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Style</label>
                        <select
                          value={settings.style}
                          title="Toast visual style"
                          aria-label="Toast visual style"
                          onChange={(e) => updateSettings({ style: e.target.value as ToastStyle })}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          {styleOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Theme</label>
                        <select
                          value={settings.theme}
                          title="Theme preference"
                          aria-label="Theme preference"
                          onChange={(e) => updateSettings({ theme: e.target.value as 'light' | 'dark' | 'auto' })}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="auto">Auto</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Max Toasts ({settings.maxToasts})
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          value={settings.maxToasts}
                          title={`Maximum toasts: ${settings.maxToasts}`}
                          aria-label={`Maximum toasts: ${settings.maxToasts}`}
                          onChange={(e) => updateSettings({ maxToasts: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Default Duration ({settings.duration / 1000}s)
                        </label>
                        <input
                          type="range"
                          min="1000"
                          max="30000"
                          step="1000"
                          value={settings.duration}
                          title={`Default duration: ${settings.duration / 1000} seconds`}
                          aria-label={`Default duration: ${settings.duration / 1000} seconds`}
                          onChange={(e) => updateSettings({ duration: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'types' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Notification Types
                    </h3>
                    
                    <div className="space-y-6">
                      {Object.entries(settings.typeSettings).map(([type, typeConfig]) => (
                        <div key={type} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-md font-medium capitalize flex items-center space-x-2">
                              <span className={`w-3 h-3 rounded-full ${
                                type === 'success' ? 'bg-green-500' :
                                type === 'error' ? 'bg-red-500' :
                                type === 'warning' ? 'bg-yellow-500' :
                                type === 'info' ? 'bg-blue-500' :
                                type === 'loading' ? 'bg-gray-500' :
                                'bg-purple-500'
                              }`} />
                              <span>{type}</span>
                            </h4>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => testNotification(type as ToastType)}
                                title={`Test ${type} notification`}
                                aria-label={`Test ${type} notification`}
                                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                              >
                                <Play className="w-3 h-3 inline mr-1" />
                                Test
                              </button>
                              
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={typeConfig.enabled}
                                  onChange={(e) => updateTypeSettings(type as ToastType, { enabled: e.target.checked })}
                                  className="rounded"
                                  title={`Enable ${type} notifications`}
                                  aria-label={`Enable ${type} notifications`}
                                />
                                <span className="text-sm">Enabled</span>
                              </label>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Duration ({typeConfig.duration === 0 ? 'Persistent' : `${typeConfig.duration / 1000}s`})
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="30000"
                                step="1000"
                                value={typeConfig.duration}
                                title={`Duration for ${type}: ${typeConfig.duration === 0 ? 'Persistent' : `${typeConfig.duration / 1000}s`}`}
                                aria-label={`Duration for ${type}: ${typeConfig.duration === 0 ? 'Persistent' : `${typeConfig.duration / 1000}s`}`}
                                onChange={(e) => updateTypeSettings(type as ToastType, { duration: parseInt(e.target.value) })}
                                className="w-full"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-1">Priority</label>
                              <select
                                value={typeConfig.priority}
                                title={`Priority for ${type} notifications`}
                                aria-label={`Priority for ${type} notifications`}
                                onChange={(e) => updateTypeSettings(type as ToastType, { 
                                  priority: e.target.value as 'low' | 'normal' | 'high' | 'urgent' 
                                })}
                                className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded 
                                          bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                              >
                                <option value="low">Low</option>
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                              </select>
                            </div>
                            
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={typeConfig.showIcon}
                                onChange={(e) => updateTypeSettings(type as ToastType, { showIcon: e.target.checked })}
                                className="rounded"
                                title={`Show icon for ${type} notifications`}
                                aria-label={`Show icon for ${type} notifications`}
                              />
                              <span className="text-sm">Show icon</span>
                            </label>
                            
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={typeConfig.showProgress}
                                onChange={(e) => updateTypeSettings(type as ToastType, { showProgress: e.target.checked })}
                                className="rounded"
                                title={`Show progress for ${type} notifications`}
                                aria-label={`Show progress for ${type} notifications`}
                              />
                              <span className="text-sm">Show progress</span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleReset}
                  title="Reset to defaults"
                  aria-label="Reset to defaults"
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 
                            border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Import settings"
                  aria-label="Import settings"
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 
                            border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import</span>
                </button>
                
                <button
                  onClick={handleExport}
                  title="Export settings"
                  aria-label="Export settings"
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 
                            border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={onClose}
                  title="Cancel changes"
                  aria-label="Cancel changes"
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 
                            border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges}
                  title="Save changes"
                  aria-label="Save changes"
                  className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md 
                            hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              title="Import settings file"
              aria-label="Import settings file"
              onChange={handleImport}
              className="hidden"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationSettings;