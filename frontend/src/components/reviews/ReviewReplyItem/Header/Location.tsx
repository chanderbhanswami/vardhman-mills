'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPinIcon,
  GlobeAltIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';

// Types
export interface LocationData {
  city?: string;
  state?: string;
  country: string;
}

export interface LocationProps {
  location: LocationData;
  showIcon?: boolean;
  showCity?: boolean;
  showState?: boolean;
  showCountry?: boolean;
  showFullAddress?: boolean;
  showTooltip?: boolean;
  compact?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'detailed';
  className?: string;

  // Privacy
  respectPrivacy?: boolean;
  showPrivacyIcon?: boolean;

  // Event handlers
  onClick?: (location: LocationData) => void;
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
    icon: 'w-5 h-5'
  }
} as const;

const Location: React.FC<LocationProps> = ({
  location,
  showIcon = true,
  showCity = true,
  showState = true,
  showCountry = true,
  showFullAddress = false,
  showTooltip = true,
  compact = false,
  size = 'md',
  variant = 'default',
  className,
  respectPrivacy = true,
  showPrivacyIcon = false,
  onClick,
  onAnalyticsEvent
}) => {
  // State
  const [isHovered, setIsHovered] = useState(false);

  // Get size configuration
  const sizeConfig = SIZE_CONFIGS[size];

  // Format location display
  const formatLocation = useCallback(() => {
    const parts = [];

    // Add city if available and should be shown
    if (showCity && location.city && (!compact || variant === 'detailed')) {
      parts.push(location.city);
    }

    // Add state if available and should be shown
    if (showState && location.state && (!compact || showFullAddress)) {
      parts.push(location.state);
    }

    // Add country if should be shown
    if (showCountry && location.country) {
      // For compact mode, only show country unless it's detailed variant
      if (compact && variant !== 'detailed' && parts.length > 0) {
        // Replace previous parts with just country for compact display
        return location.country;
      }
      parts.push(location.country);
    }

    return parts.length > 0 ? parts.join(', ') : null;
  }, [
    location, showCity, showState, showCountry, compact, variant, showFullAddress
  ]);

  // Format tooltip content
  const formatTooltip = useCallback(() => {
    if (!showTooltip) return '';

    const parts = [];
    
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    if (location.country) parts.push(location.country);
    
    return parts.join(', ');
  }, [showTooltip, location]);

  // Handle click
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(location);
      onAnalyticsEvent?.('location_click', {
        city: location.city,
        state: location.state,
        country: location.country
      });
    }
  }, [onClick, location, onAnalyticsEvent]);

  // Render privacy icon
  const renderPrivacyIcon = useCallback(() => {
    if (!showPrivacyIcon || !respectPrivacy) return null;

    return (
      <Tooltip content="Location visibility controlled by user privacy settings">
        <EyeSlashIcon className={cn(sizeConfig.icon, 'text-gray-400 ml-1')} />
      </Tooltip>
    );
  }, [showPrivacyIcon, respectPrivacy, sizeConfig.icon]);

  // Format location text
  const locationText = formatLocation();
  const tooltipText = formatTooltip();

  // Don't render if no location data
  if (!locationText) {
    return null;
  }

  // Main component content
  const content = (
    <div
      className={cn(
        'inline-flex items-center gap-1 text-gray-500 transition-colors',
        onClick && 'hover:text-gray-700 cursor-pointer',
        sizeConfig.text,
        className
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {showIcon && (
        <motion.div
          animate={{ scale: isHovered && onClick ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {variant === 'detailed' ? (
            <GlobeAltIcon className={sizeConfig.icon} />
          ) : (
            <MapPinIcon className={sizeConfig.icon} />
          )}
        </motion.div>
      )}
      
      <span className="truncate max-w-32 sm:max-w-48">
        {locationText}
      </span>
      
      {renderPrivacyIcon()}
    </div>
  );

  // Wrap with tooltip if enabled
  if (showTooltip && tooltipText !== locationText) {
    return (
      <Tooltip content={tooltipText}>
        {content}
      </Tooltip>
    );
  }

  return content;
};

export default Location;
