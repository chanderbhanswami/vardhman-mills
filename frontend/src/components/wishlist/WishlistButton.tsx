'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartIcon,
  CheckIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon
} from '@heroicons/react/24/solid';

// UI Components
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { Badge } from '@/components/ui/Badge';

// Hooks and Contexts
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/hooks/useToast';

// Utils
import { cn } from '@/lib/utils';

// Types
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
}

export interface WishlistButtonProps {
  product: Product;
  variant?: 'default' | 'minimal' | 'icon' | 'floating' | 'card';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showCount?: boolean;
  showTooltip?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  onToggle?: (isInWishlist: boolean, product: Product) => void;
  onError?: (error: Error) => void;
  customIcon?: {
    inactive?: React.ReactNode;
    active?: React.ReactNode;
    loading?: React.ReactNode;
  };
  customText?: {
    add?: string;
    remove?: string;
    added?: string;
    loading?: string;
  };
  animated?: boolean;
  pulseOnAdd?: boolean;
  confirmRemoval?: boolean;
  analytics?: {
    trackAdd?: boolean;
    trackRemove?: boolean;
    category?: string;
    source?: string;
  };
}

interface WishlistIconProps {
  isInWishlist: boolean;
  isLoading: boolean;
  size: string;
  animated: boolean;
  customIcon?: WishlistButtonProps['customIcon'];
  className?: string;
}

interface WishlistTextProps {
  isInWishlist: boolean;
  isLoading: boolean;
  showCount: boolean;
  wishlistCount: number;
  customText?: WishlistButtonProps['customText'];
  className?: string;
}

// Wishlist Icon Component
const WishlistIcon: React.FC<WishlistIconProps> = ({
  isInWishlist,
  isLoading,
  size,
  animated,
  customIcon,
  className
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  };

  const iconSize = sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md;

  if (isLoading) {
    if (customIcon?.loading) {
      return <>{customIcon.loading}</>;
    }
    return (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={cn(iconSize, className)}
      >
        <ArrowPathIcon className={iconSize} />
      </motion.div>
    );
  }

  if (isInWishlist) {
    if (customIcon?.active) {
      return <>{customIcon.active}</>;
    }
    
    return (
      <motion.div
        key="filled"
        initial={animated ? { scale: 0 } : undefined}
        animate={animated ? { scale: 1 } : undefined}
        exit={animated ? { scale: 0 } : undefined}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        className={cn(iconSize, className)}
      >
        <HeartSolidIcon className={cn(iconSize, 'text-red-500')} />
      </motion.div>
    );
  }

  if (customIcon?.inactive) {
    return <>{customIcon.inactive}</>;
  }

  return (
    <motion.div
      key="outline"
      initial={animated ? { scale: 0 } : undefined}
      animate={animated ? { scale: 1 } : undefined}
      exit={animated ? { scale: 0 } : undefined}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      className={cn(iconSize, className)}
    >
      <HeartIcon className={cn(iconSize, 'text-gray-400 hover:text-red-400 transition-colors')} />
    </motion.div>
  );
};

// Wishlist Text Component
const WishlistText: React.FC<WishlistTextProps> = ({
  isInWishlist,
  isLoading,
  showCount,
  wishlistCount,
  customText,
  className
}) => {
  const getText = () => {
    if (isLoading) {
      return customText?.loading || 'Loading...';
    }
    
    if (isInWishlist) {
      return customText?.remove || 'Remove from Wishlist';
    }
    
    return customText?.add || 'Add to Wishlist';
  };

  return (
    <span className={cn('font-medium', className)}>
      {getText()}
      {showCount && wishlistCount > 0 && (
        <Badge variant="secondary" className="ml-2">
          {wishlistCount}
        </Badge>
      )}
    </span>
  );
};

// Success Animation Component
const SuccessAnimation: React.FC<{ size: string }> = ({ size }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const iconSize = sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={cn(iconSize, 'text-green-500')}
    >
      <CheckIcon className={iconSize} />
    </motion.div>
  );
};

// Pulse Animation Component
const PulseAnimation: React.FC<{ children: React.ReactNode; trigger: boolean }> = ({ 
  children, 
  trigger 
}) => {
  return (
    <motion.div
      animate={trigger ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
};

// Main Wishlist Button Component
export const WishlistButton: React.FC<WishlistButtonProps> = ({
  product,
  variant = 'default',
  size = 'md',
  showText = true,
  showCount = false,
  showTooltip = true,
  disabled = false,
  loading = false,
  className,
  iconClassName,
  textClassName,
  onToggle,
  onError,
  customIcon,
  customText,
  animated = true,
  pulseOnAdd = true,
  confirmRemoval = false,
  analytics = {
    trackAdd: true,
    trackRemove: true,
    category: 'product',
    source: 'product-page'
  }
}) => {
  // Hooks
  const { 
    isInWishlist: checkIsInWishlist, 
    addToWishlist, 
    removeFromWishlist
  } = useWishlist();
  const { toast } = useToast();
  
  // State
  const [isLoading, setIsLoading] = useState(loading);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pulseState, setPulseState] = useState(false);
  const [confirmingRemoval, setConfirmingRemoval] = useState(false);

  // Computed values
  const isInWishlist = useMemo(() => 
    checkIsInWishlist(product.id), 
    [checkIsInWishlist, product.id]
  );
  
  const wishlistCount = items?.length || 0;
  const isDisabled = disabled || isLoading;

  // Update loading state when prop changes
  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  // Analytics tracking
  const trackEvent = useCallback((action: 'add' | 'remove') => {
    if (!analytics || (action === 'add' && !analytics.trackAdd) || (action === 'remove' && !analytics.trackRemove)) {
      return;
    }

    // Mock analytics event
    console.log('Analytics Event:', {
      event: `wishlist_${action}`,
      product_id: product.id,
      product_name: product.name,
      category: analytics.category,
      source: analytics.source,
      price: product.price,
      timestamp: new Date().toISOString()
    });
  }, [analytics, product]);

  // Success animation handler
  const showSuccessAnimation = useCallback(() => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1000);
  }, []);

  // Pulse animation handler
  const triggerPulse = useCallback(() => {
    if (pulseOnAdd) {
      setPulseState(true);
      setTimeout(() => setPulseState(false), 300);
    }
  }, [pulseOnAdd]);

  // Handle wishlist toggle
  const handleToggle = useCallback(async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (isDisabled) return;

    // Handle removal confirmation
    if (isInWishlist && confirmRemoval && !confirmingRemoval) {
      setConfirmingRemoval(true);
      
      toast({
        title: 'Remove from wishlist?',
        description: 'Click again to confirm removal',
        duration: 3000
      });
      
      setTimeout(() => setConfirmingRemoval(false), 3000);
      return;
    }

    setIsLoading(true);
    setConfirmingRemoval(false);

    try {
      if (isInWishlist) {
        await removeFromWishlist(product.id);
        trackEvent('remove');
        
        toast({
          title: 'Removed from wishlist',
          description: `${product.name} has been removed from your wishlist`
        });
        
        onToggle?.(false, product);
      } else {
        await addToWishlist(product.id);
        
        trackEvent('add');
        triggerPulse();
        showSuccessAnimation();
        
        toast({
          title: 'Added to wishlist',
          description: `${product.name} has been added to your wishlist`
        });
        
        onToggle?.(true, product);
      }
    } catch (error) {
      console.error('Wishlist operation failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      
      toast({
        title: 'Operation failed',
        description: errorMessage,
        variant: 'destructive'
      });
      
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [
    isDisabled,
    isInWishlist,
    confirmRemoval,
    confirmingRemoval,
    product,
    removeFromWishlist,
    addToWishlist,
    trackEvent,
    triggerPulse,
    showSuccessAnimation,
    toast,
    onToggle,
    onError
  ]);

  // Variant styles
  const getVariantStyles = () => {
    const baseStyles = 'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    switch (variant) {
      case 'minimal':
        return cn(
          baseStyles,
          'p-1 rounded-md hover:bg-gray-100 focus:ring-gray-300',
          isInWishlist && 'bg-red-50 hover:bg-red-100'
        );
      
      case 'icon':
        return cn(
          baseStyles,
          'p-2 rounded-full hover:bg-gray-100 focus:ring-gray-300',
          isInWishlist && 'bg-red-50 hover:bg-red-100'
        );
      
      case 'floating':
        return cn(
          baseStyles,
          'fixed bottom-6 right-6 p-3 rounded-full shadow-lg hover:shadow-xl z-50',
          'bg-white border border-gray-200 hover:bg-gray-50 focus:ring-blue-300',
          isInWishlist && 'bg-red-50 border-red-200 hover:bg-red-100'
        );
      
      case 'card':
        return cn(
          baseStyles,
          'p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm focus:ring-blue-300',
          isInWishlist && 'border-red-200 bg-red-50 hover:border-red-300 hover:bg-red-100'
        );
      
      default:
        return cn(
          baseStyles,
          'px-4 py-2 rounded-md border border-gray-300 hover:border-gray-400 hover:bg-gray-50 focus:ring-blue-300',
          isInWishlist && 'border-red-300 bg-red-50 hover:border-red-400 hover:bg-red-100'
        );
    }
  };

  // Size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  // Tooltip content
  const getTooltipContent = () => {
    if (isLoading) return 'Loading...';
    if (confirmingRemoval) return 'Click again to confirm removal';
    if (isInWishlist) return customText?.remove || 'Remove from Wishlist';
    return customText?.add || 'Add to Wishlist';
  };

  // Show text based on variant and showText prop
  const shouldShowText = showText && !['icon', 'floating'].includes(variant);

  // Button content
  const buttonContent = (
    <PulseAnimation trigger={pulseState}>
      <div className={cn(
        'flex items-center gap-2',
        variant === 'floating' && 'justify-center'
      )}>
        <div className="relative">
          <AnimatePresence mode="wait">
            {showSuccess ? (
              <SuccessAnimation size={size} />
            ) : (
              <WishlistIcon
                isInWishlist={isInWishlist}
                isLoading={isLoading}
                size={size}
                animated={animated}
                customIcon={customIcon}
                className={iconClassName}
              />
            )}
          </AnimatePresence>
          
          {confirmingRemoval && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute -top-1 -right-1"
            >
              <ExclamationTriangleIcon className="w-3 h-3 text-yellow-500" />
            </motion.div>
          )}
        </div>
        
        {shouldShowText && (
          <WishlistText
            isInWishlist={isInWishlist}
            isLoading={isLoading}
            showCount={showCount}
            wishlistCount={wishlistCount}
            customText={customText}
            className={textClassName}
          />
        )}
      </div>
    </PulseAnimation>
  );

  // Render button
  const button = (
    <Button
      variant="ghost"
      onClick={handleToggle}
      disabled={isDisabled}
      className={cn(
        getVariantStyles(),
        getSizeStyles(),
        confirmingRemoval && 'ring-2 ring-yellow-300',
        className
      )}
      aria-label={getTooltipContent()}
      aria-pressed={isInWishlist}
    >
      {buttonContent}
    </Button>
  );

  // Wrap with tooltip if enabled
  if (showTooltip && !['floating', 'card'].includes(variant)) {
    return (
      <Tooltip content={getTooltipContent()}>
        {button}
      </Tooltip>
    );
  }

  return button;
};

// Preset Components
export const WishlistIconButton: React.FC<Omit<WishlistButtonProps, 'variant' | 'showText'>> = (props) => (
  <WishlistButton {...props} variant="icon" showText={false} />
);

export const WishlistFloatingButton: React.FC<Omit<WishlistButtonProps, 'variant' | 'showText'>> = (props) => (
  <WishlistButton {...props} variant="floating" showText={false} />
);

export const WishlistCardButton: React.FC<Omit<WishlistButtonProps, 'variant'>> = (props) => (
  <WishlistButton {...props} variant="card" />
);

export const WishlistMinimalButton: React.FC<Omit<WishlistButtonProps, 'variant'>> = (props) => (
  <WishlistButton {...props} variant="minimal" />
);

// Quick Add Button (for product lists/grids)
export interface QuickWishlistProps {
  product: Product;
  size?: WishlistButtonProps['size'];
  className?: string;
}

export const QuickWishlist: React.FC<QuickWishlistProps> = ({ 
  product, 
  size = 'sm', 
  className 
}) => (
  <WishlistButton
    product={product}
    variant="icon"
    size={size}
    showText={false}
    showTooltip={true}
    animated={true}
    pulseOnAdd={true}
    className={cn('absolute top-2 right-2 bg-white/80 backdrop-blur-sm', className)}
  />
);

export default WishlistButton;
