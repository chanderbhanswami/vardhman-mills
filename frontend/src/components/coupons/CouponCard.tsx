'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, 
  Copy, 
  ExternalLink, 
  Clock, 
  Users, 
  ShoppingCart,
  Star,
  Sparkles,
  Check,
  Info,
  Calendar,
  Tag,
  Percent,
  Zap,
  TrendingUp,
  Package,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  Card, 
  Badge, 
  Button, 
  Tooltip, 
  Flex,
  Progress,
  Separator
} from '@/components/ui';
import type { Coupon } from '@/hooks/coupons/useCoupons';
import { formatCurrency } from '@/lib/utils/currency';
import { cn } from '@/lib/utils';

export interface CouponCardProps {
  /**
   * Coupon data
   */
  coupon: Coupon;
  
  /**
   * Callback when coupon is applied
   */
  onApply?: (coupon: Coupon) => void;
  
  /**
   * Callback when coupon details are viewed
   */
  onViewDetails?: (coupon: Coupon) => void;
  
  /**
   * Callback when coupon is copied
   */
  onCopy?: (coupon: Coupon) => void;
  
  /**
   * Current cart total for eligibility check
   */
  cartTotal?: number;
  
  /**
   * Applied coupon codes to check if already applied
   */
  appliedCoupons?: string[];
  
  /**
   * Show usage statistics
   */
  showUsage?: boolean;
  
  /**
   * Show terms preview
   */
  showTerms?: boolean;
  
  /**
   * Show expiry countdown
   */
  showCountdown?: boolean;
  
  /**
   * Show share functionality
   */
  showShare?: boolean;
  
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Layout variant
   */
  layout?: 'card' | 'compact' | 'detailed';
  
  /**
   * Theme variant
   */
  theme?: 'default' | 'premium' | 'festive' | 'gradient';
  
  /**
   * Animation preset
   */
  animation?: 'hover' | 'pulse' | 'glow' | 'none';
  
  /**
   * Loading state
   */
  isLoading?: boolean;
  
  /**
   * Disabled state
   */
  disabled?: boolean;
  
  /**
   * Featured/highlighted state
   */
  featured?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Test ID for testing
   */
  testId?: string;
}

const CouponCard: React.FC<CouponCardProps> = ({
  coupon,
  onApply,
  onViewDetails,
  onCopy,
  cartTotal = 0,
  appliedCoupons = [],
  showUsage = false,
  showTerms = true,
  showCountdown = true,
  showShare = false,
  size = 'md',
  theme = 'default',
  animation = 'hover',
  isLoading = false,
  disabled = false,
  featured = false,
  className,
  testId = 'coupon-card'
}) => {
  // State
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Computed values
  const isApplied = appliedCoupons.includes(coupon.code);
  const isEligible = cartTotal >= (coupon.minOrderValue || 0);
  const isExpired = new Date() > new Date(coupon.validUntil);
  const isAvailable = !isExpired && !isApplied && (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit);
  
  // Time calculations
  const timeUntilExpiry = useMemo(() => {
    const now = new Date();
    const expiry = new Date(coupon.validUntil);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Expires soon';
  }, [coupon.validUntil]);
  
  // Usage percentage
  const usagePercentage = coupon.usageLimit ? (coupon.usageCount / coupon.usageLimit) * 100 : 0;
  
  // Handle actions
  const handleApply = useCallback(() => {
    if (!isAvailable || !isEligible || disabled || isLoading) return;
    onApply?.(coupon);
  }, [coupon, onApply, isAvailable, isEligible, disabled, isLoading]);
  
  const handleCopy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(coupon.code);
    toast.success(`Coupon code ${coupon.code} copied!`);
    onCopy?.(coupon);
  }, [coupon, onCopy]);
  
  const handleViewDetails = useCallback(() => {
    onViewDetails?.(coupon);
    setIsExpanded(!isExpanded);
  }, [coupon, onViewDetails, isExpanded]);
  
  // Get discount display
  const getDiscountDisplay = () => {
    switch (coupon.type) {
      case 'percentage':
        return {
          value: `${coupon.value}%`,
          label: 'OFF',
          icon: Percent
        };
      case 'fixed':
        return {
          value: formatCurrency(coupon.value),
          label: 'OFF',
          icon: Tag
        };
      case 'shipping':
        return {
          value: 'FREE',
          label: 'SHIPPING',
          icon: Package
        };
      case 'buy_x_get_y':
        return {
          value: 'BUY 2',
          label: 'GET 1 FREE',
          icon: Gift
        };
      default:
        return {
          value: 'SPECIAL',
          label: 'OFFER',
          icon: Star
        };
    }
  };
  
  // Get theme classes
  const getThemeClasses = () => {
    const base = {
      card: 'bg-white border border-gray-200',
      header: 'bg-gray-50',
      text: 'text-gray-900',
      subText: 'text-gray-600',
      accent: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700 text-white'
    };
    
    switch (theme) {
      case 'premium':
        return {
          ...base,
          card: 'bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200',
          header: 'bg-gradient-to-r from-purple-100 to-pink-100',
          accent: 'text-primary-600',
          button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
        };
      case 'festive':
        return {
          ...base,
          card: 'bg-gradient-to-br from-red-50 to-green-50 border-red-200',
          header: 'bg-gradient-to-r from-red-100 to-green-100',
          accent: 'text-red-600',
          button: 'bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white'
        };
      case 'gradient':
        return {
          ...base,
          card: 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-blue-200',
          header: 'bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100',
          accent: 'text-blue-600',
          button: 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white'
        };
      default:
        return base;
    }
  };
  
  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          card: 'p-3',
          header: 'p-2',
          title: 'text-sm',
          subtitle: 'text-xs',
          button: 'text-xs px-2 py-1',
          icon: 'w-4 h-4',
          badge: 'text-xs'
        };
      case 'lg':
        return {
          card: 'p-6',
          header: 'p-4',
          title: 'text-lg',
          subtitle: 'text-base',
          button: 'text-base px-6 py-3',
          icon: 'w-6 h-6',
          badge: 'text-sm'
        };
      default:
        return {
          card: 'p-4',
          header: 'p-3',
          title: 'text-base',
          subtitle: 'text-sm',
          button: 'text-sm px-4 py-2',
          icon: 'w-5 h-5',
          badge: 'text-xs'
        };
    }
  };
  
  // Get animation classes
  const getAnimationClasses = () => {
    switch (animation) {
      case 'pulse':
        return 'animate-pulse';
      case 'glow':
        return 'shadow-lg hover:shadow-xl transition-shadow duration-300';
      case 'hover':
        return 'hover:scale-105 transition-transform duration-200';
      default:
        return '';
    }
  };
  
  const discountInfo = getDiscountDisplay();
  const themeClasses = getThemeClasses();
  const sizeClasses = getSizeClasses();
  const animationClasses = getAnimationClasses();
  
  const DiscountIcon = discountInfo.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={animation === 'hover' ? { scale: 1.02 } : {}}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn('relative', className)}
      data-testid={testId}
    >
      <Card className={cn(
        themeClasses.card,
        sizeClasses.card,
        animationClasses,
        featured && 'ring-2 ring-yellow-400 ring-opacity-50',
        !isAvailable && 'opacity-60',
        disabled && 'pointer-events-none opacity-50'
      )}>
        {/* Featured Badge */}
        {featured && (
          <div className="absolute -top-2 -right-2 z-10">
            <Badge variant="warning" className="bg-yellow-400 text-yellow-900">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          </div>
        )}
        
        {/* Header */}
        <div className={cn(themeClasses.header, sizeClasses.header, 'rounded-t-lg')}>
          <Flex align="center" justify="between">
            <Flex align="center" gap={2}>
              <div className={cn(
                'rounded-full p-2',
                theme === 'premium' ? 'bg-primary-100' : 
                theme === 'festive' ? 'bg-red-100' : 'bg-blue-100'
              )}>
                <DiscountIcon className={cn(sizeClasses.icon, themeClasses.accent)} />
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <span className={cn('font-bold', themeClasses.text, sizeClasses.title)}>
                    {discountInfo.value}
                  </span>
                  <span className={cn('font-medium', themeClasses.subText, sizeClasses.subtitle)}>
                    {discountInfo.label}
                  </span>
                </div>
                
                <Badge variant="secondary" size={size}>
                  {coupon.type.charAt(0).toUpperCase() + coupon.type.slice(1).replace('_', ' ')}
                </Badge>
              </div>
            </Flex>
            
            {/* Status Indicators */}
            <div className="flex items-center gap-1">
              {isApplied && (
                <Badge variant="success" size={size}>
                  <Check className="w-3 h-3 mr-1" />
                  Applied
                </Badge>
              )}
              
              {isExpired && (
                <Badge variant="destructive" size={size}>
                  <Clock className="w-3 h-3 mr-1" />
                  Expired
                </Badge>
              )}
              
              {!isEligible && !isExpired && (
                <Badge variant="warning" size={size}>
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Not Eligible
                </Badge>
              )}
              
              {showCountdown && timeUntilExpiry && !isExpired && (
                <Badge variant="outline" size={size}>
                  <Clock className="w-3 h-3 mr-1" />
                  {timeUntilExpiry}
                </Badge>
              )}
            </div>
          </Flex>
        </div>
        
        {/* Content */}
        <div className="space-y-3">
          {/* Title and Description */}
          <div>
            <h3 className={cn('font-semibold', themeClasses.text, sizeClasses.title)}>
              {coupon.title || `${discountInfo.value} ${discountInfo.label}`}
            </h3>
            {coupon.description && (
              <p className={cn(themeClasses.subText, sizeClasses.subtitle, 'mt-1')}>
                {coupon.description}
              </p>
            )}
          </div>
          
          {/* Coupon Code */}
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <span className={cn('font-mono font-bold flex-1', themeClasses.text)}>
              {coupon.code}
            </span>
            <Tooltip content="Copy code">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-6 w-6 p-0"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </Tooltip>
          </div>
          
          {/* Usage Progress */}
          {showUsage && coupon.usageLimit && coupon.usageLimit > 0 && (
            <div className="space-y-1">
              <Flex align="center" justify="between" className="text-xs">
                <span className={themeClasses.subText}>
                  {coupon.usageCount} of {coupon.usageLimit} used
                </span>
                <span className={themeClasses.subText}>
                  {Math.round(100 - usagePercentage)}% remaining
                </span>
              </Flex>
              <Progress 
                value={usagePercentage} 
                className="h-1"
                variant={usagePercentage > 80 ? 'destructive' : 'default'}
              />
            </div>
          )}
          
          {/* Requirements */}
          {coupon.minOrderValue && (
            <div className="flex items-center gap-2 text-xs">
              <ShoppingCart className="w-3 h-3 text-gray-400" />
              <span className={themeClasses.subText}>
                Minimum order: {formatCurrency(coupon.minOrderValue)}
                {cartTotal < coupon.minOrderValue && (
                  <span className="text-orange-600 ml-1">
                    (Add {formatCurrency(coupon.minOrderValue - cartTotal)} more)
                  </span>
                )}
              </span>
            </div>
          )}
          
          {/* Stackable Info */}
          {coupon.stackable && (
            <div className="flex items-center gap-2 text-xs">
              <Sparkles className="w-3 h-3 text-primary-400" />
              <span className={themeClasses.subText}>
                Can be combined with other offers
              </span>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleApply}
              disabled={!isAvailable || !isEligible || disabled || isLoading}
              className={cn(themeClasses.button, sizeClasses.button, 'flex-1')}
              loading={isLoading}
            >
              {isApplied ? (
                <>
                  <Check className={cn(sizeClasses.icon, 'mr-1')} />
                  Applied
                </>
              ) : isExpired ? (
                'Expired'
              ) : !isEligible ? (
                'Not Eligible'
              ) : (
                <>
                  <Zap className={cn(sizeClasses.icon, 'mr-1')} />
                  Apply Coupon
                </>
              )}
            </Button>
            
            {(showTerms || onViewDetails) && (
              <Tooltip content="View details">
                <Button
                  variant="outline"
                  size={size}
                  onClick={handleViewDetails}
                  className="px-2"
                >
                  <Info className={sizeClasses.icon} />
                </Button>
              </Tooltip>
            )}
            
            {showShare && (
              <Tooltip content="Share coupon">
                <Button
                  variant="outline"
                  size={size}
                  onClick={() => {
                    navigator.share?.({
                      title: coupon.title || 'Great Coupon Deal!',
                      text: `Get ${discountInfo.value} ${discountInfo.label} with code ${coupon.code}`,
                      url: window.location.href
                    });
                  }}
                  className="px-2"
                >
                  <ExternalLink className={sizeClasses.icon} />
                </Button>
              </Tooltip>
            )}
          </div>
          
          {/* Expanded Details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Separator className="my-3" />
                
                <div className="space-y-3 text-xs">
                  {/* Valid Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">Valid from:</span>
                      <br />
                      <span className={themeClasses.subText}>
                        {new Date(coupon.validFrom).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Valid until:</span>
                      <br />
                      <span className={themeClasses.subText}>
                        {new Date(coupon.validUntil).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Terms Preview */}
                  {showTerms && coupon.terms && (
                    <div>
                      <span className="font-medium text-gray-700">Terms & Conditions:</span>
                      <p className={cn(themeClasses.subText, 'mt-1 line-clamp-3')}>
                        {coupon.terms}
                      </p>
                    </div>
                  )}
                  
                  {/* Additional Info */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      {coupon.usageCount > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-gray-400" />
                          <span className={themeClasses.subText}>
                            {coupon.usageCount} used
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className={themeClasses.subText}>
                          ID: {coupon.id}
                        </span>
                      </div>
                    </div>
                    
                    <Badge variant="success" size="sm">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Hover Overlay Effect */}
        <AnimatePresence>
          {isHovered && animation === 'glow' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg pointer-events-none"
            />
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default CouponCard;
