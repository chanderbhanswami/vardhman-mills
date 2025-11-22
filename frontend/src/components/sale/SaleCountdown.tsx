'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClockIcon,
  FireIcon,
  BellAlertIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { Sale } from '@/types/sale.types';

/**
 * Time Remaining Interface
 * Represents the calculated time remaining until sale end
 */
interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  expired: boolean;
  urgent: boolean; // Less than 1 hour remaining
  critical: boolean; // Less than 10 minutes remaining
}

/**
 * SaleCountdown Component Props
 */
interface SaleCountdownProps {
  /**
   * Sale object with schedule information
   */
  sale: Sale;

  /**
   * Display variant
   * - default: Full card with all time units
   * - compact: Inline single-line countdown
   * - minimal: Just numbers, no labels
   * - badge: Badge-style countdown
   * - inline: Inline text format
   * - grid: Grid layout with large numbers
   * - circle: Circular progress indicators
   */
  variant?: 'default' | 'compact' | 'minimal' | 'badge' | 'inline' | 'grid' | 'circle';

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Show/hide specific time units
   */
  showDays?: boolean;
  showHours?: boolean;
  showMinutes?: boolean;
  showSeconds?: boolean;

  /**
   * Show icons and decorations
   */
  showIcon?: boolean;
  showLabels?: boolean;
  showProgress?: boolean;

  /**
   * Enable animations
   */
  animated?: boolean;

  /**
   * Custom labels for time units
   */
  labels?: {
    days?: string;
    hours?: string;
    minutes?: string;
    seconds?: string;
  };

  /**
   * Callback when countdown expires
   */
  onExpire?: () => void;

  /**
   * Callback when countdown reaches urgent state (< 1 hour)
   */
  onUrgent?: () => void;

  /**
   * Callback when countdown reaches critical state (< 10 minutes)
   */
  onCritical?: () => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Time Unit Display Component
 * Renders individual time unit (days, hours, minutes, seconds)
 */
interface TimeUnitProps {
  value: number;
  label: string;
  size: 'sm' | 'md' | 'lg';
  animated: boolean;
  urgent: boolean;
  critical: boolean;
  showLabel: boolean;
}

const TimeUnit: React.FC<TimeUnitProps> = ({
  value,
  label,
  size,
  animated,
  urgent,
  critical,
  showLabel,
}) => {
  const [prevValue, setPrevValue] = useState(value);

  useEffect(() => {
    if (value !== prevValue) {
      setPrevValue(value);
    }
  }, [value, prevValue]);

  const sizeClasses = {
    sm: 'text-lg md:text-xl',
    md: 'text-2xl md:text-3xl',
    lg: 'text-3xl md:text-5xl',
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const paddingClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
  };

  const getBgColor = () => {
    if (critical) return 'bg-red-100 border-red-300';
    if (urgent) return 'bg-orange-100 border-orange-300';
    return 'bg-gray-100 border-gray-300';
  };

  const getTextColor = () => {
    if (critical) return 'text-red-600';
    if (urgent) return 'text-orange-600';
    return 'text-gray-900';
  };

  const digitVariants = {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          'relative rounded-lg border-2 overflow-hidden',
          paddingClasses[size],
          getBgColor(),
          animated && 'transition-all duration-300'
        )}
      >
        <AnimatePresence mode="wait">
          {animated ? (
            <motion.div
              key={value}
              variants={digitVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' as const }}
              className={cn(
                'font-bold tabular-nums',
                sizeClasses[size],
                getTextColor()
              )}
            >
              {String(value).padStart(2, '0')}
            </motion.div>
          ) : (
            <div
              className={cn(
                'font-bold tabular-nums',
                sizeClasses[size],
                getTextColor()
              )}
            >
              {String(value).padStart(2, '0')}
            </div>
          )}
        </AnimatePresence>

        {/* Pulse effect for urgent/critical states */}
        {animated && (urgent || critical) && (
          <motion.div
            className={cn(
              'absolute inset-0 rounded-lg',
              critical ? 'bg-red-400' : 'bg-orange-400'
            )}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0, 0.5] }}
            transition={{
              duration: 1.5,
              repeat: Infinity as number,
              ease: 'easeInOut' as const,
            }}
          />
        )}
      </div>

      {showLabel && (
        <span
          className={cn(
            'font-medium text-gray-600',
            labelSizeClasses[size],
            critical && 'text-red-600',
            urgent && 'text-orange-600'
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
};

/**
 * SaleCountdown Component
 * 
 * Comprehensive countdown timer for sales with multiple variants and states.
 * Features:
 * - 7 display variants (default, compact, minimal, badge, inline, grid, circle)
 * - Urgent/critical state indicators
 * - Animated digit transitions
 * - Progress bars
 * - Customizable time units
 * - Auto-updates every second
 * - Event callbacks for state changes
 * 
 * @example
 * ```tsx
 * <SaleCountdown
 *   sale={sale}
 *   variant="grid"
 *   size="lg"
 *   animated
 *   onExpire={() => console.log('Sale ended!')}
 * />
 * ```
 */
const SaleCountdown: React.FC<SaleCountdownProps> = ({
  sale,
  variant = 'default',
  size = 'md',
  showDays = true,
  showHours = true,
  showMinutes = true,
  showSeconds = true,
  showIcon = true,
  showLabels = true,
  showProgress = false,
  animated = true,
  labels = {
    days: 'Days',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds',
  },
  onExpire,
  onUrgent,
  onCritical,
  className,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(sale.schedule.endDate)
  );
  const [hasTriggeredUrgent, setHasTriggeredUrgent] = useState(false);
  const [hasTriggeredCritical, setHasTriggeredCritical] = useState(false);

  /**
   * Calculate time remaining from current time to end date
   */
  function calculateTimeRemaining(endDate: Date | string): TimeRemaining {
    const end = new Date(endDate);
    const now = new Date();
    const totalSeconds = Math.floor((end.getTime() - now.getTime()) / 1000);

    if (totalSeconds <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
        expired: true,
        urgent: false,
        critical: false,
      };
    }

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      days,
      hours,
      minutes,
      seconds,
      totalSeconds,
      expired: false,
      urgent: totalSeconds < 3600, // Less than 1 hour
      critical: totalSeconds < 600, // Less than 10 minutes
    };
  }

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeRemaining = calculateTimeRemaining(sale.schedule.endDate);
      setTimeRemaining(newTimeRemaining);

      // Trigger callbacks
      if (newTimeRemaining.expired && onExpire) {
        onExpire();
        clearInterval(interval);
      } else if (newTimeRemaining.critical && !hasTriggeredCritical && onCritical) {
        onCritical();
        setHasTriggeredCritical(true);
      } else if (newTimeRemaining.urgent && !hasTriggeredUrgent && onUrgent) {
        onUrgent();
        setHasTriggeredUrgent(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    sale.schedule.endDate,
    onExpire,
    onUrgent,
    onCritical,
    hasTriggeredUrgent,
    hasTriggeredCritical,
  ]);

  // Calculate progress percentage for progress bar
  const progressPercentage = useMemo(() => {
    if (!showProgress) return 0;

    const start = new Date(sale.schedule.startDate);
    const end = new Date(sale.schedule.endDate);
    const now = new Date();

    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();

    return Math.max(0, Math.min(100, (elapsed / total) * 100));
  }, [sale.schedule.startDate, sale.schedule.endDate, showProgress]);

  // Get status icon
  const getStatusIcon = () => {
    if (timeRemaining.expired) {
      return <XCircleIcon className="h-5 w-5 text-red-500" />;
    }
    if (timeRemaining.critical) {
      return <FireIcon className="h-5 w-5 text-red-500 animate-pulse" />;
    }
    if (timeRemaining.urgent) {
      return <BellAlertIcon className="h-5 w-5 text-orange-500 animate-pulse" />;
    }
    return <ClockIcon className="h-5 w-5 text-gray-600" />;
  };

  // Get status badge
  const getStatusBadge = () => {
    if (timeRemaining.expired) {
      return (
        <Badge variant="destructive" className="gap-1.5">
          <CheckCircleIcon className="h-4 w-4" />
          Sale Ended
        </Badge>
      );
    }
    if (timeRemaining.critical) {
      return (
        <Badge variant="destructive" className="gap-1.5 animate-pulse">
          <FireIcon className="h-4 w-4" />
          Ending Soon!
        </Badge>
      );
    }
    if (timeRemaining.urgent) {
      return (
        <Badge variant="warning" className="gap-1.5 animate-pulse">
          <BellAlertIcon className="h-4 w-4" />
          Hurry Up!
        </Badge>
      );
    }
    return null;
  };

  // Render expired state
  if (timeRemaining.expired) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <XCircleIcon className="h-5 w-5 text-red-500" />
        <span className="text-sm font-medium text-red-600">Sale Ended</span>
      </div>
    );
  }

  // Render badge variant
  if (variant === 'badge') {
    const badgeVariant = timeRemaining.critical
      ? 'destructive'
      : timeRemaining.urgent
      ? 'warning'
      : 'secondary';

    return (
      <Badge variant={badgeVariant} className={cn('gap-2', className)}>
        {showIcon && getStatusIcon()}
        <span className="font-mono">
          {showDays && timeRemaining.days > 0 && `${timeRemaining.days}d `}
          {showHours && `${String(timeRemaining.hours).padStart(2, '0')}:`}
          {showMinutes && `${String(timeRemaining.minutes).padStart(2, '0')}:`}
          {showSeconds && String(timeRemaining.seconds).padStart(2, '0')}
        </span>
      </Badge>
    );
  }

  // Render inline variant
  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-2 text-sm', className)}>
        {showIcon && getStatusIcon()}
        <span
          className={cn(
            'font-medium font-mono',
            timeRemaining.critical && 'text-red-600',
            timeRemaining.urgent && 'text-orange-600',
            !timeRemaining.urgent && !timeRemaining.critical && 'text-gray-700'
          )}
        >
          {showDays && timeRemaining.days > 0 && `${timeRemaining.days}d `}
          {showHours && `${String(timeRemaining.hours).padStart(2, '0')}:`}
          {showMinutes && `${String(timeRemaining.minutes).padStart(2, '0')}:`}
          {showSeconds && String(timeRemaining.seconds).padStart(2, '0')}
        </span>
      </div>
    );
  }

  // Render compact variant
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        {showIcon && getStatusIcon()}
        <div className="flex items-center gap-1.5 font-mono text-sm font-medium">
          {showDays && timeRemaining.days > 0 && (
            <span
              className={cn(
                timeRemaining.critical && 'text-red-600',
                timeRemaining.urgent && 'text-orange-600',
                !timeRemaining.urgent && !timeRemaining.critical && 'text-gray-700'
              )}
            >
              {timeRemaining.days}d
            </span>
          )}
          {showHours && (
            <span
              className={cn(
                timeRemaining.critical && 'text-red-600',
                timeRemaining.urgent && 'text-orange-600',
                !timeRemaining.urgent && !timeRemaining.critical && 'text-gray-700'
              )}
            >
              {String(timeRemaining.hours).padStart(2, '0')}h
            </span>
          )}
          {showMinutes && (
            <span
              className={cn(
                timeRemaining.critical && 'text-red-600',
                timeRemaining.urgent && 'text-orange-600',
                !timeRemaining.urgent && !timeRemaining.critical && 'text-gray-700'
              )}
            >
              {String(timeRemaining.minutes).padStart(2, '0')}m
            </span>
          )}
          {showSeconds && (
            <span
              className={cn(
                timeRemaining.critical && 'text-red-600',
                timeRemaining.urgent && 'text-orange-600',
                !timeRemaining.urgent && !timeRemaining.critical && 'text-gray-700'
              )}
            >
              {String(timeRemaining.seconds).padStart(2, '0')}s
            </span>
          )}
        </div>
      </div>
    );
  }

  // Render minimal variant
  if (variant === 'minimal') {
    return (
      <div className={cn('font-mono text-lg font-bold tabular-nums', className)}>
        {showDays && timeRemaining.days > 0 && `${timeRemaining.days}:`}
        {showHours && `${String(timeRemaining.hours).padStart(2, '0')}:`}
        {showMinutes && `${String(timeRemaining.minutes).padStart(2, '0')}:`}
        {showSeconds && String(timeRemaining.seconds).padStart(2, '0')}
      </div>
    );
  }

  // Render grid variant
  if (variant === 'grid') {
    const timeUnits = [];

    if (showDays && timeRemaining.days > 0) {
      timeUnits.push(
        <TimeUnit
          key="days"
          value={timeRemaining.days}
          label={labels.days || 'Days'}
          size={size}
          animated={animated}
          urgent={timeRemaining.urgent}
          critical={timeRemaining.critical}
          showLabel={showLabels}
        />
      );
    }

    if (showHours) {
      timeUnits.push(
        <TimeUnit
          key="hours"
          value={timeRemaining.hours}
          label={labels.hours || 'Hours'}
          size={size}
          animated={animated}
          urgent={timeRemaining.urgent}
          critical={timeRemaining.critical}
          showLabel={showLabels}
        />
      );
    }

    if (showMinutes) {
      timeUnits.push(
        <TimeUnit
          key="minutes"
          value={timeRemaining.minutes}
          label={labels.minutes || 'Minutes'}
          size={size}
          animated={animated}
          urgent={timeRemaining.urgent}
          critical={timeRemaining.critical}
          showLabel={showLabels}
        />
      );
    }

    if (showSeconds) {
      timeUnits.push(
        <TimeUnit
          key="seconds"
          value={timeRemaining.seconds}
          label={labels.seconds || 'Seconds'}
          size={size}
          animated={animated}
          urgent={timeRemaining.urgent}
          critical={timeRemaining.critical}
          showLabel={showLabels}
        />
      );
    }

    return (
      <div className={cn('space-y-3', className)}>
        {getStatusBadge() && (
          <div className="flex justify-center">{getStatusBadge()}</div>
        )}
        <div className="flex items-center justify-center gap-2 md:gap-4">
          {timeUnits.map((unit, index) => (
            <React.Fragment key={index}>
              {unit}
              {index < timeUnits.length - 1 && (
                <div
                  className={cn(
                    'text-2xl font-bold text-gray-400',
                    size === 'lg' && 'text-4xl',
                    size === 'sm' && 'text-xl'
                  )}
                >
                  :
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        {showProgress && (
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <motion.div
              className={cn(
                'absolute left-0 top-0 h-full',
                timeRemaining.critical && 'bg-red-500',
                timeRemaining.urgent && 'bg-orange-500',
                !timeRemaining.urgent && !timeRemaining.critical && 'bg-blue-500'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' as const }}
            />
          </div>
        )}
      </div>
    );
  }

  // Render circle variant
  if (variant === 'circle') {
    const radius = size === 'sm' ? 30 : size === 'lg' ? 50 : 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset =
      circumference - (progressPercentage / 100) * circumference;

    return (
      <div className={cn('flex flex-col items-center gap-4', className)}>
        {getStatusBadge() && getStatusBadge()}
        <div className="relative">
          <svg
            width={(radius + 10) * 2}
            height={(radius + 10) * 2}
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              cx={radius + 10}
              cy={radius + 10}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-gray-200"
            />
            {/* Progress circle */}
            <motion.circle
              cx={radius + 10}
              cy={radius + 10}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={cn(
                timeRemaining.critical && 'text-red-500',
                timeRemaining.urgent && 'text-orange-500',
                !timeRemaining.urgent && !timeRemaining.critical && 'text-blue-500'
              )}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: 'easeOut' as const }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className={cn(
                'font-mono font-bold tabular-nums',
                size === 'sm' && 'text-sm',
                size === 'md' && 'text-base',
                size === 'lg' && 'text-xl',
                timeRemaining.critical && 'text-red-600',
                timeRemaining.urgent && 'text-orange-600',
                !timeRemaining.urgent && !timeRemaining.critical && 'text-gray-900'
              )}
            >
              {showDays && timeRemaining.days > 0
                ? `${timeRemaining.days}d`
                : `${String(timeRemaining.hours).padStart(2, '0')}:${String(
                    timeRemaining.minutes
                  ).padStart(2, '0')}`}
            </div>
            {showLabels && (
              <div className="text-xs text-gray-500">
                {timeRemaining.days > 0 ? 'Days left' : 'Time left'}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render default variant (Card)
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-4 md:p-6">
        <div className="space-y-4">
          {/* Header with icon and status badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {showIcon && getStatusIcon()}
              <h3 className="text-sm font-medium text-gray-700">
                {timeRemaining.critical
                  ? 'Sale Ending Soon!'
                  : timeRemaining.urgent
                  ? 'Hurry Up!'
                  : 'Sale Ends In'}
              </h3>
            </div>
            {getStatusBadge()}
          </div>

          {/* Time units grid */}
          <div className="flex items-center justify-center gap-2 md:gap-4">
            {showDays && timeRemaining.days > 0 && (
              <>
                <TimeUnit
                  value={timeRemaining.days}
                  label={labels.days || 'Days'}
                  size={size}
                  animated={animated}
                  urgent={timeRemaining.urgent}
                  critical={timeRemaining.critical}
                  showLabel={showLabels}
                />
                <div
                  className={cn(
                    'text-2xl font-bold text-gray-400',
                    size === 'lg' && 'text-4xl',
                    size === 'sm' && 'text-xl'
                  )}
                >
                  :
                </div>
              </>
            )}

            {showHours && (
              <>
                <TimeUnit
                  value={timeRemaining.hours}
                  label={labels.hours || 'Hours'}
                  size={size}
                  animated={animated}
                  urgent={timeRemaining.urgent}
                  critical={timeRemaining.critical}
                  showLabel={showLabels}
                />
                <div
                  className={cn(
                    'text-2xl font-bold text-gray-400',
                    size === 'lg' && 'text-4xl',
                    size === 'sm' && 'text-xl'
                  )}
                >
                  :
                </div>
              </>
            )}

            {showMinutes && (
              <>
                <TimeUnit
                  value={timeRemaining.minutes}
                  label={labels.minutes || 'Minutes'}
                  size={size}
                  animated={animated}
                  urgent={timeRemaining.urgent}
                  critical={timeRemaining.critical}
                  showLabel={showLabels}
                />
                <div
                  className={cn(
                    'text-2xl font-bold text-gray-400',
                    size === 'lg' && 'text-4xl',
                    size === 'sm' && 'text-xl'
                  )}
                >
                  :
                </div>
              </>
            )}

            {showSeconds && (
              <TimeUnit
                value={timeRemaining.seconds}
                label={labels.seconds || 'Seconds'}
                size={size}
                animated={animated}
                urgent={timeRemaining.urgent}
                critical={timeRemaining.critical}
                showLabel={showLabels}
              />
            )}
          </div>

          {/* Progress bar */}
          {showProgress && (
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <motion.div
                className={cn(
                  'absolute left-0 top-0 h-full',
                  timeRemaining.critical && 'bg-red-500',
                  timeRemaining.urgent && 'bg-orange-500',
                  !timeRemaining.urgent && !timeRemaining.critical && 'bg-blue-500'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' as const }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SaleCountdown;
