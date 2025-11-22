'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ClockIcon,
  CalendarIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';
import { Timestamp } from '@/types/common.types';

// Types
export interface DateProps {
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  isEdited?: boolean;
  showRelative?: boolean;
  showFull?: boolean;
  showIcon?: boolean;
  showEditIndicator?: boolean;
  showTooltip?: boolean;
  autoUpdateRelative?: boolean;
  updateInterval?: number; // in seconds
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'detailed' | 'compact';
  format?: 'short' | 'medium' | 'long' | 'full';
  timeZone?: string;
  locale?: string;
  clickable?: boolean;
  className?: string;

  // Event handlers
  onClick?: () => void;
  onAnalyticsEvent?: (event: string, data: Record<string, unknown>) => void;
}

const SIZE_CONFIGS = {
  xs: {
    text: 'text-xs',
    icon: 'w-3 h-3'
  },
  sm: {
    text: 'text-xs',
    icon: 'w-3 h-3'
  },
  md: {
    text: 'text-sm',
    icon: 'w-4 h-4'
  },
  lg: {
    text: 'text-base',
    icon: 'w-4 h-4'
  }
} as const;

const DateComponent: React.FC<DateProps> = ({
  createdAt,
  updatedAt,
  isEdited = false,
  showRelative = true,
  showFull = false,
  showIcon = false,
  showEditIndicator = true,
  showTooltip = true,
  autoUpdateRelative = true,
  updateInterval = 60, // 1 minute
  size = 'md',
  variant = 'default',
  format = 'medium',
  timeZone,
  locale = 'en-US',
  clickable = false,
  className,
  onClick,
  onAnalyticsEvent
}) => {
  // State
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isHovered, setIsHovered] = useState(false);

  // Get size configuration
  const sizeConfig = SIZE_CONFIGS[size];

  // Auto-update relative time
  useEffect(() => {
    if (!autoUpdateRelative || !showRelative) return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, updateInterval * 1000);

    return () => clearInterval(interval);
  }, [autoUpdateRelative, showRelative, updateInterval]);

  // Format relative time
  const formatRelativeTime = useCallback((timestamp: Timestamp) => {
    const now = currentTime;
    const time = typeof timestamp === 'string' ? new Date(timestamp).getTime() : Number(timestamp);
    const diff = now - time;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return seconds <= 5 ? 'just now' : `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (weeks < 4) return `${weeks}w ago`;
    if (months < 12) return `${months}mo ago`;
    return `${years}y ago`;
  }, [currentTime]);

  // Format absolute time
  const formatAbsoluteTime = useCallback((timestamp: Timestamp) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
    
    const formatOptions: Intl.DateTimeFormatOptions = {
      timeZone: timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    switch (format) {
      case 'short':
        formatOptions.month = 'short';
        formatOptions.day = 'numeric';
        if (date.getFullYear() !== new Date().getFullYear()) {
          formatOptions.year = 'numeric';
        }
        break;
      case 'medium':
        formatOptions.month = 'short';
        formatOptions.day = 'numeric';
        formatOptions.hour = 'numeric';
        formatOptions.minute = '2-digit';
        if (date.getFullYear() !== new Date().getFullYear()) {
          formatOptions.year = 'numeric';
        }
        break;
      case 'long':
        formatOptions.weekday = 'short';
        formatOptions.month = 'short';
        formatOptions.day = 'numeric';
        formatOptions.hour = 'numeric';
        formatOptions.minute = '2-digit';
        formatOptions.year = 'numeric';
        break;
      case 'full':
        formatOptions.weekday = 'long';
        formatOptions.year = 'numeric';
        formatOptions.month = 'long';
        formatOptions.day = 'numeric';
        formatOptions.hour = 'numeric';
        formatOptions.minute = '2-digit';
        formatOptions.second = '2-digit';
        formatOptions.timeZoneName = 'short';
        break;
      default:
        formatOptions.month = 'short';
        formatOptions.day = 'numeric';
        formatOptions.hour = 'numeric';
        formatOptions.minute = '2-digit';
    }

    return date.toLocaleDateString(locale, formatOptions);
  }, [format, timeZone, locale]);

  // Determine display text
  const displayText = useMemo(() => {
    if (showFull) {
      return formatAbsoluteTime(createdAt);
    }
    
    if (showRelative) {
      return formatRelativeTime(createdAt);
    }
    
    return formatAbsoluteTime(createdAt);
  }, [showFull, showRelative, formatAbsoluteTime, formatRelativeTime, createdAt]);

  // Generate tooltip content
  const tooltipContent = useMemo(() => {
    if (!showTooltip) return '';

    const parts = [];

    // Primary timestamp
    const primaryFormat = showRelative 
      ? `Created: ${formatAbsoluteTime(createdAt)}`
      : `Created: ${formatRelativeTime(createdAt)}`;
    parts.push(primaryFormat);

    // Edit information
    if (isEdited && updatedAt) {
      const editFormat = showRelative
        ? `Last edited: ${formatAbsoluteTime(updatedAt)}`
        : `Last edited: ${formatRelativeTime(updatedAt)}`;
      parts.push(editFormat);
    }

    // Timezone info for detailed variant
    if (variant === 'detailed' && timeZone) {
      parts.push(`Timezone: ${timeZone}`);
    }

    return parts.join('\n');
  }, [
    showTooltip, showRelative, formatAbsoluteTime, formatRelativeTime, 
    createdAt, isEdited, updatedAt, variant, timeZone
  ]);

  // Handle click
  const handleClick = useCallback(() => {
    if (!clickable || !onClick) return;
    
    onClick();
    onAnalyticsEvent?.('date_click', {
      createdAt: createdAt,
      isEdited: isEdited,
      displayFormat: showRelative ? 'relative' : 'absolute'
    });
  }, [clickable, onClick, createdAt, isEdited, showRelative, onAnalyticsEvent]);

  // Render edit indicator
  const renderEditIndicator = useCallback(() => {
    if (!showEditIndicator || !isEdited) return null;

    const indicator = (
      <div className="flex items-center gap-0.5">
        <PencilIcon className={cn(sizeConfig.icon, 'text-gray-400')} />
        {variant === 'detailed' && (
          <span className={cn(sizeConfig.text, 'text-gray-400')}>
            edited
          </span>
        )}
      </div>
    );

    if (updatedAt && showTooltip) {
      return (
        <Tooltip content={`Last edited: ${formatAbsoluteTime(updatedAt)}`}>
          {indicator}
        </Tooltip>
      );
    }

    return indicator;
  }, [
    showEditIndicator, isEdited, sizeConfig, variant, updatedAt, 
    showTooltip, formatAbsoluteTime
  ]);

  // Render icon
  const renderIcon = useCallback(() => {
    if (!showIcon) return null;

    const IconComponent = variant === 'detailed' ? CalendarIcon : ClockIcon;
    
    return (
      <motion.div
        animate={{ scale: isHovered && clickable ? 1.1 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <IconComponent className={cn(sizeConfig.icon, 'text-gray-400 flex-shrink-0')} />
      </motion.div>
    );
  }, [showIcon, variant, isHovered, clickable, sizeConfig.icon]);

  // Main content
  const content = (
    <div
      className={cn(
        'inline-flex items-center gap-1 text-gray-500 transition-colors',
        clickable && 'hover:text-gray-700 cursor-pointer',
        sizeConfig.text,
        className
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {renderIcon()}
      
      <motion.span
        className="whitespace-nowrap"
        whileHover={clickable ? { scale: 1.02 } : undefined}
        transition={{ duration: 0.2 }}
      >
        {displayText}
      </motion.span>
      
      {renderEditIndicator()}
    </div>
  );

  // Wrap with tooltip if enabled and content available
  if (showTooltip && tooltipContent) {
    return (
      <Tooltip content={<div className="whitespace-pre-line">{tooltipContent}</div>}>
        {content}
      </Tooltip>
    );
  }

  return content;
};

export default DateComponent;
