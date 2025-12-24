'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ThreadCountRange {
  min: number;
  max: number;
}

export interface ThreadCountFilterProps {
  minThreadCount: number;
  maxThreadCount: number;
  selectedRange: ThreadCountRange;
  onRangeChange: (range: ThreadCountRange) => void;
  step?: number;
  className?: string;
  disabled?: boolean;
  presets?: { label: string; min: number; max: number }[];
}

const defaultPresets = [
  { label: 'Low (0-200)', min: 0, max: 200 },
  { label: 'Medium (200-400)', min: 200, max: 400 },
  { label: 'High (400-600)', min: 400, max: 600 },
  { label: 'Premium (600+)', min: 600, max: 1000 },
];

const ThreadCountFilter: React.FC<ThreadCountFilterProps> = ({
  minThreadCount,
  maxThreadCount,
  selectedRange,
  onRangeChange,
  step = 50,
  className,
  disabled = false,
  presets = defaultPresets,
}) => {
  const [localMin, setLocalMin] = useState(selectedRange.min);
  const [localMax, setLocalMax] = useState(selectedRange.max);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setLocalMin(selectedRange.min);
    setLocalMax(selectedRange.max);
  }, [selectedRange]);

  const handleMinChange = (value: number) => {
    const newMin = Math.max(minThreadCount, Math.min(value, localMax - step));
    setLocalMin(newMin);
    if (!isDragging) {
      onRangeChange({ min: newMin, max: localMax });
    }
  };

  const handleMaxChange = (value: number) => {
    const newMax = Math.min(maxThreadCount, Math.max(value, localMin + step));
    setLocalMax(newMax);
    if (!isDragging) {
      onRangeChange({ min: localMin, max: newMax });
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onRangeChange({ min: localMin, max: localMax });
  };

  const handlePresetClick = (preset: typeof presets[0]) => {
    if (disabled) return;
    const min = Math.max(minThreadCount, preset.min);
    const max = Math.min(maxThreadCount, preset.max);
    setLocalMin(min);
    setLocalMax(max);
    onRangeChange({ min, max });
  };

  const handleReset = () => {
    if (disabled) return;
    setLocalMin(minThreadCount);
    setLocalMax(maxThreadCount);
    onRangeChange({ min: minThreadCount, max: maxThreadCount });
  };

  const minPercent = ((localMin - minThreadCount) / (maxThreadCount - minThreadCount)) * 100;
  const maxPercent = ((localMax - minThreadCount) / (maxThreadCount - minThreadCount)) * 100;

  const isFiltered = localMin !== minThreadCount || localMax !== maxThreadCount;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Thread Count</h3>
        {isFiltered && (
          <button
            onClick={handleReset}
            disabled={disabled}
            className="text-xs text-primary-600 hover:text-primary-700 disabled:opacity-50"
          >
            Reset
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Range Display */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleMinChange(localMin - step)}
              disabled={disabled || localMin <= minThreadCount}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Decrease minimum thread count"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              value={localMin}
              onChange={(e) => handleMinChange(parseInt(e.target.value) || minThreadCount)}
              min={minThreadCount}
              max={localMax - step}
              step={step}
              disabled={disabled}
              className={cn(
                'w-20 px-2 py-1 text-center border border-gray-300 rounded',
                'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              aria-label="Minimum thread count"
            />
            <button
              onClick={() => handleMinChange(localMin + step)}
              disabled={disabled || localMin >= localMax - step}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Increase minimum thread count"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <span className="text-gray-500">to</span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleMaxChange(localMax - step)}
              disabled={disabled || localMax <= localMin + step}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Decrease maximum thread count"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              value={localMax}
              onChange={(e) => handleMaxChange(parseInt(e.target.value) || maxThreadCount)}
              min={localMin + step}
              max={maxThreadCount}
              step={step}
              disabled={disabled}
              className={cn(
                'w-20 px-2 py-1 text-center border border-gray-300 rounded',
                'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              aria-label="Maximum thread count"
            />
            <button
              onClick={() => handleMaxChange(localMax + step)}
              disabled={disabled || localMax >= maxThreadCount}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Increase maximum thread count"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Dual Range Slider */}
        <div className="relative pt-2 pb-6">
          <div className="h-2 bg-gray-200 rounded-full">
            {/* Dynamic range positioning based on selected values requires inline style */}
            <div
              className="absolute h-2 bg-primary-600 rounded-full"
              style={{
                left: `${minPercent}%`,
                right: `${100 - maxPercent}%`,
              } as React.CSSProperties}
            />
          </div>

          <input
            type="range"
            min={minThreadCount}
            max={maxThreadCount}
            step={step}
            value={localMin}
            onChange={(e) => {
              setIsDragging(true);
              handleMinChange(parseInt(e.target.value));
            }}
            onMouseUp={handleDragEnd}
            onTouchEnd={handleDragEnd}
            disabled={disabled}
            className="absolute w-full h-2 top-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary-600 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Minimum thread count slider"
          />
          <input
            type="range"
            min={minThreadCount}
            max={maxThreadCount}
            step={step}
            value={localMax}
            onChange={(e) => {
              setIsDragging(true);
              handleMaxChange(parseInt(e.target.value));
            }}
            onMouseUp={handleDragEnd}
            onTouchEnd={handleDragEnd}
            disabled={disabled}
            className="absolute w-full h-2 top-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary-600 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Maximum thread count slider"
          />
        </div>

        {/* Quality Presets */}
        {presets.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-600 font-medium">Quick Select:</p>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset, index) => {
                const isActive =
                  localMin === Math.max(minThreadCount, preset.min) &&
                  localMax === Math.min(maxThreadCount, preset.max);

                return (
                  <motion.button
                    key={index}
                    onClick={() => handlePresetClick(preset)}
                    disabled={disabled}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'px-3 py-2 text-xs font-medium rounded-lg border-2 transition-all',
                      isActive
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
                      disabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {preset.label}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Info Text */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p className="font-medium text-gray-700 mb-1">About Thread Count:</p>
          <p>
            Thread count refers to the number of threads per square inch. Higher thread counts
            typically indicate softer, more durable fabrics with better quality.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThreadCountFilter;
