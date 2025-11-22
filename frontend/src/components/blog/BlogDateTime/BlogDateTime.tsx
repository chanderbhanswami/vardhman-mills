/**
 * BlogDateTime Component - Vardhman Mills Frontend
 * 
 * Comprehensive date and time display component for blog posts
 * with multiple formats, relative time, and internationalization.
 */

'use client';

import React from 'react';
import { formatDistanceToNow, format, isToday, isYesterday, parseISO } from 'date-fns';
import { Calendar, Clock, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';

// Types
export interface BlogDateTimeProps {
  /** The date to display */
  date: string | Date;
  /** The type of date being displayed */
  type?: 'published' | 'updated' | 'created' | 'modified' | 'viewed';
  /** Display format for the date */
  format?: 'relative' | 'absolute' | 'both' | 'smart' | 'compact';
  /** Additional information about the date */
  author?: string;
  /** Show time along with date */
  showTime?: boolean;
  /** Show an icon */
  showIcon?: boolean;
  /** Custom icon to use */
  icon?: React.ComponentType<{ className?: string }>;
  /** Custom prefix text */
  prefix?: string;
  /** Custom suffix text */
  suffix?: string;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Color variant */
  variant?: 'default' | 'muted' | 'accent' | 'success' | 'warning' | 'error';
  /** Display as a badge */
  badge?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom date format string */
  customFormat?: string;
  /** Show tooltip with full date information */
  tooltip?: boolean;
  /** Locale for date formatting */
  locale?: string;
}

/**
 * BlogDateTime Component
 * 
 * Flexible date and time display component with multiple
 * formatting options and internationalization support.
 */
export const BlogDateTime: React.FC<BlogDateTimeProps> = ({
  date,
  type = 'published',
  format: displayFormat = 'smart',
  author,
  showTime = false,
  showIcon = true,
  icon: CustomIcon,
  prefix,
  suffix,
  size = 'sm',
  variant = 'default',
  badge = false,
  className = '',
  customFormat,
  tooltip = true,
  locale = 'en-US' // eslint-disable-line @typescript-eslint/no-unused-vars
}) => {
  // Parse date if it's a string
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  
  // Validate date
  if (!parsedDate || isNaN(parsedDate.getTime())) {
    return null;
  }

  /**
   * Get the appropriate icon based on type
   */
  const getIcon = () => {
    if (CustomIcon) return CustomIcon;
    
    switch (type) {
      case 'viewed':
        return Eye;
      case 'created':
      case 'published':
        return Calendar;
      case 'updated':
      case 'modified':
        return Clock;
      default:
        return Calendar;
    }
  };

  const Icon = getIcon();

  /**
   * Get display text based on type
   */
  const getTypeText = () => {
    switch (type) {
      case 'published':
        return 'Published';
      case 'updated':
        return 'Updated';
      case 'created':
        return 'Created';
      case 'modified':
        return 'Modified';
      case 'viewed':
        return 'Viewed';
      default:
        return '';
    }
  };

  /**
   * Format date based on display format
   */
  const formatDate = () => {
    const now = new Date();
    const diffInHours = (now.getTime() - parsedDate.getTime()) / (1000 * 60 * 60);
    
    switch (displayFormat) {
      case 'relative':
        return formatDistanceToNow(parsedDate, { addSuffix: true });
      
      case 'absolute':
        if (customFormat) {
          return format(parsedDate, customFormat);
        }
        return showTime 
          ? format(parsedDate, 'MMM dd, yyyy \'at\' h:mm a')
          : format(parsedDate, 'MMM dd, yyyy');
      
      case 'both':
        const relative = formatDistanceToNow(parsedDate, { addSuffix: true });
        const absolute = showTime 
          ? format(parsedDate, 'MMM dd, yyyy \'at\' h:mm a')
          : format(parsedDate, 'MMM dd, yyyy');
        return `${relative} (${absolute})`;
      
      case 'compact':
        if (diffInHours < 24) {
          return formatDistanceToNow(parsedDate, { addSuffix: true });
        }
        return format(parsedDate, 'MMM dd');
      
      case 'smart':
      default:
        // Smart formatting based on how old the date is
        if (isToday(parsedDate)) {
          return showTime 
            ? format(parsedDate, 'h:mm a')
            : 'Today';
        } else if (isYesterday(parsedDate)) {
          return showTime 
            ? `Yesterday at ${format(parsedDate, 'h:mm a')}`
            : 'Yesterday';
        } else if (diffInHours < 168) { // Less than a week
          return formatDistanceToNow(parsedDate, { addSuffix: true });
        } else if (parsedDate.getFullYear() === now.getFullYear()) {
          return showTime 
            ? format(parsedDate, 'MMM dd \'at\' h:mm a')
            : format(parsedDate, 'MMM dd');
        } else {
          return showTime 
            ? format(parsedDate, 'MMM dd, yyyy \'at\' h:mm a')
            : format(parsedDate, 'MMM dd, yyyy');
        }
    }
  };

  /**
   * Get full date information for tooltip
   */
  const getTooltipContent = () => {
    return (
      <div className="space-y-1">
        <div className="font-medium">
          {getTypeText()} {format(parsedDate, 'EEEE, MMMM dd, yyyy')}
        </div>
        <div className="text-sm">
          {format(parsedDate, 'h:mm:ss a')}
        </div>
        <div className="text-xs text-gray-400">
          {formatDistanceToNow(parsedDate, { addSuffix: true })}
        </div>
      </div>
    );
  };

  /**
   * Get size classes
   */
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'text-xs';
      case 'sm':
        return 'text-sm';
      case 'md':
        return 'text-base';
      case 'lg':
        return 'text-lg';
      default:
        return 'text-sm';
    }
  };

  /**
   * Get variant classes
   */
  const getVariantClasses = () => {
    switch (variant) {
      case 'muted':
        return 'text-gray-500';
      case 'accent':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-700';
    }
  };

  /**
   * Get icon size based on text size
   */
  const getIconSize = () => {
    switch (size) {
      case 'xs':
        return 'w-3 h-3';
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-5 h-5';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-4 h-4';
    }
  };

  const formattedDate = formatDate();
  const typeText = getTypeText();
  const displayText = `${prefix || ''}${typeText ? `${typeText} ` : ''}${formattedDate}${author ? ` by ${author}` : ''}${suffix || ''}`;

  const baseClasses = `
    inline-flex items-center space-x-1
    ${getSizeClasses()}
    ${getVariantClasses()}
    ${className}
  `.trim();

  const content = (
    <>
      {showIcon && (
        <Icon className={`${getIconSize()} flex-shrink-0`} />
      )}
      <span>{displayText}</span>
    </>
  );

  if (badge) {
    const getBadgeVariant = () => {
      switch (variant) {
        case 'success': return 'success';
        case 'warning': return 'warning';
        case 'error': return 'destructive';
        case 'accent': return 'info';
        case 'muted': return 'secondary';
        default: return 'secondary';
      }
    };
    
    return (
      <Badge variant={getBadgeVariant()} className={`${baseClasses} ${className}`}>
        {content}
      </Badge>
    );
  }

  if (tooltip) {
    return (
      <Tooltip content={getTooltipContent()}>
        <span className={baseClasses}>
          {content}
        </span>
      </Tooltip>
    );
  }

  return (
    <span className={baseClasses}>
      {content}
    </span>
  );
};

/**
 * Specialized components for common use cases
 */

/**
 * Published date display
 */
export const PublishedDate: React.FC<Omit<BlogDateTimeProps, 'type'>> = (props) => (
  <BlogDateTime {...props} type="published" />
);

/**
 * Last updated date display
 */
export const LastUpdated: React.FC<Omit<BlogDateTimeProps, 'type'>> = (props) => (
  <BlogDateTime {...props} type="updated" />
);

/**
 * Creation date display
 */
export const CreatedDate: React.FC<Omit<BlogDateTimeProps, 'type'>> = (props) => (
  <BlogDateTime {...props} type="created" />
);

/**
 * Last viewed date display
 */
export const LastViewed: React.FC<Omit<BlogDateTimeProps, 'type'>> = (props) => (
  <BlogDateTime {...props} type="viewed" />
);

/**
 * Compact date display for lists
 */
export const CompactDate: React.FC<Omit<BlogDateTimeProps, 'format' | 'size'>> = (props) => (
  <BlogDateTime {...props} format="compact" size="xs" />
);

/**
 * Smart date display with automatic formatting
 */
export const SmartDate: React.FC<Omit<BlogDateTimeProps, 'format'>> = (props) => (
  <BlogDateTime {...props} format="smart" />
);

/**
 * Relative time display (e.g., "2 hours ago")
 */
export const RelativeTime: React.FC<Omit<BlogDateTimeProps, 'format'>> = (props) => (
  <BlogDateTime {...props} format="relative" />
);

/**
 * Full date display with time
 */
export const FullDateTime: React.FC<Omit<BlogDateTimeProps, 'format' | 'showTime'>> = (props) => (
  <BlogDateTime {...props} format="absolute" showTime={true} />
);

/**
 * Date range component for displaying periods
 */
export interface DateRangeProps {
  startDate: string | Date;
  endDate?: string | Date;
  format?: 'relative' | 'absolute' | 'smart';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'muted' | 'accent';
  className?: string;
  showIcon?: boolean;
}

export const DateRange: React.FC<DateRangeProps> = ({
  startDate,
  endDate,
  format: displayFormat = 'smart',
  size = 'sm',
  variant = 'default',
  className = '',
  showIcon = true
}) => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = endDate ? (typeof endDate === 'string' ? parseISO(endDate) : endDate) : null;

  if (!start || isNaN(start.getTime())) {
    return null;
  }

  const formatDateRange = () => {
    if (!end) {
      return <BlogDateTime date={start} format={displayFormat} size={size} variant={variant} showIcon={false} />;
    }

    const startFormatted = format(start, 'MMM dd, yyyy');
    const endFormatted = format(end, 'MMM dd, yyyy');

    if (start.getFullYear() === end.getFullYear()) {
      if (start.getMonth() === end.getMonth()) {
        // Same month
        return `${format(start, 'MMM dd')} - ${format(end, 'dd, yyyy')}`;
      } else {
        // Same year, different months
        return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')}`;
      }
    } else {
      // Different years
      return `${startFormatted} - ${endFormatted}`;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'xs': return 'text-xs';
      case 'sm': return 'text-sm';
      case 'md': return 'text-base';
      case 'lg': return 'text-lg';
      default: return 'text-sm';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'muted': return 'text-gray-500';
      case 'accent': return 'text-blue-600';
      default: return 'text-gray-700';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'xs': return 'w-3 h-3';
      case 'sm': return 'w-4 h-4';
      case 'md': return 'w-5 h-5';
      case 'lg': return 'w-6 h-6';
      default: return 'w-4 h-4';
    }
  };

  return (
    <span className={`inline-flex items-center space-x-1 ${getSizeClasses()} ${getVariantClasses()} ${className}`}>
      {showIcon && <Calendar className={`${getIconSize()} flex-shrink-0`} />}
      <span>{formatDateRange()}</span>
    </span>
  );
};

export default BlogDateTime;
