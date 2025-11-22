'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ScaleIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CompareEmptyStateProps {
  /**
   * Variant of empty state
   */
  variant?: 'default' | 'minimal' | 'detailed';

  /**
   * Title text
   */
  title?: string;

  /**
   * Description text
   */
  description?: string;

  /**
   * Show suggestions
   */
  showSuggestions?: boolean;

  /**
   * Custom suggestions
   */
  suggestions?: string[];

  /**
   * Show browse products button
   */
  showBrowseButton?: boolean;

  /**
   * Browse button text
   */
  browseButtonText?: string;

  /**
   * Show help text
   */
  showHelpText?: boolean;

  /**
   * Help text content
   */
  helpText?: string;

  /**
   * Callback when browse products is clicked
   */
  onBrowseProducts?: () => void;

  /**
   * Callback when suggestion is clicked
   */
  onSuggestionClick?: (suggestion: string) => void;

  /**
   * Enable animations
   */
  animated?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// DEFAULT DATA
// ============================================================================

const DEFAULT_SUGGESTIONS = [
  'Compare fabric quality and durability',
  'Compare prices across different brands',
  'Compare thread count and GSM',
  'Compare color options and patterns',
  'Compare customer ratings and reviews',
];

const DEFAULT_FEATURES = [
  'Side-by-side comparison of up to 4 products',
  'Detailed specifications analysis',
  'Price and value comparison',
  'Customer ratings and reviews',
  'Easy sharing with friends and family',
];

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

const iconVariants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: 'reverse' as const,
    },
  },
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Feature item
 */
interface FeatureItemProps {
  feature: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ feature }) => {
  return (
    <motion.div
      variants={itemVariants}
      className="flex items-start gap-3"
    >
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
        <CheckCircleIcon className="h-4 w-4 text-primary-600" />
      </div>
      <p className="text-sm text-gray-700">{feature}</p>
    </motion.div>
  );
};

/**
 * Suggestion chip
 */
interface SuggestionChipProps {
  suggestion: string;
  onClick?: () => void;
}

const SuggestionChip: React.FC<SuggestionChipProps> = ({ suggestion, onClick }) => {
  return (
    <motion.button
      variants={itemVariants}
      onClick={onClick}
      className={cn(
        'px-4 py-2 bg-gray-100 hover:bg-primary-50 rounded-full',
        'text-sm text-gray-700 hover:text-primary-700',
        'transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
      )}
    >
      {suggestion}
    </motion.button>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * CompareEmptyState Component
 * 
 * Empty state display when no products are selected for comparison.
 * Features:
 * - Multiple variants (default, minimal, detailed)
 * - Customizable title and description
 * - Helpful suggestions
 * - Feature highlights
 * - Browse products CTA
 * - Animated elements
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <CompareEmptyState
 *   variant="detailed"
 *   showSuggestions={true}
 *   onBrowseProducts={handleBrowse}
 *   onSuggestionClick={handleSuggestion}
 * />
 * ```
 */
export const CompareEmptyState: React.FC<CompareEmptyStateProps> = ({
  variant = 'default',
  title = 'No Products to Compare',
  description = 'Start adding products to compare their features, specifications, and prices side by side.',
  showSuggestions = true,
  suggestions = DEFAULT_SUGGESTIONS,
  showBrowseButton = true,
  browseButtonText = 'Browse Products',
  showHelpText = true,
  helpText = 'Add products by clicking the "Compare" button on any product card.',
  onBrowseProducts,
  onSuggestionClick,
  animated = true,
  className,
}) => {
  // Minimal variant
  if (variant === 'minimal') {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
        <motion.div
          initial={animated ? { scale: 0, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <ScaleIcon className="h-10 w-10 text-gray-400" />
          </div>
        </motion.div>

        <motion.h3
          initial={animated ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg font-semibold text-gray-900 mb-2 text-center"
        >
          {title}
        </motion.h3>

        <motion.p
          initial={animated ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-gray-600 text-center max-w-md mb-6"
        >
          {description}
        </motion.p>

        {showBrowseButton && onBrowseProducts && (
          <motion.div
            initial={animated ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button onClick={onBrowseProducts}>
              <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
              {browseButtonText}
            </Button>
          </motion.div>
        )}
      </div>
    );
  }

  // Detailed variant
  if (variant === 'detailed') {
    return (
      <div className={cn('py-12 px-4', className)}>
        <Card>
          <CardContent className="p-8">
            <motion.div
              initial={animated ? 'hidden' : 'visible'}
              animate="visible"
              variants={containerVariants}
              className="max-w-4xl mx-auto"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  variants={iconVariants}
                  initial="initial"
                  animate="animate"
                  className="inline-block mb-4"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-50 rounded-full flex items-center justify-center">
                    <ScaleIcon className="h-12 w-12 text-primary-600" />
                  </div>
                </motion.div>

                <motion.h2
                  variants={itemVariants}
                  className="text-2xl font-bold text-gray-900 mb-3"
                >
                  {title}
                </motion.h2>

                <motion.p
                  variants={itemVariants}
                  className="text-gray-600 max-w-2xl mx-auto"
                >
                  {description}
                </motion.p>
              </div>

              {/* Features */}
              <div className="mb-8">
                <motion.h3
                  variants={itemVariants}
                  className="text-lg font-semibold text-gray-900 mb-4 text-center"
                >
                  <SparklesIcon className="inline h-5 w-5 text-yellow-500 mr-2" />
                  Comparison Features
                </motion.h3>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {DEFAULT_FEATURES.map((feature, index) => (
                    <FeatureItem key={index} feature={feature} />
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="mb-8">
                  <motion.h3
                    variants={itemVariants}
                    className="text-sm font-medium text-gray-700 mb-3 text-center"
                  >
                    What you can compare:
                  </motion.h3>

                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestions.map((suggestion, index) => (
                      <SuggestionChip
                        key={index}
                        suggestion={suggestion}
                        onClick={() => onSuggestionClick?.(suggestion)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <motion.div
                variants={itemVariants}
                className="text-center"
              >
                {showBrowseButton && onBrowseProducts && (
                  <Button size="lg" onClick={onBrowseProducts}>
                    <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                    {browseButtonText}
                    <ArrowRightIcon className="h-5 w-5 ml-2" />
                  </Button>
                )}

                {showHelpText && (
                  <p className="text-xs text-gray-500 mt-4">{helpText}</p>
                )}
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4', className)}>
      <motion.div
        initial={animated ? { scale: 0, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="text-center"
      >
        {/* Icon */}
        <motion.div
          variants={iconVariants}
          initial="initial"
          animate="animate"
          className="inline-block mb-6"
        >
          <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-50 rounded-full flex items-center justify-center">
            <ScaleIcon className="h-16 w-16 text-primary-600" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={animated ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-gray-900 mb-3"
        >
          {title}
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={animated ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 max-w-md mx-auto mb-8"
        >
          {description}
        </motion.p>

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={animated ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <p className="text-sm font-medium text-gray-700 mb-3">
              You can compare:
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
              {suggestions.slice(0, 5).map((suggestion, index) => (
                <SuggestionChip
                  key={index}
                  suggestion={suggestion}
                  onClick={() => onSuggestionClick?.(suggestion)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={animated ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {showBrowseButton && onBrowseProducts && (
            <Button size="lg" onClick={onBrowseProducts}>
              <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
              {browseButtonText}
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Button>
          )}

          {showHelpText && (
            <p className="text-sm text-gray-500 mt-4">{helpText}</p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CompareEmptyState;