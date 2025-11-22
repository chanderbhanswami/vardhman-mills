import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';

export interface GiftCardDesign {
  id: string;
  name: string;
  thumbnail: string;
  previewImage: string;
  category: 'birthday' | 'anniversary' | 'wedding' | 'festival' | 'general';
  isPremium: boolean;
  price?: number;
}

export interface GiftCardCheckoutItem {
  design: GiftCardDesign;
  amount: number;
  quantity: number;
  recipientInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  message?: string;
  deliveryDate?: Date;
  isScheduled: boolean;
}

export interface GiftCardCheckoutData {
  items: GiftCardCheckoutItem[];
  senderInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet';
  applyGiftCard?: {
    code: string;
    amount: number;
  };
  appliedCoupons?: {
    code: string;
    discount: number;
  }[];
  subtotal: number;
  discounts: number;
  taxes: number;
  total: number;
}

export interface GiftCardOrderResponse {
  orderId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  giftCards: {
    id: string;
    code: string;
    amount: number;
    recipientEmail: string;
  }[];
  paymentId?: string;
  createdAt: Date;
}



export const useGiftCardCheckout = () => {

  const { user, isAuthenticated } = useAuth();

  // Local state
  const [checkoutData, setCheckoutData] = useState<Partial<GiftCardCheckoutData>>({
    items: [],
    senderInfo: {
      name: user ? `${user.firstName} ${user.lastName || ''}`.trim() : '',
      email: user?.email || '',
      phone: '',
    },
    paymentMethod: 'card',
    subtotal: 0,
    discounts: 0,
    taxes: 0,
    total: 0,
  });
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch available gift card designs
  const {
    data: designs = [],
    isLoading: isLoadingDesigns,
  } = useQuery({
    queryKey: ['giftCardDesigns'],
    queryFn: async (): Promise<GiftCardDesign[]> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockDesigns: GiftCardDesign[] = [
        {
          id: 'birthday_01',
          name: 'Happy Birthday Celebration',
          thumbnail: '/images/gift-cards/birthday-01-thumb.jpg',
          previewImage: '/images/gift-cards/birthday-01-preview.jpg',
          category: 'birthday',
          isPremium: false,
        },
        {
          id: 'wedding_01',
          name: 'Wedding Bliss',
          thumbnail: '/images/gift-cards/wedding-01-thumb.jpg',
          previewImage: '/images/gift-cards/wedding-01-preview.jpg',
          category: 'wedding',
          isPremium: true,
          price: 50,
        },
        {
          id: 'festival_01',
          name: 'Festival Joy',
          thumbnail: '/images/gift-cards/festival-01-thumb.jpg',
          previewImage: '/images/gift-cards/festival-01-preview.jpg',
          category: 'festival',
          isPremium: false,
        },
        {
          id: 'general_01',
          name: 'Classic Elegant',
          thumbnail: '/images/gift-cards/general-01-thumb.jpg',
          previewImage: '/images/gift-cards/general-01-preview.jpg',
          category: 'general',
          isPremium: false,
        },
      ];

      return mockDesigns;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Validate coupon mutation
  const validateCouponMutation = useMutation({
    mutationFn: async (couponCode: string): Promise<{ isValid: boolean; discount: number; message: string }> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock validation
      const validCoupons = ['GIFT10', 'SAVE20', 'WELCOME'];
      const isValid = validCoupons.includes(couponCode.toUpperCase());
      
      return {
        isValid,
        discount: isValid ? (couponCode.toUpperCase() === 'SAVE20' ? 20 : 10) : 0,
        message: isValid ? 'Coupon applied successfully!' : 'Invalid coupon code',
      };
    },
  });

  // Process checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async (data: GiftCardCheckoutData): Promise<GiftCardOrderResponse> => {
      setIsProcessing(true);

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mockResponse: GiftCardOrderResponse = {
        orderId: `GC-ORD-${Date.now()}`,
        status: Math.random() > 0.1 ? 'completed' : 'failed', // 90% success rate
        giftCards: data.items.map((item, index) => ({
          id: `gc_${Date.now()}_${index}`,
          code: `GC-${Date.now().toString().slice(-6)}-${index}`,
          amount: item.amount,
          recipientEmail: item.recipientInfo.email,
        })),
        paymentId: `pay_${Date.now()}`,
        createdAt: new Date(),
      };

      return mockResponse;
    },
    onSuccess: (response) => {
      setIsProcessing(false);
      if (response.status === 'completed') {
        toast.success(
          `Gift card purchase successful! Order ID: ${response.orderId}`,
          { duration: 5000, icon: '🎉' }
        );
        clearCheckout();
      } else {
        toast.error('Payment failed. Please try again.', { duration: 4000 });
      }
    },
    onError: (error) => {
      setIsProcessing(false);
      toast.error(
        error instanceof Error ? error.message : 'Checkout failed',
        { duration: 4000 }
      );
    },
  });

  // Helper functions
  const addItem = useCallback((item: GiftCardCheckoutItem) => {
    setCheckoutData(prev => ({
      ...prev,
      items: [...(prev.items || []), item],
    }));
    
    toast.success('Gift card added to checkout', { duration: 2000 });
  }, []);

  const removeItem = useCallback((index: number) => {
    setCheckoutData(prev => ({
      ...prev,
      items: prev.items?.filter((_, i) => i !== index) || [],
    }));
    
    toast.success('Gift card removed', { duration: 2000 });
  }, []);

  const updateItem = useCallback((index: number, updates: Partial<GiftCardCheckoutItem>) => {
    setCheckoutData(prev => ({
      ...prev,
      items: prev.items?.map((item, i) => 
        i === index ? { ...item, ...updates } : item
      ) || [],
    }));
  }, []);

  const updateSenderInfo = useCallback((info: Partial<GiftCardCheckoutData['senderInfo']>) => {
    setCheckoutData(prev => ({
      ...prev,
      senderInfo: { ...prev.senderInfo!, ...info },
    }));
  }, []);

  const calculateTotals = useCallback(() => {
    const items = checkoutData.items || [];
    
    const subtotal = items.reduce((sum, item) => {
      const designCost = item.design.isPremium ? (item.design.price || 0) : 0;
      return sum + (item.amount + designCost) * item.quantity;
    }, 0);

    const couponDiscount = checkoutData.appliedCoupons?.reduce(
      (sum, coupon) => sum + coupon.discount,
      0
    ) || 0;

    const giftCardDiscount = checkoutData.applyGiftCard?.amount || 0;
    const totalDiscount = couponDiscount + giftCardDiscount;

    const taxableAmount = Math.max(0, subtotal - totalDiscount);
    const taxes = taxableAmount * 0.18; // 18% GST

    const total = taxableAmount + taxes;

    setCheckoutData(prev => ({
      ...prev,
      subtotal,
      discounts: totalDiscount,
      taxes,
      total,
    }));

    return { subtotal, discounts: totalDiscount, taxes, total };
  }, [checkoutData.items, checkoutData.appliedCoupons, checkoutData.applyGiftCard]);

  const validateCheckoutData = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    // Validate sender info
    if (!checkoutData.senderInfo?.name?.trim()) {
      errors.senderName = 'Sender name is required';
    }
    if (!checkoutData.senderInfo?.email?.trim()) {
      errors.senderEmail = 'Sender email is required';
    } else if (!/\S+@\S+\.\S+/.test(checkoutData.senderInfo.email)) {
      errors.senderEmail = 'Invalid email format';
    }

    // Validate items
    if (!checkoutData.items?.length) {
      errors.items = 'At least one gift card is required';
    } else {
      checkoutData.items.forEach((item, index) => {
        if (!item.recipientInfo?.name?.trim()) {
          errors[`recipient_${index}_name`] = `Recipient name is required for gift card ${index + 1}`;
        }
        if (!item.recipientInfo?.email?.trim()) {
          errors[`recipient_${index}_email`] = `Recipient email is required for gift card ${index + 1}`;
        } else if (!/\S+@\S+\.\S+/.test(item.recipientInfo.email)) {
          errors[`recipient_${index}_email`] = `Invalid email format for gift card ${index + 1}`;
        }
        if (item.amount < 100) {
          errors[`amount_${index}`] = `Minimum amount is ₹100 for gift card ${index + 1}`;
        }
        if (item.amount > 50000) {
          errors[`amount_${index}`] = `Maximum amount is ₹50,000 for gift card ${index + 1}`;
        }
      });
    }

    // Validate payment method
    if (!checkoutData.paymentMethod) {
      errors.paymentMethod = 'Payment method is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [checkoutData]);

  const applyCoupon = useCallback(async (couponCode: string) => {
    try {
      const result = await validateCouponMutation.mutateAsync(couponCode);
      
      if (result.isValid) {
        setCheckoutData(prev => ({
          ...prev,
          appliedCoupons: [
            ...(prev.appliedCoupons || []),
            { code: couponCode, discount: result.discount },
          ],
        }));
        toast.success(result.message, { duration: 3000 });
      } else {
        toast.error(result.message, { duration: 3000 });
      }
      
      return result;
    } catch (error) {
      toast.error('Failed to validate coupon', { duration: 3000 });
      throw error;
    }
  }, [validateCouponMutation]);

  const removeCoupon = useCallback((couponCode: string) => {
    setCheckoutData(prev => ({
      ...prev,
      appliedCoupons: prev.appliedCoupons?.filter(c => c.code !== couponCode) || [],
    }));
    toast.success('Coupon removed', { duration: 2000 });
  }, []);

  const processCheckout = useCallback(async () => {
    if (!validateCheckoutData()) {
      toast.error('Please fix validation errors before proceeding', { duration: 3000 });
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please login to complete the purchase', { duration: 3000 });
      return;
    }

    return checkoutMutation.mutateAsync(checkoutData as GiftCardCheckoutData);
  }, [checkoutData, validateCheckoutData, isAuthenticated, checkoutMutation]);

  const clearCheckout = useCallback(() => {
    setCheckoutData({
      items: [],
      senderInfo: {
        name: user ? `${user.firstName} ${user.lastName || ''}`.trim() : '',
        email: user?.email || '',
        phone: '',
      },
      paymentMethod: 'card',
      subtotal: 0,
      discounts: 0,
      taxes: 0,
      total: 0,
    });
    setValidationErrors({});
    setCurrentStep(0);
    toast.success('Checkout cleared', { duration: 2000 });
  }, [user]);

  const getDesignsByCategory = useCallback((category?: GiftCardDesign['category']) => {
    if (!category) return designs;
    return designs.filter(design => design.category === category);
  }, [designs]);

  const getItemCount = useCallback((): number => {
    return checkoutData.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }, [checkoutData.items]);

  const hasValidationErrors = useCallback((): boolean => {
    return Object.keys(validationErrors).length > 0;
  }, [validationErrors]);

  // Auto-calculate totals when items change
  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  return {
    // Data
    checkoutData,
    designs,
    validationErrors,
    
    // State
    isLoadingDesigns,
    isProcessing: isProcessing || checkoutMutation.isPending,
    isValidatingCoupon: validateCouponMutation.isPending,
    currentStep,
    
    // Actions
    addItem,
    removeItem,
    updateItem,
    updateSenderInfo,
    applyCoupon,
    removeCoupon,
    processCheckout,
    clearCheckout,
    validateCheckoutData,
    setCurrentStep,
    
    // Computed values
    itemCount: getItemCount(),
    hasErrors: hasValidationErrors(),
    canCheckout: !hasValidationErrors() && (checkoutData.items?.length || 0) > 0,
    
    // Helpers
    getDesignsByCategory,
    
    // Mutation states
    checkoutError: checkoutMutation.error,
    lastOrder: checkoutMutation.data,
  };
};

export default useGiftCardCheckout;
