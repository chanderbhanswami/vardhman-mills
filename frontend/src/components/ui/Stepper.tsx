'use client';

import React, { createContext, useContext, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

// Stepper variants
const stepperVariants = cva(
  'flex',
  {
    variants: {
      orientation: {
        horizontal: 'flex-row items-center',
        vertical: 'flex-col',
      },
      variant: {
        default: '',
        outline: '',
        ghost: '',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
      variant: 'default',
      size: 'md',
    },
  }
);

// Step variants
const stepVariants = cva(
  'flex items-center transition-all duration-200',
  {
    variants: {
      orientation: {
        horizontal: 'flex-row',
        vertical: 'flex-col',
      },
      state: {
        pending: 'text-muted-foreground',
        active: 'text-primary',
        completed: 'text-primary',
        error: 'text-destructive',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
      state: 'pending',
    },
  }
);

// Step indicator variants
const stepIndicatorVariants = cva(
  'flex items-center justify-center rounded-full border-2 transition-all duration-200 font-medium',
  {
    variants: {
      size: {
        sm: 'w-6 h-6 text-xs',
        md: 'w-8 h-8 text-sm',
        lg: 'w-10 h-10 text-base',
      },
      state: {
        pending: 'border-muted bg-background text-muted-foreground',
        active: 'border-primary bg-primary text-primary-foreground',
        completed: 'border-primary bg-primary text-primary-foreground',
        error: 'border-destructive bg-destructive text-destructive-foreground',
      },
      variant: {
        default: '',
        outline: 'bg-transparent',
        ghost: 'border-transparent',
      },
    },
    defaultVariants: {
      size: 'md',
      state: 'pending',
      variant: 'default',
    },
  }
);

// Connector variants
const connectorVariants = cva(
  'transition-all duration-200',
  {
    variants: {
      orientation: {
        horizontal: 'h-px flex-1 mx-2',
        vertical: 'w-px h-8 my-2 ml-4',
      },
      state: {
        pending: 'bg-muted',
        active: 'bg-primary',
        completed: 'bg-primary',
        error: 'bg-destructive',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
      state: 'pending',
    },
  }
);

// Types
type StepState = 'pending' | 'active' | 'completed' | 'error';

// Stepper Context
interface StepperContextType {
  activeStep: number;
  orientation: 'horizontal' | 'vertical';
  size: 'sm' | 'md' | 'lg';
  variant: 'default' | 'outline' | 'ghost';
  totalSteps: number;
  clickable?: boolean;
  onStepClick?: (step: number) => void;
}

const StepperContext = createContext<StepperContextType | undefined>(undefined);

const useStepperContext = () => {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error('Step components must be used within a Stepper');
  }
  return context;
};

// Stepper Props
export interface StepperProps extends VariantProps<typeof stepperVariants> {
  children: React.ReactNode;
  activeStep: number;
  onStepClick?: (step: number) => void;
  clickable?: boolean;
  className?: string;
}

// Step Props
export interface StepProps {
  children?: React.ReactNode;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  completedIcon?: React.ReactNode;
  errorIcon?: React.ReactNode;
  state?: StepState;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

// Step Content Props
export interface StepContentProps {
  children: React.ReactNode;
  step: number;
  className?: string;
}

// Main Stepper Component
export const Stepper = forwardRef<HTMLDivElement, StepperProps>(
  ({
    children,
    activeStep = 0,
    orientation = 'horizontal',
    variant = 'default',
    size = 'md',
    onStepClick,
    clickable = false,
    className,
    ...props
  }, ref) => {
    const totalSteps = React.Children.count(children);
    
    return (
      <StepperContext.Provider
        value={{
          activeStep,
          orientation: orientation || 'horizontal',
          size: size || 'md',
          variant: variant || 'default',
          totalSteps,
          clickable,
          onStepClick,
        }}
      >
        <div
          ref={ref}
          className={cn(
            stepperVariants({ orientation, variant, size }),
            className
          )}
          {...props}
        >
          {React.Children.map(children, (child, index) => {
            return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
              stepIndex: index,
              isLast: index === totalSteps - 1,
            });
          })}
        </div>
      </StepperContext.Provider>
    );
  }
);

Stepper.displayName = 'Stepper';

// Step Component
export const Step = forwardRef<HTMLDivElement, StepProps & { stepIndex?: number; isLast?: boolean }>(
  ({
    children,
    title,
    description,
    icon,
    completedIcon,
    errorIcon,
    state: propState,
    stepIndex = 0,
    isLast = false,
    className,
    onClick,
    disabled = false,
    ...props
  }, ref) => {
    const { activeStep, orientation, size, variant, clickable, onStepClick } = useStepperContext();
    
    // Determine step state
    const getStepState = (): StepState => {
      if (propState) return propState;
      if (stepIndex < activeStep) return 'completed';
      if (stepIndex === activeStep) return 'active';
      return 'pending';
    };
    
    const stepState = getStepState();
    const isClickable = clickable && !disabled;
    
    const handleClick = () => {
      if (isClickable) {
        onClick?.();
        onStepClick?.(stepIndex);
      }
    };
    
    // Get icon based on state
    const getIcon = () => {
      if (stepState === 'error' && errorIcon) return errorIcon;
      if (stepState === 'completed' && completedIcon) return completedIcon;
      if (icon) return icon;
      return stepIndex + 1; // Default to step number
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          stepVariants({ orientation, state: stepState }),
          orientation === 'horizontal' && 'flex-1',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'flex items-center',
            orientation === 'vertical' ? 'flex-col text-center' : 'flex-row',
            isClickable && 'cursor-pointer hover:opacity-80'
          )}
          onClick={handleClick}
          {...(isClickable && {
            role: 'button' as const,
            tabIndex: 0
          })}
          onKeyDown={isClickable ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick();
            }
          } : undefined}
        >
          {/* Step Indicator */}
          <motion.div
            className={cn(
              stepIndicatorVariants({ size, state: stepState, variant })
            )}
            whileHover={isClickable ? { scale: 1.05 } : {}}
            whileTap={isClickable ? { scale: 0.95 } : {}}
          >
            {getIcon()}
          </motion.div>
          
          {/* Step Content */}
          {(title || description || children) && (
            <div className={cn(
              'flex flex-col',
              orientation === 'horizontal' ? 'ml-3' : 'mt-2',
              orientation === 'vertical' && 'text-center'
            )}>
              {title && (
                <div className={cn(
                  'font-medium',
                  size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base',
                  stepState === 'active' ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {title}
                </div>
              )}
              {description && (
                <div className={cn(
                  'text-sm text-muted-foreground',
                  orientation === 'vertical' && 'mt-1'
                )}>
                  {description}
                </div>
              )}
              {children && (
                <div className="mt-1">
                  {children}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Connector */}
        {!isLast && (
          <motion.div
            className={cn(
              connectorVariants({ orientation, state: stepIndex < activeStep ? 'completed' : 'pending' })
            )}
            initial={{ scaleX: orientation === 'horizontal' ? 0 : 1, scaleY: orientation === 'vertical' ? 0 : 1 }}
            animate={{ scaleX: 1, scaleY: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          />
        )}
      </div>
    );
  }
);

Step.displayName = 'Step';

// Step Content Component
export const StepContent = forwardRef<HTMLDivElement, StepContentProps>(
  ({ children, step, className, ...props }, ref) => {
    const { activeStep } = useStepperContext();
    
    if (step !== activeStep) {
      return null;
    }
    
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={cn('mt-4', className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

StepContent.displayName = 'StepContent';

// Stepper Navigation Component
export interface StepperNavigationProps {
  onNext?: () => void;
  onPrevious?: () => void;
  onFinish?: () => void;
  nextLabel?: string;
  previousLabel?: string;
  finishLabel?: string;
  showPrevious?: boolean;
  showNext?: boolean;
  showFinish?: boolean;
  className?: string;
}

export const StepperNavigation = forwardRef<HTMLDivElement, StepperNavigationProps>(
  ({
    onNext,
    onPrevious,
    onFinish,
    nextLabel = 'Next',
    previousLabel = 'Previous',
    finishLabel = 'Finish',
    showPrevious = true,
    showNext = true,
    showFinish = true,
    className,
    ...props
  }, ref) => {
    const { activeStep, totalSteps } = useStepperContext();
    
    const isFirstStep = activeStep === 0;
    const isLastStep = activeStep === totalSteps - 1;
    
    return (
      <div
        ref={ref}
        className={cn('flex justify-between mt-6', className)}
        {...props}
      >
        <div>
          {showPrevious && !isFirstStep && (
            <button
              type="button"
              onClick={onPrevious}
              className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {previousLabel}
            </button>
          )}
        </div>
        
        <div>
          {isLastStep ? (
            showFinish && (
              <button
                type="button"
                onClick={onFinish}
                className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {finishLabel}
              </button>
            )
          ) : (
            showNext && (
              <button
                type="button"
                onClick={onNext}
                className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {nextLabel}
              </button>
            )
          )}
        </div>
      </div>
    );
  }
);

StepperNavigation.displayName = 'StepperNavigation';

// Export all components
export default Stepper;