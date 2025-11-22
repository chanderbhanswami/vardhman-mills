'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { AddressCard } from './AddressCard';
import { AddressForm } from './AddressForm';
import type { UserAddress, AddressType, AddressForm as AddressFormData } from '@/types/address.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AddressSelectorProps {
  /**
   * Array of addresses to select from
   */
  addresses: UserAddress[];

  /**
   * Currently selected address ID
   */
  selectedAddressId?: string;

  /**
   * Whether the selector is open (for modal mode)
   */
  isOpen: boolean;

  /**
   * Callback when selector is closed
   */
  onClose: () => void;

  /**
   * Callback when address is selected
   */
  onSelectAddress: (address: UserAddress) => void;

  /**
   * Callback when new address is added
   */
  onAddAddress?: (address: AddressFormData) => Promise<void>;

  /**
   * Callback when address is edited
   */
  onEditAddress?: (address: UserAddress) => Promise<void>;

  /**
   * Callback when address is deleted
   */
  onDeleteAddress?: (addressId: string) => Promise<void>;

  /**
   * Show search
   */
  showSearch?: boolean;

  /**
   * Show add new button
   */
  showAddNew?: boolean;

  /**
   * Show recent addresses section
   */
  showRecent?: boolean;

  /**
   * Title text
   */
  title?: string;

  /**
   * Subtitle text
   */
  subtitle?: string;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Enable address validation
   */
  validateAddress?: boolean;

  /**
   * Validation error message
   */
  validationError?: string;

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Filter addresses by search query
 */
const filterBySearch = (addresses: UserAddress[], query: string): UserAddress[] => {
  if (!query.trim()) return addresses;

  const lowerQuery = query.toLowerCase();

  return addresses.filter((address) => {
    const searchableText = [
      address.firstName,
      address.lastName,
      address.company,
      address.label,
      address.addressLine1,
      address.city,
      address.state,
      address.postalCode,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchableText.includes(lowerQuery);
  });
};

/**
 * Get recent addresses
 */
const getRecentAddresses = (addresses: UserAddress[], limit: number = 3): UserAddress[] => {
  return addresses
    .filter((address) => address.lastUsedAt)
    .sort((a, b) => {
      const aTime = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0;
      const bTime = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, limit);
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * AddressSelector Component
 * 
 * Modal dialog for selecting an address from user's saved addresses.
 * Features:
 * - Search addresses
 * - Filter by type (quick buttons)
 * - Recent addresses section
 * - Add new address inline
 * - Edit existing address
 * - Compact card display
 * - Single selection
 * - Validation support
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <AddressSelector
 *   addresses={userAddresses}
 *   selectedAddressId={selectedId}
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   onSelectAddress={handleSelect}
 *   onAddAddress={handleAdd}
 *   showSearch={true}
 *   showAddNew={true}
 * />
 * ```
 */
export const AddressSelector: React.FC<AddressSelectorProps> = ({
  addresses,
  selectedAddressId,
  isOpen,
  onClose,
  onSelectAddress,
  onAddAddress,
  onEditAddress,
  onDeleteAddress,
  showSearch = true,
  showAddNew = true,
  showRecent = true,
  title = 'Select Address',
  subtitle,
  isLoading = false,
  validateAddress = false,
  validationError,
  className,
}) => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<AddressType | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [tempSelectedId, setTempSelectedId] = useState<string | undefined>(selectedAddressId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get default address
  const defaultAddress = useMemo(
    () => addresses.find((address) => address.isDefault),
    [addresses]
  );

  // Get recent addresses
  const recentAddresses = useMemo(
    () => (showRecent ? getRecentAddresses(addresses) : []),
    [addresses, showRecent]
  );

  // Filtered addresses
  const filteredAddresses = useMemo(() => {
    let result = addresses;

    // Apply search filter
    if (searchQuery) {
      result = filterBySearch(result, searchQuery);
    }

    // Apply type filter
    if (filterType !== 'all') {
      result = result.filter((address) => address.type === filterType);
    }

    return result;
  }, [addresses, searchQuery, filterType]);

  // Get selected address
  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === tempSelectedId),
    [addresses, tempSelectedId]
  );

  // Handle address selection
  const handleAddressSelect = (addressId: string) => {
    setTempSelectedId(addressId);
  };

  // Handle confirm selection
  const handleConfirm = () => {
    if (selectedAddress) {
      onSelectAddress(selectedAddress);
      onClose();
    }
  };

  // Handle add new address
  const handleAddNew = async (formData: AddressFormData) => {
    if (!onAddAddress) return;

    setIsSubmitting(true);
    try {
      await onAddAddress(formData);
      setShowAddForm(false);
      setSearchQuery('');
    } catch (error) {
      console.error('Error adding address:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit address
  const handleEdit = (address: UserAddress) => {
    setEditingAddress(address);
    setShowAddForm(true);
  };

  // Handle edit submit
  const handleEditSubmit = async (formData: AddressFormData) => {
    if (!onEditAddress || !editingAddress) return;

    setIsSubmitting(true);
    try {
      await onEditAddress({ ...editingAddress, ...formData });
      setShowAddForm(false);
      setEditingAddress(null);
    } catch (error) {
      console.error('Error editing address:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (addressId: string) => {
    if (!onDeleteAddress) return;

    try {
      await onDeleteAddress(addressId);
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  // Reset state on close
  const handleClose = () => {
    setSearchQuery('');
    setFilterType('all');
    setShowAddForm(false);
    setEditingAddress(null);
    setTempSelectedId(selectedAddressId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'relative w-full max-w-4xl bg-white rounded-lg shadow-xl',
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                {subtitle && (
                  <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
                )}
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close address selector"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
              {/* Show Add/Edit Form */}
              {showAddForm ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <Button
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingAddress(null);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                  <AddressForm
                    address={editingAddress || undefined}
                    onSubmit={editingAddress ? handleEditSubmit : handleAddNew}
                    onCancel={() => {
                      setShowAddForm(false);
                      setEditingAddress(null);
                    }}
                    isLoading={isSubmitting}
                  />
                </div>
              ) : (
                <>
                  {/* Search and Filters */}
                  <div className="space-y-4 mb-6">
                    {/* Search */}
                    {showSearch && (
                      <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search addresses..."
                          className="pl-10"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            aria-label="Clear search"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    )}

                    {/* Type Filter Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setFilterType('all')}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                          filterType === 'all'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        )}
                      >
                        All
                      </button>
                      {(['home', 'office', 'apartment', 'business'] as AddressType[]).map((type) => (
                        <button
                          key={type}
                          onClick={() => setFilterType(type)}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize',
                            filterType === type
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    {/* Quick Select Default */}
                    {defaultAddress && !tempSelectedId && (
                      <Button
                        onClick={() => handleAddressSelect(defaultAddress.id)}
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        Use Default Address
                      </Button>
                    )}

                    {/* Add New Button */}
                    {showAddNew && onAddAddress && (
                      <Button
                        onClick={() => setShowAddForm(true)}
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <PlusIcon className="h-4 w-4" />
                        Add New Address
                      </Button>
                    )}
                  </div>

                  {/* Loading State */}
                  {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[...Array(4)].map((_, index) => (
                        <Card key={index} className="p-4 animate-pulse">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="h-5 w-5 bg-gray-200 rounded" />
                              <div className="h-4 w-24 bg-gray-200 rounded" />
                            </div>
                            <div className="h-4 w-32 bg-gray-200 rounded" />
                            <div className="space-y-2">
                              <div className="h-3 w-full bg-gray-200 rounded" />
                              <div className="h-3 w-3/4 bg-gray-200 rounded" />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Recent Addresses Section */}
                  {!isLoading && showRecent && recentAddresses.length > 0 && !searchQuery && filterType === 'all' && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-sm font-semibold text-gray-900">Recently Used</h3>
                        <Badge variant="secondary">{recentAddresses.length}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recentAddresses.map((address) => (
                          <AddressCard
                            key={address.id}
                            address={address}
                            isSelected={tempSelectedId === address.id}
                            selectable
                            onSelect={handleAddressSelect}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            compact
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Addresses */}
                  {!isLoading && filteredAddresses.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {searchQuery || filterType !== 'all' ? 'Search Results' : 'All Addresses'}
                        </h3>
                        <Badge variant="secondary">{filteredAddresses.length}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredAddresses.map((address) => (
                          <AddressCard
                            key={address.id}
                            address={address}
                            isSelected={tempSelectedId === address.id}
                            selectable
                            onSelect={handleAddressSelect}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            compact
                            showPhone={false}
                            showInstructions={false}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {!isLoading && filteredAddresses.length === 0 && (
                    <Card className="p-8 text-center">
                      <div className="max-w-sm mx-auto space-y-4">
                        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                          <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            No addresses found
                          </h3>
                          <p className="text-gray-600">
                            {searchQuery || filterType !== 'all'
                              ? 'Try adjusting your search or filters'
                              : 'Get started by adding your first address'}
                          </p>
                        </div>
                        {showAddNew && onAddAddress && (
                          <Button
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center gap-2 mx-auto"
                          >
                            <PlusIcon className="h-4 w-4" />
                            Add New Address
                          </Button>
                        )}
                      </div>
                    </Card>
                  )}

                  {/* Validation Error */}
                  {validateAddress && validationError && (
                    <Card className="p-4 bg-red-50 border-red-200 mt-4">
                      <p className="text-sm text-red-800">{validationError}</p>
                    </Card>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {!showAddForm && (
              <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                  {selectedAddress && (
                    <>
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-gray-700">
                        {selectedAddress.label || `${selectedAddress.firstName} ${selectedAddress.lastName}`}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Button onClick={handleClose} variant="outline">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={!tempSelectedId || isSubmitting}
                  >
                    Confirm Selection
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default AddressSelector;