'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import type { CheckoutStep } from '@/types/cart.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CheckoutProgressProps {
  /**
   * Current step
   */
  currentStep: CheckoutStep;

  /**
   * All checkout steps
   */
  steps: CheckoutStep[];

  /**
   * Completed steps
   */
  completedSteps?: CheckoutStep[];

  /**
   * Callback when step is clicked
   */
  onStepClick?: (step: CheckoutStep) => void;

  /**
   * Allow clicking on completed steps to navigate back
   */
  allowBackNavigation?: boolean;

  /**
   * Show step labels
   */
  showLabels?: boolean;

  /**
   * Show estimated time per step
   */
  showEstimatedTime?: boolean;

  /**
   * Orientation
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// STEP CONFIGURATION
// ============================================================================

const STEP_CONFIG: Record<
  CheckoutStep,
  {
    label: string;
    shortLabel: string;
    estimatedMinutes: number;
  }
> = {
  cart_review: {
    label: 'Review Cart',
    shortLabel: 'Cart',
    estimatedMinutes: 2,
  },
  shipping_address: {
    label: 'Shipping Address',
    shortLabel: 'Shipping',
    estimatedMinutes: 3,
  },
  billing_address: {
    label: 'Billing Address',
    shortLabel: 'Billing',
    estimatedMinutes: 2,
  },
  shipping_method: {
    label: 'Shipping Method',
    shortLabel: 'Method',
    estimatedMinutes: 1,
  },
  payment_method: {
    label: 'Payment',
    shortLabel: 'Payment',
    estimatedMinutes: 2,
  },
  order_review: {
    label: 'Review Order',
    shortLabel: 'Review',
    estimatedMinutes: 2,
  },
  payment_processing: {
    label: 'Processing',
    shortLabel: 'Processing',
    estimatedMinutes: 1,
  },
  order_confirmation: {
    label: 'Confirmation',
    shortLabel: 'Done',
    estimatedMinutes: 0,
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate progress percentage
 */
const calculateProgress = (currentStep: CheckoutStep, steps: CheckoutStep[]): number => {
  const currentIndex = steps.indexOf(currentStep);
  if (currentIndex === -1) return 0;
  return ((currentIndex + 1) / steps.length) * 100;
};

/**
 * Check if step is completed
 */
const isStepCompleted = (
  step: CheckoutStep,
  currentStep: CheckoutStep,
  steps: CheckoutStep[],
  completedSteps?: CheckoutStep[]
): boolean => {
  if (completedSteps) {
    return completedSteps.includes(step);
  }
  const currentIndex = steps.indexOf(currentStep);
  const stepIndex = steps.indexOf(step);
  return stepIndex < currentIndex;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * CheckoutProgress Component
 * 
 * Visual progress indicator for checkout flow with step indicators.
 * Features:
 * - Horizontal/vertical orientation
 * - Progress bar with percentage
 * - Numbered step indicators
 * - Completed steps with checkmarks
 * - Current step highlight
 * - Pending steps (gray)
 * - Step labels
 * - Estimated time per step
 * - Clickable completed steps
 * - Animated transitions
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <CheckoutProgress
 *   currentStep="shipping_address"
 *   steps={allSteps}
 *   completedSteps={completed}
 *   onStepClick={handleStepClick}
 *   showLabels={true}
 * />
 * ```
 */
export const CheckoutProgress: React.FC<CheckoutProgressProps> = ({
  currentStep,
  steps,
  completedSteps,
  onStepClick,
  allowBackNavigation = true,
  showLabels = true,
  showEstimatedTime = false,
  orientation = 'horizontal',
  className,
}) => {
  // Calculate progress
  const progress = calculateProgress(currentStep, steps);
  const currentStepIndex = steps.indexOf(currentStep);

  // Handle step click
  const handleStepClick = (step: CheckoutStep, index: number) => {
    const isCompleted = isStepCompleted(step, currentStep, steps, completedSteps);
    if (allowBackNavigation && isCompleted && onStepClick && index < currentStepIndex) {
      onStepClick(step);
    }
  };

  if (orientation === 'vertical') {
    return (
      <div className={cn('space-y-4', className)}>
        {steps.map((step, index) => {
          const isCompleted = isStepCompleted(step, currentStep, steps, completedSteps);
          const isCurrent = step === currentStep;
          const config = STEP_CONFIG[step];
          const isClickable = allowBackNavigation && isCompleted && index < currentStepIndex;

          return (
            <div key={step} className="flex items-start gap-4">
              {/* Step Indicator */}
              <button
                onClick={() => handleStepClick(step, index)}
                disabled={!isClickable}
                className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                  isCurrent &&
                    'bg-primary-600 text-white ring-4 ring-primary-100 scale-110',
                  isCompleted &&
                    !isCurrent &&
                    'bg-green-500 text-white hover:bg-green-600',
                  !isCompleted &&
                    !isCurrent &&
                    'bg-gray-200 text-gray-600',
                  isClickable && 'cursor-pointer',
                  !isClickable && 'cursor-default'
                )}
              >
                {isCompleted && !isCurrent ? (
                  <CheckIcon className="h-5 w-5" />
                ) : (
                  <span className="text-sm">{index + 1}</span>
                )}
              </button>

              {/* Step Info */}
              <div className="flex-1 pt-2">
                <p
                  className={cn(
                    'text-sm font-medium',
                    isCurrent && 'text-primary-600',
                    isCompleted && !isCurrent && 'text-green-600',
                    !isCompleted && !isCurrent && 'text-gray-500'
                  )}
                >
                  {config.label}
                </p>
                {showEstimatedTime && config.estimatedMinutes > 0 && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    ~{config.estimatedMinutes} min
                  </p>
                )}
              </div>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-5 top-14 w-0.5 h-12 -translate-x-1/2 bg-gray-200">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{
                      height: isCompleted ? '100%' : '0%',
                    }}
                    transition={{ duration: 0.3 }}
                    className="w-full bg-green-500"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('py-6', className)}>
      {/* Progress Bar */}
      <div className="relative mb-8">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="h-full bg-gradient-to-r from-primary-600 to-primary-500"
          />
        </div>
        <div className="absolute -top-1 right-0 px-2 py-0.5 bg-primary-600 text-white text-xs font-semibold rounded-full">
          {Math.round(progress)}%
        </div>
      </div>

      {/* Step Indicators */}
      <div className="relative">
        {/* Connecting Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 hidden sm:block">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="h-full bg-green-500"
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = isStepCompleted(step, currentStep, steps, completedSteps);
            const isCurrent = step === currentStep;
            const config = STEP_CONFIG[step];
            const isClickable = allowBackNavigation && isCompleted && index < currentStepIndex;

            return (
              <div
                key={step}
                className="flex flex-col items-center flex-1"
              >
                {/* Step Circle */}
                <motion.button
                  onClick={() => handleStepClick(step, index)}
                  disabled={!isClickable}
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                  }}
                  whileHover={isClickable ? { scale: 1.15 } : {}}
                  whileTap={isClickable ? { scale: 1.05 } : {}}
                  className={cn(
                    'relative w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all z-10',
                    isCurrent &&
                      'bg-primary-600 text-white ring-4 ring-primary-100 shadow-lg',
                    isCompleted &&
                      !isCurrent &&
                      'bg-green-500 text-white shadow-md hover:bg-green-600',
                    !isCompleted &&
                      !isCurrent &&
                      'bg-gray-200 text-gray-600',
                    isClickable && 'cursor-pointer',
                    !isClickable && 'cursor-default'
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <CheckIcon className="h-5 w-5" />
                  ) : (
                    <span className="text-sm">{index + 1}</span>
                  )}

                  {/* Pulse Animation for Current Step */}
                  {isCurrent && (
                    <motion.div
                      initial={{ scale: 1, opacity: 1 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeOut',
                      }}
                      className="absolute inset-0 rounded-full bg-primary-600"
                    />
                  )}
                </motion.button>

                {/* Step Label */}
                {showLabels && (
                  <div className="mt-3 text-center">
                    <p
                      className={cn(
                        'text-xs sm:text-sm font-medium whitespace-nowrap',
                        isCurrent && 'text-primary-600',
                        isCompleted && !isCurrent && 'text-green-600',
                        !isCompleted && !isCurrent && 'text-gray-500'
                      )}
                    >
                      <span className="hidden sm:inline">{config.label}</span>
                      <span className="sm:hidden">{config.shortLabel}</span>
                    </p>
                    {showEstimatedTime && config.estimatedMinutes > 0 && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        {config.estimatedMinutes}m
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CheckoutProgress;