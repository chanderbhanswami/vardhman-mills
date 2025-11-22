'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
  count: number;
  image?: string;
}

export interface ColorFilterProps {
  colors: ColorOption[];
  selectedColors: string[];
  onColorChange: (colors: string[]) => void;
  maxVisible?: number;
  className?: string;
  disabled?: boolean;
  displayMode?: 'swatch' | 'list';
}

const ColorFilter: React.FC<ColorFilterProps> = ({
  colors,
  selectedColors,
  onColorChange,
  maxVisible = 12,
  className,
  disabled = false,
  displayMode = 'swatch',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleColors = isExpanded ? colors : colors.slice(0, maxVisible);
  const hasMore = colors.length > maxVisible;

  const handleColorToggle = (colorId: string) => {
    if (disabled) return;
    
    if (selectedColors.includes(colorId)) {
      onColorChange(selectedColors.filter(id => id !== colorId));
    } else {
      onColorChange([...selectedColors, colorId]);
    }
  };

  const handleClearAll = () => {
    if (disabled) return;
    onColorChange([]);
  };

  const selectedCount = selectedColors.length;

  if (displayMode === 'swatch') {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Color</h3>
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
          <div className="grid grid-cols-6 gap-2">
            <AnimatePresence mode="popLayout">
              {visibleColors.map((color, index) => {
                const isSelected = selectedColors.includes(color.id);
                
                return (
                  <motion.button
                    key={color.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => handleColorToggle(color.id)}
                    disabled={disabled || color.count === 0}
                    className={cn(
                      'relative w-10 h-10 rounded-full border-2 transition-all',
                      'hover:scale-110 disabled:cursor-not-allowed',
                      isSelected
                        ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-900'
                        : 'border-gray-300 hover:border-gray-400',
                      color.count === 0 && 'opacity-40'
                    )}
                    title={`${color.name} (${color.count})`}
                    style={{
                      backgroundColor: color.hex,
                    }}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                          <Check className="h-3 w-3 text-gray-900" />
                        </div>
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
                  <span>Show All ({colors.length})</span>
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>

        {selectedCount > 0 && (
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-2">Selected Colors:</p>
            <div className="flex flex-wrap gap-2">
              {colors
                .filter(color => selectedColors.includes(color.id))
                .map(color => (
                  <div
                    key={color.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full text-xs"
                  >
                    {/* Dynamic hex color from database requires inline style */}
                    <div
                      className="w-3 h-3 rounded-full border border-gray-300"
                      style={{ backgroundColor: color.hex } as React.CSSProperties}
                    />
                    <span>{color.name}</span>
                    <button
                      onClick={() => handleColorToggle(color.id)}
                      className="ml-1 hover:text-red-600"
                      aria-label={`Remove ${color.name}`}
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
        <h3 className="font-semibold text-gray-900">Color</h3>
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
          {visibleColors.map((color, index) => {
            const isSelected = selectedColors.includes(color.id);
            
            return (
              <motion.label
                key={color.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.03 }}
                className={cn(
                  'flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors',
                  isSelected ? 'bg-primary-50' : 'hover:bg-gray-50',
                  disabled && 'opacity-50 cursor-not-allowed',
                  color.count === 0 && 'opacity-40'
                )}
              >
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleColorToggle(color.id)}
                    disabled={disabled || color.count === 0}
                    className={cn(
                      'w-4 h-4 rounded border-gray-300 text-primary-600',
                      'focus:ring-2 focus:ring-primary-500',
                      'disabled:cursor-not-allowed'
                    )}
                    aria-label={`Select ${color.name} color`}
                    title={color.name}
                  />
                  
                  {/* Dynamic background color requires inline style */}
                  <div
                    className="w-6 h-6 rounded border-2 border-gray-300"
                    style={{ backgroundColor: color.hex } as React.CSSProperties}
                  />
                  
                  <span className={cn(
                    'text-sm',
                    isSelected ? 'font-medium text-gray-900' : 'text-gray-700'
                  )}>
                    {color.name}
                  </span>
                </div>

                <span className="text-xs text-gray-500 ml-2">
                  ({color.count})
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
              <span>Show All ({colors.length})</span>
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ColorFilter;
