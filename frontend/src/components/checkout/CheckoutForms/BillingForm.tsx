'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCardIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { AddressSelector } from '../AddressForms/AddressSelector';
import { AddressCard } from '../AddressForms/AddressCard';
import type { UserAddress } from '@/types/address.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface BillingFormData {
  billingAddressId: string;
  billingAddress: UserAddress;
  sameAsShipping: boolean;
}

export interface BillingFormProps {
  /**
   * Available addresses
   */
  addresses: UserAddress[];

  /**
   * Shipping address (for same as shipping option)
   */
  shippingAddress?: UserAddress;

  /**
   * Initial data
   */
  initialData?: Partial<BillingFormData>;

  /**
   * Callback when form is submitted
   */
  onSubmit: (data: BillingFormData) => void | Promise<void>;

  /**
   * Callback when cancel is clicked
   */
  onCancel?: () => void;

  /**
   * Callback when add new address
   */
  onAddAddress?: (address: Partial<UserAddress>) => Promise<void>;

  /**
   * Callback when edit address
   */
  onEditAddress?: (address: UserAddress) => Promise<void>;

  /**
   * Callback when delete address
   */
  onDeleteAddress?: (addressId: string) => Promise<void>;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * BillingForm Component
 * 
 * Comprehensive billing address form for checkout.
 * Features:
 * - Same as shipping address option
 * - Address selection with AddressSelector
 * - Display selected address with AddressCard
 * - Add/Edit/Delete address capabilities
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <BillingForm
 *   addresses={userAddresses}
 *   shippingAddress={shippingAddr}
 *   onSubmit={handleSubmit}
 * />
 * ```
 */
export const BillingForm: React.FC<BillingFormProps> = ({
  addresses,
  shippingAddress,
  initialData,
  onSubmit,
  onCancel,
  onAddAddress,
  onEditAddress,
  onDeleteAddress,
  isLoading = false,
  className,
}) => {
  // State
  const [sameAsShipping, setSameAsShipping] = useState(
    initialData?.sameAsShipping ?? (!!shippingAddress)
  );
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | undefined>(
    initialData?.billingAddress || 
    (sameAsShipping && shippingAddress) || 
    addresses.find((a) => a.isDefault)
  );
  const [showAddressSelector, setShowAddressSelector] = useState(false);

  // Handle same as shipping toggle
  const handleSameAsShippingChange = (checked: boolean) => {
    setSameAsShipping(checked);
    if (checked && shippingAddress) {
      setSelectedAddress(shippingAddress);
    } else if (!checked) {
      setSelectedAddress(addresses.find((a) => a.isDefault));
    }
  };

  // Handle address selection
  const handleAddressSelect = (address: UserAddress) => {
    setSelectedAddress(address);
    setShowAddressSelector(false);
    setSameAsShipping(false);
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAddress) {
      toast.error('Please select a billing address');
      return;
    }

    const formData: BillingFormData = {
      billingAddressId: selectedAddress.id,
      billingAddress: selectedAddress,
      sameAsShipping,
    };

    try {
      await onSubmit(formData);
      toast.success('Billing information saved');
    } catch (error) {
      console.error('Error submitting billing form:', error);
      toast.error('Failed to save billing information');
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
        {/* Billing Address Section */}
        <Card className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <CreditCardIcon className="h-5 w-5 text-primary-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Billing Address</h3>
                  <p className="text-sm text-gray-600">
                    Address for billing and invoice
                  </p>
                </div>
              </div>
              {!sameAsShipping && (
                <Button
                  type="button"
                  onClick={() => setShowAddressSelector(true)}
                  variant="outline"
                  size="sm"
                >
                  {selectedAddress ? 'Change' : 'Select'} Address
                </Button>
              )}
            </div>

            {/* Same as Shipping Option */}
            {shippingAddress && (
              <label className="flex items-start gap-3 cursor-pointer group p-4 rounded-lg border-2 border-gray-200 hover:border-primary-300 transition-colors">
                <input
                  type="checkbox"
                  checked={sameAsShipping}
                  onChange={(e) => handleSameAsShippingChange(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  disabled={isLoading}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      Same as shipping address
                    </span>
                    {sameAsShipping && (
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use the same address for billing and shipping
                  </p>
                </div>
              </label>
            )}

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
                <CreditCardIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  No billing address selected
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Please select a billing address to continue
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
          </div>
        </Card>

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
            disabled={isLoading || !selectedAddress}
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
        title="Select Billing Address"
        subtitle="Choose your billing address for invoice"
      />
    </>
  );
};

export default BillingForm;