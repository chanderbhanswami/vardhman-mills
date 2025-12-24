'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, IndianRupee, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PriceRange {
  min: number;
  max: number;
}

export interface PriceFilterProps {
  minPrice: number;
  maxPrice: number;
  selectedRange: PriceRange;
  onRangeChange: (range: PriceRange) => void;
  currency?: 'INR' | 'USD';
  step?: number;
  className?: string;
  disabled?: boolean;
  presets?: { label: string; min: number; max: number }[];
}

const PriceFilter: React.FC<PriceFilterProps> = ({
  minPrice,
  maxPrice,
  selectedRange,
  onRangeChange,
  currency = 'INR',
  step = 100,
  className,
  disabled = false,
  presets,
}) => {
  const [localMin, setLocalMin] = useState(selectedRange.min);
  const [localMax, setLocalMax] = useState(selectedRange.max);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setLocalMin(selectedRange.min);
    setLocalMax(selectedRange.max);
  }, [selectedRange]);

  const formatPrice = (value: number) => {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(value);
  };

  const handleMinChange = (value: number) => {
    const newMin = Math.max(minPrice, Math.min(value, localMax - step));
    setLocalMin(newMin);
    if (!isDragging) {
      onRangeChange({ min: newMin, max: localMax });
    }
  };

  const handleMaxChange = (value: number) => {
    const newMax = Math.min(maxPrice, Math.max(value, localMin + step));
    setLocalMax(newMax);
    if (!isDragging) {
      onRangeChange({ min: localMin, max: newMax });
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onRangeChange({ min: localMin, max: localMax });
  };

  const handlePresetClick = (preset: { min: number; max: number }) => {
    if (disabled) return;
    const min = Math.max(minPrice, preset.min);
    const max = Math.min(maxPrice, preset.max);
    setLocalMin(min);
    setLocalMax(max);
    onRangeChange({ min, max });
  };

  const handleReset = () => {
    if (disabled) return;
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
    onRangeChange({ min: minPrice, max: maxPrice });
  };

  const minPercent = ((localMin - minPrice) / (maxPrice - minPrice)) * 100;
  const maxPercent = ((localMax - minPrice) / (maxPrice - minPrice)) * 100;

  const isFiltered = localMin !== minPrice || localMax !== maxPrice;

  const CurrencyIcon = currency === 'INR' ? IndianRupee : DollarSign;

  const defaultPresets = presets || [
    { label: 'Under ₹1,000', min: minPrice, max: 1000 },
    { label: '₹1,000 - ₹2,500', min: 1000, max: 2500 },
    { label: '₹2,500 - ₹5,000', min: 2500, max: 5000 },
    { label: 'Above ₹5,000', min: 5000, max: maxPrice },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CurrencyIcon className="h-4 w-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Price Range</h3>
        </div>
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
        {/* Price Display */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <label className="block text-xs text-gray-600 mb-1">Min Price</label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleMinChange(localMin - step)}
                disabled={disabled || localMin <= minPrice}
                className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Decrease minimum price"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <input
                type="number"
                value={localMin}
                onChange={(e) => handleMinChange(parseInt(e.target.value) || minPrice)}
                min={minPrice}
                max={localMax - step}
                step={step}
                disabled={disabled}
                className={cn(
                  'flex-1 px-3 py-2 text-sm text-center border border-gray-300 rounded-lg',
                  'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                aria-label="Minimum price input"
              />
              <button
                onClick={() => handleMinChange(localMin + step)}
                disabled={disabled || localMin >= localMax - step}
                className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Increase minimum price"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">{formatPrice(localMin)}</p>
          </div>

          <div className="flex-1">
            <label className="block text-xs text-gray-600 mb-1">Max Price</label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleMaxChange(localMax - step)}
                disabled={disabled || localMax <= localMin + step}
                className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Decrease maximum price"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <input
                type="number"
                value={localMax}
                onChange={(e) => handleMaxChange(parseInt(e.target.value) || maxPrice)}
                min={localMin + step}
                max={maxPrice}
                step={step}
                disabled={disabled}
                className={cn(
                  'flex-1 px-3 py-2 text-sm text-center border border-gray-300 rounded-lg',
                  'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                aria-label="Maximum price input"
              />
              <button
                onClick={() => handleMaxChange(localMax + step)}
                disabled={disabled || localMax >= maxPrice}
                className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Increase maximum price"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">{formatPrice(localMax)}</p>
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
            min={minPrice}
            max={maxPrice}
            step={step}
            value={localMin}
            onChange={(e) => {
              setIsDragging(true);
              handleMinChange(parseInt(e.target.value));
            }}
            onMouseUp={handleDragEnd}
            onTouchEnd={handleDragEnd}
            disabled={disabled}
            className="absolute w-full h-2 top-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary-600 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Minimum price slider"
          />
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            step={step}
            value={localMax}
            onChange={(e) => {
              setIsDragging(true);
              handleMaxChange(parseInt(e.target.value));
            }}
            onMouseUp={handleDragEnd}
            onTouchEnd={handleDragEnd}
            disabled={disabled}
            className="absolute w-full h-2 top-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary-600 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Maximum price slider"
          />
        </div>

        {/* Price Presets */}
        {defaultPresets.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-600 font-medium">Quick Select:</p>
            <div className="grid grid-cols-2 gap-2">
              {defaultPresets.map((preset, index) => {
                const isActive =
                  localMin === Math.max(minPrice, preset.min) &&
                  localMax === Math.min(maxPrice, preset.max);

                return (
                  <motion.button
                    key={index}
                    onClick={() => handlePresetClick(preset)}
                    disabled={disabled}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'px-3 py-2.5 text-xs font-medium rounded-lg border-2 transition-all text-left',
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

        {/* Current Selection Summary */}
        {isFiltered && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-primary-50 border border-primary-200 rounded-lg"
          >
            <p className="text-xs text-primary-900 font-medium">
              Filtering: {formatPrice(localMin)} - {formatPrice(localMax)}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PriceFilter;
