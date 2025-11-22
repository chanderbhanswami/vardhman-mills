'use client';

import React, { useState, useCallback, useRef, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Range variants
const rangeVariants = cva(
  'relative flex items-center select-none touch-none w-full',
  {
    variants: {
      variant: {
        default: '',
        success: '',
        warning: '',
        destructive: ''
      },
      size: {
        sm: 'h-4',
        default: 'h-6',
        lg: 'h-8'
      },
      orientation: {
        horizontal: 'w-full',
        vertical: 'h-full w-6 flex-col'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      orientation: 'horizontal'
    }
  }
);

// Track variants
const trackVariants = cva(
  'relative flex-1 rounded-full',
  {
    variants: {
      variant: {
        default: 'bg-secondary',
        success: 'bg-green-200',
        warning: 'bg-yellow-200',
        destructive: 'bg-red-200'
      },
      size: {
        sm: 'h-1',
        default: 'h-2',
        lg: 'h-3'
      },
      orientation: {
        horizontal: 'w-full',
        vertical: 'h-full w-2'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      orientation: 'horizontal'
    }
  }
);

// Range variants for progress
const rangeProgressVariants = cva(
  'absolute rounded-full',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        destructive: 'bg-red-500'
      },
      size: {
        sm: 'h-1',
        default: 'h-2',
        lg: 'h-3'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

// Thumb variants
const thumbVariants = cva(
  'block rounded-full border-2 border-primary bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-primary',
        success: 'border-green-500',
        warning: 'border-yellow-500',
        destructive: 'border-red-500'
      },
      size: {
        sm: 'h-3 w-3',
        default: 'h-4 w-4',
        lg: 'h-5 w-5'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

// Base Range Props
export interface RangeProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange' | 'value' | 'defaultValue'>,
    VariantProps<typeof rangeVariants> {
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  orientation?: 'horizontal' | 'vertical';
  minStepsBetweenThumbs?: number;
  showValue?: boolean;
  showTicks?: boolean;
  tickLabels?: string[];
  formatValue?: (value: number) => string;
  inverted?: boolean;
}

// Single Range Component
export const Range = forwardRef<HTMLDivElement, RangeProps>(
  ({
    className,
    value,
    defaultValue = [0],
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    variant = 'default',
    size = 'default',
    orientation = 'horizontal',
    minStepsBetweenThumbs = 0,
    showValue = false,
    showTicks = false,
    tickLabels = [],
    formatValue = (val) => val.toString(),
    inverted = false,
    disabled,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const trackRef = useRef<HTMLDivElement>(null);
    
    const currentValue = value !== undefined ? value : internalValue;
    
    const handleValueChange = useCallback((newValue: number[]) => {
      if (value === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    }, [value, onValueChange]);

    const getValueFromPointer = useCallback((event: React.PointerEvent | PointerEvent) => {
      if (!trackRef.current) return 0;
      
      const rect = trackRef.current.getBoundingClientRect();
      const input = orientation === 'vertical' 
        ? (rect.bottom - event.clientY) / rect.height
        : (event.clientX - rect.left) / rect.width;
      
      const percent = inverted ? 1 - Math.max(0, Math.min(1, input)) : Math.max(0, Math.min(1, input));
      const value = min + percent * (max - min);
      const snappedValue = Math.round(value / step) * step;
      
      return Math.max(min, Math.min(max, snappedValue));
    }, [min, max, step, orientation, inverted]);

    const handlePointerDown = useCallback((event: React.PointerEvent, thumbIndex: number) => {
      if (disabled) return;
      
      event.preventDefault();
      const newValue = getValueFromPointer(event);
      const updatedValues = [...currentValue];
      updatedValues[thumbIndex] = newValue;
      
      // Ensure minimum distance between thumbs
      if (currentValue.length > 1 && minStepsBetweenThumbs > 0) {
        const minDistance = minStepsBetweenThumbs * step;
        if (thumbIndex === 0 && updatedValues[1] - updatedValues[0] < minDistance) {
          updatedValues[0] = updatedValues[1] - minDistance;
        } else if (thumbIndex === 1 && updatedValues[1] - updatedValues[0] < minDistance) {
          updatedValues[1] = updatedValues[0] + minDistance;
        }
      }
      
      handleValueChange(updatedValues);
      
      const handlePointerMove = (moveEvent: PointerEvent) => {
        const newValue = getValueFromPointer(moveEvent);
        const updatedValues = [...currentValue];
        updatedValues[thumbIndex] = newValue;
        
        // Apply constraints
        if (currentValue.length > 1) {
          if (thumbIndex === 0 && updatedValues[0] > updatedValues[1] - minStepsBetweenThumbs * step) {
            updatedValues[0] = updatedValues[1] - minStepsBetweenThumbs * step;
          } else if (thumbIndex === 1 && updatedValues[1] < updatedValues[0] + minStepsBetweenThumbs * step) {
            updatedValues[1] = updatedValues[0] + minStepsBetweenThumbs * step;
          }
        }
        
        handleValueChange(updatedValues);
      };
      
      const handlePointerUp = () => {
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
      };
      
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
    }, [currentValue, disabled, getValueFromPointer, handleValueChange, minStepsBetweenThumbs, step]);

    const getThumbPosition = useCallback((value: number) => {
      const percent = (value - min) / (max - min);
      return inverted ? (1 - percent) * 100 : percent * 100;
    }, [min, max, inverted]);

    const progressStart = currentValue.length > 1 ? getThumbPosition(Math.min(...currentValue)) : 0;
    const progressEnd = getThumbPosition(Math.max(...currentValue));

    return (
      <div
        ref={ref}
        className={cn(rangeVariants({ variant, size, orientation }), className)}
        {...props}
      >
        {/* Track */}
        <div
          ref={trackRef}
          className={cn(trackVariants({ variant, size, orientation }))}
        >
          {/* Progress */}
          <div
            className={cn(rangeProgressVariants({ variant, size }))}
            data-orientation={orientation}
            data-progress-start={progressStart}
            data-progress-end={progressEnd}
          />
          
          {/* Ticks */}
          {showTicks && (
            <div className="absolute inset-0 flex justify-between items-center">
              {Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => {
                const tickValue = min + i * step;
                const position = getThumbPosition(tickValue);
                
                return (
                  <div
                    key={i}
                    className="absolute w-0.5 h-2 bg-border"
                    data-tick-position={position}
                    data-orientation={orientation}
                  />
                );
              })}
            </div>
          )}
        </div>
        
        {/* Thumbs */}
        {currentValue.map((value, index) => (
          <motion.div
            key={index}
            className={cn(thumbVariants({ variant, size }), 'absolute cursor-grab active:cursor-grabbing')}
            style={
              orientation === 'horizontal'
                ? { left: `${getThumbPosition(value)}%`, transform: 'translateX(-50%)' }
                : { bottom: `${getThumbPosition(value)}%`, transform: 'translateY(50%)' }
            }
            onPointerDown={(e) => handlePointerDown(e, index)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 1.2 }}
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-orientation={orientation}
            tabIndex={disabled ? -1 : 0}
          >
            {showValue && (
              <div
                className={cn(
                  'absolute whitespace-nowrap rounded bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md',
                  orientation === 'horizontal' ? '-top-10 left-1/2 -translate-x-1/2' : '-right-12 top-1/2 -translate-y-1/2'
                )}
              >
                {formatValue(value)}
              </div>
            )}
          </motion.div>
        ))}
        
        {/* Tick Labels */}
        {showTicks && tickLabels.length > 0 && (
          <div className={cn(
            'absolute flex justify-between text-xs text-muted-foreground',
            orientation === 'horizontal' ? 'top-8 w-full' : 'left-8 h-full flex-col'
          )}>
            {tickLabels.map((label, index) => (
              <span key={index}>{label}</span>
            ))}
          </div>
        )}
      </div>
    );
  }
);

Range.displayName = 'Range';

// Dual Range Component
export interface DualRangeProps extends Omit<RangeProps, 'defaultValue'> {
  defaultValue?: [number, number];
}

export const DualRange = forwardRef<HTMLDivElement, DualRangeProps>(
  ({ defaultValue = [25, 75], ...props }, ref) => {
    return (
      <Range
        ref={ref}
        defaultValue={defaultValue}
        minStepsBetweenThumbs={1}
        {...props}
      />
    );
  }
);

DualRange.displayName = 'DualRange';

// Vertical Range Component
export const VerticalRange = forwardRef<HTMLDivElement, RangeProps>(
  ({ className, ...props }, ref) => {
    return (
      <Range
        ref={ref}
        orientation="vertical"
        className={cn('h-48', className)}
        {...props}
      />
    );
  }
);

VerticalRange.displayName = 'VerticalRange';

// Range with Input Component
export interface RangeWithInputProps extends RangeProps {
  showInput?: boolean;
  inputClassName?: string;
}

export const RangeWithInput = forwardRef<HTMLDivElement, RangeWithInputProps>(
  ({ 
    showInput = true,
    inputClassName,
    value,
    onValueChange,
    formatValue,
    className,
    ...props 
  }, ref) => {
    const handleInputChange = useCallback((index: number, inputValue: string) => {
      const numValue = Number(inputValue);
      if (!isNaN(numValue) && value && onValueChange) {
        const newValue = [...value];
        newValue[index] = Math.max(props.min || 0, Math.min(props.max || 100, numValue));
        onValueChange(newValue);
      }
    }, [value, onValueChange, props.min, props.max]);

    return (
      <div className={cn('space-y-4', className)}>
        <Range
          ref={ref}
          value={value}
          onValueChange={onValueChange}
          showValue={!showInput}
          formatValue={formatValue}
          {...props}
        />
        
        {showInput && value && (
          <div className="flex items-center gap-2">
            {value.map((val, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="text-muted-foreground">to</span>}
                <input
                  type="number"
                  value={val}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  min={props.min}
                  max={props.max}
                  step={props.step}
                  aria-label={`Range value ${index + 1}`}
                  title={`Range value ${index + 1}`}
                  className={cn(
                    'w-20 px-2 py-1 text-sm border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring',
                    inputClassName
                  )}
                />
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    );
  }
);

RangeWithInput.displayName = 'RangeWithInput';

// Price Range Component
export interface PriceRangeProps extends Omit<DualRangeProps, 'formatValue'> {
  currency?: string;
  showInputs?: boolean;
}

export const PriceRange = forwardRef<HTMLDivElement, PriceRangeProps>(
  ({ currency = '$', showInputs = true, ...props }, ref) => {
    const formatValue = useCallback((value: number) => {
      return `${currency}${value.toLocaleString()}`;
    }, [currency]);

    return (
      <RangeWithInput
        ref={ref}
        showInput={showInputs}
        formatValue={formatValue}
        {...props}
      />
    );
  }
);

PriceRange.displayName = 'PriceRange';

// Volume Range Component
export const VolumeRange = forwardRef<HTMLDivElement, RangeProps>(
  ({ className, value, onValueChange, ...props }, ref) => {
    const [isMuted, setIsMuted] = useState(false);
    const currentVolume = value?.[0] || 50;
    
    const handleMuteToggle = useCallback(() => {
      setIsMuted(!isMuted);
      if (!isMuted && onValueChange) {
        onValueChange([0]);
      } else if (isMuted && onValueChange) {
        onValueChange([50]);
      }
    }, [isMuted, onValueChange]);
    
    const getVolumeIcon = () => {
      if (isMuted || currentVolume === 0) return '🔇';
      if (currentVolume < 30) return '🔈';
      if (currentVolume < 70) return '🔉';
      return '🔊';
    };

    return (
      <div className={cn('flex items-center gap-3', className)}>
        <button
          onClick={handleMuteToggle}
          className="p-1 hover:bg-muted rounded transition-colors"
          type="button"
        >
          <span className="text-lg">{getVolumeIcon()}</span>
        </button>
        
        <Range
          ref={ref}
          value={value}
          onValueChange={onValueChange}
          className="flex-1"
          {...props}
        />
        
        <span className="text-sm text-muted-foreground w-8">
          {Math.round(currentVolume)}
        </span>
      </div>
    );
  }
);

VolumeRange.displayName = 'VolumeRange';

export default Range;

