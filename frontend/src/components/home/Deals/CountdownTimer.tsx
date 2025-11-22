/**
 * CountdownTimer Component
 * 
 * Reusable countdown timer with multiple display variants.
 * 
 * Features:
 * - Real-time countdown to specified date
 * - Multiple display variants (default, compact, large, minimal)
 * - Days, hours, minutes, seconds display
 * - Auto-update every second
 * - Expiration callback
 * - Custom styling support
 * - Responsive design
 * - Zero-padded numbers
 * 
 * @component
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ClockIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export interface CountdownTimerProps {
  /** End date for countdown */
  endDate: Date | string;
  /** Display variant */
  variant?: 'default' | 'compact' | 'large' | 'minimal';
  /** Show labels (Days, Hours, etc.) */
  showLabels?: boolean;
  /** Show icon */
  showIcon?: boolean;
  /** Callback when countdown expires */
  onExpire?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const calculateTimeLeft = (endDate: Date | string): TimeLeft => {
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const now = new Date();
  const total = end.getTime() - now.getTime();

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds, total };
};

const padZero = (num: number): string => {
  return num.toString().padStart(2, '0');
};

// ============================================================================
// COMPONENT
// ============================================================================

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  endDate,
  variant = 'default',
  showLabels = true,
  showIcon = true,
  onExpire,
  className,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(endDate));
  const [hasExpired, setHasExpired] = useState(false);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleExpire = useCallback(() => {
    if (!hasExpired && onExpire) {
      setHasExpired(true);
      onExpire();
      console.log('Countdown expired for:', endDate);
    }
  }, [hasExpired, onExpire, endDate]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(endDate);
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.total <= 0) {
        clearInterval(timer);
        handleExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, handleExpire]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderDefaultVariant = useMemo(
    () => (
      <div className={cn('flex items-center gap-4', className)}>
        {showIcon && (
          <div className="flex-shrink-0">
            <ClockIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        )}
        <div className="flex items-center gap-2">
          {/* Days */}
          <div className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-lg p-3 shadow-md min-w-[70px]">
            <motion.span
              key={timeLeft.days}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring' as const, stiffness: 300 }}
              className="text-3xl font-bold text-gray-900 dark:text-white"
            >
              {padZero(timeLeft.days)}
            </motion.span>
            {showLabels && (
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">Days</span>
            )}
          </div>

          <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">:</span>

          {/* Hours */}
          <div className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-lg p-3 shadow-md min-w-[70px]">
            <motion.span
              key={timeLeft.hours}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring' as const, stiffness: 300 }}
              className="text-3xl font-bold text-gray-900 dark:text-white"
            >
              {padZero(timeLeft.hours)}
            </motion.span>
            {showLabels && (
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">Hours</span>
            )}
          </div>

          <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">:</span>

          {/* Minutes */}
          <div className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-lg p-3 shadow-md min-w-[70px]">
            <motion.span
              key={timeLeft.minutes}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring' as const, stiffness: 300 }}
              className="text-3xl font-bold text-gray-900 dark:text-white"
            >
              {padZero(timeLeft.minutes)}
            </motion.span>
            {showLabels && (
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">Minutes</span>
            )}
          </div>

          <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">:</span>

          {/* Seconds */}
          <div className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-lg p-3 shadow-md min-w-[70px]">
            <motion.span
              key={timeLeft.seconds}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring' as const, stiffness: 300 }}
              className="text-3xl font-bold text-gray-900 dark:text-white"
            >
              {padZero(timeLeft.seconds)}
            </motion.span>
            {showLabels && (
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">Seconds</span>
            )}
          </div>
        </div>
      </div>
    ),
    [timeLeft, showLabels, showIcon, className]
  );

  const renderCompactVariant = useMemo(
    () => (
      <div className={cn('inline-flex items-center gap-2 text-sm', className)}>
        {showIcon && <ClockIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
        <span className="font-mono font-semibold text-gray-900 dark:text-white">
          {padZero(timeLeft.days)}d {padZero(timeLeft.hours)}h {padZero(timeLeft.minutes)}m{' '}
          {padZero(timeLeft.seconds)}s
        </span>
      </div>
    ),
    [timeLeft, showIcon, className]
  );

  const renderLargeVariant = useMemo(
    () => (
      <div className={cn('flex flex-col items-center gap-4', className)}>
        {showIcon && (
          <ClockIcon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
        )}
        <div className="flex items-center gap-3">
          {/* Days */}
          <div className="flex flex-col items-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl min-w-[100px]">
            <motion.span
              key={timeLeft.days}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring' as const, stiffness: 300 }}
              className="text-5xl font-bold text-white"
            >
              {padZero(timeLeft.days)}
            </motion.span>
            {showLabels && (
              <span className="text-sm text-blue-100 mt-2 uppercase tracking-wide">Days</span>
            )}
          </div>

          <span className="text-4xl font-bold text-gray-400">:</span>

          {/* Hours */}
          <div className="flex flex-col items-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl min-w-[100px]">
            <motion.span
              key={timeLeft.hours}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring' as const, stiffness: 300 }}
              className="text-5xl font-bold text-white"
            >
              {padZero(timeLeft.hours)}
            </motion.span>
            {showLabels && (
              <span className="text-sm text-blue-100 mt-2 uppercase tracking-wide">Hours</span>
            )}
          </div>

          <span className="text-4xl font-bold text-gray-400">:</span>

          {/* Minutes */}
          <div className="flex flex-col items-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl min-w-[100px]">
            <motion.span
              key={timeLeft.minutes}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring' as const, stiffness: 300 }}
              className="text-5xl font-bold text-white"
            >
              {padZero(timeLeft.minutes)}
            </motion.span>
            {showLabels && (
              <span className="text-sm text-blue-100 mt-2 uppercase tracking-wide">Minutes</span>
            )}
          </div>

          <span className="text-4xl font-bold text-gray-400">:</span>

          {/* Seconds */}
          <div className="flex flex-col items-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl min-w-[100px]">
            <motion.span
              key={timeLeft.seconds}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring' as const, stiffness: 300 }}
              className="text-5xl font-bold text-white"
            >
              {padZero(timeLeft.seconds)}
            </motion.span>
            {showLabels && (
              <span className="text-sm text-blue-100 mt-2 uppercase tracking-wide">Seconds</span>
            )}
          </div>
        </div>
      </div>
    ),
    [timeLeft, showLabels, showIcon, className]
  );

  const renderMinimalVariant = useMemo(
    () => (
      <div className={cn('flex items-center gap-1 text-base font-semibold', className)}>
        {showIcon && <ClockIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
        <span className="text-gray-900 dark:text-white">
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {padZero(timeLeft.hours)}:{padZero(timeLeft.minutes)}:{padZero(timeLeft.seconds)}
        </span>
      </div>
    ),
    [timeLeft, showIcon, className]
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (timeLeft.total <= 0) {
    return (
      <div className={cn('text-center', className)}>
        <span className="text-red-600 dark:text-red-400 font-semibold">Expired</span>
      </div>
    );
  }

  return (
    <>
      {variant === 'default' && renderDefaultVariant}
      {variant === 'compact' && renderCompactVariant}
      {variant === 'large' && renderLargeVariant}
      {variant === 'minimal' && renderMinimalVariant}
    </>
  );
};

export default CountdownTimer;
