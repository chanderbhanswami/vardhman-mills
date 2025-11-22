'use client';

import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  AlertCircle, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Info,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Copy,
  MessageCircle,
  ArrowRight,
  ShoppingCart,
  Calendar,
  Users,
  Shield
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  Card, 
  Badge, 
  Button, 
  Flex,
  Separator
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils/currency';

export type CouponErrorType = 
  | 'invalid_code'
  | 'expired'
  | 'not_started'
  | 'usage_limit_exceeded'
  | 'user_limit_exceeded'
  | 'min_order_not_met'
  | 'max_discount_exceeded'
  | 'product_not_eligible'
  | 'category_not_eligible'
  | 'already_applied'
  | 'not_stackable'
  | 'account_required'
  | 'region_restricted'
  | 'payment_method_restricted'
  | 'first_time_only'
  | 'network_error'
  | 'server_error'
  | 'unknown_error';

export interface CouponErrorDetails {
  type: CouponErrorType;
  message: string;
  code?: string;
  suggestions?: string[];
  retryable?: boolean;
  contactSupport?: boolean;
  helpUrl?: string;
  requiredAmount?: number;
  currentAmount?: number;
  validFrom?: Date;
  validUntil?: Date;
  maxUsage?: number;
  currentUsage?: number;
  eligibleProducts?: string[];
  eligibleCategories?: string[];
  requiredPaymentMethods?: string[];
  restrictedRegions?: string[];
}

export interface CouponErrorProps {
  /**
   * Error details
   */
  error: CouponErrorDetails;
  
  /**
   * Failed coupon code
   */
  couponCode?: string;
  
  /**
   * Callback when retry is requested
   */
  onRetry?: () => void;
  
  /**
   * Callback when help is requested
   */
  onHelp?: () => void;
  
  /**
   * Callback when support contact is requested
   */
  onContactSupport?: () => void;
  
  /**
   * Callback when user wants to continue shopping
   */
  onContinueShopping?: () => void;
  
  /**
   * Show detailed error information
   */
  showDetails?: boolean;
  
  /**
   * Show suggestions
   */
  showSuggestions?: boolean;
  
  /**
   * Show support options
   */
  showSupport?: boolean;
  
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Theme variant
   */
  theme?: 'destructive' | 'warning' | 'info';
  
  /**
   * Animation variant
   */
  animation?: 'shake' | 'bounce' | 'fade' | 'none';
  
  /**
   * Loading state for retry
   */
  isRetrying?: boolean;
  
  /**
   * Dismissible
   */
  dismissible?: boolean;
  
  /**
   * Callback when dismissed
   */
  onDismiss?: () => void;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Test ID for testing
   */
  testId?: string;
}

const CouponError: React.FC<CouponErrorProps> = ({
  error,
  couponCode,
  onRetry,
  onHelp,
  onContactSupport,
  onContinueShopping,
  showDetails = true,
  showSuggestions = true,
  showSupport = true,
  size = 'md',
  animation = 'shake',
  isRetrying = false,
  dismissible = false,
  onDismiss,
  className,
  testId = 'coupon-error'
}) => {
  // State
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get error icon and styling
  const getErrorConfig = () => {
    switch (error.type) {
      case 'expired':
        return {
          icon: Clock,
          title: 'Coupon Expired',
          variant: 'destructive' as const,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'not_started':
        return {
          icon: Calendar,
          title: 'Coupon Not Active Yet',
          variant: 'warning' as const,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
      case 'usage_limit_exceeded':
      case 'user_limit_exceeded':
        return {
          icon: Users,
          title: 'Usage Limit Reached',
          variant: 'destructive' as const,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'min_order_not_met':
        return {
          icon: ShoppingCart,
          title: 'Minimum Order Required',
          variant: 'warning' as const,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
      case 'already_applied':
        return {
          icon: AlertCircle,
          title: 'Already Applied',
          variant: 'warning' as const,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
      case 'invalid_code':
        return {
          icon: XCircle,
          title: 'Invalid Coupon Code',
          variant: 'destructive' as const,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'network_error':
      case 'server_error':
        return {
          icon: RefreshCw,
          title: 'Connection Error',
          variant: 'warning' as const,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
      default:
        return {
          icon: AlertTriangle,
          title: 'Coupon Error',
          variant: 'destructive' as const,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
    }
  };
  
  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          card: 'p-3',
          icon: 'w-4 h-4',
          title: 'text-sm',
          message: 'text-xs',
          button: 'text-xs px-2 py-1'
        };
      case 'lg':
        return {
          card: 'p-6',
          icon: 'w-6 h-6',
          title: 'text-lg',
          message: 'text-base',
          button: 'text-base px-6 py-3'
        };
      default:
        return {
          card: 'p-4',
          icon: 'w-5 h-5',
          title: 'text-base',
          message: 'text-sm',
          button: 'text-sm px-4 py-2'
        };
    }
  };
  
  // Get animation variants
  const getAnimationVariants = () => {
    switch (animation) {
      case 'shake':
        return {
          initial: { x: 0 },
          animate: { 
            x: [-5, 5, -5, 5, 0],
            transition: { duration: 0.5 }
          }
        };
      case 'bounce':
        return {
          initial: { scale: 0, opacity: 0 },
          animate: { 
            scale: 1, 
            opacity: 1,
            transition: { type: 'spring' as const, stiffness: 300, damping: 20 }
          }
        };
      case 'fade':
        return {
          initial: { opacity: 0, y: -10 },
          animate: { opacity: 1, y: 0 }
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 }
        };
    }
  };
  
  // Handle actions
  const handleRetry = useCallback(() => {
    if (isRetrying) return;
    onRetry?.();
  }, [onRetry, isRetrying]);
  
  const handleCopyCode = useCallback(() => {
    if (couponCode) {
      navigator.clipboard.writeText(couponCode);
      toast.success('Coupon code copied to clipboard');
    }
  }, [couponCode]);
  
  const handleHelp = useCallback(() => {
    if (error.helpUrl) {
      window.open(error.helpUrl, '_blank');
    }
    onHelp?.();
  }, [error.helpUrl, onHelp]);
  
  const errorConfig = getErrorConfig();
  const sizeClasses = getSizeClasses();
  const animationVariants = getAnimationVariants();
  
  const ErrorIcon = errorConfig.icon;
  
  return (
    <motion.div
      initial={animationVariants.initial}
      animate={animationVariants.animate}
      className={cn('relative', className)}
      data-testid={testId}
    >
      <Card className={cn(
        errorConfig.bgColor,
        errorConfig.borderColor,
        sizeClasses.card,
        'border-2'
      )}>
        <Flex align="start" gap={3}>
          {/* Error Icon */}
          <div className={cn(
            'rounded-full p-2 flex-shrink-0',
            errorConfig.color === 'text-red-600' ? 'bg-red-100' :
            errorConfig.color === 'text-orange-600' ? 'bg-orange-100' : 'bg-blue-100'
          )}>
            <ErrorIcon className={cn(sizeClasses.icon, errorConfig.color)} />
          </div>
          
          {/* Error Content */}
          <div className="flex-1 min-w-0">
            <Flex align="start" justify="between">
              <div className="flex-1">
                <h3 className={cn('font-semibold', errorConfig.color, sizeClasses.title)}>
                  {errorConfig.title}
                </h3>
                
                <p className={cn('mt-1 text-gray-700', sizeClasses.message)}>
                  {error.message}
                </p>
                
                {/* Coupon Code Display */}
                {couponCode && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-500">Code:</span>
                    <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {couponCode}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyCode}
                      className="h-5 w-5 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                
                {/* Contextual Information */}
                {error.type === 'min_order_not_met' && error.requiredAmount && (
                  <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                    <Flex align="center" gap={2}>
                      <ShoppingCart className="w-3 h-3 text-gray-500" />
                      <span>
                        Add {formatCurrency((error.requiredAmount || 0) - (error.currentAmount || 0))} more to qualify
                      </span>
                    </Flex>
                  </div>
                )}
                
                {(error.type === 'expired' || error.type === 'not_started') && error.validUntil && (
                  <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                    <Flex align="center" gap={2}>
                      <Calendar className="w-3 h-3 text-gray-500" />
                      <span>
                        {error.type === 'expired' ? 'Expired on' : 'Valid from'}{' '}
                        {new Date(error.type === 'expired' ? error.validUntil : error.validFrom!).toLocaleDateString()}
                      </span>
                    </Flex>
                  </div>
                )}
                
                {(error.type === 'usage_limit_exceeded' || error.type === 'user_limit_exceeded') && (
                  <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                    <Flex align="center" gap={2}>
                      <Users className="w-3 h-3 text-gray-500" />
                      <span>
                        Usage limit reached ({error.currentUsage}/{error.maxUsage})
                      </span>
                    </Flex>
                  </div>
                )}
              </div>
              
              {/* Dismiss Button */}
              {dismissible && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              )}
            </Flex>
            
            {/* Action Buttons */}
            <div className="mt-3 flex flex-wrap gap-2">
              {error.retryable && onRetry && (
                <Button
                  variant="outline"
                  size={size}
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className={cn(sizeClasses.button, 'bg-white')}
                >
                  {isRetrying ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="mr-1"
                    >
                      <RefreshCw className={sizeClasses.icon} />
                    </motion.div>
                  ) : (
                    <RefreshCw className={cn(sizeClasses.icon, 'mr-1')} />
                  )}
                  {isRetrying ? 'Retrying...' : 'Try Again'}
                </Button>
              )}
              
              {onContinueShopping && (
                <Button
                  variant="outline"
                  size={size}
                  onClick={onContinueShopping}
                  className={cn(sizeClasses.button, 'bg-white')}
                >
                  <ArrowRight className={cn(sizeClasses.icon, 'mr-1')} />
                  Continue Shopping
                </Button>
              )}
              
              {(showDetails || showSuggestions) && (
                <Button
                  variant="ghost"
                  size={size}
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={cn(sizeClasses.button, 'text-gray-600')}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className={cn(sizeClasses.icon, 'mr-1')} />
                      Less Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className={cn(sizeClasses.icon, 'mr-1')} />
                      More Details
                    </>
                  )}
                </Button>
              )}
            </div>
            
            {/* Expanded Content */}
            {isExpanded && (
              <div className="mt-3">
                <Separator className="mb-3" />
                
                <div className="space-y-3">
                  {/* Suggestions */}
                  {showSuggestions && error.suggestions && error.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-800 text-sm mb-2 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Suggestions
                      </h4>
                      <ul className="space-y-1 text-xs text-gray-600">
                        {error.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Eligible Products/Categories */}
                  {(error.eligibleProducts || error.eligibleCategories) && (
                    <div>
                      <h4 className="font-medium text-gray-800 text-sm mb-2 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Eligible Items
                      </h4>
                      <div className="space-y-2 text-xs">
                        {error.eligibleCategories && (
                          <div>
                            <span className="font-medium text-gray-700">Categories:</span>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {error.eligibleCategories.map((category, index) => (
                                <Badge key={index} variant="outline" size="sm">
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {error.eligibleProducts && (
                          <div>
                            <span className="font-medium text-gray-700">Products:</span>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {error.eligibleProducts.slice(0, 5).map((product, index) => (
                                <Badge key={index} variant="outline" size="sm">
                                  {product}
                                </Badge>
                              ))}
                              {error.eligibleProducts.length > 5 && (
                                <Badge variant="outline" size="sm">
                                  +{error.eligibleProducts.length - 5} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Support Options */}
                  {showSupport && (error.contactSupport || error.helpUrl) && (
                    <div>
                      <h4 className="font-medium text-gray-800 text-sm mb-2 flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" />
                        Need Help?
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {error.helpUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleHelp}
                            className="text-xs bg-white"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Help Center
                          </Button>
                        )}
                        
                        {error.contactSupport && onContactSupport && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={onContactSupport}
                            className="text-xs bg-white"
                          >
                            <MessageCircle className="w-3 h-3 mr-1" />
                            Contact Support
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Error Code */}
                  {error.code && (
                    <div className="pt-2 border-t border-gray-200">
                      <span className="text-xs text-gray-500">
                        Error Code: {error.code}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Flex>
      </Card>
    </motion.div>
  );
};

export default CouponError;
