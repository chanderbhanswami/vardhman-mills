/**
 * Discount Coupons Page - Vardhman Mills Frontend
 * 
 * Browse and apply discount coupons with:
 * - Available coupons list
 * - Coupon categories
 * - Apply/Remove functionality
 * - Terms and conditions
 * - Validity and restrictions
 * - Applied coupons display
 * 
 * @route /checkout/discount-coupons
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TagIcon,
  ClockIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  TicketIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useCart } from '@/hooks/useCart';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

type CouponCategory = 'all' | 'flat-discount' | 'percentage' | 'shipping' | 'seasonal';

interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  category: CouponCategory;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  validUntil: string;
  termsAndConditions: string[];
  isApplied: boolean;
  applicableProducts?: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const COUPON_CATEGORIES: { id: CouponCategory; name: string }[] = [
  { id: 'all', name: 'All Coupons' },
  { id: 'flat-discount', name: 'Flat Discount' },
  { id: 'percentage', name: 'Percentage Off' },
  { id: 'shipping', name: 'Free Shipping' },
  { id: 'seasonal', name: 'Seasonal Offers' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DiscountCouponsPage() {
  const router = useRouter();
  const { clearCart } = useCart();

  // State
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CouponCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState<string | null>(null);

  // Mock cart total
  const cartTotal = 1897;

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Load available coupons
   */
  useEffect(() => {
    const loadCoupons = async () => {
      setIsLoading(true);

      try {
        // Load coupons from backend
        // const response = await couponApi.getAvailableCoupons();
        // setCoupons(response.data);

        // Mock data
        const mockCoupons: Coupon[] = [
          {
            id: '1',
            code: 'WELCOME100',
            title: 'New User Special',
            description: 'Get ₹100 off on your first order',
            category: 'flat-discount',
            discountType: 'flat',
            discountValue: 100,
            minOrderValue: 500,
            validUntil: '2024-12-31',
            termsAndConditions: [
              'Valid for new users only',
              'Minimum order value: ₹500',
              'Cannot be combined with other offers',
            ],
            isApplied: false,
          },
          {
            id: '2',
            code: 'SAVE10',
            title: '10% Off',
            description: 'Save 10% on orders above ₹1000',
            category: 'percentage',
            discountType: 'percentage',
            discountValue: 10,
            minOrderValue: 1000,
            maxDiscount: 500,
            validUntil: '2024-12-31',
            termsAndConditions: [
              'Minimum order value: ₹1000',
              'Maximum discount: ₹500',
              'Valid on all products',
            ],
            isApplied: false,
          },
          {
            id: '3',
            code: 'FREESHIP',
            title: 'Free Shipping',
            description: 'Get free shipping on all orders',
            category: 'shipping',
            discountType: 'flat',
            discountValue: 0,
            validUntil: '2024-12-31',
            termsAndConditions: [
              'Valid on all orders',
              'No minimum order value',
              'Applicable nationwide',
            ],
            isApplied: false,
          },
          {
            id: '4',
            code: 'MEGA25',
            title: 'Mega Sale - 25% Off',
            description: 'Flat 25% off on orders above ₹2000',
            category: 'seasonal',
            discountType: 'percentage',
            discountValue: 25,
            minOrderValue: 2000,
            maxDiscount: 1000,
            validUntil: '2024-12-15',
            termsAndConditions: [
              'Limited time offer',
              'Minimum order value: ₹2000',
              'Maximum discount: ₹1000',
              'Valid on select products only',
            ],
            isApplied: false,
          },
          {
            id: '5',
            code: 'FLAT500',
            title: 'Flat ₹500 Off',
            description: 'Get flat ₹500 off on orders above ₹3000',
            category: 'flat-discount',
            discountType: 'flat',
            discountValue: 500,
            minOrderValue: 3000,
            validUntil: '2024-12-31',
            termsAndConditions: [
              'Minimum order value: ₹3000',
              'Valid for all users',
              'Can be used multiple times',
            ],
            isApplied: false,
          },
        ];

        setCoupons(mockCoupons);
        setFilteredCoupons(mockCoupons);
      } catch (error) {
        console.error('Error loading coupons:', error);
        toast.error('Failed to load coupons');
      } finally {
        setIsLoading(false);
      }
    };

    loadCoupons();
  }, []);

  /**
   * Filter coupons based on category and search
   */
  useEffect(() => {
    let filtered = coupons;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((c) => c.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCoupons(filtered);
  }, [selectedCategory, searchQuery, coupons]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle apply coupon
   */
  const handleApplyCoupon = async (coupon: Coupon) => {
    // Validate minimum order value
    if (coupon.minOrderValue && cartTotal < coupon.minOrderValue) {
      toast.error(`Minimum order value of ₹${coupon.minOrderValue} required`);
      return;
    }

    setIsApplying(coupon.id);

    try {
      // Apply coupon through backend
      // await couponApi.applyCoupon(coupon.code);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update coupon status
      setCoupons((prev) =>
        prev.map((c) => ({
          ...c,
          isApplied: c.id === coupon.id,
        }))
      );
      setAppliedCoupon(coupon.code);

      // Calculate discount
      let discount = 0;
      if (coupon.discountType === 'flat') {
        discount = coupon.discountValue;
      } else {
        discount = (cartTotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      }

      toast.success(`Coupon applied! You saved ₹${discount.toFixed(2)}`);
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error('Failed to apply coupon');
    } finally {
      setIsApplying(null);
    }
  };

  /**
   * Handle remove coupon
   */
  const handleRemoveCoupon = async (couponCode: string) => {
    setIsApplying('removing');

    try {
      // Remove coupon through backend
      // await couponApi.removeCoupon(couponCode);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update coupon status
      setCoupons((prev) =>
        prev.map((c) => ({
          ...c,
          isApplied: false,
        }))
      );
      setAppliedCoupon(null);

      // Log which coupon was removed
      console.log(`Removed coupon: ${couponCode}`);
      toast.success(`Coupon ${couponCode} removed`);
    } catch (error) {
      console.error('Error removing coupon:', error);
      toast.error('Failed to remove coupon');
    } finally {
      setIsApplying(null);
    }
  };

  /**
   * Handle back
   */
  const handleBack = () => {
    router.push('/checkout');
  };

  /**
   * Handle clear all and start fresh (uses clearCart)
   */
  const handleClearAndRestart = async () => {
    if (confirm('Clear cart and start fresh shopping?')) {
      await clearCart();
      toast.success('Cart cleared! Starting fresh.');
      router.push('/products');
    }
  };

  /**
   * Calculate discount for a coupon
   */
  const calculateDiscount = (coupon: Coupon): number => {
    if (coupon.discountType === 'flat') {
      return coupon.discountValue;
    } else {
      let discount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
      return discount;
    }
  };

  /**
   * Check if coupon is applicable
   */
  const isCouponApplicable = (coupon: Coupon): boolean => {
    if (coupon.minOrderValue && cartTotal < coupon.minOrderValue) {
      return false;
    }
    return true;
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <Button variant="link" onClick={handleBack}>
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Checkout
            </Button>
            <Button variant="outline" onClick={handleClearAndRestart} size="sm">
              Clear Cart & Start Fresh
            </Button>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TicketIcon className="h-8 w-8 text-primary-600" />
            Available Coupons
          </h1>
          <p className="text-gray-600 mt-1">
            Select and apply a coupon to get discount on your order
          </p>
        </div>

        {/* Applied Coupon Alert */}
        {appliedCoupon && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-green-900">Coupon Applied: {appliedCoupon}</strong>
                  <p className="text-sm text-green-700 mt-1">
                    You are saving ₹
                    {calculateDiscount(
                      coupons.find((c) => c.code === appliedCoupon)!
                    ).toFixed(2)}{' '}
                    on this order
                  </p>
                </div>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => handleRemoveCoupon(appliedCoupon)}
                  className="text-green-700 hover:text-green-800"
                >
                  <XMarkIcon className="h-5 w-5" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Coupons
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by code or title"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2">
                  {COUPON_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg transition-colors',
                        selectedCategory === category.id
                          ? 'bg-primary-100 text-primary-900 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Cart Summary */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Cart Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Cart Total</span>
                  <span className="font-medium">₹{cartTotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">
                      -₹
                      {calculateDiscount(
                        coupons.find((c) => c.code === appliedCoupon)!
                      ).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t flex justify-between text-lg font-bold text-gray-900">
                  <span>Final Total</span>
                  <span>
                    ₹
                    {(
                      cartTotal -
                      (appliedCoupon
                        ? calculateDiscount(
                            coupons.find((c) => c.code === appliedCoupon)!
                          )
                        : 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Coupons List */}
          <div className="lg:col-span-3">
            {filteredCoupons.length === 0 ? (
              <Card className="p-12 text-center">
                <TagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Coupons Found
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery
                    ? 'Try searching with different keywords'
                    : 'No coupons available in this category'}
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                >
                  View All Coupons
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredCoupons.map((coupon) => (
                    <motion.div
                      key={coupon.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      layout
                    >
                      <Card
                        className={cn(
                          'p-6 transition-all',
                          coupon.isApplied
                            ? 'border-2 border-green-500 bg-green-50'
                            : 'hover:shadow-lg'
                        )}
                      >
                        <div className="flex items-start gap-4">
                          {/* Coupon Icon */}
                          <div className="flex-shrink-0">
                            <div
                              className={cn(
                                'w-16 h-16 rounded-lg flex items-center justify-center',
                                coupon.isApplied
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-primary-100 text-primary-600'
                              )}
                            >
                              {coupon.isApplied ? (
                                <CheckCircleIcon className="h-8 w-8" />
                              ) : (
                                <SparklesIcon className="h-8 w-8" />
                              )}
                            </div>
                          </div>

                          {/* Coupon Details */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {coupon.title}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {coupon.description}
                                </p>
                              </div>
                              {coupon.isApplied && (
                                <Badge variant="default" className="bg-green-600">
                                  Applied
                                </Badge>
                              )}
                            </div>

                            {/* Coupon Code */}
                            <div className="flex items-center gap-4 mb-3">
                              <div className="px-4 py-2 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
                                <span className="font-mono font-bold text-gray-900">
                                  {coupon.code}
                                </span>
                              </div>
                              {!isCouponApplicable(coupon) && (
                                <Badge variant="destructive" size="sm">
                                  Min. order ₹{coupon.minOrderValue}
                                </Badge>
                              )}
                            </div>

                            {/* Validity & Discount */}
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <ClockIcon className="h-4 w-4" />
                                <span>Valid till {coupon.validUntil}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <TagIcon className="h-4 w-4" />
                                <span>
                                  Save{' '}
                                  {isCouponApplicable(coupon)
                                    ? `₹${calculateDiscount(coupon).toFixed(2)}`
                                    : coupon.discountType === 'flat'
                                    ? `₹${coupon.discountValue}`
                                    : `${coupon.discountValue}%`}
                                </span>
                              </div>
                            </div>

                            {/* Terms */}
                            <details className="group text-sm">
                              <summary className="text-primary-600 cursor-pointer flex items-center gap-1 hover:underline">
                                <InformationCircleIcon className="h-4 w-4" />
                                <span>View Terms & Conditions</span>
                              </summary>
                              <ul className="mt-2 ml-5 space-y-1 text-gray-600 list-disc">
                                {coupon.termsAndConditions.map((term, index) => (
                                  <li key={index}>{term}</li>
                                ))}
                              </ul>
                            </details>

                            {/* Action Button */}
                            <div className="mt-4">
                              {coupon.isApplied ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveCoupon(coupon.code)}
                                  disabled={isApplying === 'removing'}
                                >
                                  {isApplying === 'removing' ? (
                                    <>
                                      <LoadingSpinner size="sm" className="mr-2" />
                                      Removing...
                                    </>
                                  ) : (
                                    <>
                                      <XMarkIcon className="h-4 w-4 mr-1" />
                                      Remove
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleApplyCoupon(coupon)}
                                  disabled={
                                    !isCouponApplicable(coupon) ||
                                    isApplying === coupon.id ||
                                    appliedCoupon !== null
                                  }
                                >
                                  {isApplying === coupon.id ? (
                                    <>
                                      <LoadingSpinner size="sm" className="mr-2" />
                                      Applying...
                                    </>
                                  ) : !isCouponApplicable(coupon) ? (
                                    'Not Applicable'
                                  ) : appliedCoupon !== null ? (
                                    'Remove Applied Coupon First'
                                  ) : (
                                    'Apply Coupon'
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
