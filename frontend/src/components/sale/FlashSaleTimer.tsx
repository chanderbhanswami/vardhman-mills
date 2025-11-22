'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FireIcon,
  ClockIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface FlashSaleTimerProps {
  /**
   * Sale end date/time
   */
  endDate: Date | string;

  /**
   * Sale start date/time (optional, for countdown before start)
   */
  startDate?: Date | string;

  /**
   * Display variant
   * - default: Full timer with labels
   * - compact: Minimal timer
   * - inline: Single line timer
   * - large: Large hero timer
   */
  variant?: 'default' | 'compact' | 'inline' | 'large';

  /**
   * Show progress bar
   */
  showProgress?: boolean;

  /**
   * Show milliseconds
   */
  showMilliseconds?: boolean;

  /**
   * Callback when timer expires
   */
  onExpire?: () => void;

  /**
   * Callback when timer starts (if startDate provided)
   */
  onStart?: () => void;

  /**
   * Update interval in milliseconds
   */
  updateInterval?: number;

  /**
   * Show urgent state when time is low
   */
  showUrgent?: boolean;

  /**
   * Urgent threshold in minutes
   */
  urgentThreshold?: number;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Time remaining breakdown
 */
interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  total: number;
  expired: boolean;
  notStarted: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate time remaining
 */
const calculateTimeRemaining = (
  endDate: Date | string,
  startDate?: Date | string
): TimeRemaining => {
  const now = new Date().getTime();
  const end = typeof endDate === 'string' ? new Date(endDate).getTime() : endDate.getTime();
  const start = startDate
    ? typeof startDate === 'string'
      ? new Date(startDate).getTime()
      : startDate.getTime()
    : now;

  // Check if not started yet
  if (now < start) {
    const diff = start - now;
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      milliseconds: diff % 1000,
      total: diff,
      expired: false,
      notStarted: true,
    };
  }

  const diff = end - now;

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
      total: 0,
      expired: true,
      notStarted: false,
    };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    milliseconds: diff % 1000,
    total: diff,
    expired: false,
    notStarted: false,
  };
};

/**
 * Format number with leading zero
 */
const padNumber = (num: number, size: number = 2): string => {
  return String(num).padStart(size, '0');
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Timer Unit Component
 */
interface TimerUnitProps {
  value: number;
  label: string;
  size?: 'small' | 'medium' | 'large';
  urgent?: boolean;
}

const TimerUnit: React.FC<TimerUnitProps> = ({ value, label, size = 'medium', urgent = false }) => {
  const sizeClasses = {
    small: 'text-lg',
    medium: 'text-3xl',
    large: 'text-5xl',
  };

  return (
    <div className="flex flex-col items-center">
      <motion.div
        key={value}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'font-bold tabular-nums',
          sizeClasses[size],
          urgent ? 'text-red-600' : 'text-gray-900'
        )}
      >
        {padNumber(value)}
      </motion.div>
      <div className={cn('text-xs font-medium mt-1', urgent ? 'text-red-600' : 'text-gray-500')}>
        {label}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * FlashSaleTimer Component
 * 
 * Precise countdown timer for flash sales with millisecond accuracy.
 * Features:
 * - Millisecond precision
 * - Multiple display variants
 * - Progress bar visualization
 * - Urgent state styling
 * - Not-started countdown
 * - Auto state transitions
 * - Animated updates
 * - Customizable intervals
 * 
 * @example
 * ```tsx
 * <FlashSaleTimer
 *   endDate={saleEndDate}
 *   variant="large"
 *   showProgress={true}
 *   showMilliseconds={true}
 *   onExpire={() => handleSaleEnd()}
 * />
 * ```
 */
export const FlashSaleTimer: React.FC<FlashSaleTimerProps> = ({
  endDate,
  startDate,
  variant = 'default',
  showProgress = false,
  showMilliseconds = false,
  onExpire,
  onStart,
  updateInterval = 100,
  showUrgent = true,
  urgentThreshold = 60,
  className,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(endDate, startDate)
  );
  const [hasStarted, setHasStarted] = useState(false);
  const [hasExpired, setHasExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining(endDate, startDate);
      setTimeRemaining(remaining);

      // Handle start event
      if (remaining.notStarted === false && !hasStarted && onStart) {
        setHasStarted(true);
        onStart();
      }

      // Handle expiry
      if (remaining.expired && !hasExpired) {
        setHasExpired(true);
        if (onExpire) {
          onExpire();
        }
        clearInterval(timer);
      }
    }, updateInterval);

    return () => clearInterval(timer);
  }, [endDate, startDate, updateInterval, onExpire, onStart, hasStarted, hasExpired]);

  // Calculate if urgent
  const totalMinutes = Math.floor(timeRemaining.total / (1000 * 60));
  const isUrgent = showUrgent && !timeRemaining.notStarted && totalMinutes <= urgentThreshold && totalMinutes > 0;

  // Calculate progress percentage
  const progressPercentage = (() => {
    if (!showProgress || !startDate) return 0;
    
    const start = typeof startDate === 'string' ? new Date(startDate).getTime() : startDate.getTime();
    const end = typeof endDate === 'string' ? new Date(endDate).getTime() : endDate.getTime();
    const now = new Date().getTime();
    
    const total = end - start;
    const elapsed = now - start;
    
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  })();

  // Expired state
  if (timeRemaining.expired) {
    return (
      <div
        className={cn(
          'flex items-center justify-center gap-2 p-4 bg-gray-100 rounded-lg',
          className
        )}
      >
        <ClockIcon className="h-5 w-5 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Sale Ended</span>
      </div>
    );
  }

  // Not started state
  if (timeRemaining.notStarted) {
    return (
      <div
        className={cn(
          'flex items-center justify-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg',
          className
        )}
      >
        <ClockIcon className="h-5 w-5 text-blue-600 animate-pulse" />
        <span className="text-sm font-medium text-blue-700">
          Starts in {timeRemaining.days > 0 && `${timeRemaining.days}d `}
          {timeRemaining.hours}h {padNumber(timeRemaining.minutes)}m
        </span>
      </div>
    );
  }

  // Inline variant
  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <FireIcon className={cn('h-4 w-4', isUrgent ? 'text-red-600 animate-pulse' : 'text-orange-600')} />
        <span className={cn('text-sm font-semibold tabular-nums', isUrgent ? 'text-red-600' : 'text-gray-900')}>
          {timeRemaining.days > 0 && `${timeRemaining.days}d `}
          {padNumber(timeRemaining.hours)}:{padNumber(timeRemaining.minutes)}:{padNumber(timeRemaining.seconds)}
          {showMilliseconds && `.${padNumber(Math.floor(timeRemaining.milliseconds / 10))}`}
        </span>
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <div className={cn('p-4', isUrgent && 'bg-red-50 animate-pulse')}>
          <div className="flex items-center justify-center gap-4">
            <BoltIcon className={cn('h-6 w-6', isUrgent ? 'text-red-600' : 'text-orange-600')} />
            <div className="flex items-center gap-2">
              {timeRemaining.days > 0 && (
                <>
                  <TimerUnit value={timeRemaining.days} label="D" size="small" urgent={isUrgent} />
                  <span className="text-xl font-bold text-gray-400">:</span>
                </>
              )}
              <TimerUnit value={timeRemaining.hours} label="H" size="small" urgent={isUrgent} />
              <span className="text-xl font-bold text-gray-400">:</span>
              <TimerUnit value={timeRemaining.minutes} label="M" size="small" urgent={isUrgent} />
              <span className="text-xl font-bold text-gray-400">:</span>
              <TimerUnit value={timeRemaining.seconds} label="S" size="small" urgent={isUrgent} />
            </div>
          </div>
        </div>
        {showProgress && (
          <div className="h-2 bg-gray-200">
            <motion.div
              className={cn('h-full', isUrgent ? 'bg-red-500' : 'bg-primary-500')}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
      </Card>
    );
  }

  // Large variant
  if (variant === 'large') {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <div className={cn('p-8 text-center', isUrgent && 'bg-red-50')}>
          <div className="flex items-center justify-center gap-3 mb-6">
            <FireIcon
              className={cn(
                'h-8 w-8',
                isUrgent ? 'text-red-600 animate-bounce' : 'text-orange-600'
              )}
            />
            <h3 className={cn('text-2xl font-bold', isUrgent ? 'text-red-600' : 'text-gray-900')}>
              {isUrgent ? 'Ending Soon!' : 'Flash Sale Ends In'}
            </h3>
          </div>

          <div className="flex items-center justify-center gap-4">
            {timeRemaining.days > 0 && (
              <>
                <TimerUnit value={timeRemaining.days} label="DAYS" size="large" urgent={isUrgent} />
                <span className="text-5xl font-bold text-gray-400">:</span>
              </>
            )}
            <TimerUnit value={timeRemaining.hours} label="HOURS" size="large" urgent={isUrgent} />
            <span className="text-5xl font-bold text-gray-400">:</span>
            <TimerUnit value={timeRemaining.minutes} label="MINS" size="large" urgent={isUrgent} />
            <span className="text-5xl font-bold text-gray-400">:</span>
            <TimerUnit value={timeRemaining.seconds} label="SECS" size="large" urgent={isUrgent} />
            {showMilliseconds && (
              <>
                <span className="text-5xl font-bold text-gray-400">.</span>
                <TimerUnit
                  value={Math.floor(timeRemaining.milliseconds / 10)}
                  label="MS"
                  size="large"
                  urgent={isUrgent}
                />
              </>
            )}
          </div>

          {isUrgent && (
            <div className="mt-6">
              <Badge variant="destructive" className="text-base px-4 py-2 animate-pulse">
                ⚡ Last Chance - Hurry Up!
              </Badge>
            </div>
          )}
        </div>

        {showProgress && (
          <div className="h-3 bg-gray-200">
            <motion.div
              className={cn(
                'h-full transition-colors',
                isUrgent ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-primary-500 to-primary-600'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className={cn('p-6', isUrgent && 'bg-red-50')}>
        <div className="flex items-center justify-center gap-2 mb-4">
          <FireIcon
            className={cn('h-6 w-6', isUrgent ? 'text-red-600 animate-pulse' : 'text-orange-600')}
          />
          <h4 className={cn('text-lg font-bold', isUrgent ? 'text-red-600' : 'text-gray-900')}>
            {isUrgent ? 'Hurry! Ending Soon' : 'Sale Ends In'}
          </h4>
        </div>

        <div className="flex items-center justify-center gap-3">
          {timeRemaining.days > 0 && (
            <>
              <TimerUnit value={timeRemaining.days} label="Days" size="medium" urgent={isUrgent} />
              <span className="text-3xl font-bold text-gray-400">:</span>
            </>
          )}
          <TimerUnit value={timeRemaining.hours} label="Hours" size="medium" urgent={isUrgent} />
          <span className="text-3xl font-bold text-gray-400">:</span>
          <TimerUnit value={timeRemaining.minutes} label="Minutes" size="medium" urgent={isUrgent} />
          <span className="text-3xl font-bold text-gray-400">:</span>
          <TimerUnit value={timeRemaining.seconds} label="Seconds" size="medium" urgent={isUrgent} />
          {showMilliseconds && (
            <>
              <span className="text-3xl font-bold text-gray-400">.</span>
              <TimerUnit
                value={Math.floor(timeRemaining.milliseconds / 10)}
                label="MS"
                size="medium"
                urgent={isUrgent}
              />
            </>
          )}
        </div>
      </div>

      {showProgress && (
        <div className="h-2 bg-gray-200">
          <motion.div
            className={cn('h-full', isUrgent ? 'bg-red-500' : 'bg-primary-500')}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}
    </Card>
  );
};

export default FlashSaleTimer;
