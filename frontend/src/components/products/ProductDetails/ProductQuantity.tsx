'use client';

import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export interface ProductQuantityProps {
  value: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const ProductQuantity: React.FC<ProductQuantityProps> = ({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  className,
  size = 'md',
  showLabel = false,
}) => {
  const [inputValue, setInputValue] = useState(value.toString());

  const handleIncrement = () => {
    const newValue = Math.min(value + 1, max);
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  const handleDecrement = () => {
    const newValue = Math.max(value - 1, min);
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    setInputValue(inputVal);

    const numValue = parseInt(inputVal, 10);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(min, Math.min(numValue, max));
      onChange(clampedValue);
    }
  };

  const handleInputBlur = () => {
    const numValue = parseInt(inputValue, 10);
    if (isNaN(numValue) || numValue < min) {
      setInputValue(min.toString());
      onChange(min);
    } else if (numValue > max) {
      setInputValue(max.toString());
      onChange(max);
    } else {
      setInputValue(numValue.toString());
    }
  };

  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
  };

  const buttonSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <label className="text-sm font-medium text-gray-700">Quantity</label>
      )}
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className={cn(buttonSizeClasses[size])}
          aria-label="Decrease quantity"
        >
          <Minus className={iconSizeClasses[size]} />
        </Button>

        <input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          disabled={disabled}
          min={min}
          max={max}
          className={cn(
            'w-16 text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 font-medium',
            sizeClasses[size],
            disabled && 'bg-gray-100 cursor-not-allowed'
          )}
          aria-label="Quantity"
        />

        <Button
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          className={cn(buttonSizeClasses[size])}
          aria-label="Increase quantity"
        >
          <Plus className={iconSizeClasses[size]} />
        </Button>

        {max && (
          <span className="text-sm text-gray-500 ml-2">
            Max: {max}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProductQuantity;
