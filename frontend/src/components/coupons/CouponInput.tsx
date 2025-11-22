'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket, 
  Check, 
  X, 
  AlertCircle, 
  Loader2, 
  Gift, 
  Tag,
  Clock,
  Copy,
  Sparkles
} from 'lucide-react';
import { useDebounce } from '@/hooks/common/useDebounce';
import { useCoupons } from '@/hooks/coupons/useCoupons';
import { toast } from 'react-hot-toast';
import { 
  Input, 
  Button, 
  Badge, 
  Card, 
  Tooltip, 
  Spinner,
  Box,
  Flex
} from '@/components/ui';
import type { Coupon } from '@/hooks/coupons/useCoupons';
import { formatCurrency } from '@/lib/utils/currency';
import { cn } from '@/lib/utils';

// Validation schema
const couponSchema = yup.object({
  code: yup
    .string()
    .required('Please enter a coupon code')
    .min(3, 'Coupon code must be at least 3 characters')
    .max(50, 'Coupon code cannot exceed 50 characters')
    .matches(/^[A-Z0-9_-]+$/i, 'Coupon code can only contain letters, numbers, hyphens, and underscores')
});

export interface CouponInputProps {
  /**
   * Current applied coupon
   */
  appliedCoupon?: Coupon | null;
  
  /**
   * Cart subtotal for validation
   */
  cartSubtotal: number;
  
  /**
   * Products in cart for validation
   */
  cartProducts?: Array<{
    id: string;
    categoryId?: string;
    brandId?: string;
  }>;
  
  /**
   * Customer ID for validation
   */
  customerId?: string;
  
  /**
   * Callback when coupon is successfully applied
   */
  onCouponApplied: (coupon: Coupon, discount: number) => void;
  
  /**
   * Callback when coupon is removed
   */
  onCouponRemoved: (coupon: Coupon) => void;
  
  /**
   * Callback when validation fails
   */
  onValidationError: (error: string) => void;
  
  /**
   * Show available coupons
   */
  showAvailableCoupons?: boolean;
  
  /**
   * Suggested coupons
   */
  suggestedCoupons?: Coupon[];
  
  /**
   * Loading state
   */
  isLoading?: boolean;
  
  /**
   * Disabled state
   */
  disabled?: boolean;
  
  /**
   * Placeholder text
   */
  placeholder?: string;
  
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Full width
   */
  fullWidth?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Test ID for testing
   */
  testId?: string;
}

export interface CouponInputFormData {
  code: string;
}

const CouponInput: React.FC<CouponInputProps> = ({
  appliedCoupon,
  cartSubtotal,
  cartProducts = [],
  customerId,
  onCouponApplied,
  onCouponRemoved,
  onValidationError,
  showAvailableCoupons = true,
  suggestedCoupons = [],
  isLoading: externalLoading = false,
  disabled = false,
  placeholder = 'Enter coupon code',
  size = 'md',
  fullWidth = false,
  className,
  testId = 'coupon-input'
}) => {
  // State
  const [isExpanded, setIsExpanded] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [lastValidationError, setLastValidationError] = useState<string | null>(null);
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);
  
  // Hooks
  const { 
    availableCoupons,
    getCouponByCode,
    isCouponValid,
    getCouponSavings,
    isLoading: couponsLoading 
  } = useCoupons({
    enablePersonal: true,
    enablePublic: true,
    autoLoad: true
  });
  
  // Form
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CouponInputFormData>({
    resolver: yupResolver(couponSchema),
    defaultValues: {
      code: appliedCoupon?.code || ''
    }
  });
  
  const watchedCode = watch('code');
  const debouncedCode = useDebounce(watchedCode, 500);
  
  // Loading state
  const isLoading = externalLoading || isSubmitting || isValidating || couponsLoading;

  // Auto-validation function
  const handleAutoValidation = useCallback(async (code: string) => {
    if (!code || code.length < 3) return;
    
    try {
      setIsValidating(true);
      setLastValidationError(null);
      
      const coupon = getCouponByCode(code);
      
      if (!coupon) {
        setLastValidationError('Invalid coupon code');
        return;
      }

      if (!isCouponValid(coupon, cartSubtotal)) {
        // Check if coupon is valid for cart products
        if (cartProducts.length > 0 && coupon.applicableProducts?.length) {
          const hasValidProducts = cartProducts.some(product => 
            coupon.applicableProducts?.includes(product.id)
          );
          if (!hasValidProducts) {
            setLastValidationError('This coupon is not valid for items in your cart');
            return;
          }
        }
        
        setLastValidationError('This coupon is not valid for your current order');
        return;
      }
      
    } catch (error) {
      console.error('Auto-validation error:', error);
    } finally {
      setIsValidating(false);
    }
  }, [getCouponByCode, isCouponValid, cartSubtotal, cartProducts]);
  
  // Auto-validate on code change
  useEffect(() => {
    if (debouncedCode && debouncedCode.length >= 3 && !appliedCoupon) {
      handleAutoValidation(debouncedCode);
    }
  }, [debouncedCode, appliedCoupon, handleAutoValidation]);
  
  // Apply coupon
  const handleApplyCoupon = useCallback(async (data: CouponInputFormData) => {
    try {
      const coupon = getCouponByCode(data.code.toUpperCase());
      
      if (!coupon) {
        onValidationError('Invalid coupon code');
        setLastValidationError('Invalid coupon code');
        
        toast.error('Invalid coupon code');
        return;
      }

      if (!isCouponValid(coupon, cartSubtotal)) {
        // Additional validation for customer eligibility
        if (customerId && coupon.isPersonal) {
          // This would typically check against customer eligibility in a real app
          console.log('Validating coupon for customer:', customerId);
        }
        
        const errorMsg = 'This coupon is not valid for your current order';
        onValidationError(errorMsg);
        setLastValidationError(errorMsg);
        
        toast.error(errorMsg);
        return;
      }

      const discount = getCouponSavings(coupon, cartSubtotal);
      
      onCouponApplied(coupon, discount);
      setIsExpanded(false);
      setLastValidationError(null);
      
      toast.success(`Coupon Applied! You saved ${formatCurrency(discount)}`);
      
    } catch (error) {
      console.error('Apply coupon error:', error);
      toast.error('Failed to apply coupon. Please try again.');
    }
  }, [
    getCouponByCode,
    isCouponValid,
    getCouponSavings,
    cartSubtotal,
    customerId,
    onCouponApplied,
    onValidationError
  ]);
  
  // Remove coupon
  const handleRemoveCoupon = useCallback(async () => {
    if (!appliedCoupon) return;
    
    try {
      onCouponRemoved(appliedCoupon);
      reset({ code: '' });
      setLastValidationError(null);
      
      toast.success(`Coupon ${appliedCoupon.code} has been removed`);
    } catch (error) {
      console.error('Remove coupon error:', error);
      toast.error('Failed to remove coupon. Please try again.');
    }
  }, [appliedCoupon, onCouponRemoved, reset]);
  
  // Apply suggested coupon
  const handleApplySuggestedCoupon = useCallback((coupon: Coupon) => {
    setValue('code', coupon.code);
    setShowSuggestions(false);
    handleSubmit(handleApplyCoupon)();
  }, [setValue, handleSubmit, handleApplyCoupon]);
  
  // Copy coupon code
  const handleCopyCoupon = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code ${code} copied to clipboard`);
  }, []);
  
  // Get discount badge variant
  const getDiscountBadgeVariant = (discountType: string) => {
    switch (discountType) {
      case 'percentage':
        return 'success';
      case 'fixed':
        return 'default';
      case 'shipping':
        return 'info';
      default:
        return 'secondary';
    }
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };
  
  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <Box 
      className={cn(
        'relative',
        fullWidth && 'w-full',
        className
      )}
      data-testid={testId}
    >
      {/* Applied Coupon Display */}
      {appliedCoupon && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Card className="p-4 border-green-200 bg-green-50">
            <Flex align="center" justify="between">
              <Flex align="center" gap={3}>
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-green-600" />
                </div>
                
                <div>
                  <Flex align="center" gap={2} className="mb-1">
                    <span className="font-semibold text-green-800">
                      {appliedCoupon.code}
                    </span>
                    <Badge 
                      variant={getDiscountBadgeVariant(appliedCoupon.type)}
                      size="sm"
                    >
                      {appliedCoupon.type === 'percentage' 
                        ? `${appliedCoupon.value}% OFF`
                        : appliedCoupon.type === 'fixed'
                        ? `${formatCurrency(appliedCoupon.value)} OFF`
                        : 'FREE SHIPPING'
                      }
                    </Badge>
                  </Flex>
                  
                  <p className="text-sm text-green-700">
                    {appliedCoupon.title || 'Coupon applied successfully'}
                  </p>
                </div>
              </Flex>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveCoupon}
                disabled={isLoading}
                className="text-green-700 hover:text-green-800 hover:bg-green-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </Flex>
          </Card>
        </motion.div>
      )}
      
      {/* Coupon Input Form */}
      {!appliedCoupon && (
        <form onSubmit={handleSubmit(handleApplyCoupon)}>
          <Card className="p-1">
            <Flex gap={1}>
              <div className="flex-1 relative">
                <Controller
                  name="code"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      ref={inputRef}
                      placeholder={placeholder}
                      disabled={disabled || isLoading}
                      className={cn(
                        'border-0 focus:ring-0 focus:border-0 bg-transparent',
                        sizeClasses[size],
                        errors.code && 'text-red-600'
                      )}
                      onFocus={() => {
                        setIsExpanded(true);
                        setShowSuggestions(true);
                      }}
                      onChange={(e) => {
                        field.onChange(e.target.value.toUpperCase());
                        setLastValidationError(null);
                      }}
                      leftIcon={<Tag className="w-4 h-4 text-gray-400" />}
                      rightIcon={
                        isValidating ? (
                          <Spinner size="sm" />
                        ) : lastValidationError ? (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        ) : watchedCode && watchedCode.length >= 3 ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : undefined
                      }
                    />
                  )}
                />
              </div>
              
              <Button
                type="submit"
                disabled={disabled || isLoading || !watchedCode || watchedCode.length < 3}
                size={size}
                className="flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Apply'
                )}
              </Button>
            </Flex>
            
            {/* Error Message */}
            {(errors.code || lastValidationError) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="px-3 py-2"
              >
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.code?.message || lastValidationError}
                </p>
              </motion.div>
            )}
          </Card>
        </form>
      )}
      
      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && isExpanded && !appliedCoupon && (
          <motion.div
            ref={suggestionRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 z-50 mt-2"
          >
            <Card className="max-h-64 overflow-y-auto shadow-lg">
              {/* Available Coupons */}
              {showAvailableCoupons && availableCoupons.length > 0 && (
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Available Coupons
                  </h4>
                  
                  <div className="space-y-2">
                    {availableCoupons.slice(0, 3).map((coupon: Coupon) => (
                      <div
                        key={coupon.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleApplySuggestedCoupon(coupon)}
                      >
                        <Flex align="center" justify="between" className="mb-2">
                          <Flex align="center" gap={2}>
                            <span className="font-mono font-medium text-sm">
                              {coupon.code}
                            </span>
                            <Badge 
                              variant={getDiscountBadgeVariant(coupon.type)}
                              size="sm"
                            >
                              {coupon.type === 'percentage' 
                                ? `${coupon.value}% OFF`
                                : coupon.type === 'fixed'
                                ? `${formatCurrency(coupon.value)} OFF`
                                : 'FREE SHIPPING'
                              }
                            </Badge>
                          </Flex>
                          
                          <Tooltip content="Copy code">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyCoupon(coupon.code);
                              }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </Tooltip>
                        </Flex>
                        
                        <p className="text-xs text-gray-600 mb-1">
                          {coupon.title}
                        </p>
                        
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expires {new Date(coupon.validUntil).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Suggested Coupons */}
              {suggestedCoupons.length > 0 && (
                <div className="p-4 border-t">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    Suggested for You
                  </h4>
                  
                  <div className="space-y-2">
                    {suggestedCoupons.slice(0, 2).map((coupon: Coupon) => (
                      <div
                        key={coupon.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleApplySuggestedCoupon(coupon)}
                      >
                        <Flex align="center" justify="between" className="mb-2">
                          <Flex align="center" gap={2}>
                            <span className="font-mono font-medium text-sm">
                              {coupon.code}
                            </span>
                            <Badge 
                              variant={getDiscountBadgeVariant(coupon.type)}
                              size="sm"
                            >
                              {coupon.type === 'percentage' 
                                ? `${coupon.value}% OFF`
                                : `${formatCurrency(coupon.value)} OFF`
                              }
                            </Badge>
                          </Flex>
                          
                          <Tooltip content="Copy code">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyCoupon(coupon.code);
                              }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </Tooltip>
                        </Flex>
                        
                        <p className="text-xs text-gray-600">
                          {coupon.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* No suggestions */}
              {availableCoupons.length === 0 && suggestedCoupons.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  <Ticket className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No available coupons at the moment</p>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default CouponInput;
