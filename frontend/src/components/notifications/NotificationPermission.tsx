/**
 * NotificationPermission Component
 * Comprehensive permission management for web notifications with fallback strategies
 * Features: Permission request, status tracking, custom UI, guidance, fallbacks
 */
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Check, X, AlertTriangle, Info, Settings, Shield, RefreshCw } from 'lucide-react';

// Types
export type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export interface PermissionStatus {
  permission: PermissionState;
  isSupported: boolean;
  canRequestPermission: boolean;
  lastRequested?: Date;
  requestCount: number;
  deniedPermanently: boolean;
  browserInfo: {
    name: string;
    version: string;
    platform: string;
  };
}

export interface NotificationPermissionProps {
  onPermissionChange?: (status: PermissionStatus) => void;
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
  showFallbackOptions?: boolean;
  autoRequest?: boolean;
  requestDelay?: number;
  maxRequestAttempts?: number;
  customContent?: {
    title?: string;
    description?: string;
    grantedMessage?: string;
    deniedMessage?: string;
    unsupportedMessage?: string;
  };
  showBrowserGuide?: boolean;
  enablePersistence?: boolean;
  fallbackStrategies?: Array<'email' | 'sms' | 'in_app' | 'push_service'>;
  style?: 'modal' | 'banner' | 'card' | 'minimal';
  position?: 'top' | 'bottom' | 'center';
  theme?: 'light' | 'dark' | 'auto';
  animated?: boolean;
  showIcon?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

export interface BrowserGuideSteps {
  browser: string;
  steps: Array<{
    step: number;
    instruction: string;
    image?: string;
    note?: string;
  }>;
}

// Browser detection utility
const getBrowserInfo = (): { name: string; version: string; platform: string } => {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  
  if (userAgent.includes('Chrome')) {
    browserName = 'Chrome';
    const match = userAgent.match(/Chrome\/([0-9.]+)/);
    if (match) browserVersion = match[1];
  } else if (userAgent.includes('Firefox')) {
    browserName = 'Firefox';
    const match = userAgent.match(/Firefox\/([0-9.]+)/);
    if (match) browserVersion = match[1];
  } else if (userAgent.includes('Safari')) {
    browserName = 'Safari';
    const match = userAgent.match(/Version\/([0-9.]+)/);
    if (match) browserVersion = match[1];
  } else if (userAgent.includes('Edge')) {
    browserName = 'Edge';
    const match = userAgent.match(/Edge\/([0-9.]+)/);
    if (match) browserVersion = match[1];
  }
  
  return { name: browserName, version: browserVersion, platform };
};

// Browser-specific guides
const browserGuides: Record<string, BrowserGuideSteps> = {
  Chrome: {
    browser: 'Chrome',
    steps: [
      {
        step: 1,
        instruction: 'Click on the lock icon in the address bar',
        note: 'This opens the site information panel'
      },
      {
        step: 2,
        instruction: 'Find "Notifications" in the permissions list',
        note: 'It may show as "Blocked" or "Ask"'
      },
      {
        step: 3,
        instruction: 'Change the setting to "Allow"',
        note: 'This will enable notifications for this site'
      },
      {
        step: 4,
        instruction: 'Refresh the page to apply changes',
        note: 'The page needs to reload for the changes to take effect'
      }
    ]
  },
  Firefox: {
    browser: 'Firefox',
    steps: [
      {
        step: 1,
        instruction: 'Click on the shield icon in the address bar',
        note: 'This opens the site protection panel'
      },
      {
        step: 2,
        instruction: 'Click on "Permissions" or the gear icon',
        note: 'This shows detailed permission settings'
      },
      {
        step: 3,
        instruction: 'Find "Receive Notifications" and set to "Allow"',
        note: 'You can also access this via Settings > Privacy & Security'
      },
      {
        step: 4,
        instruction: 'Refresh the page',
        note: 'Changes take effect after page reload'
      }
    ]
  },
  Safari: {
    browser: 'Safari',
    steps: [
      {
        step: 1,
        instruction: 'Go to Safari > Preferences (or Safari > Settings)',
        note: 'Use keyboard shortcut Cmd+, to open preferences quickly'
      },
      {
        step: 2,
        instruction: 'Click on the "Websites" tab',
        note: 'This shows per-site settings'
      },
      {
        step: 3,
        instruction: 'Select "Notifications" from the left sidebar',
        note: 'You will see a list of websites and their notification settings'
      },
      {
        step: 4,
        instruction: 'Find this website and change setting to "Allow"',
        note: 'If the site is not listed, you may need to request permission first'
      }
    ]
  },
  Edge: {
    browser: 'Edge',
    steps: [
      {
        step: 1,
        instruction: 'Click on the lock icon in the address bar',
        note: 'This opens the site permissions panel'
      },
      {
        step: 2,
        instruction: 'Click on "Permissions for this site"',
        note: 'This shows detailed permission controls'
      },
      {
        step: 3,
        instruction: 'Toggle "Notifications" to "Allow"',
        note: 'The toggle should turn blue when enabled'
      },
      {
        step: 4,
        instruction: 'Refresh the page',
        note: 'Page reload is required for changes to apply'
      }
    ]
  }
};

// Custom hook for permission management
const useNotificationPermission = (props: Partial<NotificationPermissionProps> = {}) => {
  const {
    enablePersistence = true,
    maxRequestAttempts = 3,
    requestDelay = 1000
  } = props;

  const [status, setStatus] = useState<PermissionStatus>(() => {
    const browserInfo = getBrowserInfo();
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    
    let permission: PermissionState = 'unsupported';
    if (isSupported) {
      permission = Notification.permission as PermissionState;
    }
    
    // Load persisted data
    let persistedData = null;
    if (enablePersistence) {
      try {
        const stored = localStorage.getItem('notification_permission_status');
        persistedData = stored ? JSON.parse(stored) : null;
      } catch (error) {
        console.warn('Failed to load persisted permission status', error);
      }
    }
    
    return {
      permission,
      isSupported,
      canRequestPermission: isSupported && permission === 'default',
      lastRequested: persistedData?.lastRequested ? new Date(persistedData.lastRequested) : undefined,
      requestCount: persistedData?.requestCount || 0,
      deniedPermanently: persistedData?.deniedPermanently || false,
      browserInfo
    };
  });

  const requestTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Persist status changes
  useEffect(() => {
    if (enablePersistence) {
      try {
        const dataToStore = {
          lastRequested: status.lastRequested?.toISOString(),
          requestCount: status.requestCount,
          deniedPermanently: status.deniedPermanently
        };
        localStorage.setItem('notification_permission_status', JSON.stringify(dataToStore));
      } catch (error) {
        console.warn('Failed to persist permission status', error);
      }
    }
  }, [status, enablePersistence]);

  // Listen for permission changes
  useEffect(() => {
    if (!status.isSupported) return;

    const checkPermission = () => {
      const currentPermission = Notification.permission as PermissionState;
      if (currentPermission !== status.permission) {
        setStatus(prev => ({
          ...prev,
          permission: currentPermission,
          canRequestPermission: currentPermission === 'default'
        }));
      }
    };

    // Check periodically
    const interval = setInterval(checkPermission, 2000);
    
    // Listen for page focus (user might have changed permissions in another tab)
    const handleFocus = () => checkPermission();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [status.permission, status.isSupported]);

  const requestPermission = useCallback(async (): Promise<PermissionState> => {
    if (!status.isSupported) {
      console.warn('Notifications not supported in this browser');
      return 'unsupported';
    }

    if (status.permission !== 'default') {
      console.info(`Permission already ${status.permission}`);
      return status.permission;
    }

    if (status.requestCount >= maxRequestAttempts) {
      console.warn('Max request attempts reached');
      setStatus(prev => ({ ...prev, deniedPermanently: true }));
      return 'denied';
    }

    try {
      console.info('Requesting notification permission');
      
      // Add delay to improve UX
      if (requestDelay > 0) {
        await new Promise(resolve => {
          requestTimeoutRef.current = setTimeout(resolve, requestDelay);
        });
      }

      const permission = await Notification.requestPermission();
      
      setStatus(prev => ({
        ...prev,
        permission: permission as PermissionState,
        canRequestPermission: permission === 'default',
        lastRequested: new Date(),
        requestCount: prev.requestCount + 1,
        deniedPermanently: permission === 'denied' && prev.requestCount + 1 >= maxRequestAttempts
      }));

      console.info(`Permission ${permission}`, { requestCount: status.requestCount + 1 });
      return permission as PermissionState;
    } catch (error) {
      console.error('Failed to request permission', error);
      setStatus(prev => ({
        ...prev,
        requestCount: prev.requestCount + 1
      }));
      return 'denied';
    }
  }, [status.isSupported, status.permission, status.requestCount, maxRequestAttempts, requestDelay]);

  const resetPermissionState = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      requestCount: 0,
      deniedPermanently: false,
      lastRequested: undefined
    }));
    
    if (enablePersistence) {
      try {
        localStorage.removeItem('notification_permission_status');
      } catch (error) {
        console.warn('Failed to clear persisted permission status', error);
      }
    }
  }, [enablePersistence]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }
    };
  }, []);

  return {
    status,
    requestPermission,
    resetPermissionState
  };
};

export const NotificationPermission: React.FC<NotificationPermissionProps> = ({
  onPermissionChange,
  onPermissionGranted,
  onPermissionDenied,
  showFallbackOptions = true,
  autoRequest = false,
  requestDelay = 1000,
  maxRequestAttempts = 3,
  customContent = {},
  showBrowserGuide = true,
  enablePersistence = true,
  fallbackStrategies = ['email', 'in_app'],
  style = 'card',
  position = 'center',
  theme = 'auto',
  animated = true,
  showIcon = true,
  showCloseButton = true,
  className = ''
}) => {
  const { status, requestPermission, resetPermissionState } = useNotificationPermission({
    enablePersistence,
    maxRequestAttempts,
    requestDelay
  });

  const [showGuide, setShowGuide] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [showFallbacks, setShowFallbacks] = useState(false);
  const [selectedFallback, setSelectedFallback] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Permission change callback
  useEffect(() => {
    onPermissionChange?.(status);
    
    if (status.permission === 'granted') {
      onPermissionGranted?.();
    } else if (status.permission === 'denied') {
      onPermissionDenied?.();
    }
  }, [status, onPermissionChange, onPermissionGranted, onPermissionDenied]);

  const handleRequestPermission = useCallback(async () => {
    setIsRequesting(true);
    try {
      await requestPermission();
    } finally {
      setIsRequesting(false);
    }
  }, [requestPermission]);

  // Auto-request permission  
  useEffect(() => {
    if (autoRequest && status.canRequestPermission && status.requestCount === 0) {
      const timer = setTimeout(() => {
        handleRequestPermission();
      }, 2000); // Wait 2 seconds before auto-requesting
      
      return () => clearTimeout(timer);
    }
  }, [autoRequest, status.canRequestPermission, status.requestCount, handleRequestPermission]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleShowGuide = () => {
    setShowGuide(true);
  };

  const handleSelectFallback = (strategy: string) => {
    setSelectedFallback(strategy);
    console.info(`Selected fallback strategy: ${strategy}`);
    // Implement fallback strategy logic here
  };

  // Don't render if permission is already granted and no issues
  if (status.permission === 'granted' && !showGuide) {
    return null;
  }

  // Don't render if hidden
  if (!isVisible) {
    return null;
  }

  const getPermissionIcon = () => {
    switch (status.permission) {
      case 'granted':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'denied':
        return <X className="w-5 h-5 text-red-600" />;
      case 'unsupported':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const getPermissionMessage = () => {
    const {
      title = 'Enable Notifications',
      description = 'Get notified about important updates and messages.',
      grantedMessage = 'Notifications are enabled! You\'ll receive updates.',
      deniedMessage = 'Notifications are blocked. Enable them to stay updated.',
      unsupportedMessage = 'Notifications are not supported in this browser.'
    } = customContent;

    switch (status.permission) {
      case 'granted':
        return { title: 'Notifications Enabled', description: grantedMessage };
      case 'denied':
        return { title: 'Notifications Blocked', description: deniedMessage };
      case 'unsupported':
        return { title: 'Notifications Unavailable', description: unsupportedMessage };
      default:
        return { title, description };
    }
  };

  const message = getPermissionMessage();

  // Base styles
  const baseStyles = {
    card: 'bg-white rounded-lg shadow-lg border p-6 max-w-md mx-auto',
    modal: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
    banner: 'bg-blue-50 border-l-4 border-blue-400 p-4',
    minimal: 'bg-gray-50 rounded p-4 border'
  };

  const positionStyles = {
    top: 'fixed top-4 left-1/2 transform -translate-x-1/2 z-40',
    bottom: 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40',
    center: 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40'
  };

  const themeStyles = {
    light: 'bg-white text-gray-900',
    dark: 'bg-gray-900 text-white',
    auto: 'bg-white text-gray-900 dark:bg-gray-900 dark:text-white'
  };

  const containerClass = `
    ${baseStyles[style]}
    ${style !== 'modal' ? positionStyles[position] : ''}
    ${themeStyles[theme]}
    ${animated ? 'transition-all duration-300 ease-in-out' : ''}
    ${className}
  `.trim();

  const renderContent = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          {showIcon && getPermissionIcon()}
          <div>
            <h3 className="text-lg font-semibold">{message.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {message.description}
            </p>
          </div>
        </div>
        {showCloseButton && (
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Permission Status */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
        <div className="flex items-center justify-between text-sm">
          <span>Browser Support:</span>
          <span className={status.isSupported ? 'text-green-600' : 'text-red-600'}>
            {status.isSupported ? 'Supported' : 'Not Supported'}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span>Permission Status:</span>
          <span className={
            status.permission === 'granted' ? 'text-green-600' :
            status.permission === 'denied' ? 'text-red-600' :
            'text-yellow-600'
          }>
            {status.permission.charAt(0).toUpperCase() + status.permission.slice(1)}
          </span>
        </div>
        {status.requestCount > 0 && (
          <div className="flex items-center justify-between text-sm mt-1">
            <span>Requests Made:</span>
            <span>{status.requestCount}/{maxRequestAttempts}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-2">
        {status.canRequestPermission && !status.deniedPermanently && (
          <button
            onClick={handleRequestPermission}
            disabled={isRequesting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isRequesting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
            <span>{isRequesting ? 'Requesting...' : 'Enable Notifications'}</span>
          </button>
        )}

        {status.permission === 'denied' && showBrowserGuide && (
          <button
            onClick={handleShowGuide}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 flex items-center justify-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>How to Enable in {status.browserInfo.name}</span>
          </button>
        )}

        {(status.permission === 'denied' || status.permission === 'unsupported') && showFallbackOptions && (
          <button
            onClick={() => setShowFallbacks(!showFallbacks)}
            className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 flex items-center justify-center space-x-2"
          >
            <Shield className="w-4 h-4" />
            <span>Alternative Options</span>
          </button>
        )}

        {status.deniedPermanently && (
          <button
            onClick={resetPermissionState}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Permission State</span>
          </button>
        )}
      </div>

      {/* Fallback Options */}
      {showFallbacks && (
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
          <h4 className="font-medium mb-2 flex items-center space-x-1">
            <Info className="w-4 h-4" />
            <span>Alternative Notification Methods</span>
          </h4>
          <div className="space-y-2">
            {fallbackStrategies.map((strategy) => (
              <button
                key={strategy}
                onClick={() => handleSelectFallback(strategy)}
                className={`w-full text-left p-2 rounded border ${
                  selectedFallback === strategy
                    ? 'bg-orange-200 dark:bg-orange-800 border-orange-400'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                }`}
              >
                <div className="font-medium capitalize">{strategy.replace('_', ' ')}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {strategy === 'email' && 'Receive notifications via email'}
                  {strategy === 'sms' && 'Get updates via SMS messages'}
                  {strategy === 'in_app' && 'See notifications within the app'}
                  {strategy === 'push_service' && 'Use third-party push service'}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Browser Guide Modal
  if (showGuide) {
    const guide = browserGuides[status.browserInfo.name];
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Enable Notifications in {status.browserInfo.name}</h2>
            <button
              onClick={() => setShowGuide(false)}
              title="Close browser guide"
              aria-label="Close browser guide"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {guide ? (
            <div className="space-y-4">
              {guide.steps.map((step) => (
                <div key={step.step} className="flex space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{step.instruction}</p>
                    {step.note && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{step.note}</p>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mt-6">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">Need More Help?</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      If these steps don&apos;t work, try refreshing the page or restarting your browser.
                      You can also check your browser&apos;s help documentation for more detailed instructions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                We don&apos;t have specific instructions for {status.browserInfo.name} yet.
                Please check your browser&apos;s settings to enable notifications for this site.
              </p>
            </div>
          )}
          
          <div className="flex justify-end mt-6">
            <button
              onClick={() => setShowGuide(false)}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render main component
  if (style === 'modal') {
    return (
      <div className={baseStyles.modal}>
        <div className={`${baseStyles.card} ${themeStyles[theme]} ${animated ? 'transform transition-all duration-300 scale-100' : ''}`}>
          {renderContent()}
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {renderContent()}
    </div>
  );
};

export default NotificationPermission;

// Utility exports
export { useNotificationPermission, getBrowserInfo, browserGuides };
