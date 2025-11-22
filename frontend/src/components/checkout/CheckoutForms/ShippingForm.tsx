'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  CurrencyRupeeIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { AddressSelector } from '../AddressForms/AddressSelector';
import { AddressCard } from '../AddressForms/AddressCard';
import type { UserAddress } from '@/types/address.types';
import type { ShippingMethod } from '@/types/cart.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ShippingFormData {
  shippingAddressId: string;
  shippingAddress: UserAddress;
  shippingMethodId: string;
  shippingMethod: ShippingMethod;
  deliveryInstructions?: string;
  giftWrap?: boolean;
  giftMessage?: string;
}

export interface ShippingFormProps {
  /**
   * Available addresses
   */
  addresses: UserAddress[];

  /**
   * Available shipping methods
   */
  shippingMethods: ShippingMethod[];

  /**
   * Initial data
   */
  initialData?: Partial<ShippingFormData>;

  /**
   * Callback when form is submitted
   */
  onSubmit: (data: ShippingFormData) => void | Promise<void>;

  /**
   * Callback when cancel is clicked
   */
  onCancel?: () => void;

  /**
   * Callback when add new address is clicked
   */
  onAddAddress?: (address: Partial<UserAddress>) => Promise<void>;

  /**
   * Callback when edit address is clicked
   */
  onEditAddress?: (address: UserAddress) => Promise<void>;

  /**
   * Callback when delete address is clicked
   */
  onDeleteAddress?: (addressId: string) => Promise<void>;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Show gift options
   */
  showGiftOptions?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate estimated delivery date
 */
const calculateDeliveryDate = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('en-IN', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};

/**
 * Format delivery time
 */
const formatDeliveryTime = (minDays: number, maxDays: number): string => {
  if (minDays === maxDays) {
    return `${minDays} ${minDays === 1 ? 'day' : 'days'}`;
  }
  return `${minDays}-${maxDays} days`;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * ShippingForm Component
 * 
 * Comprehensive shipping form for selecting address and shipping method.
 * Features:
 * - Address selection with AddressSelector
 * - Display selected address with AddressCard
 * - Multiple shipping methods with pricing
 * - Estimated delivery dates
 * - Delivery instructions
 * - Gift wrapping options
 * - Gift message
 * - Real-time shipping cost calculation
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <ShippingForm
 *   addresses={userAddresses}
 *   shippingMethods={availableMethods}
 *   onSubmit={handleSubmit}
 *   showGiftOptions={true}
 * />
 * ```
 */
export const ShippingForm: React.FC<ShippingFormProps> = ({
  addresses,
  shippingMethods,
  initialData,
  onSubmit,
  onCancel,
  onAddAddress,
  onEditAddress,
  onDeleteAddress,
  isLoading = false,
  showGiftOptions = true,
  className,
}) => {
  // State
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | undefined>(
    initialData?.shippingAddress || addresses.find((a) => a.isDefault)
  );
  const [selectedMethodId, setSelectedMethodId] = useState<string>(
    initialData?.shippingMethodId || shippingMethods[0]?.id || ''
  );
  const [deliveryInstructions, setDeliveryInstructions] = useState(
    initialData?.deliveryInstructions || ''
  );
  const [giftWrap, setGiftWrap] = useState(initialData?.giftWrap || false);
  const [giftMessage, setGiftMessage] = useState(initialData?.giftMessage || '');
  const [showAddressSelector, setShowAddressSelector] = useState(false);

  // Get selected shipping method
  const selectedMethod = shippingMethods.find((m) => m.id === selectedMethodId);

  // Handle address selection
  const handleAddressSelect = (address: UserAddress) => {
    setSelectedAddress(address);
    setShowAddressSelector(false);
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }

    if (!selectedMethodId || !selectedMethod) {
      toast.error('Please select a shipping method');
      return;
    }

    const formData: ShippingFormData = {
      shippingAddressId: selectedAddress.id,
      shippingAddress: selectedAddress,
      shippingMethodId: selectedMethodId,
      shippingMethod: selectedMethod,
      deliveryInstructions: deliveryInstructions.trim() || undefined,
      giftWrap: showGiftOptions ? giftWrap : undefined,
      giftMessage: showGiftOptions && giftWrap ? giftMessage.trim() || undefined : undefined,
    };

    try {
      await onSubmit(formData);
      toast.success('Shipping information saved');
    } catch (error) {
      console.error('Error submitting shipping form:', error);
      toast.error('Failed to save shipping information');
    }
  };

  return (
    <>
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onSubmit={handleSubmit}
        className={cn('space-y-6', className)}
      >
        {/* Shipping Address Section */}
        <Card className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <TruckIcon className="h-5 w-5 text-primary-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
                  <p className="text-sm text-gray-600">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>
              <Button
                type="button"
                onClick={() => setShowAddressSelector(true)}
                variant="outline"
                size="sm"
              >
                {selectedAddress ? 'Change' : 'Select'} Address
              </Button>
            </div>

            {/* Selected Address Display */}
            {selectedAddress ? (
              <AddressCard
                address={selectedAddress}
                isSelected={true}
                showActions={false}
                compact={false}
              />
            ) : (
              <Card className="p-8 text-center border-dashed">
                <TruckIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  No address selected
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Please select a delivery address to continue
                </p>
                <Button
                  type="button"
                  onClick={() => setShowAddressSelector(true)}
                  variant="default"
                >
                  Select Address
                </Button>
              </Card>
            )}

            {/* Delivery Instructions */}
            {selectedAddress && (
              <div>
                <label htmlFor="deliveryInstructions" className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Instructions (Optional)
                </label>
                <textarea
                  id="deliveryInstructions"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="E.g., Ring the doorbell, leave at the gate, etc."
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  disabled={isLoading}
                />
                <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <InformationCircleIcon className="h-3 w-3" />
                    Help delivery agent find your location easily
                  </span>
                  <span>{deliveryInstructions.length}/500</span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Shipping Method Section */}
        {selectedAddress && shippingMethods.length > 0 && (
          <Card className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <ClockIcon className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Shipping Method</h3>
                  <p className="text-sm text-gray-600">
                    Choose your preferred delivery speed
                  </p>
                </div>
              </div>

              {/* Shipping Methods */}
              <div className="space-y-3">
                {shippingMethods.map((method) => {
                  const isSelected = selectedMethodId === method.id;
                  const isFree = method.price.amount === 0;
                  const deliveryTime = formatDeliveryTime(
                    method.estimatedDays.min,
                    method.estimatedDays.max
                  );
                  const estimatedDate = calculateDeliveryDate(method.estimatedDays.min);

                  return (
                    <motion.button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethodId(method.id)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={cn(
                        'w-full p-4 rounded-lg border-2 transition-all text-left',
                        isSelected
                          ? 'border-primary-500 bg-primary-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      )}
                    >
                      <div className="flex items-start gap-4">
                        {/* Radio Button */}
                        <div className="flex-shrink-0 mt-1">
                          <div
                            className={cn(
                              'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                              isSelected
                                ? 'border-primary-600 bg-primary-600'
                                : 'border-gray-300'
                            )}
                          >
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <CheckCircleIcon className="h-5 w-5 text-white" />
                              </motion.div>
                            )}
                          </div>
                        </div>

                        {/* Method Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                {method.name}
                                {isFree && (
                                  <Badge variant="secondary" className="text-xs">
                                    FREE
                                  </Badge>
                                )}
                              </h4>
                              {method.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {method.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              {isFree ? (
                                <span className="text-lg font-bold text-green-600">FREE</span>
                              ) : (
                                <div className="flex items-center gap-1 text-lg font-bold text-gray-900">
                                  <CurrencyRupeeIcon className="h-5 w-5" />
                                  {method.price.amount.toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-gray-700">
                              <ClockIcon className="h-4 w-4" />
                              <span>{deliveryTime}</span>
                            </div>
                            <div className="text-gray-600">
                              Estimated delivery by <strong>{estimatedDate}</strong>
                            </div>
                          </div>

                          {/* Additional Info */}
                          {method.description && (
                            <div className="mt-2 text-xs text-gray-600">
                              {method.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </Card>
        )}

        {/* Gift Options */}
        {showGiftOptions && selectedAddress && (
          <Card className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Gift Options</h3>
                  <p className="text-sm text-gray-600">
                    Make your gift extra special
                  </p>
                </div>
              </div>

              {/* Gift Wrap Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={giftWrap}
                  onChange={(e) => setGiftWrap(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  disabled={isLoading}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      Add gift wrapping
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      FREE
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    We&apos;ll wrap your items in premium gift packaging
                  </p>
                </div>
              </label>

              {/* Gift Message */}
              <AnimatePresence>
                {giftWrap && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div>
                      <label htmlFor="giftMessage" className="block text-sm font-medium text-gray-700 mb-1">
                        Gift Message (Optional)
                      </label>
                      <textarea
                        id="giftMessage"
                        value={giftMessage}
                        onChange={(e) => setGiftMessage(e.target.value)}
                        placeholder="Write a personal message for your gift recipient..."
                        rows={4}
                        maxLength={250}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        disabled={isLoading}
                      />
                      <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <InformationCircleIcon className="h-3 w-3" />
                          Your message will be printed on a beautiful card
                        </span>
                        <span>{giftMessage.length}/250</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        )}

        {/* Form Actions */}
        <div className="flex items-center gap-3 justify-end">
          {onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              disabled={isLoading}
            >
              Back
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading || !selectedAddress || !selectedMethodId}
            className="min-w-[150px]"
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
                Saving...
              </>
            ) : (
              'Continue to Payment'
            )}
          </Button>
        </div>
      </motion.form>

      {/* Address Selector Modal */}
      <AddressSelector
        addresses={addresses}
        selectedAddressId={selectedAddress?.id}
        isOpen={showAddressSelector}
        onClose={() => setShowAddressSelector(false)}
        onSelectAddress={handleAddressSelect}
        onAddAddress={onAddAddress}
        onEditAddress={onEditAddress}
        onDeleteAddress={onDeleteAddress}
        showSearch={true}
        showAddNew={true}
        title="Select Shipping Address"
        subtitle="Choose where you want your order delivered"
      />
    </>
  );
};

export default ShippingForm;