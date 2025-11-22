'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  TagIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ShoppingBagIcon,
  SparklesIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

/**
 * Empty State Type
 * Defines different scenarios for empty states
 */
type EmptyStateType =
  | 'no-sales' // No sales exist at all
  | 'no-active' // No currently active sales
  | 'no-results' // Search returned no results
  | 'filter-empty' // Applied filters returned no results
  | 'expired' // All sales have expired
  | 'upcoming' // Only upcoming sales (none active)
  | 'error' // Error loading sales
  | 'loading-error'; // Loading failed

/**
 * SaleEmptyState Component Props
 */
interface SaleEmptyStateProps {
  /**
   * Type of empty state to display
   */
  type?: EmptyStateType;

  /**
   * Display variant
   * - default: Card with illustration
   * - compact: Smaller inline version
   * - minimal: Text only
   * - centered: Full-screen centered layout
   * - inline: Inline message
   */
  variant?: 'default' | 'compact' | 'minimal' | 'centered' | 'inline';

  /**
   * Custom title (overrides default)
   */
  title?: string;

  /**
   * Custom description (overrides default)
   */
  description?: string;

  /**
   * Custom icon (overrides default)
   */
  icon?: React.ReactNode;

  /**
   * Show action buttons
   */
  showActions?: boolean;

  /**
   * Primary action button config
   */
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  };

  /**
   * Secondary action button config
   */
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  };

  /**
   * Applied filters (for filter-empty type)
   */
  appliedFilters?: string[];

  /**
   * Search query (for no-results type)
   */
  searchQuery?: string;

  /**
   * Enable animations
   */
  animated?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Empty State Configuration
 * Defines content for each empty state type
 */
interface EmptyStateConfig {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  iconColor: string;
  iconBgColor: string;
  suggestions?: string[];
}

/**
 * Get Empty State Configuration
 * Returns configuration based on type
 */
const getEmptyStateConfig = (
  type: EmptyStateType,
  searchQuery?: string,
  appliedFilters?: string[]
): EmptyStateConfig => {
  const configs: Record<EmptyStateType, EmptyStateConfig> = {
    'no-sales': {
      icon: TagIcon,
      title: 'No Sales Available',
      description:
        'There are currently no sales or promotions available. Check back later for exciting deals!',
      iconColor: 'text-gray-400',
      iconBgColor: 'bg-gray-100',
      suggestions: [
        'Browse our regular product catalog',
        'Sign up for sale notifications',
        'Check back during holiday seasons',
      ],
    },
    'no-active': {
      icon: ClockIcon,
      title: 'No Active Sales',
      description:
        'There are no active sales at the moment. Stay tuned for upcoming promotions!',
      iconColor: 'text-blue-400',
      iconBgColor: 'bg-blue-50',
      suggestions: [
        'View upcoming sales',
        'Enable sale notifications',
        'Shop regular priced items',
      ],
    },
    'no-results': {
      icon: MagnifyingGlassIcon,
      title: searchQuery ? `No results for "${searchQuery}"` : 'No Sales Found',
      description: searchQuery
        ? `We couldn't find any sales matching "${searchQuery}". Try different keywords or check your spelling.`
        : 'Your search didn\'t return any results. Try adjusting your search terms.',
      iconColor: 'text-primary-400',
      iconBgColor: 'bg-primary-50',
      suggestions: [
        'Try different keywords',
        'Check your spelling',
        'Use more general terms',
        'Browse all sales',
      ],
    },
    'filter-empty': {
      icon: FunnelIcon,
      title: 'No Matching Sales',
      description: appliedFilters && appliedFilters.length > 0
        ? `No sales match your current filters: ${appliedFilters.join(', ')}. Try removing some filters.`
        : 'No sales match your current filters. Try adjusting your filter criteria.',
      iconColor: 'text-orange-400',
      iconBgColor: 'bg-orange-50',
      suggestions: [
        'Remove some filters',
        'Try different filter combinations',
        'Clear all filters',
        'Browse all sales',
      ],
    },
    expired: {
      icon: TagIcon,
      title: 'All Sales Ended',
      description:
        'All current sales have expired. New promotions are coming soon!',
      iconColor: 'text-red-400',
      iconBgColor: 'bg-red-50',
      suggestions: [
        'Check upcoming sales',
        'Enable sale notifications',
        'Browse regular products',
      ],
    },
    upcoming: {
      icon: SparklesIcon,
      title: 'Upcoming Sales',
      description:
        'No sales are active right now, but we have exciting promotions coming soon!',
      iconColor: 'text-green-400',
      iconBgColor: 'bg-green-50',
      suggestions: [
        'View upcoming sale schedule',
        'Set sale reminders',
        'Shop pre-sale items',
      ],
    },
    error: {
      icon: ExclamationTriangleIcon,
      title: 'Unable to Load Sales',
      description:
        'We encountered an error while loading sales. Please try again.',
      iconColor: 'text-red-500',
      iconBgColor: 'bg-red-50',
      suggestions: [
        'Refresh the page',
        'Check your internet connection',
        'Try again later',
      ],
    },
    'loading-error': {
      icon: ArrowPathIcon,
      title: 'Loading Failed',
      description:
        'Failed to load sales data. Please check your connection and try again.',
      iconColor: 'text-red-500',
      iconBgColor: 'bg-red-50',
      suggestions: [
        'Retry loading',
        'Check internet connection',
        'Clear browser cache',
      ],
    },
  };

  return configs[type];
};

/**
 * SaleEmptyState Component
 * 
 * Comprehensive empty state component for sales with multiple types and variants.
 * Features:
 * - 8 empty state types (no-sales, no-active, no-results, filter-empty, expired, upcoming, error, loading-error)
 * - 5 display variants (default, compact, minimal, centered, inline)
 * - Contextual messages and suggestions
 * - Animated illustrations
 * - Action buttons
 * - Filter/search context display
 * 
 * @example
 * ```tsx
 * <SaleEmptyState
 *   type="no-results"
 *   variant="centered"
 *   searchQuery="winter jackets"
 *   primaryAction={{
 *     label: 'Browse All Sales',
 *     onClick: () => router.push('/sales')
 *   }}
 * />
 * ```
 */
const SaleEmptyState: React.FC<SaleEmptyStateProps> = ({
  type = 'no-sales',
  variant = 'default',
  title: customTitle,
  description: customDescription,
  icon: customIcon,
  showActions = true,
  primaryAction,
  secondaryAction,
  appliedFilters,
  searchQuery,
  animated = true,
  className,
}) => {
  const config = getEmptyStateConfig(type, searchQuery, appliedFilters);
  const IconComponent = customIcon ? null : config.icon;

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' as const },
    },
  };

  const iconVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' as const, delay: 0.1 },
    },
    float: {
      y: [-5, 5, -5],
      transition: {
        duration: 3,
        repeat: Infinity as number,
        ease: 'easeInOut' as const,
      },
    },
  };

  const suggestionsVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const suggestionItemVariants = {
    initial: { opacity: 0, x: -10 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' as const },
    },
  };

  // Render inline variant
  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-3 py-4', className)}>
        {IconComponent && (
          <IconComponent className={cn('h-5 w-5', config.iconColor)} />
        )}
        {customIcon && customIcon}
        <div>
          <p className="text-sm font-medium text-gray-900">
            {customTitle || config.title}
          </p>
          <p className="text-xs text-gray-500">
            {customDescription || config.description}
          </p>
        </div>
      </div>
    );
  }

  // Render minimal variant
  if (variant === 'minimal') {
    return (
      <div className={cn('py-8 text-center', className)}>
        {IconComponent && (
          <IconComponent
            className={cn('mx-auto h-8 w-8 mb-3', config.iconColor)}
          />
        )}
        {customIcon && <div className="mb-3 flex justify-center">{customIcon}</div>}
        <p className="text-sm font-medium text-gray-900">
          {customTitle || config.title}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {customDescription || config.description}
        </p>
      </div>
    );
  }

  // Render compact variant
  if (variant === 'compact') {
    const CompactContainer = animated ? motion.div : 'div';
    const compactProps = animated
      ? {
          variants: containerVariants,
          initial: 'initial',
          animate: 'animate',
        }
      : {};

    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-6">
          <CompactContainer {...compactProps} className="text-center">
            <div
              className={cn(
                'mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-4',
                config.iconBgColor
              )}
            >
              {IconComponent && (
                <IconComponent className={cn('h-8 w-8', config.iconColor)} />
              )}
              {customIcon && customIcon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {customTitle || config.title}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {customDescription || config.description}
            </p>

            {/* Action buttons */}
            {showActions && (primaryAction || secondaryAction) && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {primaryAction && (
                  <Button
                    onClick={primaryAction.onClick}
                    leftIcon={primaryAction.icon ? <primaryAction.icon className="h-4 w-4" /> : undefined}
                    size="sm"
                  >
                    {primaryAction.label}
                  </Button>
                )}
                {secondaryAction && (
                  <Button
                    onClick={secondaryAction.onClick}
                    variant="outline"
                    leftIcon={secondaryAction.icon ? <secondaryAction.icon className="h-4 w-4" /> : undefined}
                    size="sm"
                  >
                    {secondaryAction.label}
                  </Button>
                )}
              </div>
            )}
          </CompactContainer>
        </CardContent>
      </Card>
    );
  }

  // Render centered variant (full-screen)
  if (variant === 'centered') {
    const CenteredContainer = animated ? motion.div : 'div';
    const CenteredIcon = animated ? motion.div : 'div';
    const CenteredSuggestions = animated ? motion.ul : 'ul';
    const CenteredSuggestionItem = animated ? motion.li : 'li';

    const centeredContainerProps = animated
      ? {
          variants: containerVariants,
          initial: 'initial',
          animate: 'animate',
        }
      : {};

    const centeredIconProps = animated
      ? {
          variants: iconVariants,
          initial: 'initial',
          animate: ['animate', 'float'],
        }
      : {};

    const centeredSuggestionsProps = animated
      ? {
          variants: suggestionsVariants,
          initial: 'initial',
          animate: 'animate',
        }
      : {};

    const centeredSuggestionItemProps = animated
      ? {
          variants: suggestionItemVariants,
        }
      : {};

    return (
      <div
        className={cn(
          'flex min-h-[400px] md:min-h-[500px] items-center justify-center px-4',
          className
        )}
      >
        <CenteredContainer
          {...centeredContainerProps}
          className="max-w-md text-center"
        >
          {/* Icon */}
          <CenteredIcon
            {...centeredIconProps}
            className={cn(
              'mx-auto flex h-24 w-24 items-center justify-center rounded-full mb-6',
              config.iconBgColor
            )}
          >
            {IconComponent && (
              <IconComponent className={cn('h-12 w-12', config.iconColor)} />
            )}
            {customIcon && customIcon}
          </CenteredIcon>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            {customTitle || config.title}
          </h2>

          {/* Description */}
          <p className="text-base text-gray-600 mb-6">
            {customDescription || config.description}
          </p>

          {/* Applied filters/search query display */}
          {type === 'filter-empty' && appliedFilters && appliedFilters.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Active Filters:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {appliedFilters.map((filter, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                  >
                    {filter}
                  </span>
                ))}
              </div>
            </div>
          )}

          {type === 'no-results' && searchQuery && (
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Searched for:{' '}
                <span className="font-semibold text-gray-900">
                  &ldquo;{searchQuery}&rdquo;
                </span>
              </p>
            </div>
          )}

          {/* Suggestions */}
          {config.suggestions && config.suggestions.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Suggestions:
              </p>
              <CenteredSuggestions
                {...centeredSuggestionsProps}
                className="space-y-2 text-left"
              >
                {config.suggestions.map((suggestion, index) => (
                  <CenteredSuggestionItem
                    key={index}
                    {...centeredSuggestionItemProps}
                    className="flex items-start gap-2"
                  >
                    <ShoppingBagIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{suggestion}</span>
                  </CenteredSuggestionItem>
                ))}
              </CenteredSuggestions>
            </div>
          )}

          {/* Action buttons */}
          {showActions && (primaryAction || secondaryAction) && (
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              {primaryAction && (
                <Button
                  onClick={primaryAction.onClick}
                  leftIcon={primaryAction.icon ? <primaryAction.icon className="h-5 w-5" /> : undefined}
                  size="lg"
                >
                  {primaryAction.label}
                </Button>
              )}
              {secondaryAction && (
                <Button
                  onClick={secondaryAction.onClick}
                  variant="outline"
                  leftIcon={secondaryAction.icon ? <secondaryAction.icon className="h-5 w-5" /> : undefined}
                  size="lg"
                >
                  {secondaryAction.label}
                </Button>
              )}
            </div>
          )}
        </CenteredContainer>
      </div>
    );
  }

  // Render default variant (Card)
  const DefaultContainer = animated ? motion.div : 'div';
  const DefaultIcon = animated ? motion.div : 'div';
  const DefaultSuggestions = animated ? motion.ul : 'ul';
  const DefaultSuggestionItem = animated ? motion.li : 'li';

  const defaultContainerProps = animated
    ? {
        variants: containerVariants,
        initial: 'initial',
        animate: 'animate',
      }
    : {};

  const defaultIconProps = animated
    ? {
        variants: iconVariants,
        initial: 'initial',
        animate: ['animate', 'float'],
      }
    : {};

  const defaultSuggestionsProps = animated
    ? {
        variants: suggestionsVariants,
        initial: 'initial',
        animate: 'animate',
      }
    : {};

  const defaultSuggestionItemProps = animated
    ? {
        variants: suggestionItemVariants,
      }
    : {};

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-8 md:p-12">
        <DefaultContainer {...defaultContainerProps} className="text-center">
          {/* Icon */}
          <DefaultIcon
            {...defaultIconProps}
            className={cn(
              'mx-auto flex h-20 w-20 items-center justify-center rounded-full mb-5',
              config.iconBgColor
            )}
          >
            {IconComponent && (
              <IconComponent className={cn('h-10 w-10', config.iconColor)} />
            )}
            {customIcon && customIcon}
          </DefaultIcon>

          {/* Title */}
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
            {customTitle || config.title}
          </h3>

          {/* Description */}
          <p className="text-sm md:text-base text-gray-600 mb-6 max-w-md mx-auto">
            {customDescription || config.description}
          </p>

          {/* Applied filters/search query display */}
          {type === 'filter-empty' && appliedFilters && appliedFilters.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Active Filters:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {appliedFilters.map((filter, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                  >
                    {filter}
                  </span>
                ))}
              </div>
            </div>
          )}

          {type === 'no-results' && searchQuery && (
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Searched for:{' '}
                <span className="font-semibold text-gray-900">
                  &ldquo;{searchQuery}&rdquo;
                </span>
              </p>
            </div>
          )}

          {/* Suggestions */}
          {config.suggestions && config.suggestions.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">
                You can try:
              </p>
              <DefaultSuggestions
                {...defaultSuggestionsProps}
                className="space-y-2 max-w-sm mx-auto"
              >
                {config.suggestions.map((suggestion, index) => (
                  <DefaultSuggestionItem
                    key={index}
                    {...defaultSuggestionItemProps}
                    className="flex items-start gap-2 text-left"
                  >
                    <ShoppingBagIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{suggestion}</span>
                  </DefaultSuggestionItem>
                ))}
              </DefaultSuggestions>
            </div>
          )}

          {/* Action buttons */}
          {showActions && (primaryAction || secondaryAction) && (
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              {primaryAction && (
                <Button
                  onClick={primaryAction.onClick}
                  leftIcon={primaryAction.icon ? <primaryAction.icon className="h-5 w-5" /> : undefined}
                >
                  {primaryAction.label}
                </Button>
              )}
              {secondaryAction && (
                <Button
                  onClick={secondaryAction.onClick}
                  variant="outline"
                  leftIcon={secondaryAction.icon ? <secondaryAction.icon className="h-5 w-5" /> : undefined}
                >
                  {secondaryAction.label}
                </Button>
              )}
            </div>
          )}
        </DefaultContainer>
      </CardContent>
    </Card>
  );
};

export default SaleEmptyState;
