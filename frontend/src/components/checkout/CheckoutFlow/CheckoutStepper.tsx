'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { CheckoutProgress } from './CheckoutProgress';
import { CheckoutNavigation } from './CheckoutNavigation';
import { cn } from '@/lib/utils';
import type { CheckoutStep } from '@/types/cart.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CheckoutStepperProps {
  /**
   * Initial step
   */
  initialStep?: CheckoutStep;

  /**
   * All checkout steps
   */
  steps?: CheckoutStep[];

  /**
   * Render function for step content
   */
  renderStep: (step: CheckoutStep, helpers: StepHelpers) => React.ReactNode;

  /**
   * Validation function for each step
   */
  validateStep?: (step: CheckoutStep) => Promise<StepValidationResult> | StepValidationResult;

  /**
   * Callback when step changes
   */
  onStepChange?: (step: CheckoutStep) => void;

  /**
   * Callback when checkout is completed
   */
  onComplete?: () => void;

  /**
   * Callback when save & exit is clicked
   */
  onSaveAndExit?: () => void;

  /**
   * Enable auto-save to localStorage
   */
  enableAutoSave?: boolean;

  /**
   * LocalStorage key for auto-save
   */
  autoSaveKey?: string;

  /**
   * Show progress indicator
   */
  showProgress?: boolean;

  /**
   * Allow navigation to previous steps
   */
  allowBackNavigation?: boolean;

  /**
   * Show save & exit button
   */
  showSaveButton?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export interface StepHelpers {
  /**
   * Go to next step
   */
  goToNext: () => void;

  /**
   * Go to previous step
   */
  goToPrevious: () => void;

  /**
   * Go to specific step
   */
  goToStep: (step: CheckoutStep) => void;

  /**
   * Mark current step as complete
   */
  completeStep: () => void;

  /**
   * Set validation errors
   */
  setErrors: (errors: string[]) => void;

  /**
   * Clear validation errors
   */
  clearErrors: () => void;

  /**
   * Save data to auto-save storage
   */
  saveData: (data: unknown) => void;

  /**
   * Get data from auto-save storage
   */
  getData: () => unknown;
}

export interface StepValidationResult {
  /**
   * Is step valid
   */
  isValid: boolean;

  /**
   * Validation errors
   */
  errors?: string[];
}

// ============================================================================
// DEFAULT STEPS
// ============================================================================

const DEFAULT_STEPS: CheckoutStep[] = [
  'cart_review',
  'shipping_address',
  'billing_address',
  'shipping_method',
  'payment_method',
  'order_review',
  'payment_processing',
  'order_confirmation',
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Load data from localStorage
 */
const loadFromStorage = (key: string): unknown => {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
};

/**
 * Save data to localStorage
 */
const saveToStorage = (key: string, data: unknown): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

/**
 * Clear data from localStorage
 */
const clearStorage = (key: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * CheckoutStepper Component
 * 
 * Multi-step wizard for checkout flow with navigation and validation.
 * Features:
 * - Multi-step wizard container
 * - Dynamic step content rendering
 * - Step validation before navigation
 * - Progress indicator integration
 * - Navigation controls
 * - Form state management
 * - Auto-save to localStorage
 * - Back navigation support
 * - Exit confirmation
 * - Animated transitions
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <CheckoutStepper
 *   initialStep="cart_review"
 *   renderStep={(step, helpers) => {
 *     switch (step) {
 *       case 'cart_review':
 *         return <CartReview {...helpers} />;
 *       // ... other steps
 *     }
 *   }}
 *   validateStep={async (step) => {
 *     // Validate step
 *     return { isValid: true };
 *   }}
 *   onComplete={handleComplete}
 * />
 * ```
 */
export const CheckoutStepper: React.FC<CheckoutStepperProps> = ({
  initialStep = 'cart_review',
  steps = DEFAULT_STEPS,
  renderStep,
  validateStep,
  onStepChange,
  onComplete,
  onSaveAndExit,
  enableAutoSave = true,
  autoSaveKey = 'checkout_progress',
  showProgress = true,
  allowBackNavigation = true,
  showSaveButton = true,
  className,
}) => {
  // State
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(initialStep);
  const [completedSteps, setCompletedSteps] = useState<CheckoutStep[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [stepData, setStepData] = useState<Record<string, unknown>>({});

  // Load saved progress on mount
  useEffect(() => {
    if (enableAutoSave) {
      const savedData = loadFromStorage(autoSaveKey);
      if (savedData && typeof savedData === 'object' && savedData !== null) {
        const data = savedData as Record<string, unknown>;
        if (data.currentStep && typeof data.currentStep === 'string') {
          setCurrentStep(data.currentStep as CheckoutStep);
        }
        if (Array.isArray(data.completedSteps)) {
          setCompletedSteps(data.completedSteps as CheckoutStep[]);
        }
        if (data.stepData && typeof data.stepData === 'object') {
          setStepData(data.stepData as Record<string, unknown>);
        }
      }
    }
  }, [enableAutoSave, autoSaveKey]);

  // Auto-save progress
  useEffect(() => {
    if (enableAutoSave) {
      saveToStorage(autoSaveKey, {
        currentStep,
        completedSteps,
        stepData,
        lastSaved: new Date().toISOString(),
      });
    }
  }, [currentStep, completedSteps, stepData, enableAutoSave, autoSaveKey]);

  // Get current step index
  const currentStepIndex = useMemo(
    () => steps.indexOf(currentStep),
    [currentStep, steps]
  );

  // Check if can proceed
  const canProceed = useMemo(() => {
    return validationErrors.length === 0 && !isValidating;
  }, [validationErrors, isValidating]);

  // Validate current step
  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    if (!validateStep) return true;

    setIsValidating(true);
    setValidationErrors([]);

    try {
      const result = await validateStep(currentStep);

      if (!result.isValid && result.errors) {
        setValidationErrors(result.errors);
        toast.error('Please fix validation errors');
        return false;
      }

      return result.isValid;
    } catch (error) {
      console.error('Error validating step:', error);
      toast.error('Validation failed');
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [currentStep, validateStep]);

  // Go to next step
  const goToNext = useCallback(async () => {
    if (isTransitioning || isValidating) return;

    // Validate current step
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    // Mark step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }

    // Get next step
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setIsTransitioning(true);
      const nextStep = steps[nextIndex];
      setCurrentStep(nextStep);
      setValidationErrors([]);
      
      if (onStepChange) {
        onStepChange(nextStep);
      }

      setTimeout(() => setIsTransitioning(false), 300);
    } else if (onComplete) {
      // Checkout completed
      onComplete();
      if (enableAutoSave) {
        clearStorage(autoSaveKey);
      }
    }
  }, [
    currentStep,
    currentStepIndex,
    steps,
    completedSteps,
    isTransitioning,
    isValidating,
    validateCurrentStep,
    onStepChange,
    onComplete,
    enableAutoSave,
    autoSaveKey,
  ]);

  // Go to previous step
  const goToPrevious = useCallback(() => {
    if (isTransitioning || currentStepIndex === 0) return;

    setIsTransitioning(true);
    const prevIndex = currentStepIndex - 1;
    const prevStep = steps[prevIndex];
    setCurrentStep(prevStep);
    setValidationErrors([]);

    if (onStepChange) {
      onStepChange(prevStep);
    }

    setTimeout(() => setIsTransitioning(false), 300);
  }, [currentStepIndex, steps, isTransitioning, onStepChange]);

  // Go to specific step
  const goToStep = useCallback(
    (step: CheckoutStep) => {
      if (isTransitioning) return;

      const targetIndex = steps.indexOf(step);
      if (targetIndex === -1) return;

      // Only allow going back to completed steps
      if (allowBackNavigation && targetIndex < currentStepIndex) {
        setIsTransitioning(true);
        setCurrentStep(step);
        setValidationErrors([]);

        if (onStepChange) {
          onStepChange(step);
        }

        setTimeout(() => setIsTransitioning(false), 300);
      }
    },
    [steps, currentStepIndex, isTransitioning, allowBackNavigation, onStepChange]
  );

  // Complete current step
  const completeStep = useCallback(() => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }
  }, [currentStep, completedSteps]);

  // Save step data
  const saveData = useCallback((data: unknown) => {
    setStepData((prev) => ({
      ...prev,
      [currentStep]: data,
    }));
  }, [currentStep]);

  // Get step data
  const getData = useCallback(() => {
    return stepData[currentStep] || null;
  }, [currentStep, stepData]);

  // Step helpers
  const stepHelpers: StepHelpers = useMemo(
    () => ({
      goToNext,
      goToPrevious,
      goToStep,
      completeStep,
      setErrors: setValidationErrors,
      clearErrors: () => setValidationErrors([]),
      saveData,
      getData,
    }),
    [goToNext, goToPrevious, goToStep, completeStep, saveData, getData]
  );

  // Handle save and exit
  const handleSaveAndExit = useCallback(() => {
    if (onSaveAndExit) {
      onSaveAndExit();
    } else {
      toast.success('Progress saved');
    }
  }, [onSaveAndExit]);

  return (
    <div className={cn('flex flex-col min-h-screen', className)}>
      {/* Progress Indicator */}
      {showProgress && (
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <CheckoutProgress
              currentStep={currentStep}
              steps={steps}
              completedSteps={completedSteps}
              onStepClick={allowBackNavigation ? goToStep : undefined}
              allowBackNavigation={allowBackNavigation}
              showLabels={true}
              showEstimatedTime={false}
            />
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="flex-1 bg-gray-50 px-4 sm:px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep(currentStep, stepHelpers)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Controls */}
      <CheckoutNavigation
        currentStep={currentStep}
        steps={steps}
        onPrevious={allowBackNavigation ? goToPrevious : undefined}
        onNext={goToNext}
        onSaveAndExit={showSaveButton ? handleSaveAndExit : undefined}
        validationErrors={validationErrors}
        canProceed={canProceed}
        isLoading={isValidating || isTransitioning}
        showSaveButton={showSaveButton}
      />
    </div>
  );
};

export default CheckoutStepper;