/**
 * Checkout Shipping Page - Vardhman Mills Frontend
 * 
 * Shipping address and method selection with:
 * - Address management (add/edit/delete/select)
 * - Multiple shipping methods
 * - Delivery estimates
 * - Address validation
 * - Saved addresses
 * 
 * @route /checkout/shipping
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  HomeIcon,
  BuildingOfficeIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/auth/useAuth';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

type AddressType = 'home' | 'office';

interface UserAddress {
  id: string;
  type: AddressType;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
}

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  estimatedDays: string;
  price: number;
  icon: React.ComponentType<{ className?: string }>;
  recommended?: boolean;
  available: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    description: 'Delivered in 5-7 business days',
    estimatedDays: '5-7 days',
    price: 0,
    icon: TruckIcon,
    recommended: true,
    available: true,
  },
  {
    id: 'express',
    name: 'Express Delivery',
    description: 'Delivered in 2-3 business days',
    estimatedDays: '2-3 days',
    price: 100,
    icon: TruckIcon,
    available: true,
  },
  {
    id: 'overnight',
    name: 'Overnight Delivery',
    description: 'Delivered next business day',
    estimatedDays: '1 day',
    price: 250,
    icon: TruckIcon,
    available: true,
  },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Shipping page content wrapper
 */
function ShippingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { cart } = useCart();
  
  const orderId = searchParams?.get('orderId');

  // State
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string>('standard');
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<UserAddress>>({
    type: 'home',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    isDefault: false,
  });

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Load saved addresses
   */
  useEffect(() => {
    const loadAddresses = async () => {
      if (user) {
        try {
          // Load addresses from backend
          // const response = await addressApi.getAddresses();
          // setAddresses(response.data);
          
          // Mock data
          const mockAddresses: UserAddress[] = [
            {
              id: '1',
              type: 'home',
              fullName: 'John Doe',
              phone: '+91 9876543210',
              addressLine1: '123, Main Street',
              addressLine2: 'Near City Mall',
              city: 'Mumbai',
              state: 'Maharashtra',
              pincode: '400001',
              landmark: 'Opposite HDFC Bank',
              isDefault: true,
            },
          ];
          setAddresses(mockAddresses);
          setSelectedAddressId(mockAddresses.find(a => a.isDefault)?.id || null);
        } catch (error) {
          console.error('Error loading addresses:', error);
          toast.error('Failed to load addresses');
        }
      }
    };

    loadAddresses();
  }, [user]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle form input change
   */
  const handleInputChange = (field: keyof UserAddress, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Handle add new address
   */
  const handleAddAddress = () => {
    setIsAddingAddress(true);
    setEditingAddressId(null);
    setFormData({
      type: 'home',
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      isDefault: false,
    });
  };

  /**
   * Handle edit address
   */
  const handleEditAddress = (address: UserAddress) => {
    setIsAddingAddress(true);
    setEditingAddressId(address.id);
    setFormData(address);
  };

  /**
   * Handle save address
   */
  const handleSaveAddress = async () => {
    // Validate
    if (!formData.fullName || !formData.phone || !formData.addressLine1 || 
        !formData.city || !formData.state || !formData.pincode) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    if (formData.phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);

    try {
      if (editingAddressId) {
        // Update existing address
        // await addressApi.updateAddress(editingAddressId, formData);
        setAddresses((prev) =>
          prev.map((addr) => (addr.id === editingAddressId ? { ...addr, ...formData } : addr))
        );
        toast.success('Address updated successfully');
      } else {
        // Add new address
        // const response = await addressApi.createAddress(formData);
        const newAddress: UserAddress = {
          ...(formData as UserAddress),
          id: `addr_${Date.now()}`,
        };
        setAddresses((prev) => [...prev, newAddress]);
        setSelectedAddressId(newAddress.id);
        toast.success('Address added successfully');
      }

      setIsAddingAddress(false);
      setEditingAddressId(null);
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle delete address
   */
  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    setIsLoading(true);

    try {
      // await addressApi.deleteAddress(addressId);
      setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
      
      if (selectedAddressId === addressId) {
        setSelectedAddressId(null);
      }
      
      toast.success('Address deleted successfully');
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle continue to payment
   */
  const handleContinue = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }

    if (!selectedShippingMethod) {
      toast.error('Please select a shipping method');
      return;
    }

    setIsLoading(true);

    try {
      // Save shipping details to order
      // await orderApi.updateShipping(orderId, {
      //   addressId: selectedAddressId,
      //   shippingMethodId: selectedShippingMethod,
      // });

      // Navigate to payment
      router.push(`/checkout/payment?orderId=${orderId || 'test123'}`);
    } catch (error) {
      console.error('Error saving shipping details:', error);
      toast.error('Failed to save shipping details');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle back
   */
  const handleBack = () => {
    router.push('/checkout');
  };

  /**
   * Cancel add/edit address
   */
  const handleCancelAddEdit = () => {
    setIsAddingAddress(false);
    setEditingAddressId(null);
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  /**
   * Render address form
   */
  const renderAddressForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {editingAddressId ? 'Edit Address' : 'Add New Address'}
        </h3>

        <div className="space-y-4">
          {/* Address Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="addressType"
                  checked={formData.type === 'home'}
                  onChange={() => handleInputChange('type', 'home')}
                  className="text-primary-600"
                />
                <HomeIcon className="h-5 w-5 text-gray-600" />
                <span>Home</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="addressType"
                  checked={formData.type === 'office'}
                  onChange={() => handleInputChange('type', 'office')}
                  className="text-primary-600"
                />
                <BuildingOfficeIcon className="h-5 w-5 text-gray-600" />
                <span>Office</span>
              </label>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.fullName || ''}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="+91 9876543210"
              maxLength={15}
            />
          </div>

          {/* Address Line 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 1 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.addressLine1 || ''}
              onChange={(e) => handleInputChange('addressLine1', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="House No., Building Name"
            />
          </div>

          {/* Address Line 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 2
            </label>
            <input
              type="text"
              value={formData.addressLine2 || ''}
              onChange={(e) => handleInputChange('addressLine2', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Road Name, Area, Colony"
            />
          </div>

          {/* City, State, Pincode Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="City"
              />
            </div>
            <div>
              <label htmlFor="state-select" className="block text-sm font-medium text-gray-700 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <select
                id="state-select"
                value={formData.state || ''}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                aria-label="Select state"
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pincode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.pincode || ''}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="400001"
                maxLength={6}
              />
            </div>
          </div>

          {/* Landmark */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Landmark (Optional)
            </label>
            <input
              type="text"
              value={formData.landmark || ''}
              onChange={(e) => handleInputChange('landmark', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Near bus stop, mall, etc."
            />
          </div>

          {/* Default Address */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isDefault || false}
              onChange={(e) => handleInputChange('isDefault', e.target.checked)}
              className="text-primary-600"
            />
            <span className="text-sm text-gray-700">Set as default address</span>
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 mt-6">
          <Button onClick={handleSaveAddress} disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              'Save Address'
            )}
          </Button>
          <Button variant="outline" onClick={handleCancelAddEdit}>
            Cancel
          </Button>
        </div>
      </Card>
    </motion.div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="link" onClick={handleBack} className="mb-4">
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Checkout
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900">Shipping Details</h1>
          <p className="text-gray-600 mt-1">
            Select delivery address and shipping method
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Address & Shipping */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <AnimatePresence mode="wait">
              {!isAddingAddress ? (
                <motion.div
                  key="address-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Delivery Address
                      </h2>
                      <Button onClick={handleAddAddress} variant="outline" size="sm">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add New
                      </Button>
                    </div>

                    {addresses.length === 0 ? (
                      <div className="text-center py-8">
                        <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 mb-4">No saved addresses</p>
                        <Button onClick={handleAddAddress}>
                          <PlusIcon className="h-5 w-5 mr-2" />
                          Add Address
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {addresses.map((address) => (
                          <label
                            key={address.id}
                            className={cn(
                              'block p-4 border-2 rounded-lg cursor-pointer transition-all',
                              selectedAddressId === address.id
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300'
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                name="address"
                                checked={selectedAddressId === address.id}
                                onChange={() => setSelectedAddressId(address.id)}
                                className="mt-1 text-primary-600"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {address.type === 'home' ? (
                                    <HomeIcon className="h-4 w-4 text-gray-600" />
                                  ) : (
                                    <BuildingOfficeIcon className="h-4 w-4 text-gray-600" />
                                  )}
                                  <span className="font-medium text-gray-900">
                                    {address.fullName}
                                  </span>
                                  {address.isDefault && (
                                    <Badge variant="default" size="sm">Default</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-700">
                                  {address.addressLine1}
                                  {address.addressLine2 && `, ${address.addressLine2}`}
                                </p>
                                <p className="text-sm text-gray-700">
                                  {address.city}, {address.state} - {address.pincode}
                                </p>
                                {address.landmark && (
                                  <p className="text-sm text-gray-600">
                                    Landmark: {address.landmark}
                                  </p>
                                )}
                                <p className="text-sm text-gray-700 mt-1">
                                  Phone: {address.phone}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="link"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleEditAddress(address);
                                  }}
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="link"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleDeleteAddress(address.id);
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </Card>
                </motion.div>
              ) : (
                renderAddressForm()
              )}
            </AnimatePresence>

            {/* Shipping Method */}
            {!isAddingAddress && addresses.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Shipping Method
                </h2>
                <div className="space-y-3">
                  {SHIPPING_METHODS.map((method) => (
                    <label
                      key={method.id}
                      className={cn(
                        'flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all',
                        selectedShippingMethod === method.id
                          ? 'border-primary-500 bg-primary-50'
                          : method.available
                          ? 'border-gray-200 hover:border-gray-300'
                          : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                      )}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <input
                          type="radio"
                          name="shippingMethod"
                          checked={selectedShippingMethod === method.id}
                          onChange={() => setSelectedShippingMethod(method.id)}
                          disabled={!method.available}
                          className="text-primary-600"
                        />
                        <method.icon className="h-6 w-6 text-gray-700 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {method.name}
                            </span>
                            {method.recommended && (
                              <Badge variant="default" size="sm">Recommended</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {method.price === 0 ? 'FREE' : `₹${method.price}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {method.estimatedDays}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </Card>
            )}

            {/* Delivery Info Alert */}
            {!isAddingAddress && (
              <Alert>
                <InformationCircleIcon className="h-5 w-5" />
                <AlertDescription>
                  <strong>Delivery Information</strong>
                  <p className="mt-1 text-sm text-gray-600">
                    Estimated delivery times may vary based on your location and product availability. 
                    You will receive tracking information once your order is shipped.
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{cart?.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span>
                    {SHIPPING_METHODS.find(m => m.id === selectedShippingMethod)?.price === 0
                      ? 'FREE'
                      : `₹${SHIPPING_METHODS.find(m => m.id === selectedShippingMethod)?.price?.toFixed(2) || '0.00'}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax</span>
                  <span>₹{((cart?.subtotal || 0) * 0.18).toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between text-lg font-bold text-gray-900 mb-6">
                  <span>Total</span>
                  <span>
                    ₹{(
                      (cart?.subtotal || 0) +
                      (SHIPPING_METHODS.find(m => m.id === selectedShippingMethod)?.price || 0) +
                      (cart?.subtotal || 0) * 0.18
                    ).toFixed(2)}
                  </span>
                </div>

                <Button
                  onClick={handleContinue}
                  disabled={!selectedAddressId || isLoading || isAddingAddress}
                  size="lg"
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue to Payment
                      <CheckCircleIcon className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              {/* Estimated Delivery */}
              {selectedShippingMethod && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <ClockIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      Estimated Delivery: {SHIPPING_METHODS.find(m => m.id === selectedShippingMethod)?.estimatedDays}
                    </span>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CheckoutShippingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <ShippingPageContent />
    </Suspense>
  );
}
