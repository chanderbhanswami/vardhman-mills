/**
 * Toast Component
 * Comprehensive toast notification system with animations, positioning, and interactions
 * Features: Multiple styles, animations, positioning, actions, progress, queuing, persistence
 */
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Bell, Heart, Zap, Crown } from 'lucide-react';
import { uiLogger } from '@/lib/utils/logger';
// import styles from '@/styles/Toast.module.css'; // Disabled - using Tailwind classes instead

// Types
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'custom';
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center';
export type ToastAnimation = 'slide' | 'fade' | 'scale' | 'bounce' | 'flip' | 'swing';
export type ToastStyle = 'filled' | 'outlined' | 'minimal' | 'glass' | 'gradient';

export interface ToastAction {
  label: string;
  onClick: () => void;
  style?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
}

export interface ToastProps {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number; // 0 means persistent
  position?: ToastPosition;
  animation?: ToastAnimation;
  style?: ToastStyle;
  icon?: React.ReactNode;
  actions?: ToastAction[];
  dismissible?: boolean;
  showProgress?: boolean;
  pauseOnHover?: boolean;
  pauseOnFocus?: boolean;
  role?: 'alert' | 'status' | 'log';
  ariaLive?: 'polite' | 'assertive' | 'off';
  className?: string;
  onDismiss?: (id: string) => void;
  onClick?: (id: string) => void;
  onAction?: (id: string, actionLabel: string) => void;
  // Advanced features
  persistent?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  category?: string;
  metadata?: Record<string, unknown>;
  // Styling options
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  // Rich content
  html?: string;
  component?: React.ComponentType<Record<string, unknown>>;
  componentProps?: Record<string, unknown>;
  // Sound and vibration
  sound?: string | boolean;
  vibration?: boolean | number[];
  // Progress and updates
  progress?: number; // 0-100
  updatable?: boolean;
  // Grouping
  group?: string;
  stackable?: boolean;
}

export interface ToastState {
  isVisible: boolean;
  isEntering: boolean;
  isExiting: boolean;
  isPaused: boolean;
  progress: number;
  timeRemaining: number;
  clickCount: number;
  hoverTime: number;
  lastInteraction: Date;
}

// Default icons for each toast type
const defaultIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5" />,
  error: <AlertCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
  loading: <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />,
  custom: <Bell className="w-5 h-5" />
};

// Style configurations
const styleConfigs = {
  filled: {
    success: 'bg-green-500 text-white border-green-600',
    error: 'bg-red-500 text-white border-red-600',
    warning: 'bg-yellow-500 text-white border-yellow-600',
    info: 'bg-blue-500 text-white border-blue-600',
    loading: 'bg-gray-500 text-white border-gray-600',
    custom: 'bg-purple-500 text-white border-purple-600'
  },
  outlined: {
    success: 'bg-white text-green-600 border-green-500 border-2',
    error: 'bg-white text-red-600 border-red-500 border-2',
    warning: 'bg-white text-yellow-600 border-yellow-500 border-2',
    info: 'bg-white text-blue-600 border-blue-500 border-2',
    loading: 'bg-white text-gray-600 border-gray-500 border-2',
    custom: 'bg-white text-purple-600 border-purple-500 border-2'
  },
  minimal: {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    loading: 'bg-gray-50 text-gray-800 border-gray-200',
    custom: 'bg-purple-50 text-purple-800 border-purple-200'
  },
  glass: {
    success: 'bg-green-500/20 text-green-900 border-green-500/30 backdrop-blur-md',
    error: 'bg-red-500/20 text-red-900 border-red-500/30 backdrop-blur-md',
    warning: 'bg-yellow-500/20 text-yellow-900 border-yellow-500/30 backdrop-blur-md',
    info: 'bg-blue-500/20 text-blue-900 border-blue-500/30 backdrop-blur-md',
    loading: 'bg-gray-500/20 text-gray-900 border-gray-500/30 backdrop-blur-md',
    custom: 'bg-purple-500/20 text-purple-900 border-purple-500/30 backdrop-blur-md'
  },
  gradient: {
    success: 'bg-gradient-to-r from-green-400 to-green-600 text-white border-green-500',
    error: 'bg-gradient-to-r from-red-400 to-red-600 text-white border-red-500',
    warning: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-500',
    info: 'bg-gradient-to-r from-blue-400 to-blue-600 text-white border-blue-500',
    loading: 'bg-gradient-to-r from-gray-400 to-gray-600 text-white border-gray-500',
    custom: 'bg-gradient-to-r from-purple-400 to-purple-600 text-white border-purple-500'
  }
};

// Animation configurations
const animationConfigs = {
  slide: {
    enter: {
      'top-left': 'animate-slide-in-left',
      'top-center': 'animate-slide-in-down',
      'top-right': 'animate-slide-in-right',
      'bottom-left': 'animate-slide-in-left',
      'bottom-center': 'animate-slide-in-up',
      'bottom-right': 'animate-slide-in-right',
      'center': 'animate-slide-in-down'
    },
    exit: {
      'top-left': 'animate-slide-out-left',
      'top-center': 'animate-slide-out-up',
      'top-right': 'animate-slide-out-right',
      'bottom-left': 'animate-slide-out-left',
      'bottom-center': 'animate-slide-out-down',
      'bottom-right': 'animate-slide-out-right',
      'center': 'animate-slide-out-up'
    }
  },
  fade: {
    enter: 'animate-fade-in',
    exit: 'animate-fade-out'
  },
  scale: {
    enter: 'animate-scale-in',
    exit: 'animate-scale-out'
  },
  bounce: {
    enter: 'animate-bounce-in',
    exit: 'animate-bounce-out'
  },
  flip: {
    enter: 'animate-flip-in',
    exit: 'animate-flip-out'
  },
  swing: {
    enter: 'animate-swing-in',
    exit: 'animate-swing-out'
  }
};

// Custom hook for toast state management
const useToastState = (props: ToastProps) => {
  const { id, duration, onDismiss, onClick, onAction, showProgress } = props;
  
  const [state, setState] = useState<ToastState>({
    isVisible: false,
    isEntering: true,
    isExiting: false,
    isPaused: false,
    progress: 0,
    timeRemaining: duration || 0,
    clickCount: 0,
    hoverTime: 0,
    lastInteraction: new Date()
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const pauseStartRef = useRef<number>(0);
  const totalPauseTimeRef = useRef<number>(0);

  const handleDismiss = useCallback(() => {
    if (state.isExiting) return;

    setState(prev => ({ ...prev, isExiting: true }));
    
    // Wait for exit animation
    setTimeout(() => {
      onDismiss?.(id);
    }, 300);
  }, [onDismiss, id, state.isExiting]);

  const handlePause = useCallback(() => {
    if (state.isPaused) return;
    
    pauseStartRef.current = Date.now();
    setState(prev => ({ ...prev, isPaused: true }));
  }, [state.isPaused]);

  const handleResume = useCallback(() => {
    if (!state.isPaused) return;
    
    totalPauseTimeRef.current += Date.now() - pauseStartRef.current;
    setState(prev => ({ ...prev, isPaused: false }));
  }, [state.isPaused]);

  const handleClick = useCallback(() => {
    setState(prev => ({
      ...prev,
      clickCount: prev.clickCount + 1,
      lastInteraction: new Date()
    }));
    
    onClick?.(id);
  }, [onClick, id]);

  const handleAction = useCallback((actionLabel: string) => {
    onAction?.(id, actionLabel);
  }, [onAction, id]);

  // Initialize toast
  useEffect(() => {
    setState(prev => ({ ...prev, isVisible: true, isEntering: true }));
    
    // Set entering to false after animation
    const enterTimer = setTimeout(() => {
      setState(prev => ({ ...prev, isEntering: false }));
    }, 300);

    return () => clearTimeout(enterTimer);
  }, []);

  // Handle auto-dismiss timer
  useEffect(() => {
    if (duration === 0 || state.isPaused || state.isExiting) {
      return;
    }

    const remainingTime = Math.max(0, duration! - (Date.now() - startTimeRef.current - totalPauseTimeRef.current));

    if (remainingTime <= 0) {
      handleDismiss();
      return;
    }

    timerRef.current = setTimeout(() => {
      handleDismiss();
    }, remainingTime);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [duration, state.isPaused, state.isExiting, handleDismiss]);

  // Handle progress bar
  useEffect(() => {
    if (!showProgress || duration === 0 || state.isPaused || state.isExiting) {
      return;
    }

    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current - totalPauseTimeRef.current;
      const progress = Math.min(100, (elapsed / duration!) * 100);
      
      setState(prev => ({
        ...prev,
        progress,
        timeRemaining: Math.max(0, duration! - elapsed)
      }));
    }, 50);

    return () => {
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
    };
  }, [showProgress, duration, state.isPaused, state.isExiting]);

  return {
    state,
    handleDismiss,
    handlePause,
    handleResume,
    handleClick,
    handleAction
  };
};

export const Toast: React.FC<ToastProps> = (props) => {
  const {
    id,
    type = 'info',
    title,
    message,
    duration = 5000,
    position = 'top-right',
    animation = 'slide',
    style = 'filled',
    icon,
    actions = [],
    dismissible = true,
    showProgress = true,
    pauseOnHover = true,
    pauseOnFocus = true,
    className = '',
    priority = 'normal',
    category,
    color,
    backgroundColor,
    borderColor,
    textColor,
    html,
    component: Component,
    componentProps,
    sound,
    vibration,
    progress,
    group,
    stackable = true
  } = props;

  const { state, handleDismiss, handlePause, handleResume, handleClick, handleAction } = useToastState(props);

  // Sound effect
  useEffect(() => {
    if (sound && state.isEntering) {
      try {
        if (typeof sound === 'string') {
          const audio = new Audio(sound);
          audio.volume = 0.3;
          audio.play().catch(error => {
            uiLogger.warn('Failed to play toast sound', { error, sound });
          });
        } else if (sound === true) {
          // Use default system notification sound
          const audio = new Audio('/sounds/notification.mp3');
          audio.volume = 0.3;
          audio.play().catch(() => {
            // Fallback: Use Web Audio API beep
            const audioContext = new (window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.1;
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
          });
        }
      } catch (error) {
        uiLogger.warn('Failed to play toast sound', { error });
      }
    }
  }, [sound, state.isEntering]);

  // Vibration effect
  useEffect(() => {
    if (vibration && state.isEntering && 'vibrate' in navigator) {
      try {
        if (typeof vibration === 'boolean') {
          navigator.vibrate([100, 50, 100]);
        } else {
          navigator.vibrate(vibration);
        }
      } catch (error) {
        uiLogger.warn('Failed to vibrate device', { error });
      }
    }
  }, [vibration, state.isEntering]);

  // Log toast interactions
  useEffect(() => {
    uiLogger.info('Toast displayed', {
      id,
      type,
      message: message.substring(0, 100),
      duration,
      position,
      category
    });
  }, [id, type, message, duration, position, category]);

  // Get style classes
  const getStyleClasses = () => {
    if (backgroundColor || color || borderColor || textColor) {
      return '';
    }
    return styleConfigs[style][type];
  };

  // Get animation classes
  const getAnimationClasses = () => {
    const config = animationConfigs[animation];
    
    if (state.isEntering) {
      if (typeof config.enter === 'object') {
        return config.enter[position] || config.enter['top-right'];
      }
      return config.enter;
    }
    
    if (state.isExiting) {
      if (typeof config.exit === 'object') {
        return config.exit[position] || config.exit['top-right'];
      }
      return config.exit;
    }
    
    return '';
  };

  // Priority indicator
  const getPriorityIndicator = () => {
    switch (priority) {
      case 'urgent':
        return <Crown className="w-4 h-4 text-red-500" />;
      case 'high':
        return <Zap className="w-4 h-4 text-orange-500" />;
      case 'low':
        return <Heart className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  // Base classes with CSS modules
  const baseClasses = `
    toast-component
    relative flex items-start space-x-3 p-4 rounded-lg border shadow-lg max-w-md w-full
    transition-all duration-300 ease-in-out transform-gpu
    ${getStyleClasses()}
    ${getAnimationClasses()}
    ${state.isPaused ? `toast-paused scale-105` : ''}
    ${backgroundColor ? 'custom-bg' : ''}
    ${(color || textColor) ? 'custom-color' : ''}
    ${borderColor ? 'custom-border' : ''}
    ${className}
  `.trim();

  // Event handlers
  const handleMouseEnter = () => {
    if (pauseOnHover) {
      handlePause();
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      handleResume();
    }
  };

  const handleFocus = () => {
    if (pauseOnFocus) {
      handlePause();
    }
  };

  const handleBlur = () => {
    if (pauseOnFocus) {
      handleResume();
    }
  };

  if (!state.isVisible) {
    return null;
  }

  return (
    <div
      className={`${baseClasses} toast-component`}
      role="status"
      aria-live="polite"
      tabIndex={0}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      data-toast-id={id}
      data-toast-type={type}
      data-toast-priority={priority}
      data-toast-group={group}
    >
      {/* Priority Indicator */}
      {priority !== 'normal' && (
        <div className="absolute -top-1 -right-1">
          {getPriorityIndicator()}
        </div>
      )}

      {/* Icon */}
      <div className="flex-shrink-0">
        {icon || defaultIcons[type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <div className="font-semibold text-sm mb-1 truncate">
            {title}
          </div>
        )}
        
        {Component ? (
          <Component {...componentProps} />
        ) : html ? (
          <div 
            className="text-sm"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <div className="text-sm">
            {message}
          </div>
        )}

        {/* Progress indicator */}
        {typeof progress === 'number' && (
          <div className="mt-2">
            <div className="w-full bg-black bg-opacity-20 rounded-full h-1">
              <div 
                className="progress-bar bg-current h-1 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs mt-1 opacity-75">
              {Math.round(progress)}% complete
            </div>
          </div>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex space-x-2 mt-3">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                  handleAction(action.label);
                }}
                disabled={action.disabled}
                className={`
                  px-3 py-1 rounded text-xs font-medium transition-colors
                  ${action.style === 'primary' ? 'bg-white bg-opacity-20 hover:bg-opacity-30' :
                    action.style === 'secondary' ? 'bg-black bg-opacity-10 hover:bg-opacity-20' :
                    action.style === 'danger' ? 'bg-red-500 bg-opacity-20 hover:bg-opacity-30 text-red-900' :
                    'hover:bg-white hover:bg-opacity-10'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Category */}
        {category && (
          <div className="text-xs opacity-75 mt-1">
            {category}
          </div>
        )}
      </div>

      {/* Dismiss button */}
      {dismissible && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Progress bar */}
      {showProgress && duration > 0 && !state.isPaused && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-20 rounded-b-lg overflow-hidden">
          <div 
            className="progress-bar h-full bg-current opacity-60 transition-all duration-100 ease-linear origin-left"
            style={{ width: `${100 - (state.progress || 0)}%` }}
          />
        </div>
      )}

      {/* Pause indicator */}
      {state.isPaused && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
        </div>
      )}

      {/* Stack indicator */}
      {stackable && group && (
        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-current opacity-30 rounded" />
      )}
    </div>
  );
};

export default Toast;

// Utility functions
export const createToast = (message: string, options: Partial<ToastProps> = {}): ToastProps => {
  return {
    id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    message,
    type: 'info',
    duration: 5000,
    position: 'top-right',
    animation: 'slide',
    style: 'filled',
    dismissible: true,
    showProgress: true,
    pauseOnHover: true,
    pauseOnFocus: true,
    priority: 'normal',
    ...options
  };
};

export const createSuccessToast = (message: string, options: Partial<ToastProps> = {}) =>
  createToast(message, { type: 'success', ...options });

export const createErrorToast = (message: string, options: Partial<ToastProps> = {}) =>
  createToast(message, { type: 'error', duration: 8000, ...options });

export const createWarningToast = (message: string, options: Partial<ToastProps> = {}) =>
  createToast(message, { type: 'warning', duration: 6000, ...options });

export const createInfoToast = (message: string, options: Partial<ToastProps> = {}) =>
  createToast(message, { type: 'info', ...options });

export const createLoadingToast = (message: string, options: Partial<ToastProps> = {}) =>
  createToast(message, { type: 'loading', duration: 0, dismissible: false, showProgress: false, ...options });

