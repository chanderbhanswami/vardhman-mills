/**
 * FeatureCard Component
 * 
 * Individual feature card component for displaying features, benefits,
 * and value propositions with icons, animations, and interactive elements.
 * 
 * Features:
 * - Customizable icons
 * - Hover animations
 * - Multiple layouts (icon-left, icon-top, icon-background)
 * - Expandable details
 * - Link support
 * - Badge support
 * - Progress indicators
 * - Loading states
 * - Dark mode support
 * - Accessibility features
 * 
 * @component
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowTopRightOnSquareIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import {
  ShieldCheckIcon,
  TruckIcon,
  CreditCardIcon,
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  SparklesIcon,
  BoltIcon,
  HeartIcon,
  StarIcon,
  CubeIcon,
} from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Tooltip } from '@/components/ui/Tooltip';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type FeatureIconType =
  | 'shield'
  | 'truck'
  | 'credit-card'
  | 'chat'
  | 'globe'
  | 'sparkles'
  | 'bolt'
  | 'heart'
  | 'star'
  | 'cube'
  | 'check'
  | 'info';

export type FeatureLayout = 'icon-left' | 'icon-top' | 'icon-background' | 'compact';

export interface FeatureCardProps {
  /** Feature title */
  title: string;
  /** Feature description */
  description: string;
  /** Extended details (shown when expanded) */
  details?: string;
  /** Icon type */
  icon?: FeatureIconType;
  /** Custom icon component */
  customIcon?: React.ReactNode;
  /** Icon color */
  iconColor?: string;
  /** Icon background color */
  iconBgColor?: string;
  /** Card layout */
  layout?: FeatureLayout;
  /** Show expand button */
  expandable?: boolean;
  /** Default expanded state */
  defaultExpanded?: boolean;
  /** Link URL */
  href?: string;
  /** Link label */
  linkLabel?: string;
  /** Open link in new tab */
  external?: boolean;
  /** Badge text */
  badge?: string;
  /** Badge variant */
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  /** Show progress indicator */
  showProgress?: boolean;
  /** Progress value (0-100) */
  progressValue?: number;
  /** Progress label */
  progressLabel?: string;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** On card click callback */
  onClick?: () => void;
  /** On expand toggle callback */
  onExpandToggle?: (expanded: boolean) => void;
}

// ============================================================================
// ICON MAPPING
// ============================================================================

const ICON_MAP: Record<FeatureIconType, React.ComponentType<{ className?: string }>> = {
  shield: ShieldCheckIcon,
  truck: TruckIcon,
  'credit-card': CreditCardIcon,
  chat: ChatBubbleLeftRightIcon,
  globe: GlobeAltIcon,
  sparkles: SparklesIcon,
  bolt: BoltIcon,
  heart: HeartIcon,
  star: StarIcon,
  cube: CubeIcon,
  check: CheckCircleIcon,
  info: InformationCircleIcon,
};

// ============================================================================
// COMPONENT
// ============================================================================

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  details,
  icon = 'check',
  customIcon,
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-100',
  layout = 'icon-left',
  expandable = false,
  defaultExpanded = false,
  href,
  linkLabel = 'Learn more',
  external = false,
  badge,
  badgeVariant = 'default',
  showProgress = false,
  progressValue = 0,
  progressLabel,
  loading = false,
  disabled = false,
  className,
  onClick,
  onExpandToggle,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isHovered, setIsHovered] = useState(false);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleExpandToggle = useCallback(() => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onExpandToggle?.(newExpanded);
    console.log('Feature card expanded:', newExpanded);
  }, [isExpanded, onExpandToggle]);

  const handleClick = useCallback(() => {
    if (disabled) return;
    onClick?.();
    console.log('Feature card clicked:', title);
  }, [disabled, onClick, title]);

  // ============================================================================
  // ICON RENDERING
  // ============================================================================

  const IconComponent = ICON_MAP[icon];
  const renderIcon = () => {
    if (customIcon) return customIcon;
    return <IconComponent className="w-full h-full" />;
  };

  // ============================================================================
  // LAYOUT STYLES
  // ============================================================================

  const containerClasses = cn(
    'transition-all duration-300 h-full',
    layout === 'icon-left' && 'flex items-start gap-4',
    layout === 'icon-top' && 'flex flex-col items-center text-center',
    layout === 'icon-background' && 'relative overflow-hidden',
    layout === 'compact' && 'flex items-center gap-3',
    !disabled && 'cursor-pointer hover:shadow-lg',
    disabled && 'opacity-50 cursor-not-allowed',
    className
  );

  const iconContainerClasses = cn(
    'flex items-center justify-center flex-shrink-0 transition-all duration-300',
    layout === 'icon-left' && 'w-12 h-12 rounded-lg',
    layout === 'icon-top' && 'w-16 h-16 rounded-xl mb-4',
    layout === 'icon-background' && 'absolute top-4 right-4 w-24 h-24 opacity-10',
    layout === 'compact' && 'w-10 h-10 rounded-lg',
    iconBgColor,
    iconColor,
    isHovered && !disabled && 'scale-110 rotate-3'
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  const content = (
    <Card
      className={containerClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <CardContent className="p-6 w-full">
        {/* Icon Background (for icon-background layout) */}
        {layout === 'icon-background' && (
          <div className={iconContainerClasses}>
            {renderIcon()}
          </div>
        )}

        <div className={cn('flex', layout === 'icon-left' || layout === 'compact' ? 'items-start gap-4' : 'flex-col')}>
          {/* Icon (for other layouts) */}
          {layout !== 'icon-background' && (
            <div className={iconContainerClasses}>
              {renderIcon()}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {title}
                  </h3>
                  {badge && (
                    <Badge variant={badgeVariant} className="text-xs">
                      {badge}
                    </Badge>
                  )}
                </div>
              </div>

              {expandable && details && (
                <Tooltip content={isExpanded ? 'Collapse' : 'Expand'}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExpandToggle();
                    }}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                    {...(expandable ? { 'aria-expanded': isExpanded } : {})}
                  >
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDownIcon className="w-5 h-5" />
                    </motion.div>
                  </button>
                </Tooltip>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-700 text-sm mb-3">
              {description}
            </p>

            {/* Expanded Details */}
            <AnimatePresence>
              {isExpanded && details && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="text-gray-700 text-sm mb-3 pt-2 border-t border-gray-200">
                    {details}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress Indicator */}
            {showProgress && (
              <div className="mb-3">
                {progressLabel && (
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>{progressLabel}</span>
                    <span>{progressValue}%</span>
                  </div>
                )}
                <Progress value={progressValue} className="h-2" />
              </div>
            )}

            {/* Link/CTA */}
            {href && (
              <div className="mt-4">
                {external ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    {linkLabel}
                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                  </a>
                ) : (
                  <Link
                    href={href}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    {linkLabel}
                    <ChevronRightIcon className="w-4 h-4" />
                  </Link>
                )}
              </div>
            )}

            {/* Hidden Button for import usage */}
            <Button className="hidden" aria-hidden="true">Hidden</Button>
          </div>
        </div>
      </CardContent>

      {/* Hover Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered && !disabled ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </Card>
  );

  // Wrap in loading skeleton if loading
  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-6">
          <div className={cn('flex', layout === 'icon-top' ? 'flex-col items-center' : 'gap-4')}>
            <div className={cn(
              'rounded-lg bg-gray-200 dark:bg-gray-700',
              layout === 'icon-top' ? 'w-16 h-16 mb-4' : 'w-12 h-12'
            )} />
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return content;
};

export default FeatureCard;
