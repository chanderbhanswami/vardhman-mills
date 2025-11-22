'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { 
  CalendarIcon,
  GlobeAltIcon,
  PencilIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { 
  CalendarDaysIcon
} from '@heroicons/react/24/solid';

import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Separator } from '@/components/ui/Separator';

import { cn } from '@/lib/utils';
import { ProductReview } from '@/types/review.types';

export type DateVariant = 
  | 'default' 
  | 'compact' 
  | 'detailed' 
  | 'relative' 
  | 'absolute' 
  | 'tooltip' 
  | 'inline' 
  | 'badge';

export type DateFormat = 
  | 'short' 
  | 'medium' 
  | 'long' 
  | 'full' 
  | 'relative' 
  | 'custom';

export type TimeZoneDisplay = 
  | 'auto' 
  | 'local' 
  | 'utc' 
  | 'original' 
  | 'none';

export interface DateProps {
  review: ProductReview;
  variant?: DateVariant;
  format?: DateFormat;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showTime?: boolean;
  showTimezone?: TimeZoneDisplay;
  showRelative?: boolean;
  showIcon?: boolean;
  showUpdateInfo?: boolean;
  showTooltip?: boolean;
  colorScheme?: 'default' | 'minimal' | 'vibrant' | 'muted';
  className?: string;
  customFormat?: string;
  onDateClick?: (date: Date) => void;
  onTimezoneClick?: (timezone: string) => void;
  onUpdateInfoClick?: () => void;
}

const DateComponent: React.FC<DateProps> = ({
  review,
  variant = 'default',
  format = 'medium',
  size = 'md',
  showTime = false,
  showTimezone = 'auto',
  showRelative = true,
  showIcon = true,
  showUpdateInfo = false,
  showTooltip = true,
  colorScheme = 'default',
  className,
  customFormat,
  onDateClick,
  onTimezoneClick
}) => {
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Date information - using createdAt from review
  const reviewDate = useMemo(() => new Date(review.createdAt), [review.createdAt]);
  const updatedDate = useMemo(() => 
    review.updatedAt ? new Date(review.updatedAt) : null, 
    [review.updatedAt]
  );

  // Timezone detection
  const userTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'UTC';
    }
  }, []);

  // Format configurations
  const formatConfigs = useMemo(() => ({
    short: {
      date: { month: 'short' as const, day: 'numeric' as const },
      time: { hour: 'numeric' as const, minute: '2-digit' as const }
    },
    medium: {
      date: { year: 'numeric' as const, month: 'short' as const, day: 'numeric' as const },
      time: { hour: 'numeric' as const, minute: '2-digit' as const }
    },
    long: {
      date: { year: 'numeric' as const, month: 'long' as const, day: 'numeric' as const },
      time: { hour: 'numeric' as const, minute: '2-digit' as const, second: '2-digit' as const }
    },
    full: {
      date: { 
        weekday: 'long' as const, 
        year: 'numeric' as const, 
        month: 'long' as const, 
        day: 'numeric' as const 
      },
      time: { 
        hour: 'numeric' as const, 
        minute: '2-digit' as const, 
        second: '2-digit' as const,
        timeZoneName: 'short' as const
      }
    }
  }), []);

  // Size configurations
  const sizeConfigs = useMemo(() => ({
    xs: {
      text: 'text-xs',
      icon: 'w-3 h-3',
      spacing: 'gap-1',
      padding: 'px-1.5 py-0.5'
    },
    sm: {
      text: 'text-sm',
      icon: 'w-3.5 h-3.5',
      spacing: 'gap-1.5',
      padding: 'px-2 py-1'
    },
    md: {
      text: 'text-sm',
      icon: 'w-4 h-4',
      spacing: 'gap-2',
      padding: 'px-2.5 py-1.5'
    },
    lg: {
      text: 'text-base',
      icon: 'w-5 h-5',
      spacing: 'gap-2.5',
      padding: 'px-3 py-2'
    }
  }), []);

  // Color schemes
  const colorSchemes = useMemo(() => ({
    default: {
      text: 'text-gray-600',
      icon: 'text-gray-500',
      badge: 'bg-gray-100 text-gray-700 border-gray-300',
      hover: 'hover:text-gray-800'
    },
    minimal: {
      text: 'text-gray-500',
      icon: 'text-gray-400',
      badge: 'bg-gray-50 text-gray-600 border-gray-200',
      hover: 'hover:text-gray-600'
    },
    vibrant: {
      text: 'text-blue-600',
      icon: 'text-blue-500',
      badge: 'bg-blue-100 text-blue-700 border-blue-300',
      hover: 'hover:text-blue-800'
    },
    muted: {
      text: 'text-gray-400',
      icon: 'text-gray-400',
      badge: 'bg-gray-100 text-gray-500 border-gray-200',
      hover: 'hover:text-gray-500'
    }
  }), []);

  // Get relative time string
  const getRelativeTime = useCallback((date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  }, []);

  // Format date according to configuration
  const formatDate = useCallback((date: Date, includeTime: boolean = false): string => {
    if (format === 'relative') {
      return getRelativeTime(date);
    }

    if (format === 'custom' && customFormat) {
      // Simple custom format implementation
      return customFormat
        .replace('YYYY', date.getFullYear().toString())
        .replace('MM', (date.getMonth() + 1).toString().padStart(2, '0'))
        .replace('DD', date.getDate().toString().padStart(2, '0'))
        .replace('HH', date.getHours().toString().padStart(2, '0'))
        .replace('mm', date.getMinutes().toString().padStart(2, '0'));
    }

    const config = formatConfigs[format as keyof typeof formatConfigs] || formatConfigs.medium;
    const options = { ...config.date };

    if (includeTime && showTime) {
      Object.assign(options, config.time);
    }

    if (showTimezone !== 'none' && showTimezone !== 'auto') {
      if (showTimezone === 'utc') {
        (options as Intl.DateTimeFormatOptions).timeZone = 'UTC';
      } else if (showTimezone === 'local') {
        (options as Intl.DateTimeFormatOptions).timeZone = userTimezone;
      }
    }

    try {
      return new Intl.DateTimeFormat('en-US', options).format(date);
    } catch {
      return date.toLocaleDateString();
    }
  }, [format, customFormat, formatConfigs, showTime, showTimezone, userTimezone, getRelativeTime]);

  // Get timezone display
  const getTimezoneDisplay = useCallback((): string | null => {
    if (showTimezone === 'none') return null;
    
    if (showTimezone === 'utc') return 'UTC';
    if (showTimezone === 'local') return userTimezone.split('/').pop() || 'Local';
    if (showTimezone === 'auto') {
      return userTimezone !== 'UTC' ? userTimezone.split('/').pop() || 'Local' : null;
    }
    
    return null;
  }, [showTimezone, userTimezone]);

  // Handle date click
  const handleDateClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (onDateClick) {
      onDateClick(reviewDate);
    } else if (variant !== 'inline') {
      setShowDetailsDialog(true);
    }
  }, [onDateClick, reviewDate, variant]);

  // Handle timezone click
  const handleTimezoneClick = useCallback((timezone: string) => {
    if (onTimezoneClick) {
      onTimezoneClick(timezone);
    }
  }, [onTimezoneClick]);

  // Get date colors
  const getDateColors = useCallback(() => {
    return colorSchemes[colorScheme];
  }, [colorScheme, colorSchemes]);

  // Render icon
  const renderIcon = useCallback(() => {
    if (!showIcon) return null;

    const sizeConfig = sizeConfigs[size];
    const colors = getDateColors();
    
    const IconComponent = updatedDate ? PencilIcon : CalendarIcon;

    return (
      <IconComponent 
        className={cn(
          sizeConfig.icon, 
          colors.icon,
          'flex-shrink-0'
        )} 
      />
    );
  }, [showIcon, sizeConfigs, size, getDateColors, updatedDate]);

  // Render main date content
  const renderDateContent = useCallback(() => {
    const sizeConfig = sizeConfigs[size];
    const colors = getDateColors();
    const timezone = getTimezoneDisplay();

    const dateText = formatDate(reviewDate, showTime);
    const relativeText = showRelative && format !== 'relative' ? getRelativeTime(reviewDate) : null;

    return (
      <div className={cn(
        "flex items-center cursor-pointer transition-colors duration-200",
        sizeConfig.spacing,
        colors.text,
        colors.hover,
        className
      )}
      onClick={handleDateClick}
      >
        {renderIcon()}
        <div className="flex flex-col">
          <span className={cn(sizeConfig.text, "font-medium")}>
            {dateText}
          </span>
          {relativeText && variant === 'detailed' && (
            <span className={cn(sizeConfig.text, "text-xs opacity-75 mt-0.5")}>
              {relativeText}
            </span>
          )}
        </div>
        
        {timezone && showTimezone !== 'none' && (
          <Badge
            variant="outline"
            className="ml-2 text-xs cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleTimezoneClick(timezone);
            }}
          >
            {timezone}
          </Badge>
        )}

        {showUpdateInfo && updatedDate && (
          <Tooltip content="This review was updated">
            <PencilIcon 
              className={cn(sizeConfig.icon, "text-orange-500 ml-1")}
            />
          </Tooltip>
        )}
      </div>
    );
  }, [
    sizeConfigs, 
    size, 
    getDateColors, 
    getTimezoneDisplay, 
    formatDate, 
    reviewDate, 
    showTime, 
    showRelative, 
    format, 
    getRelativeTime, 
    className, 
    handleDateClick, 
    renderIcon, 
    variant, 
    showTimezone, 
    handleTimezoneClick, 
    showUpdateInfo, 
    updatedDate
  ]);

  // Render details dialog
  const renderDetailsDialog = useCallback(() => (
    <Dialog open={showDetailsDialog} onClose={() => setShowDetailsDialog(false)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
            Review Date Information
          </DialogTitle>
          <DialogDescription>
            Detailed date and time information for this review
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Date Information */}
          <Card>
            <CardHeader>
              <CardTitle>Review Posted</CardTitle>
              <CardDescription>
                When this review was originally submitted
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Date</div>
                  <div className="text-lg font-semibold">
                    {formatDate(reviewDate, false)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Time</div>
                  <div className="text-lg font-semibold">
                    {reviewDate.toLocaleTimeString()}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Relative Time</div>
                <div className="text-base">
                  {getRelativeTime(reviewDate)}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Full Timestamp</div>
                <div className="text-sm font-mono bg-gray-100 p-2 rounded">
                  {reviewDate.toISOString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Update Information */}
          {updatedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PencilIcon className="w-5 h-5 text-orange-500" />
                  Last Updated
                </CardTitle>
                <CardDescription>
                  This review has been modified since it was posted
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Updated On</div>
                    <div className="text-lg font-semibold">
                      {formatDate(updatedDate, false)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Time Ago</div>
                    <div className="text-lg font-semibold">
                      {getRelativeTime(updatedDate)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Days Since Original</div>
                  <div className="text-base">
                    {Math.floor((updatedDate.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24))} days
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timezone Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GlobeAltIcon className="w-5 h-5 text-green-500" />
                Timezone Information
              </CardTitle>
              <CardDescription>
                Time zone details and conversions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Your Local Time</div>
                    <div className="text-base">
                      {reviewDate.toLocaleString('en-US', { timeZone: userTimezone })}
                    </div>
                    <div className="text-xs text-gray-500">{userTimezone}</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">UTC Time</div>
                    <div className="text-base">
                      {reviewDate.toLocaleString('en-US', { timeZone: 'UTC' })}
                    </div>
                    <div className="text-xs text-gray-500">Coordinated Universal Time</div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo'].map((timezone) => {
                  const tzName = timezone.split('/').pop();
                  return (
                    <Button
                      key={timezone}
                      size="sm"
                      variant="outline"
                      className="flex flex-col items-center py-3 h-auto"
                      onClick={() => handleTimezoneClick(timezone)}
                    >
                      <div className="font-medium text-xs">{tzName}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {reviewDate.toLocaleTimeString('en-US', { 
                          timeZone: timezone,
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Format Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <EyeIcon className="w-5 h-5 text-purple-500" />
                Format Examples
              </CardTitle>
              <CardDescription>
                Different ways to display this date
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(formatConfigs).map(([formatName, config]) => (
                  <div key={formatName} className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-1 capitalize">
                      {formatName}
                    </div>
                    <div className="text-sm">
                      {new Intl.DateTimeFormat('en-US', config.date).format(reviewDate)}
                    </div>
                    {showTime && (
                      <div className="text-xs text-gray-600 mt-1">
                        {new Intl.DateTimeFormat('en-US', config.time).format(reviewDate)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigator.clipboard?.writeText(reviewDate.toISOString())}
            >
              Copy ISO String
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDetailsDialog(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  ), [
    showDetailsDialog, 
    formatDate, 
    reviewDate, 
    getRelativeTime, 
    updatedDate, 
    userTimezone, 
    handleTimezoneClick, 
    formatConfigs, 
    showTime
  ]);

  // Render based on variant
  if (variant === 'badge') {
    const sizeConfig = sizeConfigs[size];
    const colors = getDateColors();
    
    return (
      <div className={className}>
        <Badge 
          variant="outline" 
          className={cn(
            sizeConfig.padding,
            colors.badge,
            "cursor-pointer"
          )}
          onClick={handleDateClick}
        >
          {showIcon && (
            <CalendarIcon className={cn(sizeConfig.icon, "mr-1")} />
          )}
          {format === 'relative' ? getRelativeTime(reviewDate) : formatDate(reviewDate)}
        </Badge>
        {renderDetailsDialog()}
      </div>
    );
  }

  if (variant === 'tooltip') {
    return (
      <div className={className}>
        <Tooltip
          content={
            <div className="space-y-2">
              <div className="font-medium">
                {formatDate(reviewDate, true)}
              </div>
              <div className="text-sm">
                {getRelativeTime(reviewDate)}
              </div>
              {updatedDate && (
                <div className="text-xs text-gray-500 border-t pt-2">
                  Updated: {getRelativeTime(updatedDate)}
                </div>
              )}
            </div>
          }
        >
          {renderDateContent()}
        </Tooltip>
        {renderDetailsDialog()}
      </div>
    );
  }

  if (variant === 'compact') {
    const sizeConfig = sizeConfigs[size];
    const colors = getDateColors();
    
    return (
      <div className={className}>
        <span 
          className={cn(
            sizeConfig.text,
            colors.text,
            colors.hover,
            "cursor-pointer transition-colors duration-200"
          )}
          onClick={handleDateClick}
        >
          {showRelative ? getRelativeTime(reviewDate) : formatDate(reviewDate)}
        </span>
        {showTooltip && (
          <Tooltip content={formatDate(reviewDate, true)}>
            <span />
          </Tooltip>
        )}
        {renderDetailsDialog()}
      </div>
    );
  }

  return (
    <div className={className}>
      {variant !== 'inline' && showTooltip ? (
        <Tooltip
          content={
            <div className="space-y-2">
              <div>Full date: {formatDate(reviewDate, true)}</div>
              <div>Relative: {getRelativeTime(reviewDate)}</div>
              {updatedDate && (
                <div className="border-t pt-2 text-xs">
                  Last updated: {formatDate(updatedDate, true)}
                </div>
              )}
            </div>
          }
        >
          {renderDateContent()}
        </Tooltip>
      ) : (
        renderDateContent()
      )}
      {renderDetailsDialog()}
    </div>
  );
};

export default DateComponent;
