/**
 * CustomerAvatars Component
 * 
 * Advanced avatar stack/grid component for displaying multiple customers
 * with various layouts and interactive features.
 * 
 * Features:
 * - Stack and grid layouts
 * - Avatar groups with overlap
 * - Verified badges
 * - Tooltips with customer info
 * - Overflow indicators (+X more)
 * - Responsive sizing
 * - Hover effects
 * - Click callbacks
 * - Loading states
 * - Placeholder fallbacks
 * - Initial-based fallbacks
 * - Custom border colors
 * - Animated entrance
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { UserIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { Tooltip } from '@/components/ui/Tooltip';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Customer {
  id: string;
  name: string;
  avatar?: string;
  location?: string;
  verified?: boolean;
  reviewCount?: number;
  rating?: number;
}

export interface CustomerAvatarsProps {
  /** Array of customers to display */
  customers: Customer[];
  /** Display layout mode */
  layout?: 'stack' | 'grid' | 'list';
  /** Maximum avatars to show before overflow */
  maxVisible?: number;
  /** Avatar size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Show verified badges */
  showVerified?: boolean;
  /** Show tooltips on hover */
  showTooltips?: boolean;
  /** Show overflow count */
  showOverflow?: boolean;
  /** Enable click interactions */
  clickable?: boolean;
  /** Avatar border color */
  borderColor?: string;
  /** Additional CSS classes */
  className?: string;
  /** On avatar click callback */
  onAvatarClick?: (customer: Customer) => void;
  /** On overflow click callback */
  onOverflowClick?: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SIZE_CLASSES = {
  xs: {
    avatar: 'w-6 h-6',
    text: 'text-xs',
    badge: 'w-3 h-3',
    overlap: '-ml-2',
  },
  sm: {
    avatar: 'w-8 h-8',
    text: 'text-xs',
    badge: 'w-3 h-3',
    overlap: '-ml-2',
  },
  md: {
    avatar: 'w-10 h-10',
    text: 'text-sm',
    badge: 'w-4 h-4',
    overlap: '-ml-3',
  },
  lg: {
    avatar: 'w-12 h-12',
    text: 'text-base',
    badge: 'w-5 h-5',
    overlap: '-ml-4',
  },
  xl: {
    avatar: 'w-16 h-16',
    text: 'text-lg',
    badge: 'w-6 h-6',
    overlap: '-ml-5',
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export const CustomerAvatars: React.FC<CustomerAvatarsProps> = ({
  customers,
  layout = 'stack',
  maxVisible = 5,
  size = 'md',
  showVerified = true,
  showTooltips = true,
  showOverflow = true,
  clickable = true,
  borderColor = 'white',
  className,
  onAvatarClick,
  onOverflowClick,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const visibleCustomers = useMemo(
    () => customers.slice(0, maxVisible),
    [customers, maxVisible]
  );

  const overflowCount = useMemo(
    () => Math.max(0, customers.length - maxVisible),
    [customers.length, maxVisible]
  );

  const sizeClasses = useMemo(() => SIZE_CLASSES[size], [size]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAvatarClick = useCallback(
    (customer: Customer) => {
      if (clickable && onAvatarClick) {
        onAvatarClick(customer);
        console.log('Avatar clicked:', customer.name);
      }
    },
    [clickable, onAvatarClick]
  );

  const handleOverflowClick = useCallback(() => {
    if (clickable && onOverflowClick) {
      onOverflowClick();
      console.log('Overflow button clicked:', overflowCount, 'more customers');
    }
  }, [clickable, onOverflowClick, overflowCount]);

  const handleImageLoad = useCallback((customerId: string) => {
    setLoadedImages((prev) => new Set(prev).add(customerId));
  }, []);

  const handleImageError = useCallback((customerId: string) => {
    console.error('Failed to load avatar image for:', customerId);
  }, []);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getGradient = (customerId: string): string => {
    const gradients = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-blue-500',
      'from-yellow-500 to-orange-500',
      'from-pink-500 to-rose-500',
      'from-teal-500 to-green-500',
    ];
    const index = customerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
    return gradients[index];
  };

  const renderAvatar = (customer: Customer, index: number) => {
    const hasImage = customer.avatar && loadedImages.has(customer.id);
    const initials = getInitials(customer.name);
    const gradient = getGradient(customer.id);

    const tooltipContent = showTooltips ? (
      <div className="text-sm space-y-1">
        <p className="font-semibold flex items-center gap-1">
          {customer.name}
          {showVerified && customer.verified && (
            <CheckBadgeIcon className="w-3 h-3 text-primary-500" />
          )}
        </p>
        {customer.location && (
          <p className="text-gray-400 text-xs">{customer.location}</p>
        )}
        {customer.reviewCount !== undefined && (
          <p className="text-gray-400 text-xs">
            {customer.reviewCount} {customer.reviewCount === 1 ? 'review' : 'reviews'}
          </p>
        )}
        {customer.rating !== undefined && (
          <p className="text-gray-400 text-xs">Rating: {customer.rating.toFixed(1)}★</p>
        )}
      </div>
    ) : null;

    const avatarContent = (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05 }}
        className={cn(
          'relative flex-shrink-0',
          layout === 'stack' && index > 0 && sizeClasses.overlap,
          clickable && 'cursor-pointer'
        )}
        onClick={() => handleAvatarClick(customer)}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        onKeyDown={(e) => {
          if (clickable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleAvatarClick(customer);
          }
        }}
      >
        <div
          className={cn(
            sizeClasses.avatar,
            'rounded-full relative overflow-hidden',
            'transition-transform duration-200',
            clickable && 'hover:scale-110 hover:z-10',
            borderColor === 'white' ? 'ring-2 ring-white' : 'ring-2 ring-gray-200'
          )}
        >
          {customer.avatar ? (
            <>
              <Image
                src={customer.avatar}
                alt={customer.name}
                fill
                className={cn(
                  'object-cover transition-opacity duration-300',
                  hasImage ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={() => handleImageLoad(customer.id)}
                onError={() => handleImageError(customer.id)}
              />
              {!hasImage && (
                <div className={cn('absolute inset-0 bg-gradient-to-br', gradient, 'flex items-center justify-center')}>
                  <span className={cn('font-semibold text-white', sizeClasses.text)}>
                    {initials}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className={cn('absolute inset-0 bg-gradient-to-br', gradient, 'flex items-center justify-center')}>
              {initials ? (
                <span className={cn('font-semibold text-white', sizeClasses.text)}>
                  {initials}
                </span>
              ) : (
                <UserIcon className={cn('text-white', sizeClasses.text)} />
              )}
            </div>
          )}
        </div>

        {/* Verified Badge */}
        {showVerified && customer.verified && (
          <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full">
            <CheckBadgeIcon className={cn(sizeClasses.badge, 'text-primary-600')} />
          </div>
        )}
      </motion.div>
    );

    if (showTooltips && tooltipContent) {
      return (
        <Tooltip key={customer.id} content={tooltipContent}>
          {avatarContent}
        </Tooltip>
      );
    }

    return <React.Fragment key={customer.id}>{avatarContent}</React.Fragment>;
  };

  const renderOverflow = () => {
    if (!showOverflow || overflowCount <= 0) return null;

    const overflowElement = (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: maxVisible * 0.05 }}
        className={cn(
          'relative flex-shrink-0',
          layout === 'stack' && sizeClasses.overlap,
          clickable && 'cursor-pointer'
        )}
        onClick={handleOverflowClick}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        onKeyDown={(e) => {
          if (clickable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleOverflowClick();
          }
        }}
      >
        <div
          className={cn(
            sizeClasses.avatar,
            'rounded-full bg-gradient-to-br from-gray-400 to-gray-600',
            'flex items-center justify-center',
            'transition-transform duration-200',
            'ring-2 ring-white',
            clickable && 'hover:scale-110 hover:from-gray-500 hover:to-gray-700'
          )}
        >
          <span className={cn('font-semibold text-white', sizeClasses.text)}>
            +{overflowCount}
          </span>
        </div>
      </motion.div>
    );

    if (showTooltips) {
      return (
        <Tooltip
          content={
            <div className="text-sm">
              <p className="font-semibold">
                {overflowCount} more {overflowCount === 1 ? 'customer' : 'customers'}
              </p>
              <p className="text-gray-400 text-xs">Click to view all</p>
            </div>
          }
        >
          {overflowElement}
        </Tooltip>
      );
    }

    return overflowElement;
  };

  const renderStackLayout = () => (
    <div className={cn('flex items-center', className)} aria-label="Customer avatars">
      {visibleCustomers.map((customer, index) => renderAvatar(customer, index))}
      {renderOverflow()}
    </div>
  );

  const renderGridLayout = () => (
    <div
      className={cn(
        'grid gap-4',
        size === 'xs' && 'grid-cols-8',
        size === 'sm' && 'grid-cols-6',
        size === 'md' && 'grid-cols-5',
        size === 'lg' && 'grid-cols-4',
        size === 'xl' && 'grid-cols-3',
        className
      )}
      aria-label="Customer avatars"
    >
      {visibleCustomers.map((customer, index) => renderAvatar(customer, index))}
      {renderOverflow()}
    </div>
  );

  const renderListLayout = () => (
    <div className={cn('space-y-3', className)}>
      {visibleCustomers.map((customer, index) => (
        <motion.div
          key={customer.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            'flex items-center gap-3 p-2 rounded-lg',
            'transition-colors duration-200',
            clickable && 'hover:bg-gray-50 cursor-pointer'
          )}
          onClick={() => handleAvatarClick(customer)}
          role={clickable ? 'button' : undefined}
          tabIndex={clickable ? 0 : undefined}
          onKeyDown={(e) => {
            if (clickable && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              handleAvatarClick(customer);
            }
          }}
        >
          {renderAvatar(customer, index)}
          <div className="flex-1 min-w-0">
            <p className={cn('font-medium text-gray-900 truncate flex items-center gap-1', sizeClasses.text)}>
              {customer.name}
              {showVerified && customer.verified && (
                <CheckBadgeIcon className="w-4 h-4 text-primary-600 flex-shrink-0" />
              )}
            </p>
            {customer.location && (
              <p className="text-xs text-gray-500 truncate">{customer.location}</p>
            )}
            {customer.reviewCount !== undefined && (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {customer.reviewCount} {customer.reviewCount === 1 ? 'review' : 'reviews'}
                </Badge>
                {customer.rating !== undefined && (
                  <span className="text-xs text-gray-600">
                    {customer.rating.toFixed(1)}★
                  </span>
                )}
              </div>
            )}
          </div>
        </motion.div>
      ))}
      {showOverflow && overflowCount > 0 && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: maxVisible * 0.05 }}
          onClick={handleOverflowClick}
          className={cn(
            'flex items-center gap-3 p-2 rounded-lg w-full text-left',
            'transition-colors duration-200',
            'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
          )}
        >
          <div
            className={cn(
              sizeClasses.avatar,
              'rounded-full bg-gradient-to-br from-gray-400 to-gray-600',
              'flex items-center justify-center flex-shrink-0'
            )}
          >
            <span className={cn('font-semibold text-white', sizeClasses.text)}>
              +{overflowCount}
            </span>
          </div>
          <span className={cn('font-medium', sizeClasses.text)}>
            View {overflowCount} more {overflowCount === 1 ? 'customer' : 'customers'}
          </span>
        </motion.button>
      )}
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (customers.length === 0) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        No customers to display
      </div>
    );
  }

  switch (layout) {
    case 'grid':
      return renderGridLayout();
    case 'list':
      return renderListLayout();
    default:
      return renderStackLayout();
  }
};

export default CustomerAvatars;
