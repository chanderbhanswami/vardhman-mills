'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  X, 
  Gift, 
  Ticket, 
  Copy, 
  Info,
  Sparkles,
  Timer,
  TrendingDown,
  Package
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  Card, 
  Badge, 
  Button, 
  Tooltip, 
  Flex,
  Separator
} from '@/components/ui';
import type { Coupon } from '@/hooks/coupons/useCoupons';
import { formatCurrency } from '@/lib/utils/currency';
import { cn } from '@/lib/utils';

export interface CouponAppliedProps {
  /**
   * Applied coupon details
   */
  coupon: Coupon;
  
  /**
   * Discount amount applied
   */
  discountAmount: number;
  
  /**
   * Original cart total before discount
   */
  originalTotal: number;
  
  /**
   * Final cart total after discount
   */
  finalTotal: number;
  
  /**
   * Callback when coupon is removed
   */
  onRemove: (coupon: Coupon) => void;
  
  /**
   * Show detailed breakdown
   */
  showBreakdown?: boolean;
  
  /**
   * Show terms and conditions
   */
  showTerms?: boolean;
  
  /**
   * Show copy functionality
   */
  showCopy?: boolean;
  
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Color theme
   */
  theme?: 'default' | 'success' | 'gradient';
  
  /**
   * Animation variant
   */
  animation?: 'slide' | 'scale' | 'bounce' | 'none';
  
  /**
   * Loading state for removal
   */
  isRemoving?: boolean;
  
  /**
   * Disabled state
   */
  disabled?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Test ID for testing
   */
  testId?: string;
}

const CouponApplied: React.FC<CouponAppliedProps> = ({
  coupon,
  discountAmount,
  originalTotal,
  finalTotal,
  onRemove,
  showBreakdown = true,
  showTerms = false,
  showCopy = true,
  size = 'md',
  theme = 'success',
  animation = 'slide',
  isRemoving = false,
  disabled = false,
  className,
  testId = 'coupon-applied'
}) => {
  // State
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  
  // Handle remove coupon
  const handleRemove = useCallback(() => {
    if (disabled || isRemoving) return;
    onRemove(coupon);
  }, [coupon, onRemove, disabled, isRemoving]);
  
  // Handle copy coupon code
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(coupon.code);
    toast.success(`Coupon code ${coupon.code} copied to clipboard`);
  }, [coupon.code]);
  
  // Get discount type display
  const getDiscountDisplay = () => {
    switch (coupon.type) {
      case 'percentage':
        return `${coupon.value}% OFF`;
      case 'fixed':
        return `${formatCurrency(coupon.value)} OFF`;
      case 'shipping':
        return 'FREE SHIPPING';
      case 'buy_x_get_y':
        return 'BUY 2 GET 1';
      default:
        return 'DISCOUNT';
    }
  };
  
  // Get badge variant based on type
  const getBadgeVariant = () => {
    switch (coupon.type) {
      case 'percentage':
        return 'success';
      case 'fixed':
        return 'default';
      case 'shipping':
        return 'info';
      case 'buy_x_get_y':
        return 'warning';
      default:
        return 'secondary';
    }
  };
  
  // Get theme classes
  const getThemeClasses = () => {
    switch (theme) {
      case 'success':
        return {
          card: 'border-green-200 bg-green-50',
          icon: 'bg-green-100 text-green-600',
          text: 'text-green-800',
          subText: 'text-green-700',
          button: 'text-green-700 hover:text-green-800 hover:bg-green-100'
        };
      case 'gradient':
        return {
          card: 'border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50',
          icon: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600',
          text: 'text-purple-800',
          subText: 'text-purple-700',
          button: 'text-purple-700 hover:text-purple-800 hover:bg-purple-100'
        };
      default:
        return {
          card: 'border-primary-200 bg-primary-50',
          icon: 'bg-primary-100 text-primary-600',
          text: 'text-primary-800',
          subText: 'text-primary-700',
          button: 'text-primary-700 hover:text-primary-800 hover:bg-primary-100'
        };
    }
  };
  
  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          card: 'p-3',
          icon: 'w-8 h-8',
          iconInner: 'w-4 h-4',
          title: 'text-sm',
          subtitle: 'text-xs',
          button: 'w-6 h-6',
          buttonIcon: 'w-3 h-3'
        };
      case 'lg':
        return {
          card: 'p-6',
          icon: 'w-12 h-12',
          iconInner: 'w-6 h-6',
          title: 'text-lg',
          subtitle: 'text-sm',
          button: 'w-8 h-8',
          buttonIcon: 'w-5 h-5'
        };
      default:
        return {
          card: 'p-4',
          icon: 'w-10 h-10',
          iconInner: 'w-5 h-5',
          title: 'text-base',
          subtitle: 'text-sm',
          button: 'w-6 h-6',
          buttonIcon: 'w-4 h-4'
        };
    }
  };
  
  // Get animation variants
  const getAnimationVariants = () => {
    switch (animation) {
      case 'scale':
        return {
          initial: { scale: 0, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0, opacity: 0 }
        };
      case 'bounce':
        return {
          initial: { y: -20, opacity: 0 },
          animate: { 
            y: 0, 
            opacity: 1,
            transition: { type: 'spring' as const, stiffness: 300, damping: 20 }
          },
          exit: { y: -20, opacity: 0 }
        };
      case 'slide':
        return {
          initial: { y: -10, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: -10, opacity: 0 }
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
    }
  };
  
  const themeClasses = getThemeClasses();
  const sizeClasses = getSizeClasses();
  const animationVariants = getAnimationVariants();
  
  // Calculate savings percentage
  const savingsPercentage = originalTotal > 0 ? (discountAmount / originalTotal) * 100 : 0;
  
  return (
    <motion.div
      initial={animationVariants.initial}
      animate={animationVariants.animate}
      exit={animationVariants.exit}
      className={cn('relative', className)}
      data-testid={testId}
    >
      <Card className={cn(themeClasses.card, sizeClasses.card)}>
        <Flex align="center" justify="between">
          <Flex align="center" gap={3}>
            {/* Success Icon */}
            <div className={cn(
              'rounded-full flex items-center justify-center',
              themeClasses.icon,
              sizeClasses.icon
            )}>
              {theme === 'gradient' ? (
                <Sparkles className={sizeClasses.iconInner} />
              ) : (
                <Check className={sizeClasses.iconInner} />
              )}
            </div>
            
            {/* Coupon Details */}
            <div className="flex-1 min-w-0">
              <Flex align="center" gap={2} className="mb-1">
                <span className={cn(
                  'font-semibold font-mono',
                  themeClasses.text,
                  sizeClasses.title
                )}>
                  {coupon.code}
                </span>
                
                <Badge 
                  variant={getBadgeVariant()}
                  size={size}
                >
                  {getDiscountDisplay()}
                </Badge>
                
                {showCopy && (
                  <Tooltip content="Copy code">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="opacity-60 hover:opacity-100"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </Tooltip>
                )}
              </Flex>
              
              <p className={cn(themeClasses.subText, sizeClasses.subtitle)}>
                {coupon.title || `You saved ${formatCurrency(discountAmount)}!`}
              </p>
              
              {showBreakdown && size !== 'sm' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={cn('mt-1 p-0 h-auto', themeClasses.button)}
                >
                  <span className="text-xs">
                    {isExpanded ? 'Hide details' : 'View details'}
                  </span>
                </Button>
              )}
            </div>
          </Flex>
          
          {/* Action Buttons */}
          <Flex align="center" gap={1}>
            {showTerms && coupon.terms && (
              <Tooltip content="Terms & conditions">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTermsModal(true)}
                  className={themeClasses.button}
                >
                  <Info className={sizeClasses.buttonIcon} />
                </Button>
              </Tooltip>
            )}
            
            <Tooltip content="Remove coupon">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={disabled || isRemoving}
                className={themeClasses.button}
              >
                {isRemoving ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Timer className={sizeClasses.buttonIcon} />
                  </motion.div>
                ) : (
                  <X className={sizeClasses.buttonIcon} />
                )}
              </Button>
            </Tooltip>
          </Flex>
        </Flex>
        
        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && showBreakdown && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <Separator className="my-3" />
              
              <div className="space-y-3">
                {/* Savings Summary */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={themeClasses.subText}>Original Total:</span>
                      <span className="font-medium">
                        {formatCurrency(originalTotal)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={themeClasses.subText}>Discount:</span>
                      <span className="font-medium text-red-600">
                        -{formatCurrency(discountAmount)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between font-semibold">
                      <span className={themeClasses.text}>Final Total:</span>
                      <span className={themeClasses.text}>
                        {formatCurrency(finalTotal)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-gray-600">
                        {savingsPercentage.toFixed(1)}% savings
                      </span>
                    </div>
                    
                    {coupon.type === 'shipping' && (
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-primary-600" />
                        <span className="text-xs text-gray-600">
                          Free shipping included
                        </span>
                      </div>
                    )}
                    
                    {coupon.stackable && (
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-purple-600" />
                        <span className="text-xs text-gray-600">
                          Stackable with other offers
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Coupon Metadata */}
                <div className="pt-2 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                    <div>
                      <span className="font-medium">Valid until:</span>
                      <br />
                      {new Date(coupon.validUntil).toLocaleDateString()}
                    </div>
                    
                    {coupon.minOrderValue && (
                      <div>
                        <span className="font-medium">Min. order:</span>
                        <br />
                        {formatCurrency(coupon.minOrderValue)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
      
      {/* Terms Modal */}
      <AnimatePresence>
        {showTermsModal && coupon.terms && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTermsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-md w-full max-h-96 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b">
                <Flex align="center" justify="between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Ticket className="w-4 h-4" />
                    Terms & Conditions
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTermsModal(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </Flex>
              </div>
              
              <div className="p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {coupon.terms}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CouponApplied;
