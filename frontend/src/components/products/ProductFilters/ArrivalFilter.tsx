'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ArrivalPeriod {
  label: string;
  value: 'today' | 'week' | 'month' | 'quarter' | 'all';
  days: number;
}

export interface ArrivalFilterProps {
  selectedPeriod: ArrivalPeriod['value'] | 'all';
  onPeriodChange: (period: ArrivalPeriod['value']) => void;
  counts?: Record<ArrivalPeriod['value'], number>;
  className?: string;
  disabled?: boolean;
  showDateRange?: boolean;
}

const arrivalPeriods: ArrivalPeriod[] = [
  { label: 'All Products', value: 'all', days: 0 },
  { label: 'New Today', value: 'today', days: 1 },
  { label: 'Last 7 Days', value: 'week', days: 7 },
  { label: 'Last 30 Days', value: 'month', days: 30 },
  { label: 'Last 90 Days', value: 'quarter', days: 90 },
];

const ArrivalFilter: React.FC<ArrivalFilterProps> = ({
  selectedPeriod,
  onPeriodChange,
  counts,
  className,
  disabled = false,
  showDateRange = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handlePeriodChange = (period: ArrivalPeriod['value']) => {
    if (disabled) return;
    onPeriodChange(period);
  };

  const handleReset = () => {
    if (disabled) return;
    onPeriodChange('all');
  };

  const getDateRange = (days: number) => {
    if (days === 0) return 'All time';

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const isFiltered = selectedPeriod !== 'all';

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-yellow-500" />
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">New Arrivals</h3>
        </div>
        <div className="flex items-center gap-2">
          {isFiltered && (
            <button
              onClick={handleReset}
              disabled={disabled}
              className="text-xs text-primary-600 hover:text-primary-700 disabled:opacity-50"
            >
              Reset
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={disabled}
            className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
            aria-label={isExpanded ? 'Collapse arrival filter' : 'Expand arrival filter'}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2 overflow-hidden"
          >
            {arrivalPeriods.map((period, index) => {
              const isSelected = selectedPeriod === period.value;
              const count = counts?.[period.value];

              return (
                <motion.button
                  key={period.value}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handlePeriodChange(period.value)}
                  disabled={disabled || (count !== undefined && count === 0)}
                  className={cn(
                    'w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all text-left',
                    isSelected
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white',
                    disabled && 'opacity-50 cursor-not-allowed',
                    count === 0 && 'opacity-40'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                        isSelected
                          ? 'border-primary-600 bg-primary-600'
                          : 'border-gray-300'
                      )}
                    >
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </motion.div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'font-medium',
                            isSelected ? 'text-gray-900' : 'text-gray-700'
                          )}
                        >
                          {period.label}
                        </span>
                        {period.value === 'today' && (
                          <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                            Hot
                          </span>
                        )}
                      </div>
                      {showDateRange && period.days > 0 && (
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {getDateRange(period.days)}
                        </p>
                      )}
                    </div>
                  </div>

                  {count !== undefined && (
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isSelected ? 'text-primary-700' : 'text-gray-500'
                      )}
                    >
                      {count.toLocaleString()}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {isFiltered && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
        >
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-yellow-900">
                Showing products from:{' '}
                {arrivalPeriods.find((p) => p.value === selectedPeriod)?.label}
              </p>
              {showDateRange && (selectedPeriod as string) !== 'all' && (
                <p className="text-xs text-yellow-700 mt-1">
                  {getDateRange(
                    arrivalPeriods.find((p) => p.value === selectedPeriod)?.days || 0
                  )}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <p className="font-medium text-gray-700 mb-1">About New Arrivals:</p>
        <p>
          Discover our latest additions! Products are marked as new based on their addition
          date to our catalog.
        </p>
      </div>
    </div>
  );
};

export default ArrivalFilter;
