/**
 * Cart Progress Indicator Component - Vardhman Mills Frontend
 * 
 * Visual cart progress with:
 * - Free shipping progress bar
 * - Checkout steps indicator
 * - Cart completion percentage
 * - Milestone rewards
 * - Gamification elements
 * 
 * @component
 */

'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TruckIcon,
  GiftIcon,
  SparklesIcon,
  CheckCircleIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ProgressMilestone {
  id: string;
  threshold: number;
  title: string;
  description: string;
  icon: React.ElementType;
  reward?: string;
  color: string;
}

export interface CheckoutStep {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'upcoming';
  icon?: React.ElementType;
}

export interface CartProgressProps {
  /**
   * Current cart total
   */
  cartTotal: number;

  /**
   * Free shipping threshold
   * @default 500
   */
  freeShippingThreshold?: number;

  /**
   * Progress milestones
   */
  milestones?: ProgressMilestone[];

  /**
   * Checkout steps
   */
  checkoutSteps?: CheckoutStep[];

  /**
   * Current step index
   */
  currentStepIndex?: number;

  /**
   * Show progress bar
   * @default true
   */
  showProgressBar?: boolean;

  /**
   * Show milestones
   * @default true
   */
  showMilestones?: boolean;

  /**
   * Show checkout steps
   * @default false
   */
  showCheckoutSteps?: boolean;

  /**
   * Variant
   * @default 'default'
   */
  variant?: 'default' | 'minimal' | 'detailed';

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// DEFAULT MILESTONES
// ============================================================================

const DEFAULT_MILESTONES: ProgressMilestone[] = [
  {
    id: 'starter',
    threshold: 250,
    title: 'Starter Reward',
    description: 'Unlock 5% off',
    icon: SparklesIcon,
    reward: '5% discount',
    color: 'text-blue-600',
  },
  {
    id: 'free-shipping',
    threshold: 500,
    title: 'Free Shipping',
    description: 'No delivery charges',
    icon: TruckIcon,
    reward: 'Free shipping',
    color: 'text-green-600',
  },
  {
    id: 'gift',
    threshold: 1000,
    title: 'Free Gift',
    description: 'Surprise gift included',
    icon: GiftIcon,
    reward: 'Mystery gift',
    color: 'text-purple-600',
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CartProgress: React.FC<CartProgressProps> = ({
  cartTotal,
  freeShippingThreshold = 500,
  milestones = DEFAULT_MILESTONES,
  checkoutSteps = [],
  currentStepIndex = 0,
  showProgressBar = true,
  showMilestones = true,
  showCheckoutSteps = false,
  variant = 'default',
  className,
}) => {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const progressPercentage = useMemo(() => {
    return Math.min(100, (cartTotal / freeShippingThreshold) * 100);
  }, [cartTotal, freeShippingThreshold]);

  const amountRemaining = useMemo(() => {
    return Math.max(0, freeShippingThreshold - cartTotal);
  }, [cartTotal, freeShippingThreshold]);

  const hasReachedFreeShipping = cartTotal >= freeShippingThreshold;

  const currentMilestones = useMemo(() => {
    return milestones.map((milestone) => ({
      ...milestone,
      isReached: cartTotal >= milestone.threshold,
      isCurrent:
        cartTotal < milestone.threshold &&
        !milestones.find((m) => m.threshold < milestone.threshold && cartTotal < m.threshold),
    }));
  }, [milestones, cartTotal]);

  const nextMilestone = useMemo(() => {
    return currentMilestones.find((m) => !m.isReached);
  }, [currentMilestones]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderProgressBar = () => (
    <div className="space-y-2">
      {/* Progress Message */}
      <div className="flex items-center justify-between text-sm">
        {hasReachedFreeShipping ? (
          <div className="flex items-center gap-2 text-green-600 font-medium">
            <CheckCircleIcon className="h-5 w-5" />
            <span>You&apos;ve unlocked free shipping!</span>
          </div>
        ) : (
          <span className="text-gray-700">
            Add <strong>{formatCurrency(amountRemaining, 'INR')}</strong> more for free shipping
          </span>
        )}
        <span className="text-gray-500 font-medium">{Math.round(progressPercentage)}%</span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cn(
            'h-full rounded-full',
            hasReachedFreeShipping
              ? 'bg-gradient-to-r from-green-500 to-green-600'
              : 'bg-gradient-to-r from-blue-500 to-purple-600'
          )}
        />
        
        {/* Animated shine effect */}
        {!hasReachedFreeShipping && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: 'linear',
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        )}
      </div>
    </div>
  );

  const renderMilestones = () => (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-900">Rewards & Milestones</h4>
      <div className="space-y-2">
        {currentMilestones.map((milestone, index) => {
          const Icon = milestone.icon;
          const isLast = index === currentMilestones.length - 1;

          return (
            <div key={milestone.id} className="relative">
              <div
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border-2 transition-all',
                  milestone.isReached
                    ? 'bg-green-50 border-green-200'
                    : milestone.isCurrent
                    ? 'bg-blue-50 border-blue-300 shadow-sm'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                )}
              >
                <div
                  className={cn(
                    'flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full',
                    milestone.isReached
                      ? 'bg-green-100'
                      : milestone.isCurrent
                      ? 'bg-blue-100'
                      : 'bg-gray-100'
                  )}
                >
                  {milestone.isReached ? (
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  ) : milestone.isCurrent ? (
                    <Icon className={cn('h-6 w-6', milestone.color)} />
                  ) : (
                    <LockClosedIcon className="h-6 w-6 text-gray-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-medium text-gray-900">{milestone.title}</h5>
                    {milestone.isReached && (
                      <Badge variant="success" size="sm">
                        Unlocked
                      </Badge>
                    )}
                    {milestone.isCurrent && (
                      <Badge variant="default" size="sm">
                        Next Goal
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{milestone.description}</p>
                  {!milestone.isReached && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatCurrency(milestone.threshold - cartTotal, 'INR')} away
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {formatCurrency(milestone.threshold, 'INR')}
                  </p>
                  {milestone.reward && (
                    <p className="text-xs text-gray-600 mt-1">{milestone.reward}</p>
                  )}
                </div>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="absolute left-8 top-full h-2 w-0.5 bg-gray-300 transform -translate-x-1/2" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderCheckoutSteps = () => {
    if (checkoutSteps.length === 0) return null;

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900">Checkout Progress</h4>
        <div className="relative">
          {/* Progress line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(currentStepIndex / (checkoutSteps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="absolute left-4 top-0 w-0.5 bg-primary"
          />

          {/* Steps */}
          <div className="relative space-y-4">
            {checkoutSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = step.status === 'completed';
              const isCurrent = step.status === 'current';

              return (
                <div key={step.id} className="flex items-center gap-3">
                  <div
                    className={cn(
                      'relative z-10 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border-2',
                      isCompleted
                        ? 'bg-primary border-primary'
                        : isCurrent
                        ? 'bg-white border-primary'
                        : 'bg-white border-gray-300'
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircleIcon className="h-5 w-5 text-white" />
                    ) : StepIcon ? (
                      <StepIcon
                        className={cn(
                          'h-4 w-4',
                          isCurrent ? 'text-primary' : 'text-gray-400'
                        )}
                      />
                    ) : (
                      <span
                        className={cn(
                          'text-sm font-medium',
                          isCurrent ? 'text-primary' : 'text-gray-400'
                        )}
                      >
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-sm',
                      isCompleted || isCurrent
                        ? 'text-gray-900 font-medium'
                        : 'text-gray-500'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (variant === 'minimal') {
    return (
      <div className={cn('space-y-2', className)}>
        {showProgressBar && renderProgressBar()}
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {showProgressBar && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          {renderProgressBar()}
        </div>
      )}

      {showMilestones && nextMilestone && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-4">
          <div className="flex items-center gap-3">
            <SparklesIcon className="h-8 w-8 text-purple-600" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">
                Almost there! {nextMilestone.title}
              </h4>
              <p className="text-sm text-gray-700">
                Add {formatCurrency(nextMilestone.threshold - cartTotal, 'INR')} more to unlock{' '}
                <strong>{nextMilestone.reward}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {showMilestones && variant === 'detailed' && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          {renderMilestones()}
        </div>
      )}

      {showCheckoutSteps && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          {renderCheckoutSteps()}
        </div>
      )}
    </div>
  );
};

export default CartProgress;
