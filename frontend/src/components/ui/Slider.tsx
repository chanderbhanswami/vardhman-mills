'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Slider variants
const sliderVariants = cva(
  'relative flex items-center select-none touch-none',
  {
    variants: {
      variant: {
        default: 'data-[orientation=horizontal]:h-2 data-[orientation=vertical]:w-2',
        range: 'data-[orientation=horizontal]:h-3 data-[orientation=vertical]:w-3',
        volume: 'data-[orientation=horizontal]:h-1 data-[orientation=vertical]:w-1',
      },
      size: {
        sm: 'data-[orientation=horizontal]:h-1 data-[orientation=vertical]:w-1',
        md: 'data-[orientation=horizontal]:h-2 data-[orientation=vertical]:w-2',
        lg: 'data-[orientation=horizontal]:h-3 data-[orientation=vertical]:w-3',
      },
      orientation: {
        horizontal: 'w-full',
        vertical: 'h-full flex-col',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      orientation: 'horizontal',
    },
  }
);

const trackVariants = cva(
  'relative bg-secondary rounded-full flex-1',
  {
    variants: {
      orientation: {
        horizontal: 'h-full w-full',
        vertical: 'h-full w-full',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  }
);

const rangeVariants = cva(
  'absolute bg-primary rounded-full',
  {
    variants: {
      orientation: {
        horizontal: 'h-full',
        vertical: 'w-full',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  }
);

const thumbVariants = cva(
  'block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'shadow-md hover:shadow-lg',
        minimal: 'shadow-sm',
        bold: 'shadow-lg ring-2 ring-primary/20',
      },
      size: {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface SliderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'>,
    VariantProps<typeof sliderVariants> {
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  onValueCommit?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  minStepsBetweenThumbs?: number;
  disabled?: boolean;
  inverted?: boolean;
  thumbVariant?: VariantProps<typeof thumbVariants>['variant'];
  thumbSize?: VariantProps<typeof thumbVariants>['size'];
  showValue?: boolean;
  formatValue?: (value: number) => string;
  marks?: Array<{ value: number; label?: string }>;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

// Hook for slider functionality
const useSlider = ({
  value,
  defaultValue = [0],
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  minStepsBetweenThumbs = 0,
  disabled = false, // eslint-disable-line @typescript-eslint/no-unused-vars -- Used in parent component for event handling
  orientation = 'horizontal',
  inverted = false,
}: Pick<SliderProps, 'value' | 'defaultValue' | 'onValueChange' | 'onValueCommit' | 'min' | 'max' | 'step' | 'minStepsBetweenThumbs' | 'disabled' | 'orientation' | 'inverted'>) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const sliderValue = value ?? internalValue;
  
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeThumb, setActiveThumb] = useState<number | null>(null);
  
  // Use minStepsBetweenThumbs for thumb spacing validation
  // Validate thumb spacing for multi-thumb sliders (future use)




  const getValueFromPointer = useCallback((pointer: { x: number; y: number }) => {
    if (!trackRef.current) return 0;
    
    const rect = trackRef.current.getBoundingClientRect();
    const isHorizontal = orientation === 'horizontal';
    const trackLength = isHorizontal ? rect.width : rect.height;
    const trackStart = isHorizontal ? rect.left : rect.top;
    const pointerPosition = isHorizontal ? pointer.x : pointer.y;
    
    let percentage = (pointerPosition - trackStart) / trackLength;
    
    if (inverted) {
      percentage = 1 - percentage;
    }
    
    if (!isHorizontal) {
      percentage = 1 - percentage;
    }
    
    percentage = Math.max(0, Math.min(1, percentage));
    
    const rawValue = min + percentage * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    
    return Math.max(min, Math.min(max, steppedValue));
  }, [min, max, step, orientation, inverted]);

  const updateValue = useCallback((newValue: number[], commit = false) => {
    let validatedValue = newValue.map(v => Math.max(min, Math.min(max, v)));
    
    // Enforce minimum steps between thumbs for multi-thumb sliders
    if (validatedValue.length > 1 && minStepsBetweenThumbs > 0) {
      validatedValue.sort((a, b) => a - b);
      for (let i = 1; i < validatedValue.length; i++) {
        const minDistance = minStepsBetweenThumbs * step;
        if (validatedValue[i] - validatedValue[i - 1] < minDistance) {
          validatedValue[i] = validatedValue[i - 1] + minDistance;
        }
      }
      validatedValue = validatedValue.map(v => Math.max(min, Math.min(max, v)));
    }
    
    if (!value) {
      setInternalValue(validatedValue);
    }
    
    onValueChange?.(validatedValue);
    
    if (commit) {
      onValueCommit?.(validatedValue);
    }
  }, [value, min, max, step, minStepsBetweenThumbs, onValueChange, onValueCommit]);

  const getThumbPosition = useCallback((valueAtIndex: number) => {
    const percentage = (valueAtIndex - min) / (max - min);
    return inverted ? (1 - percentage) * 100 : percentage * 100;
  }, [min, max, inverted]);

  return {
    sliderValue,
    trackRef,
    isDragging,
    setIsDragging,
    activeThumb,
    setActiveThumb,
    getValueFromPointer,
    updateValue,
    getThumbPosition,
  };
};

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({
    className,
    variant = 'default',
    size = 'md',
    orientation = 'horizontal',
    value,
    defaultValue = [0],
    onValueChange,
    onValueCommit,
    min = 0,
    max = 100,
    step = 1,
    minStepsBetweenThumbs = 0,
    disabled = false,
    inverted = false,
    thumbVariant = 'default',
    thumbSize = 'md',
    showValue = false,
    formatValue = (value) => value.toString(),
    marks = [],
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    ...props
  }, ref) => {
    const {
      sliderValue,
      trackRef,
      isDragging,
      setIsDragging,
      activeThumb,
      setActiveThumb,
      getValueFromPointer,
      updateValue,
      getThumbPosition,
    } = useSlider({
      value,
      defaultValue,
      onValueChange,
      onValueCommit,
      min,
      max,
      step,
      minStepsBetweenThumbs,
      disabled,
      orientation,
      inverted,
    });

    const handlePointerDown = useCallback((event: React.PointerEvent, thumbIndex: number) => {
      if (disabled) return;
      
      event.preventDefault();
      setActiveThumb(thumbIndex);
      setIsDragging(true);
      (event.target as HTMLElement).setPointerCapture(event.pointerId);
    }, [disabled, setActiveThumb, setIsDragging]);

    const handlePointerMove = useCallback((event: React.PointerEvent) => {
      if (!isDragging || activeThumb === null || disabled) return;
      
      event.preventDefault();
      const newValue = getValueFromPointer({ x: event.clientX, y: event.clientY });
      const newValues = [...sliderValue];
      newValues[activeThumb] = newValue;
      
      // Ensure minimum steps between thumbs
      if (minStepsBetweenThumbs > 0) {
        const minDistance = minStepsBetweenThumbs * step;
        
        if (activeThumb > 0 && newValues[activeThumb] < newValues[activeThumb - 1] + minDistance) {
          newValues[activeThumb] = newValues[activeThumb - 1] + minDistance;
        }
        
        if (activeThumb < newValues.length - 1 && newValues[activeThumb] > newValues[activeThumb + 1] - minDistance) {
          newValues[activeThumb] = newValues[activeThumb + 1] - minDistance;
        }
      }
      
      updateValue(newValues);
    }, [isDragging, activeThumb, disabled, getValueFromPointer, sliderValue, minStepsBetweenThumbs, step, updateValue]);

    const handlePointerUp = useCallback((event: React.PointerEvent) => {
      if (!isDragging || disabled) return;
      
      setIsDragging(false);
      setActiveThumb(null);
      (event.target as HTMLElement).releasePointerCapture(event.pointerId);
      updateValue(sliderValue, true);
    }, [isDragging, disabled, setIsDragging, setActiveThumb, updateValue, sliderValue]);

    const handleTrackClick = useCallback((event: React.MouseEvent) => {
      if (disabled || isDragging) return;
      
      const newValue = getValueFromPointer({ x: event.clientX, y: event.clientY });
      
      // Find closest thumb
      let closestThumbIndex = 0;
      let closestDistance = Math.abs(sliderValue[0] - newValue);
      
      for (let i = 1; i < sliderValue.length; i++) {
        const distance = Math.abs(sliderValue[i] - newValue);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestThumbIndex = i;
        }
      }
      
      const newValues = [...sliderValue];
      newValues[closestThumbIndex] = newValue;
      updateValue(newValues, true);
    }, [disabled, isDragging, getValueFromPointer, sliderValue, updateValue]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent, thumbIndex: number) => {
      if (disabled) return;

      let delta = 0;
      
      switch (event.key) {
        case 'ArrowUp':
        case 'ArrowRight':
          delta = step;
          break;
        case 'ArrowDown':
        case 'ArrowLeft':
          delta = -step;
          break;
        case 'PageUp':
          delta = (max - min) / 10;
          break;
        case 'PageDown':
          delta = -(max - min) / 10;
          break;
        case 'Home':
          delta = min - sliderValue[thumbIndex];
          break;
        case 'End':
          delta = max - sliderValue[thumbIndex];
          break;
        default:
          return;
      }

      event.preventDefault();
      
      const newValues = [...sliderValue];
      newValues[thumbIndex] = Math.max(min, Math.min(max, sliderValue[thumbIndex] + delta));
      updateValue(newValues, true);
    }, [disabled, step, max, min, sliderValue, updateValue]);

    // Calculate range styling
    const rangeStart = getThumbPosition(Math.min(...sliderValue));
    const rangeEnd = getThumbPosition(Math.max(...sliderValue));
    const rangeWidth = rangeEnd - rangeStart;

    return (
      <div
        ref={ref}
        className={cn(
          sliderVariants({ variant, size, orientation }),
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        data-orientation={orientation}
        data-disabled={disabled}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        {...props}
      >
        {/* Track */}
        <div
          ref={trackRef}
          className={cn(trackVariants({ orientation }))}
          onClick={handleTrackClick}
        >
          {/* Range */}
          <div
            className={cn(
              rangeVariants({ orientation }),
              orientation === 'horizontal' ? 'h-full' : 'w-full'
            )}
            data-range-start={rangeStart}
            data-range-width={rangeWidth}
          />
          
          {/* Marks */}
          {marks.map((mark) => {
            const position = getThumbPosition(mark.value);
              
            return (
              <div
                key={mark.value}
                className={cn(
                  'absolute w-1 h-1 bg-muted-foreground rounded-full',
                  orientation === 'horizontal' ? '-translate-x-0.5 top-1/2 -translate-y-0.5' : '-translate-y-0.5 left-1/2 -translate-x-0.5'
                )}
                data-mark-position={position}
              >
                {mark.label && (
                  <span className={cn(
                    'absolute text-xs text-muted-foreground whitespace-nowrap',
                    orientation === 'horizontal' ? 'top-full mt-1 left-1/2 -translate-x-1/2' : 'left-full ml-1 top-1/2 -translate-y-1/2'
                  )}>
                    {mark.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Thumbs */}
        {sliderValue.map((thumbValue, index) => {
          const position = getThumbPosition(thumbValue);
            
          return (
            <motion.div
              key={index}
              className={cn(
                'absolute',
                orientation === 'horizontal' ? '-translate-x-1/2' : '-translate-y-1/2'
              )}
              style={{ [orientation === 'horizontal' ? 'left' : 'bottom']: `${position}%` }}
              animate={{ scale: activeThumb === index ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >

              <div
                role="button"
                data-orientation={orientation || 'horizontal'}
                data-valuemin={min}
                data-valuemax={max}
                data-valuenow={thumbValue}
                aria-label={`Slider thumb ${index + 1}`}
                tabIndex={disabled ? -1 : 0}
                className={cn(
                  thumbVariants({ variant: thumbVariant, size: thumbSize }),
                  'cursor-pointer focus:cursor-grab active:cursor-grabbing',
                  disabled && 'cursor-not-allowed'
                )}
                onPointerDown={(e) => handlePointerDown(e, index)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
              
              {/* Value display */}
              {showValue && (
                <div className={cn(
                  'absolute px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md border',
                  orientation === 'horizontal' ? 'bottom-full mb-2 left-1/2 -translate-x-1/2' : 'right-full mr-2 top-1/2 -translate-y-1/2',
                  activeThumb === index ? 'opacity-100' : 'opacity-0'
                )}>
                  {formatValue(thumbValue)}
                  <div className={cn(
                    'absolute w-0 h-0 border-2 border-transparent',
                    orientation === 'horizontal' 
                      ? 'top-full left-1/2 -translate-x-1/2 border-t-popover' 
                      : 'left-full top-1/2 -translate-y-1/2 border-l-popover'
                  )} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    );
  }
);

Slider.displayName = 'Slider';

// Dual Range Slider
export interface RangeSliderProps extends Omit<SliderProps, 'defaultValue'> {
  defaultValue?: [number, number];
}

export const RangeSlider = React.forwardRef<HTMLDivElement, RangeSliderProps>(
  ({ defaultValue = [0, 100], ...props }, ref) => (
    <Slider
      ref={ref}
      defaultValue={defaultValue}
      minStepsBetweenThumbs={1}
      {...props}
    />
  )
);

RangeSlider.displayName = 'RangeSlider';

// Volume Slider
export interface VolumeSliderProps extends Omit<SliderProps, 'variant' | 'min' | 'max' | 'defaultValue'> {
  defaultValue?: [number];
}

export const VolumeSlider = React.forwardRef<HTMLDivElement, VolumeSliderProps>(
  ({ defaultValue = [50], ...props }, ref) => (
    <Slider
      ref={ref}
      variant="volume"
      min={0}
      max={100}
      defaultValue={defaultValue}
      formatValue={(value) => `${value}%`}
      {...props}
    />
  )
);

VolumeSlider.displayName = 'VolumeSlider';

// Vertical Slider
export type VerticalSliderProps = Omit<SliderProps, 'orientation'>;

export const VerticalSlider = React.forwardRef<HTMLDivElement, VerticalSliderProps>(
  (props, ref) => (
    <Slider
      ref={ref}
      orientation="vertical"
      {...props}
    />
  )
);

VerticalSlider.displayName = 'VerticalSlider';

// Price Range Slider
export interface PriceRangeSliderProps extends Omit<RangeSliderProps, 'formatValue' | 'min' | 'max'> {
  min?: number;
  max?: number;
  currency?: string;
}

export const PriceRangeSlider = React.forwardRef<HTMLDivElement, PriceRangeSliderProps>(
  ({ min = 0, max = 1000, currency = '$', ...props }, ref) => (
    <RangeSlider
      ref={ref}
      min={min}
      max={max}
      formatValue={(value) => `${currency}${value}`}
      showValue
      {...props}
    />
  )
);

PriceRangeSlider.displayName = 'PriceRangeSlider';

export default Slider;

