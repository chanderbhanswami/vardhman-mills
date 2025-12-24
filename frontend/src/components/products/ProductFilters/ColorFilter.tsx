'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Accordion } from '@/components/ui/Accordion';

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
}

const ColorFilter: React.FC<ColorFilterProps> = ({
  colors,
  selectedColors,
  onColorChange,
  maxVisible = 15,
  className,
  disabled = false,
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

  const selectedCount = selectedColors.length;

  const content = (
    <div className="space-y-4 pt-1">
      <div className="grid grid-cols-5 gap-2">
        <AnimatePresence mode="popLayout">
          {visibleColors.map((color, index) => {
            const isSelected = selectedColors.includes(color.id);

            return (
              <motion.button
                key={color.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.01 }}
                onClick={() => handleColorToggle(color.id)}
                disabled={disabled || color.count === 0}
                className={cn(
                  'relative w-8 h-8 rounded-full border-2 transition-all mx-auto',
                  'hover:scale-110 disabled:cursor-not-allowed',
                  isSelected
                    ? 'border-gray-900 ring-2 ring-offset-1 ring-gray-900'
                    : 'border-gray-200 hover:border-gray-400',
                  color.count === 0 && 'opacity-40'
                )}
                title={`${color.name} (${color.count})`}
                style={{
                  backgroundColor: color.hex,
                }}
                aria-label={color.name}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Check className="h-4 w-4 text-white drop-shadow-md" strokeWidth={3} />
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
          className="w-full flex items-center justify-center gap-2 py-2 text-xs text-primary-600 hover:text-primary-700 disabled:opacity-50 font-medium"
        >
          {isExpanded ? (
            <>
              <span>Show Less</span>
              <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              <span>Show All ({colors.length})</span>
              <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>
      )}

      {selectedCount > 0 && (
        <div className="pt-2 border-t border-gray-100 mt-2">
          <div className="flex flex-wrap gap-1.5">
            {colors
              .filter(color => selectedColors.includes(color.id))
              .map(color => (
                <div
                  key={color.id}
                  className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded text-[10px] text-gray-700 font-medium"
                >
                  <div
                    className="w-2 h-2 rounded-full border border-gray-300"
                    style={{ backgroundColor: color.hex } as React.CSSProperties}
                  />
                  <span>{color.name}</span>
                  <button
                    onClick={() => handleColorToggle(color.id)}
                    className="ml-0.5 hover:text-red-600 focus:outline-none"
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

  const accordionItems = [
    {
      id: 'color',
      title: <span className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
        Color {selectedCount > 0 && <span className="text-primary-600 ml-1">({selectedCount})</span>}
      </span>,
      content: content,
      className: 'border-b-0',
      triggerClassName: 'hover:no-underline py-3'
    }
  ];

  return (
    <Accordion
      type="single"
      collapsible
      items={accordionItems}
      className={cn("w-full", className)}
      defaultValue="color"
    />
  );
};

export default ColorFilter;
