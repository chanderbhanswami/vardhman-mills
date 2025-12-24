'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AvailabilityFilterProps {
  selectedAvailability: 'in_stock' | 'out_of_stock' | 'all';
  onAvailabilityChange: (availability: 'in_stock' | 'out_of_stock' | 'all') => void;
  counts?: {
    in_stock: number;
    out_of_stock: number;
    all: number;
  };
  className?: string;
  disabled?: boolean;
}

const availabilityOptions = [
  { value: 'all' as const, label: 'All Products', color: 'text-gray-600' },
  { value: 'in_stock' as const, label: 'In Stock', color: 'text-green-600' },
  { value: 'out_of_stock' as const, label: 'Out of Stock', color: 'text-red-600' },
];

const AvailabilityFilter: React.FC<AvailabilityFilterProps> = ({
  selectedAvailability,
  onAvailabilityChange,
  counts,
  className,
  disabled = false,
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Availability</h3>

      <div className="space-y-2">
        {availabilityOptions.map((option, index) => {
          const isSelected = selectedAvailability === option.value;
          const count = counts?.[option.value];

          return (
            <motion.button
              key={option.value}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => !disabled && onAvailabilityChange(option.value)}
              disabled={disabled || (count !== undefined && count === 0)}
              className={cn(
                'w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all',
                isSelected
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300',
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
                      <Check className="h-3 w-3 text-white" />
                    </motion.div>
                  )}
                </div>

                <span className={cn('font-medium', option.color)}>
                  {option.label}
                </span>
              </div>

              {count !== undefined && (
                <span className="text-sm text-gray-500">
                  ({count.toLocaleString()})
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default AvailabilityFilter;
