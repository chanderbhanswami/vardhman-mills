'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';
import type { CheckoutStep } from '@/types/cart.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CheckoutNavigationProps {
  /**
   * Current step
   */
  currentStep: CheckoutStep;

  /**
   * All checkout steps
   */
  steps: CheckoutStep[];

  /**
   * Callback when navigating to previous step
   */
  onPrevious?: () => void;

  /**
   * Callback when navigating to next step
   */
  onNext: () => void;

  /**
   * Callback when save & exit is clicked
   */
  onSaveAndExit?: () => void;

  /**
   * Validation errors for current step
   */
  validationErrors?: string[];

  /**
   * Is step valid and can proceed
   */
  canProceed: boolean;

  /**
   * Loading state (e.g., during step transition)
   */
  isLoading?: boolean;

  /**
   * Show save & exit button
   */
  showSaveButton?: boolean;

  /**
   * Show exit confirmation
   */
  requireExitConfirmation?: boolean;

  /**
   * Custom back button label
   */
  backLabel?: string;

  /**
   * Custom next button label
   */
  nextLabel?: string;

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// STEP LABELS
// ============================================================================

const STEP_LABELS: Record<CheckoutStep, { back: string; next: string }> = {
  cart_review: {
    back: 'Back to Cart',
    next: 'Continue to Shipping',
  },
  shipping_address: {
    back: 'Back to Cart',
    next: 'Continue to Billing',
  },
  billing_address: {
    back: 'Back to Shipping',
    next: 'Continue to Shipping Method',
  },
  shipping_method: {
    back: 'Back to Billing',
    next: 'Continue to Payment',
  },
  payment_method: {
    back: 'Back to Shipping Method',
    next: 'Review Order',
  },
  order_review: {
    back: 'Back to Payment',
    next: 'Place Order',
  },
  payment_processing: {
    back: '',
    next: 'Processing...',
  },
  order_confirmation: {
    back: '',
    next: 'Continue Shopping',
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * CheckoutNavigation Component
 * 
 * Navigation controls for checkout flow with back/next buttons.
 * Features:
 * - Dynamic button labels per step
 * - Validation error display
 * - Disabled states with tooltips
 * - Loading states
 * - Save & exit functionality
 * - Exit confirmation modal
 * - Responsive design
 * - Keyboard shortcuts
 * 
 * @example
 * ```tsx
 * <CheckoutNavigation
 *   currentStep="shipping_address"
 *   steps={allSteps}
 *   onPrevious={handlePrevious}
 *   onNext={handleNext}
 *   canProceed={isValid}
 *   validationErrors={errors}
 * />
 * ```
 */
export const CheckoutNavigation: React.FC<CheckoutNavigationProps> = ({
  currentStep,
  steps,
  onPrevious,
  onNext,
  onSaveAndExit,
  validationErrors = [],
  canProceed,
  isLoading = false,
  showSaveButton = true,
  requireExitConfirmation = true,
  backLabel,
  nextLabel,
  className,
}) => {
  // State
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Get current step index
  const currentStepIndex = steps.indexOf(currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const isProcessing = currentStep === 'payment_processing';
  const isConfirmation = currentStep === 'order_confirmation';

  // Get step labels
  const stepLabels = STEP_LABELS[currentStep];
  const backButtonLabel = backLabel || stepLabels.back;
  const nextButtonLabel = nextLabel || stepLabels.next;

  // Handle previous
  const handlePrevious = () => {
    if (!isFirstStep && onPrevious && !isProcessing && !isConfirmation) {
      onPrevious();
    }
  };

  // Handle next
  const handleNext = React.useCallback(() => {
    if (canProceed && !isLoading) {
      onNext();
    }
  }, [canProceed, isLoading, onNext]);

  // Handle save and exit
  const handleSaveAndExit = () => {
    if (requireExitConfirmation) {
      setShowExitConfirm(true);
    } else if (onSaveAndExit) {
      onSaveAndExit();
    }
  };

  // Confirm exit
  const confirmExit = () => {
    if (onSaveAndExit) {
      onSaveAndExit();
    }
    setShowExitConfirm(false);
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Enter to continue
      if (e.key === 'Enter' && canProceed && !isLoading && !showExitConfirm) {
        e.preventDefault();
        handleNext();
      }
      // Escape to close confirmation
      if (e.key === 'Escape' && showExitConfirm) {
        setShowExitConfirm(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [canProceed, isLoading, showExitConfirm, handleNext]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'sticky bottom-0 bg-white border-t border-gray-200 shadow-lg',
          className
        )}
      >
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-3">
            <div className="flex items-start gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 mb-1">
                  Please fix the following errors:
                </p>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="px-6 py-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Left: Back & Save */}
            <div className="flex items-center gap-3 order-2 sm:order-1">
              {/* Back Button */}
              {!isFirstStep && !isProcessing && !isConfirmation && (
                <Tooltip content={isFirstStep ? 'Cannot go back from first step' : ''}>
                  <Button
                    onClick={handlePrevious}
                    variant="outline"
                    disabled={isFirstStep || isLoading}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">{backButtonLabel}</span>
                    <span className="sm:hidden">Back</span>
                  </Button>
                </Tooltip>
              )}

              {/* Save & Exit */}
              {showSaveButton && onSaveAndExit && !isProcessing && !isConfirmation && (
                <Button
                  onClick={handleSaveAndExit}
                  variant="ghost"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <XMarkIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Save & Exit</span>
                  <span className="sm:hidden">Exit</span>
                </Button>
              )}
            </div>

            {/* Right: Next Button */}
            <div className="order-1 sm:order-2">
              <Tooltip
                content={
                  !canProceed && validationErrors.length === 0
                    ? 'Please complete all required fields'
                    : validationErrors.length > 0
                    ? 'Please fix validation errors'
                    : ''
                }
              >
                <Button
                  onClick={handleNext}
                  disabled={!canProceed || isLoading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 min-w-[200px]"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Please wait...</span>
                    </>
                  ) : isConfirmation ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>{nextButtonLabel}</span>
                    </>
                  ) : (
                    <>
                      <span>{nextButtonLabel}</span>
                      {!isLastStep && <ArrowRightIcon className="h-4 w-4" />}
                    </>
                  )}
                </Button>
              </Tooltip>
            </div>
          </div>

          {/* Progress Indicator */}
          {!isProcessing && !isConfirmation && (
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500">
                Step {currentStepIndex + 1} of {steps.length}
                {canProceed && (
                  <span className="ml-2 text-green-600">
                    • Ready to continue
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowExitConfirm(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Save and Exit?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Your progress will be saved and you can continue later. Are you sure you want to exit?
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setShowExitConfirm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmExit}
                    variant="default"
                    className="flex-1"
                  >
                    Save & Exit
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default CheckoutNavigation;