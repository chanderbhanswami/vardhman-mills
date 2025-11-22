import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  type: 'percentage' | 'fixed' | 'shipping' | 'buy_x_get_y';
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  applicableCategories?: string[];
  applicableProducts?: string[];
  excludedCategories?: string[];
  excludedProducts?: string[];
  usageLimit?: number;
  usageCount: number;
  userUsageLimit?: number;
  userUsageCount?: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  stackable: boolean;
  isPublic: boolean;
  isPersonal: boolean;
  terms?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponsFilters {
  type?: string[];
  isActive?: boolean;
  isExpired?: boolean;
  isAvailable?: boolean;
  minValue?: number;
  maxValue?: number;
  categories?: string[];
  search?: string;
}

export interface CouponsSort {
  field: 'created' | 'expires' | 'value' | 'usage' | 'title';
  direction: 'asc' | 'desc';
}

export interface UseCouponsOptions {
  enablePersonal?: boolean;
  enablePublic?: boolean;
  autoLoad?: boolean;
  enableRealtime?: boolean;
}

export const useCoupons = (options: UseCouponsOptions = {}) => {
  const {
    enablePersonal = true,
    enablePublic = true,
    autoLoad = true,
    enableRealtime = false,
  } = options;

  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Local state
  const [filters, setFilters] = useState<CouponsFilters>({});
  const [sort, setSort] = useState<CouponsSort>({
    field: 'created',
    direction: 'desc',
  });

  // Realtime subscription effect
  useEffect(() => {
    if (!enableRealtime || !isAuthenticated) return;

    // Simulate realtime updates every 30 seconds
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    }, 30000);

    return () => clearInterval(interval);
  }, [enableRealtime, isAuthenticated, queryClient]);

  // Fetch coupons query
  const {
    data: coupons = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['coupons', { userId: user?.id, filters, sort, enablePersonal, enablePublic }],
    queryFn: async (): Promise<Coupon[]> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock coupon data
      const mockCoupons: Coupon[] = [
        {
          id: 'coupon_1',
          code: 'WELCOME10',
          title: 'Welcome Discount',
          description: '10% off on your first order',
          type: 'percentage',
          value: 10,
          minOrderValue: 500,
          maxDiscount: 1000,
          usageLimit: 1000,
          usageCount: 145,
          userUsageLimit: 1,
          userUsageCount: 0,
          validFrom: new Date('2024-01-01'),
          validUntil: new Date('2025-12-31'),
          isActive: true,
          stackable: false,
          isPublic: true,
          isPersonal: false,
          terms: 'Valid for new users only. Cannot be combined with other offers.',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'coupon_2',
          code: 'FLAT50',
          title: 'Flat ₹50 Off',
          description: 'Flat ₹50 discount on orders above ₹200',
          type: 'fixed',
          value: 50,
          minOrderValue: 200,
          usageLimit: 5000,
          usageCount: 2341,
          validFrom: new Date('2024-01-01'),
          validUntil: new Date('2025-12-31'),
          isActive: true,
          stackable: true,
          isPublic: true,
          isPersonal: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'coupon_3',
          code: 'FREESHIP',
          title: 'Free Shipping',
          description: 'Free shipping on all orders',
          type: 'shipping',
          value: 100,
          minOrderValue: 0,
          usageLimit: 10000,
          usageCount: 5432,
          validFrom: new Date('2024-01-01'),
          validUntil: new Date('2025-12-31'),
          isActive: true,
          stackable: true,
          isPublic: true,
          isPersonal: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'coupon_4',
          code: 'PERSONAL20',
          title: 'Personal 20% Off',
          description: 'Exclusive 20% discount just for you!',
          type: 'percentage',
          value: 20,
          minOrderValue: 1000,
          maxDiscount: 2000,
          usageLimit: 1,
          usageCount: 0,
          userUsageLimit: 1,
          userUsageCount: 0,
          validFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: true,
          stackable: false,
          isPublic: false,
          isPersonal: true,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'coupon_5',
          code: 'EXPIRED10',
          title: 'Expired Coupon',
          description: 'This coupon has expired',
          type: 'percentage',
          value: 10,
          validFrom: new Date('2023-01-01'),
          validUntil: new Date('2023-12-31'),
          isActive: false,
          stackable: false,
          isPublic: true,
          isPersonal: false,
          usageLimit: 100,
          usageCount: 0,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        },
        {
          id: 'coupon_6',
          code: 'BUY2GET1',
          title: 'Buy 2 Get 1 Free',
          description: 'Buy any 2 products and get 1 free',
          type: 'buy_x_get_y',
          value: 100, // Percentage
          applicableCategories: ['clothing', 'accessories'],
          validFrom: new Date('2024-01-01'),
          validUntil: new Date('2025-06-30'),
          isActive: true,
          stackable: false,
          isPublic: true,
          isPersonal: false,
          usageLimit: 1000,
          usageCount: 234,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      // Filter coupons based on options
      let filteredCoupons = mockCoupons.filter(coupon => {
        if (!enablePersonal && coupon.isPersonal) return false;
        if (!enablePublic && coupon.isPublic) return false;
        if (!isAuthenticated && coupon.isPersonal) return false;
        return true;
      });

      // Apply filters
      if (filters.type && filters.type.length > 0) {
        filteredCoupons = filteredCoupons.filter(coupon => 
          filters.type!.includes(coupon.type)
        );
      }

      if (filters.isActive !== undefined) {
        filteredCoupons = filteredCoupons.filter(coupon => 
          coupon.isActive === filters.isActive
        );
      }

      if (filters.isExpired !== undefined) {
        const now = new Date();
        filteredCoupons = filteredCoupons.filter(coupon => {
          const isExpired = coupon.validUntil < now;
          return filters.isExpired ? isExpired : !isExpired;
        });
      }

      if (filters.isAvailable !== undefined) {
        filteredCoupons = filteredCoupons.filter(coupon => {
          const isAvailable = coupon.isActive && 
            (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit) &&
            (!coupon.userUsageLimit || (coupon.userUsageCount || 0) < coupon.userUsageLimit);
          return filters.isAvailable ? isAvailable : !isAvailable;
        });
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredCoupons = filteredCoupons.filter(coupon =>
          coupon.code.toLowerCase().includes(searchLower) ||
          coupon.title.toLowerCase().includes(searchLower) ||
          coupon.description.toLowerCase().includes(searchLower)
        );
      }

      if (filters.minValue !== undefined) {
        filteredCoupons = filteredCoupons.filter(coupon => 
          coupon.value >= filters.minValue!
        );
      }

      if (filters.maxValue !== undefined) {
        filteredCoupons = filteredCoupons.filter(coupon => 
          coupon.value <= filters.maxValue!
        );
      }

      // Apply sorting
      filteredCoupons.sort((a, b) => {
        let compareValue = 0;
        
        switch (sort.field) {
          case 'created':
            compareValue = a.createdAt.getTime() - b.createdAt.getTime();
            break;
          case 'expires':
            compareValue = a.validUntil.getTime() - b.validUntil.getTime();
            break;
          case 'value':
            compareValue = a.value - b.value;
            break;
          case 'usage':
            compareValue = a.usageCount - b.usageCount;
            break;
          case 'title':
            compareValue = a.title.localeCompare(b.title);
            break;
        }
        
        return sort.direction === 'asc' ? compareValue : -compareValue;
      });

      return filteredCoupons;
    },
    enabled: autoLoad,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Claim personal coupon mutation
  const claimCouponMutation = useMutation({
    mutationFn: async (couponId: string): Promise<Coupon> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      const coupon = coupons.find(c => c.id === couponId);
      if (!coupon) {
        throw new Error('Coupon not found');
      }

      if (!coupon.isPersonal) {
        throw new Error('This coupon cannot be claimed');
      }

      // Return updated coupon
      return {
        ...coupon,
        userUsageCount: (coupon.userUsageCount || 0) + 1,
      };
    },
    onSuccess: (claimedCoupon) => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      
      toast.success(`Coupon "${claimedCoupon.code}" claimed successfully!`, {
        duration: 3000,
        icon: '🎫',
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to claim coupon',
        { duration: 4000 }
      );
    },
  });

  // Computed values
  const availableCoupons = useMemo(() => {
    const now = new Date();
    return coupons.filter(coupon => 
      coupon.isActive &&
      coupon.validFrom <= now &&
      coupon.validUntil >= now &&
      (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit) &&
      (!coupon.userUsageLimit || (coupon.userUsageCount || 0) < coupon.userUsageLimit)
    );
  }, [coupons]);

  const expiredCoupons = useMemo(() => {
    const now = new Date();
    return coupons.filter(coupon => coupon.validUntil < now);
  }, [coupons]);

  const personalCoupons = useMemo(() => {
    return coupons.filter(coupon => coupon.isPersonal);
  }, [coupons]);

  const publicCoupons = useMemo(() => {
    return coupons.filter(coupon => coupon.isPublic);
  }, [coupons]);

  // Helper functions
  const getCouponById = useCallback(
    (id: string): Coupon | undefined => {
      return coupons.find(coupon => coupon.id === id);
    },
    [coupons]
  );

  const getCouponByCode = useCallback(
    (code: string): Coupon | undefined => {
      return coupons.find(coupon => 
        coupon.code.toLowerCase() === code.toLowerCase()
      );
    },
    [coupons]
  );

  const isCouponValid = useCallback(
    (coupon: Coupon, cartTotal?: number): boolean => {
      const now = new Date();
      
      // Check basic validity
      if (!coupon.isActive || 
          coupon.validFrom > now || 
          coupon.validUntil < now) {
        return false;
      }

      // Check usage limits
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return false;
      }

      if (coupon.userUsageLimit && 
          (coupon.userUsageCount || 0) >= coupon.userUsageLimit) {
        return false;
      }

      // Check minimum order value
      if (cartTotal !== undefined && 
          coupon.minOrderValue && 
          cartTotal < coupon.minOrderValue) {
        return false;
      }

      return true;
    },
    []
  );

  const getCouponSavings = useCallback(
    (coupon: Coupon, cartTotal: number): number => {
      if (!isCouponValid(coupon, cartTotal)) return 0;

      let savings = 0;
      
      switch (coupon.type) {
        case 'percentage':
          savings = (cartTotal * coupon.value) / 100;
          if (coupon.maxDiscount) {
            savings = Math.min(savings, coupon.maxDiscount);
          }
          break;
        case 'fixed':
          savings = Math.min(coupon.value, cartTotal);
          break;
        case 'shipping':
          savings = coupon.value;
          break;
        case 'buy_x_get_y':
          // Simplified calculation
          savings = Math.floor(cartTotal / 1000) * 100;
          break;
      }

      return savings;
    },
    [isCouponValid]
  );

  // Filter and sort functions
  const applyFilters = useCallback(
    (newFilters: Partial<CouponsFilters>) => {
      setFilters(prev => ({ ...prev, ...newFilters }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const applySort = useCallback(
    (newSort: Partial<CouponsSort>) => {
      setSort(prev => ({ ...prev, ...newSort }));
    },
    []
  );

  const claimCoupon = useCallback(
    async (couponId: string) => {
      if (!isAuthenticated) {
        toast.error('Please login to claim coupons', { duration: 4000 });
        return;
      }
      
      return claimCouponMutation.mutateAsync(couponId);
    },
    [claimCouponMutation, isAuthenticated]
  );

  return {
    // Data
    coupons,
    availableCoupons,
    expiredCoupons,
    personalCoupons,
    publicCoupons,
    
    // State
    isLoading,
    error,
    filters,
    sort,
    
    // Actions
    claimCoupon,
    refetch,
    
    // Filters and sorting
    applyFilters,
    clearFilters,
    applySort,
    
    // Utilities
    getCouponById,
    getCouponByCode,
    isCouponValid,
    getCouponSavings,
    
    // Stats
    totalCount: coupons.length,
    availableCount: availableCoupons.length,
    expiredCount: expiredCoupons.length,
    personalCount: personalCoupons.length,
    
    // Mutation state
    isClaiming: claimCouponMutation.isPending,
    claimError: claimCouponMutation.error,
  };
};

export default useCoupons;
