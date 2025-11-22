/**
 * Coupon Context - Vardhman Mills Frontend
 * Manages coupons, discounts, and promotional offers
 */

'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

// Import CartItem type
interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}
// Types
type DiscountType = 'percentage' | 'fixed_amount' | 'free_shipping' | 'bogo';
type CouponType = 'welcome' | 'seasonal' | 'clearance' | 'loyalty' | 'referral' | 'cart_abandonment';

interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  type: CouponType;
  discountType: DiscountType;
  discountValue: number; // Percentage or fixed amount
  minOrderValue?: number;
  maxDiscountAmount?: number;
  validFrom: Date;
  validUntil: Date;
  usageLimit?: number;
  usageCount: number;
  userUsageLimit?: number;
  isActive: boolean;
  isPublic: boolean;
  applicableCategories?: string[];
  applicableProducts?: string[];
  excludedCategories?: string[];
  excludedProducts?: string[];
  firstTimeOnly?: boolean;
  stackable: boolean;
  image?: string;
  terms?: string[];
}

interface AppliedCoupon {
  coupon: Coupon;
  discountAmount: number;
  appliedAt: Date;
}

interface CouponValidationResult {
  valid: boolean;
  message: string;
  discountAmount?: number;
  coupon?: Coupon;
}

interface AutoApplyCoupon {
  coupon: Coupon;
  reason: string;
  savings: number;
}

interface CouponState {
  availableCoupons: Coupon[];
  appliedCoupons: AppliedCoupon[];
  loading: boolean;
  validating: boolean;
  autoApplySuggestions: AutoApplyCoupon[];
  lastUpdated: Date | null;
  userCoupons: Coupon[]; // User-specific coupons
  earnedCoupons: Coupon[]; // Coupons earned through actions
}

type CouponAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_VALIDATING'; payload: boolean }
  | { type: 'SET_AVAILABLE_COUPONS'; payload: Coupon[] }
  | { type: 'SET_USER_COUPONS'; payload: Coupon[] }
  | { type: 'SET_EARNED_COUPONS'; payload: Coupon[] }
  | { type: 'APPLY_COUPON'; payload: AppliedCoupon }
  | { type: 'REMOVE_COUPON'; payload: string }
  | { type: 'CLEAR_COUPONS' }
  | { type: 'SET_AUTO_SUGGESTIONS'; payload: AutoApplyCoupon[] }
  | { type: 'UPDATE_COUPON_USAGE'; payload: { couponId: string; usageCount: number } };

interface CouponContextType {
  state: CouponState;
  
  // Coupon operations
  loadAvailableCoupons: () => Promise<void>;
  loadUserCoupons: () => Promise<void>;
  applyCoupon: (code: string, orderValue: number, items?: CartItem[]) => Promise<CouponValidationResult>;
  removeCoupon: (couponId: string) => void;
  clearAllCoupons: () => void;
  
  // Validation
  validateCoupon: (code: string, orderValue: number, items?: CartItem[]) => Promise<CouponValidationResult>;
  checkAutoApply: (orderValue: number, items?: CartItem[]) => Promise<AutoApplyCoupon[]>;
  
  // Utility
  getTotalDiscount: () => number;
  getCouponByCode: (code: string) => Coupon | undefined;
  getAppliedCoupons: () => AppliedCoupon[];
  canApplyMore: () => boolean;
  
  // Coupon earning
  claimCoupon: (couponId: string) => Promise<boolean>;
  checkEarnedCoupons: () => Promise<Coupon[]>;
  
  // Social sharing
  shareCoupon: (couponId: string) => Promise<string>;
  generateReferralCoupon: () => Promise<Coupon | null>;
}

// Initial state
const initialState: CouponState = {
  availableCoupons: [],
  appliedCoupons: [],
  loading: false,
  validating: false,
  autoApplySuggestions: [],
  lastUpdated: null,
  userCoupons: [],
  earnedCoupons: [],
};

// Utility functions
const calculateDiscount = (coupon: Coupon, orderValue: number): number => {
  let discount = 0;
  
  switch (coupon.discountType) {
    case 'percentage':
      discount = (orderValue * coupon.discountValue) / 100;
      break;
    case 'fixed_amount':
      discount = coupon.discountValue;
      break;
    case 'free_shipping':
      discount = 99; // Assuming ₹99 shipping cost
      break;
    default:
      discount = 0;
  }
  
  // Apply maximum discount limit
  if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
    discount = coupon.maxDiscountAmount;
  }
  
  return Math.min(discount, orderValue);
};

const isCouponValid = (coupon: Coupon, orderValue: number): { valid: boolean; message: string } => {
  const now = new Date();
  
  // Check if coupon is active
  if (!coupon.isActive) {
    return { valid: false, message: 'This coupon is not active' };
  }
  
  // Check validity period
  if (now < new Date(coupon.validFrom)) {
    return { valid: false, message: 'This coupon is not yet valid' };
  }
  
  if (now > new Date(coupon.validUntil)) {
    return { valid: false, message: 'This coupon has expired' };
  }
  
  // Check usage limit
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return { valid: false, message: 'This coupon has reached its usage limit' };
  }
  
  // Check minimum order value
  if (coupon.minOrderValue && orderValue < coupon.minOrderValue) {
    return { valid: false, message: `Minimum order value of ₹${coupon.minOrderValue} required` };
  }
  
  return { valid: true, message: 'Coupon is valid' };
};

// Reducer
const couponReducer = (state: CouponState, action: CouponAction): CouponState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_VALIDATING':
      return { ...state, validating: action.payload };
    
    case 'SET_AVAILABLE_COUPONS':
      return {
        ...state,
        availableCoupons: action.payload,
        lastUpdated: new Date(),
      };
    
    case 'SET_USER_COUPONS':
      return { ...state, userCoupons: action.payload };
    
    case 'SET_EARNED_COUPONS':
      return { ...state, earnedCoupons: action.payload };
    
    case 'APPLY_COUPON':
      // Check if coupon is stackable or if no coupons are applied
      const canApply = state.appliedCoupons.length === 0 || 
                      action.payload.coupon.stackable ||
                      state.appliedCoupons.every(ac => ac.coupon.stackable);
      
      if (!canApply) {
        return state;
      }
      
      return {
        ...state,
        appliedCoupons: [...state.appliedCoupons, action.payload],
        lastUpdated: new Date(),
      };
    
    case 'REMOVE_COUPON':
      return {
        ...state,
        appliedCoupons: state.appliedCoupons.filter(ac => ac.coupon.id !== action.payload),
        lastUpdated: new Date(),
      };
    
    case 'CLEAR_COUPONS':
      return {
        ...state,
        appliedCoupons: [],
        lastUpdated: new Date(),
      };
    
    case 'SET_AUTO_SUGGESTIONS':
      return { ...state, autoApplySuggestions: action.payload };
    
    case 'UPDATE_COUPON_USAGE':
      return {
        ...state,
        availableCoupons: state.availableCoupons.map(coupon =>
          coupon.id === action.payload.couponId
            ? { ...coupon, usageCount: action.payload.usageCount }
            : coupon
        ),
      };
    
    default:
      return state;
  }
};

// Context
const CouponContext = createContext<CouponContextType | undefined>(undefined);

// Provider component
interface CouponProviderProps {
  children: ReactNode;
}

export const CouponProvider: React.FC<CouponProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(couponReducer, initialState);
  
  // Load coupons on mount
  useEffect(() => {
    loadAvailableCoupons();
    loadUserCoupons();
  }, []);
  
  // Context methods
  const loadAvailableCoupons = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch('/api/coupons/available');
      if (!response.ok) throw new Error('Failed to load coupons');
      
      const data = await response.json();
      dispatch({ type: 'SET_AVAILABLE_COUPONS', payload: data.coupons || [] });
    } catch (error) {
      console.error('Failed to load available coupons:', error);
      toast.error('Failed to load available coupons');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const loadUserCoupons = async (): Promise<void> => {
    try {
      const response = await fetch('/api/coupons/user');
      if (!response.ok) return; // User might not be logged in
      
      const data = await response.json();
      dispatch({ type: 'SET_USER_COUPONS', payload: data.coupons || [] });
    } catch (error) {
      console.error('Failed to load user coupons:', error);
    }
  };
  
  const validateCoupon = async (code: string, orderValue: number, items?: CartItem[]): Promise<CouponValidationResult> => {
    try {
      dispatch({ type: 'SET_VALIDATING', payload: true });
      
      // Find coupon by code
      const coupon = [...state.availableCoupons, ...state.userCoupons]
        .find(c => c.code.toLowerCase() === code.toLowerCase());
      
      if (!coupon) {
        return {
          valid: false,
          message: 'Invalid coupon code',
        };
      }
      
      // Check if already applied
      if (state.appliedCoupons.some(ac => ac.coupon.id === coupon.id)) {
        return {
          valid: false,
          message: 'Coupon already applied',
        };
      }
      
      // Check basic validation
      const validation = isCouponValid(coupon, orderValue);
      if (!validation.valid) {
        return {
          valid: false,
          message: validation.message,
        };
      }
      
      // Check stackability
      if (state.appliedCoupons.length > 0 && !coupon.stackable) {
        return {
          valid: false,
          message: 'This coupon cannot be combined with other offers',
        };
      }
      
      // Server-side validation
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, orderValue, items }),
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.valid) {
        return {
          valid: false,
          message: result.message || 'Coupon validation failed',
        };
      }
      
      const discountAmount = calculateDiscount(coupon, orderValue);
      
      return {
        valid: true,
        message: `Coupon applied! You save ₹${discountAmount}`,
        discountAmount,
        coupon,
      };
    } catch (error) {
      console.error('Coupon validation failed:', error);
      return {
        valid: false,
        message: 'Failed to validate coupon',
      };
    } finally {
      dispatch({ type: 'SET_VALIDATING', payload: false });
    }
  };
  
  const applyCoupon = async (code: string, orderValue: number, items?: CartItem[]): Promise<CouponValidationResult> => {
    const validation = await validateCoupon(code, orderValue, items);
    
    if (validation.valid && validation.coupon && validation.discountAmount !== undefined) {
      const appliedCoupon: AppliedCoupon = {
        coupon: validation.coupon,
        discountAmount: validation.discountAmount,
        appliedAt: new Date(),
      };
      
      dispatch({ type: 'APPLY_COUPON', payload: appliedCoupon });
      toast.success(validation.message);
      
      // Update usage count
      dispatch({
        type: 'UPDATE_COUPON_USAGE',
        payload: {
          couponId: validation.coupon.id,
          usageCount: validation.coupon.usageCount + 1,
        },
      });
    } else {
      toast.error(validation.message);
    }
    
    return validation;
  };
  
  const removeCoupon = (couponId: string): void => {
    const appliedCoupon = state.appliedCoupons.find(ac => ac.coupon.id === couponId);
    dispatch({ type: 'REMOVE_COUPON', payload: couponId });
    
    if (appliedCoupon) {
      toast.success(`${appliedCoupon.coupon.title} removed`);
    }
  };
  
  const clearAllCoupons = (): void => {
    dispatch({ type: 'CLEAR_COUPONS' });
    toast.success('All coupons removed');
  };
  
  const checkAutoApply = async (orderValue: number, items?: CartItem[]): Promise<AutoApplyCoupon[]> => {
    try {
      const response = await fetch('/api/coupons/auto-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderValue, items }),
      });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      const suggestions = data.suggestions || [];
      
      dispatch({ type: 'SET_AUTO_SUGGESTIONS', payload: suggestions });
      return suggestions;
    } catch (error) {
      console.error('Failed to check auto-apply coupons:', error);
      return [];
    }
  };
  
  const getTotalDiscount = (): number => {
    return state.appliedCoupons.reduce((total, ac) => total + ac.discountAmount, 0);
  };
  
  const getCouponByCode = (code: string): Coupon | undefined => {
    return [...state.availableCoupons, ...state.userCoupons]
      .find(c => c.code.toLowerCase() === code.toLowerCase());
  };
  
  const getAppliedCoupons = (): AppliedCoupon[] => state.appliedCoupons;
  
  const canApplyMore = (): boolean => {
    // Can apply more if no coupons are applied or all applied coupons are stackable
    return state.appliedCoupons.length === 0 || state.appliedCoupons.every(ac => ac.coupon.stackable);
  };
  
  const claimCoupon = async (couponId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/coupons/claim/${couponId}`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to claim coupon');
      
      const data = await response.json();
      toast.success(`Coupon claimed: ${data.coupon.title}`);
      
      // Reload user coupons
      await loadUserCoupons();
      
      return true;
    } catch (error) {
      console.error('Failed to claim coupon:', error);
      toast.error('Failed to claim coupon');
      return false;
    }
  };
  
  const checkEarnedCoupons = async (): Promise<Coupon[]> => {
    try {
      const response = await fetch('/api/coupons/earned');
      if (!response.ok) return [];
      
      const data = await response.json();
      const earnedCoupons = data.coupons || [];
      
      dispatch({ type: 'SET_EARNED_COUPONS', payload: earnedCoupons });
      
      return earnedCoupons;
    } catch (error) {
      console.error('Failed to check earned coupons:', error);
      return [];
    }
  };
  
  const shareCoupon = async (couponId: string): Promise<string> => {
    try {
      const coupon = state.availableCoupons.find(c => c.id === couponId);
      if (!coupon) throw new Error('Coupon not found');
      
      const shareText = `Check out this amazing deal: ${coupon.title} - Use code ${coupon.code} at Vardhman Mills!`;
      const shareUrl = `${window.location.origin}/coupons/${coupon.code}`;
      
      if (navigator.share) {
        await navigator.share({
          title: coupon.title,
          text: shareText,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        toast.success('Coupon link copied to clipboard');
      }
      
      return shareUrl;
    } catch (error) {
      console.error('Failed to share coupon:', error);
      toast.error('Failed to share coupon');
      throw error;
    }
  };
  
  const generateReferralCoupon = async (): Promise<Coupon | null> => {
    try {
      const response = await fetch('/api/coupons/referral', {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to generate referral coupon');
      
      const data = await response.json();
      toast.success('Referral coupon generated!');
      
      return data.coupon;
    } catch (error) {
      console.error('Failed to generate referral coupon:', error);
      toast.error('Failed to generate referral coupon');
      return null;
    }
  };
  
  const contextValue: CouponContextType = {
    state,
    loadAvailableCoupons,
    loadUserCoupons,
    applyCoupon,
    removeCoupon,
    clearAllCoupons,
    validateCoupon,
    checkAutoApply,
    getTotalDiscount,
    getCouponByCode,
    getAppliedCoupons,
    canApplyMore,
    claimCoupon,
    checkEarnedCoupons,
    shareCoupon,
    generateReferralCoupon,
  };
  
  return (
    <CouponContext.Provider value={contextValue}>
      {children}
    </CouponContext.Provider>
  );
};

// Hook
export const useCoupon = (): CouponContextType => {
  const context = useContext(CouponContext);
  if (!context) {
    throw new Error('useCoupon must be used within a CouponProvider');
  }
  return context;
};

export default CouponContext;
export type { Coupon, AppliedCoupon, CouponValidationResult, AutoApplyCoupon, CouponState };