'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RatingOption {
  value: number;
  label: string;
  count: number;
}

export interface RatingFilterProps {
  ratings: RatingOption[];
  selectedRatings: number[];
  onRatingChange: (ratings: number[]) => void;
  multiSelect?: boolean;
  showAndUp?: boolean;
  className?: string;
  disabled?: boolean;
}

const RatingFilter: React.FC<RatingFilterProps> = ({
  ratings,
  selectedRatings,
  onRatingChange,
  multiSelect = true,
  showAndUp = true,
  className,
  disabled = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleRatingToggle = (rating: number) => {
    if (disabled) return;

    if (multiSelect) {
      if (selectedRatings.includes(rating)) {
        onRatingChange(selectedRatings.filter(r => r !== rating));
      } else {
        onRatingChange([...selectedRatings, rating]);
      }
    } else {
      onRatingChange([rating]);
    }
  };

  const handleClearAll = () => {
    if (disabled) return;
    onRatingChange([]);
  };

  const renderStars = (rating: number, filled = true) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              'h-4 w-4',
              star <= rating
                ? filled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-yellow-400'
                : 'text-gray-300'
            )}
          />
        ))}
      </div>
    );
  };

  const sortedRatings = [...ratings].sort((a, b) => b.value - a.value);
  const selectedCount = selectedRatings.length;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Customer Rating</h3>
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <button
              onClick={handleClearAll}
              disabled={disabled}
              className="text-xs text-primary-600 hover:text-primary-700 disabled:opacity-50"
            >
              Clear ({selectedCount})
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={disabled}
            className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
            aria-label={isExpanded ? 'Collapse rating filter' : 'Expand rating filter'}
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
            {sortedRatings.map((rating, index) => {
              const isSelected = selectedRatings.includes(rating.value);
              
              return (
                <motion.label
                  key={rating.value}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors',
                    isSelected ? 'bg-primary-50' : 'hover:bg-gray-50',
                    disabled && 'opacity-50 cursor-not-allowed',
                    rating.count === 0 && 'opacity-40'
                  )}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type={multiSelect ? 'checkbox' : 'radio'}
                      name={multiSelect ? undefined : 'rating'}
                      checked={isSelected}
                      onChange={() => handleRatingToggle(rating.value)}
                      disabled={disabled || rating.count === 0}
                      className={cn(
                        'w-4 h-4 border-gray-300 text-primary-600',
                        multiSelect ? 'rounded' : 'rounded-full',
                        'focus:ring-2 focus:ring-primary-500',
                        'disabled:cursor-not-allowed'
                      )}
                      aria-label={`Select ${rating.value} stars rating`}
                      title={`${rating.value} stars rating`}
                    />
                    
                    <div className="flex items-center gap-2">
                      {renderStars(rating.value)}
                      {showAndUp && rating.value < 5 && (
                        <span className="text-xs text-gray-600">& Up</span>
                      )}
                    </div>
                  </div>

                  <span className="text-xs text-gray-500 ml-2">
                    ({rating.count})
                  </span>
                </motion.label>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {sortedRatings.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">No ratings available</p>
        </div>
      )}

      {selectedCount > 0 && (
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-2">Filtered by:</p>
          <div className="flex flex-wrap gap-2">
            {sortedRatings
              .filter(rating => selectedRatings.includes(rating.value))
              .map(rating => (
                <div
                  key={rating.value}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full"
                >
                  <div className="flex items-center gap-1">
                    {renderStars(rating.value, false)}
                    {showAndUp && rating.value < 5 && (
                      <span className="text-xs text-gray-600">& Up</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRatingToggle(rating.value)}
                    disabled={disabled}
                    className="text-gray-500 hover:text-red-600 disabled:opacity-50"
                    aria-label={`Remove ${rating.value} star rating filter`}
                  >
                    ×
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {!multiSelect && selectedCount === 0 && (
        <div className="text-xs text-gray-500 italic">
          Select a rating to filter products
        </div>
      )}
    </div>
  );
};

export default RatingFilter;
