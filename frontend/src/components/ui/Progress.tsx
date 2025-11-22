'use client';

import React, { forwardRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/outline';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Progress variants
const progressVariants = cva(
  'relative w-full overflow-hidden rounded-full bg-muted',
  {
    variants: {
      size: {
        xs: 'h-1',
        sm: 'h-2',
        default: 'h-3',
        lg: 'h-4',
        xl: 'h-6'
      }
    },
    defaultVariants: {
      size: 'default'
    }
  }
);

// Progress bar variants
const progressBarVariants = cva(
  'h-full transition-all duration-500 ease-in-out rounded-full relative overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        secondary: 'bg-secondary',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        destructive: 'bg-destructive',
        info: 'bg-blue-500'
      },
      animated: {
        true: 'bg-gradient-to-r from-transparent via-white to-transparent bg-size-200 animate-shimmer',
        false: ''
      }
    },
    defaultVariants: {
      variant: 'default',
      animated: false
    }
  }
);

// Base Progress Props
export interface ProgressProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value: number;
  max?: number;
  variant?: VariantProps<typeof progressBarVariants>['variant'];
  showValue?: boolean;
  showPercentage?: boolean;
  animated?: boolean;
  striped?: boolean;
  label?: string;
  formatValue?: (value: number, max: number) => string;
}

// Circular Progress Props
export interface CircularProgressProps 
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'size'> {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: VariantProps<typeof progressBarVariants>['variant'];
  showValue?: boolean;
  showPercentage?: boolean;
  animated?: boolean;
  label?: string;
  formatValue?: (value: number, max: number) => string;
}

// Step Progress Props
export interface StepProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: Array<{
    id: string | number;
    label: string;
    description?: string;
    icon?: React.ReactNode;
  }>;
  currentStep: number;
  variant?: VariantProps<typeof progressBarVariants>['variant'];
  orientation?: 'horizontal' | 'vertical';
  showConnector?: boolean;
  clickable?: boolean;
  onStepClick?: (step: number) => void;
}

// Multi Progress Props
export interface MultiProgressProps 
  extends Omit<ProgressProps, 'value' | 'variant'> {
  segments: Array<{
    value: number;
    variant?: VariantProps<typeof progressBarVariants>['variant'];
    label?: string;
    color?: string;
  }>;
}

// Base Progress Component
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    size,
    value, 
    max = 100, 
    variant = 'default',
    showValue = false,
    showPercentage = false,
    animated = false,
    striped = false,
    label,
    formatValue,
    ...props 
  }, ref) => {
    const [displayValue, setDisplayValue] = useState(0);
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    // Animate value changes
    useEffect(() => {
      const timer = setTimeout(() => {
        setDisplayValue(value);
      }, 100);
      return () => clearTimeout(timer);
    }, [value]);

    const formattedValue = formatValue ? formatValue(animated ? displayValue : value, max) : (animated ? displayValue : value);
    const displayPercentage = Math.round((displayValue / max) * 100);

    return (
      <div className="w-full">
        {(label || showValue || showPercentage) && (
          <div className="flex justify-between items-center mb-2">
            {label && (
              <span className="text-sm font-medium text-foreground">{label}</span>
            )}
            {(showValue || showPercentage) && (
              <span className="text-sm text-muted-foreground">
                {showValue && formattedValue}
                {showValue && showPercentage && ' '}
                {showPercentage && `(${displayPercentage}%)`}
              </span>
            )}
          </div>
        )}
        
        <div
          ref={ref}
          className={cn(progressVariants({ size }), className)}
          role="progressbar"
          {...{ 'aria-valuenow': Number(value) }}
          {...{ 'aria-valuemin': 0 }}
          {...{ 'aria-valuemax': Number(max) }}
          {...(label && { 'aria-label': label })}
          {...props}
        >
          <motion.div
            className={cn(
              progressBarVariants({ variant, animated }),
              striped && 'bg-gradient-to-r from-current to-transparent bg-stripes animate-slide'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {animated && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            )}
          </motion.div>
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

// Circular Progress Component
export const CircularProgress = forwardRef<HTMLDivElement, CircularProgressProps>(
  ({ 
    className,
    value,
    max = 100,
    size = 100,
    strokeWidth = 8,
    variant = 'default',
    showValue = false,
    showPercentage = true,
    animated = true,
    label,
    formatValue,
    ...props 
  }, ref) => {
    const [displayValue, setDisplayValue] = useState(0);
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (displayValue / max) * circumference;

    // Animate value changes
    useEffect(() => {
      if (animated) {
        const timer = setTimeout(() => {
          setDisplayValue(value);
        }, 100);
        return () => clearTimeout(timer);
      } else {
        setDisplayValue(value);
      }
    }, [value, animated]);

    const formattedValue = formatValue ? formatValue(value, max) : value;
    const displayPercentage = Math.round(percentage);

    const variantColors = {
      default: 'stroke-primary',
      secondary: 'stroke-secondary',
      success: 'stroke-green-500',
      warning: 'stroke-yellow-500',
      destructive: 'stroke-destructive',
      info: 'stroke-blue-500'
    };

    return (
      <div
        ref={ref}
        className={cn('relative inline-flex flex-col items-center', className)}
        role="progressbar"
        {...{ 'aria-valuenow': Number(value) }}
        {...{ 'aria-valuemin': 0 }}
        {...{ 'aria-valuemax': Number(max) }}
        {...(label && { 'aria-label': label })}
        {...props}
      >
        <div className={`relative w-[${size}px] h-[${size}px]`}>
          <svg
            className="transform -rotate-90"
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
          >
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              className="text-muted opacity-20"
            />
            
            {/* Progress circle */}
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              className={cn('transition-all duration-300', variant ? variantColors[variant] : variantColors.default)}
              strokeDasharray={strokeDasharray}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: animated ? strokeDashoffset : circumference - (value / max) * circumference }}
              transition={{ duration: animated ? 1 : 0, ease: 'easeInOut' }}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              {showPercentage && (
                <div className="text-sm font-semibold text-foreground">
                  {displayPercentage}%
                </div>
              )}
              {showValue && (
                <div className="text-xs text-muted-foreground">
                  {formattedValue}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {label && (
          <span className="mt-2 text-sm text-center text-muted-foreground max-w-full">
            {label}
          </span>
        )}
      </div>
    );
  }
);

CircularProgress.displayName = 'CircularProgress';

// Step Progress Component
export const StepProgress = forwardRef<HTMLDivElement, StepProgressProps>(
  ({ 
    className,
    steps,
    currentStep,
    variant = 'default',
    orientation = 'horizontal',
    showConnector = true,
    clickable = false,
    onStepClick,
    ...props 
  }, ref) => {
    const handleStepClick = useCallback((stepIndex: number) => {
      if (clickable && onStepClick) {
        onStepClick(stepIndex);
      }
    }, [clickable, onStepClick]);

    const getStepStatus = (index: number) => {
      if (index < currentStep) return 'completed';
      if (index === currentStep) return 'current';
      return 'upcoming';
    };

    const variantColors = {
      default: {
        completed: 'bg-primary border-primary text-primary-foreground',
        current: 'bg-primary border-primary text-primary-foreground',
        upcoming: 'bg-background border-border text-muted-foreground'
      },
      secondary: {
        completed: 'bg-secondary border-secondary text-secondary-foreground',
        current: 'bg-secondary border-secondary text-secondary-foreground',
        upcoming: 'bg-background border-border text-muted-foreground'
      },
      success: {
        completed: 'bg-green-500 border-green-500 text-white',
        current: 'bg-green-500 border-green-500 text-white',
        upcoming: 'bg-background border-border text-muted-foreground'
      },
      warning: {
        completed: 'bg-yellow-500 border-yellow-500 text-white',
        current: 'bg-yellow-500 border-yellow-500 text-white',
        upcoming: 'bg-background border-border text-muted-foreground'
      },
      destructive: {
        completed: 'bg-red-500 border-red-500 text-white',
        current: 'bg-red-500 border-red-500 text-white',
        upcoming: 'bg-background border-border text-muted-foreground'
      },
      info: {
        completed: 'bg-blue-500 border-blue-500 text-white',
        current: 'bg-blue-500 border-blue-500 text-white',
        upcoming: 'bg-background border-border text-muted-foreground'
      }
    };

    if (orientation === 'vertical') {
      return (
        <div
          ref={ref}
          className={cn('flex flex-col', className)}
          {...props}
        >
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const colors = (variant && variantColors[variant]) || variantColors.default;
            const isClickable = clickable && (status === 'completed' || status === 'current');
            
            return (
              <div key={step.id} className="flex items-start">
                <div className="flex flex-col items-center mr-4">
                  <motion.button
                    type="button"
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200',
                      colors[status],
                      isClickable && 'cursor-pointer hover:scale-105',
                      !isClickable && 'cursor-default'
                    )}
                    onClick={() => handleStepClick(index)}
                    disabled={!isClickable}
                    whileHover={isClickable ? { scale: 1.05 } : {}}
                    whileTap={isClickable ? { scale: 0.95 } : {}}
                  >
                    {step.icon ? (
                      step.icon
                    ) : status === 'completed' ? (
                      <CheckIcon className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </motion.button>
                  
                  {showConnector && index < steps.length - 1 && (
                    <div 
                      className={cn(
                        'w-0.5 h-12 mt-2 transition-colors duration-300',
                        index < currentStep ? 'bg-primary' : 'bg-border'
                      )}
                    />
                  )}
                </div>
                
                <div className="flex-1 pb-8">
                  <h4 className={cn(
                    'text-sm font-medium transition-colors duration-200',
                    status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'
                  )}>
                    {step.label}
                  </h4>
                  {step.description && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-between w-full', className)}
        {...props}
      >
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const colors = (variant && variantColors[variant]) || variantColors.default;
          const isClickable = clickable && (status === 'completed' || status === 'current');
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <motion.button
                  type="button"
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 mb-2',
                    colors[status],
                    isClickable && 'cursor-pointer hover:scale-105',
                    !isClickable && 'cursor-default'
                  )}
                  onClick={() => handleStepClick(index)}
                  disabled={!isClickable}
                  whileHover={isClickable ? { scale: 1.05 } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                >
                  {step.icon ? (
                    step.icon
                  ) : status === 'completed' ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </motion.button>
                
                <div className="text-center max-w-24">
                  <h4 className={cn(
                    'text-xs font-medium transition-colors duration-200',
                    status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'
                  )}>
                    {step.label}
                  </h4>
                  {step.description && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
              
              {showConnector && index < steps.length - 1 && (
                <div className="flex-1 px-2">
                  <div 
                    className={cn(
                      'h-0.5 w-full transition-colors duration-300',
                      index < currentStep ? 'bg-primary' : 'bg-border'
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }
);

StepProgress.displayName = 'StepProgress';

// Multi Progress Component
export const MultiProgress = forwardRef<HTMLDivElement, MultiProgressProps>(
  ({ 
    className,
    size,
    segments,
    max = 100,
    showValue = false,
    showPercentage = false,
    label,
    ...props 
  }, ref) => {
    const totalValue = segments.reduce((sum, segment) => sum + segment.value, 0);
    
    return (
      <div className="w-full">
        {(label || showValue || showPercentage) && (
          <div className="flex justify-between items-center mb-2">
            {label && (
              <span className="text-sm font-medium text-foreground">{label}</span>
            )}
            {(showValue || showPercentage) && (
              <span className="text-sm text-muted-foreground">
                {showValue && totalValue}
                {showValue && showPercentage && ' '}
                {showPercentage && `(${Math.round((totalValue / max) * 100)}%)`}
              </span>
            )}
          </div>
        )}
        
        <div
          ref={ref}
          className={cn(progressVariants({ size }), className)}
          role="progressbar"
          {...{ 'aria-valuenow': Number(totalValue) }}
          {...{ 'aria-valuemin': 0 }}
          {...{ 'aria-valuemax': Number(max) }}
          {...(label && { 'aria-label': label })}
          {...props}
        >
          <div className="flex h-full">
            {segments.map((segment, index) => {
              const percentage = (segment.value / max) * 100;
              const variantClass = segment.variant ? 
                progressBarVariants({ variant: segment.variant, animated: false }) :
                'bg-primary';
              
              return (
                <motion.div
                  key={index}
                  className={cn(
                    'h-full transition-all duration-500 ease-in-out',
                    index === 0 && 'rounded-l-full',
                    index === segments.length - 1 && 'rounded-r-full',
                    variantClass
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 }}
                  {...(segment.color && { style: { backgroundColor: segment.color } })}
                  title={segment.label}
                />
              );
            })}
          </div>
        </div>
        
        {segments.length > 1 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {segments.map((segment, index) => (
              <div key={index} className="flex items-center text-xs">
                <div 
                  className={cn(
                    'w-3 h-3 rounded-sm mr-1',
                    !segment.color && (
                      segment.variant === 'success' ? 'bg-green-500' :
                      segment.variant === 'warning' ? 'bg-yellow-500' :
                      segment.variant === 'destructive' ? 'bg-red-500' :
                      segment.variant === 'info' ? 'bg-blue-500' :
                      'bg-primary'
                    )
                  )}
                  {...(segment.color && { style: { backgroundColor: segment.color } })}
                />
                <span className="text-muted-foreground">
                  {segment.label}: {segment.value}
                  {showPercentage && ` (${Math.round((segment.value / max) * 100)}%)`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

MultiProgress.displayName = 'MultiProgress';

export default Progress;
