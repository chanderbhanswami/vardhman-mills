import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';

export interface Coupon {
  code: string;
  type: 'percentage' | 'fixed' | 'shipping' | 'buy_x_get_y';
  value: number;
  description: string;
  minOrderValue?: number;
  maxDiscount?: number;
  applicableCategories?: string[];
  applicableProducts?: string[];
  excludedCategories?: string[];
  excludedProducts?: string[];
  usageLimit?: number;
  usageCount: number;
  userUsageLimit?: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  stackable: boolean;
}

export interface ApplyCouponData {
  couponCode: string;
  cartTotal: number;
  cartItems?: Array<{
    id: string;
    productId: string;
    categoryId: string;
    quantity: number;
    price: number;
  }>;
}

export interface CouponValidationResult {
  isValid: boolean;
  coupon?: Coupon;
  discount: number;
  appliedAmount: number;
  message: string;
  errorCode?: 'EXPIRED' | 'INVALID' | 'MIN_ORDER' | 'MAX_USAGE' | 'NOT_APPLICABLE';
}

export interface UseApplyCouponOptions {
  enableValidation?: boolean;
  showToast?: boolean;
  enableAnalytics?: boolean;
  autoApply?: boolean;
}

export const useApplyCoupon = (options: UseApplyCouponOptions = {}) => {
  const {
    enableValidation = true,
    showToast = true,
    enableAnalytics = true,
  } = options;

  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Local state
  const [validationState, setValidationState] = useState<{
    isValidating: boolean;
    lastValidation?: CouponValidationResult;
    validatedCode?: string;
  }>({
    isValidating: false,
  });

  // Apply coupon mutation
  const applyCouponMutation = useMutation({
    mutationFn: async (data: ApplyCouponData): Promise<CouponValidationResult> => {
      setValidationState(prev => ({ ...prev, isValidating: true }));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Mock coupon validation logic
      const mockCoupons: Coupon[] = [
        {
          code: 'WELCOME10',
          type: 'percentage',
          value: 10,
          description: '10% off on first order',
          minOrderValue: 500,
          maxDiscount: 1000,
          usageLimit: 1000,
          usageCount: 145,
          userUsageLimit: 1,
          validFrom: new Date('2024-01-01'),
          validUntil: new Date('2025-12-31'),
          isActive: true,
          stackable: false,
        },
        {
          code: 'FLAT50',
          type: 'fixed',
          value: 50,
          description: 'Flat ₹50 off on orders above ₹200',
          minOrderValue: 200,
          usageLimit: 5000,
          usageCount: 2341,
          validFrom: new Date('2024-01-01'),
          validUntil: new Date('2025-12-31'),
          isActive: true,
          stackable: true,
        },
        {
          code: 'FREESHIP',
          type: 'shipping',
          value: 100,
          description: 'Free shipping on all orders',
          minOrderValue: 0,
          usageLimit: 10000,
          usageCount: 5432,
          validFrom: new Date('2024-01-01'),
          validUntil: new Date('2025-12-31'),
          isActive: true,
          stackable: true,
        },
        {
          code: 'EXPIRED10',
          type: 'percentage',
          value: 10,
          description: 'Expired 10% coupon',
          validFrom: new Date('2023-01-01'),
          validUntil: new Date('2023-12-31'),
          isActive: false,
          stackable: false,
          usageLimit: 100,
          usageCount: 0,
        },
      ];

      const coupon = mockCoupons.find(c => c.code.toLowerCase() === data.couponCode.toLowerCase());

      if (!coupon) {
        return {
          isValid: false,
          discount: 0,
          appliedAmount: 0,
          message: 'Invalid coupon code',
          errorCode: 'INVALID',
        };
      }

      // Check if coupon is active
      if (!coupon.isActive) {
        return {
          isValid: false,
          coupon,
          discount: 0,
          appliedAmount: 0,
          message: 'This coupon is no longer active',
          errorCode: 'INVALID',
        };
      }

      // Check expiry
      const now = new Date();
      if (now < coupon.validFrom || now > coupon.validUntil) {
        return {
          isValid: false,
          coupon,
          discount: 0,
          appliedAmount: 0,
          message: 'This coupon has expired',
          errorCode: 'EXPIRED',
        };
      }

      // Check minimum order value
      if (coupon.minOrderValue && data.cartTotal < coupon.minOrderValue) {
        return {
          isValid: false,
          coupon,
          discount: 0,
          appliedAmount: 0,
          message: `Minimum order value of ₹${coupon.minOrderValue} required`,
          errorCode: 'MIN_ORDER',
        };
      }

      // Check usage limits
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return {
          isValid: false,
          coupon,
          discount: 0,
          appliedAmount: 0,
          message: 'This coupon has reached its usage limit',
          errorCode: 'MAX_USAGE',
        };
      }

      // Calculate discount
      let discount = 0;
      let appliedAmount = 0;

      switch (coupon.type) {
        case 'percentage':
          discount = (data.cartTotal * coupon.value) / 100;
          if (coupon.maxDiscount) {
            discount = Math.min(discount, coupon.maxDiscount);
          }
          appliedAmount = discount;
          break;
        case 'fixed':
          discount = Math.min(coupon.value, data.cartTotal);
          appliedAmount = discount;
          break;
        case 'shipping':
          discount = coupon.value;
          appliedAmount = discount;
          break;
        case 'buy_x_get_y':
          // Simplified buy X get Y logic
          discount = Math.floor(data.cartTotal / 1000) * 100; // Example: for every 1000 spent, get 100 off
          appliedAmount = discount;
          break;
        default:
          discount = 0;
          appliedAmount = 0;
      }

      // Track analytics
      if (enableAnalytics) {
        console.log('Analytics: Coupon applied', {
          couponCode: data.couponCode,
          couponType: coupon.type,
          discount: appliedAmount,
          cartTotal: data.cartTotal,
          userId: user?.id,
          timestamp: new Date(),
        });
      }

      return {
        isValid: true,
        coupon,
        discount,
        appliedAmount,
        message: `Coupon applied! You saved ₹${appliedAmount.toFixed(2)}`,
      };
    },
    onSuccess: (result) => {
      setValidationState(prev => ({
        ...prev,
        isValidating: false,
        lastValidation: result,
        validatedCode: result.coupon?.code,
      }));

      // Update cart with coupon
      if (result.isValid) {
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        queryClient.invalidateQueries({ queryKey: ['cart', 'summary'] });
        
        if (showToast) {
          toast.success(result.message, {
            duration: 3000,
            icon: '🎉',
          });
        }
      } else {
        if (showToast) {
          toast.error(result.message, { duration: 4000 });
        }
      }
    },
    onError: (error) => {
      setValidationState(prev => ({ ...prev, isValidating: false }));
      
      if (showToast) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to apply coupon',
          { duration: 4000 }
        );
      }
    },
  });

  // Apply coupon
  const applyCoupon = useCallback(
    async (couponCode: string, cartTotal: number, cartItems?: ApplyCouponData['cartItems']) => {
      return applyCouponMutation.mutateAsync({
        couponCode,
        cartTotal,
        cartItems,
      });
    },
    [applyCouponMutation]
  );

  // Validate coupon without applying
  const validateCoupon = useCallback(
    async (couponCode: string, cartTotal: number, cartItems?: ApplyCouponData['cartItems']) => {
      if (!enableValidation) {
        return { isValid: true, discount: 0, appliedAmount: 0, message: 'Validation disabled' };
      }

      // Use the same logic as apply but don't actually apply
      return applyCouponMutation.mutateAsync({
        couponCode,
        cartTotal,
        cartItems,
      });
    },
    [applyCouponMutation, enableValidation]
  );

  // Remove applied coupon
  const removeCoupon = useCallback(
    async () => {
      try {
        // Simulate API call to remove coupon
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update local state
        setValidationState(prev => ({
          ...prev,
          lastValidation: undefined,
          validatedCode: undefined,
        }));

        // Invalidate cart queries
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        queryClient.invalidateQueries({ queryKey: ['cart', 'summary'] });
        
        if (showToast) {
          toast.success('Coupon removed', {
            duration: 2000,
            icon: '🗑️',
          });
        }
        
        return true;
      } catch {
        if (showToast) {
          toast.error('Failed to remove coupon', { duration: 3000 });
        }
        return false;
      }
    },
    [queryClient, showToast]
  );

  // Check if coupon is applied
  const isCouponApplied = useCallback(
    (couponCode: string): boolean => {
      return validationState.validatedCode === couponCode && 
             validationState.lastValidation?.isValid === true;
    },
    [validationState]
  );

  // Get applied coupon info
  const getAppliedCoupon = useCallback(() => {
    if (validationState.lastValidation?.isValid && validationState.lastValidation.coupon) {
      return {
        coupon: validationState.lastValidation.coupon,
        discount: validationState.lastValidation.appliedAmount,
        message: validationState.lastValidation.message,
      };
    }
    return null;
  }, [validationState]);

  // Get coupon suggestions based on cart value
  const getCouponSuggestions = useCallback(
    (cartTotal: number) => {
      // Mock suggestions based on cart total
      if (cartTotal < 200) {
        return [
          { code: 'WELCOME10', reason: 'Get 10% off on orders above ₹500' },
        ];
      } else if (cartTotal < 500) {
        return [
          { code: 'FLAT50', reason: 'Get ₹50 off on this order' },
          { code: 'FREESHIP', reason: 'Get free shipping' },
        ];
      } else {
        return [
          { code: 'WELCOME10', reason: 'Get 10% off (up to ₹1000)' },
          { code: 'FLAT50', reason: 'Get ₹50 off' },
          { code: 'FREESHIP', reason: 'Get free shipping' },
        ];
      }
    },
    []
  );

  return {
    // Actions
    applyCoupon,
    validateCoupon,
    removeCoupon,
    
    // State
    isApplying: applyCouponMutation.isPending,
    isValidating: validationState.isValidating,
    error: applyCouponMutation.error,
    lastValidation: validationState.lastValidation,
    
    // Utilities
    isCouponApplied,
    getAppliedCoupon,
    getCouponSuggestions,
    
    // Reset
    resetValidation: () => setValidationState({ isValidating: false }),
  };
};

export default useApplyCoupon;
