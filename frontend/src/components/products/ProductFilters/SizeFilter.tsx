'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SizeOption {
  id: string;
  name: string;
  count: number;
  isAvailable: boolean;
  description?: string;
}

export interface SizeFilterProps {
  sizes: SizeOption[];
  selectedSizes: string[];
  onSizeChange: (sizes: string[]) => void;
  displayMode?: 'grid' | 'list';
  maxVisible?: number;
  className?: string;
  disabled?: boolean;
  showUnavailable?: boolean;
}

const SizeFilter: React.FC<SizeFilterProps> = ({
  sizes,
  selectedSizes,
  onSizeChange,
  displayMode = 'grid',
  maxVisible = 12,
  className,
  disabled = false,
  showUnavailable = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredSizes = showUnavailable ? sizes : sizes.filter(s => s.isAvailable);
  const visibleSizes = isExpanded ? filteredSizes : filteredSizes.slice(0, maxVisible);
  const hasMore = filteredSizes.length > maxVisible;

  const handleSizeToggle = (sizeId: string) => {
    if (disabled) return;
    
    const size = sizes.find(s => s.id === sizeId);
    if (!size?.isAvailable) return;
    
    if (selectedSizes.includes(sizeId)) {
      onSizeChange(selectedSizes.filter(id => id !== sizeId));
    } else {
      onSizeChange([...selectedSizes, sizeId]);
    }
  };

  const handleClearAll = () => {
    if (disabled) return;
    onSizeChange([]);
  };

  const selectedCount = selectedSizes.length;

  if (displayMode === 'grid') {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Size</h3>
          {selectedCount > 0 && (
            <button
              onClick={handleClearAll}
              disabled={disabled}
              className="text-xs text-primary-600 hover:text-primary-700 disabled:opacity-50"
            >
              Clear ({selectedCount})
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            <AnimatePresence mode="popLayout">
              {visibleSizes.map((size, index) => {
                const isSelected = selectedSizes.includes(size.id);
                
                return (
                  <motion.button
                    key={size.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => handleSizeToggle(size.id)}
                    disabled={disabled || !size.isAvailable}
                    title={size.description || `${size.name} (${size.count} available)`}
                    className={cn(
                      'relative h-12 rounded-lg border-2 transition-all font-medium',
                      'hover:scale-105 disabled:cursor-not-allowed',
                      isSelected
                        ? 'border-primary-600 bg-primary-600 text-white'
                        : size.isAvailable
                        ? 'border-gray-300 hover:border-gray-400 bg-white text-gray-900'
                        : 'border-gray-200 bg-gray-50 text-gray-400 line-through',
                      !size.isAvailable && 'opacity-50'
                    )}
                  >
                    <span className="text-sm">{size.name}</span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
                      >
                        <Check className="h-3 w-3 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          {hasMore && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              disabled={disabled}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
            >
              {isExpanded ? (
                <>
                  <span>Show Less</span>
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span>Show All ({filteredSizes.length})</span>
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>

        {selectedCount > 0 && (
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-2">Selected Sizes:</p>
            <div className="flex flex-wrap gap-2">
              {sizes
                .filter(size => selectedSizes.includes(size.id))
                .map(size => (
                  <div
                    key={size.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm"
                  >
                    <span className="font-medium">{size.name}</span>
                    <button
                      onClick={() => handleSizeToggle(size.id)}
                      disabled={disabled}
                      className="text-gray-500 hover:text-red-600 disabled:opacity-50"
                      aria-label={`Remove ${size.name} size filter`}
                    >
                      ×
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // List display mode
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Size</h3>
        {selectedCount > 0 && (
          <button
            onClick={handleClearAll}
            disabled={disabled}
            className="text-xs text-primary-600 hover:text-primary-700 disabled:opacity-50"
          >
            Clear ({selectedCount})
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {visibleSizes.map((size, index) => {
            const isSelected = selectedSizes.includes(size.id);
            
            return (
              <motion.label
                key={size.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.03 }}
                className={cn(
                  'flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors',
                  isSelected ? 'bg-primary-50' : 'hover:bg-gray-50',
                  disabled && 'opacity-50 cursor-not-allowed',
                  !size.isAvailable && 'opacity-40'
                )}
              >
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSizeToggle(size.id)}
                    disabled={disabled || !size.isAvailable}
                    className={cn(
                      'w-4 h-4 rounded border-gray-300 text-primary-600',
                      'focus:ring-2 focus:ring-primary-500',
                      'disabled:cursor-not-allowed'
                    )}
                    aria-label={`Select ${size.name} size`}
                    title={size.name}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'text-sm',
                        isSelected ? 'font-medium text-gray-900' : 'text-gray-700',
                        !size.isAvailable && 'line-through'
                      )}>
                        {size.name}
                      </span>
                      {!size.isAvailable && (
                        <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded">
                          Out of Stock
                        </span>
                      )}
                    </div>
                    {size.description && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {size.description}
                      </p>
                    )}
                  </div>
                </div>

                <span className="text-xs text-gray-500 ml-2">
                  ({size.count})
                </span>
              </motion.label>
            );
          })}
        </AnimatePresence>
      </div>

      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={disabled}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
        >
          {isExpanded ? (
            <>
              <span>Show Less</span>
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              <span>Show All ({filteredSizes.length})</span>
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default SizeFilter;
