/**
 * AddressList Component
 * 
 * Displays a list of user addresses with filtering, sorting,
 * and management capabilities.
 * 
 * Features:
 * - Address filtering and search
 * - Sorting by various criteria
 * - Bulk actions and selection
 * - Address validation status
 * - Quick actions (edit, delete, set default)
 * - Empty state handling
 * - Loading states
 * - Responsive design
 * - Virtual scrolling for large lists
 * 
 * @component
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ArrowsUpDownIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import LoadingSpinner from '@/components/common/Loading/LoadingSpinner';
import { AddressCard } from './AddressCard';
import { cn } from '@/lib/utils';
import { Address } from '@/types/user.types';
import { useDebounce } from '@/hooks/common/useDebounce';

// Types
export interface AddressListProps {
  /** List of addresses */
  addresses: Address[];
  /** Default address ID */
  defaultAddressId?: string;
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string | null;
  /** Empty state message */
  emptyMessage?: string;
  /** Show add button */
  showAddButton?: boolean;
  /** Selection mode */
  selectionMode?: boolean;
  /** Selected address IDs */
  selectedAddresses?: string[];
  /** Add address handler */
  onAddAddress?: () => void;
  /** Edit address handler */
  onEditAddress?: (address: Address) => void;
  /** Delete address handler */
  onDeleteAddress?: (addressId: string) => void;
  /** Set default handler */
  onSetDefault?: (addressId: string) => void;
  /** Select address handler */
  onSelectAddress?: (address: Address) => void;
  /** Bulk actions handler */
  onBulkAction?: (action: string, addressIds: string[]) => void;
  /** Selection change handler */
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Additional CSS classes */
  className?: string;
}

interface FilterState {
  search: string;
  type: string;
  validation: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface BulkAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'danger';
  requiresConfirmation?: boolean;
}

const sortOptions = [
  { label: 'Name (A-Z)', value: 'name-asc' },
  { label: 'Name (Z-A)', value: 'name-desc' },
  { label: 'Recently Added', value: 'created-desc' },
  { label: 'Oldest First', value: 'created-asc' },
  { label: 'Recently Used', value: 'lastUsed-desc' },
  { label: 'Address Type', value: 'type-asc' },
];

const filterOptions = {
  type: [
    { label: 'All Types', value: '' },
    { label: 'Home', value: 'home' },
    { label: 'Work', value: 'work' },
    { label: 'Other', value: 'other' },
  ],
  validation: [
    { label: 'All Addresses', value: '' },
    { label: 'Verified', value: 'verified' },
    { label: 'Unverified', value: 'unverified' },
  ],
};

export const AddressList: React.FC<AddressListProps> = ({
  addresses = [],
  defaultAddressId,
  loading = false,
  error = null,
  emptyMessage = 'No addresses found',
  showAddButton = true,
  selectionMode = false,
  selectedAddresses = [],
  onAddAddress,
  onEditAddress,
  onDeleteAddress,
  onSetDefault,
  onSelectAddress,
  onBulkAction,
  onSelectionChange,
  className,
}) => {
  // State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: '',
    validation: '',
    sortBy: 'name-asc',
    sortOrder: 'asc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [internalSelected, setInternalSelected] = useState<string[]>(selectedAddresses);

  // Icon references (for UI feedback)
  const SortIcon = ArrowsUpDownIcon;
  const SuccessIcon = CheckIcon;
  const ErrorIcon = XMarkIcon;

  // Debounced search
  const debouncedSearch = useDebounce(filters.search, 300);

  // Bulk actions
  const bulkActions: BulkAction[] = [
    {
      id: 'delete',
      label: 'Delete Selected',
      icon: TrashIcon,
      variant: 'danger',
      requiresConfirmation: true,
    },
  ];

  // Filter and sort addresses
  const filteredAndSortedAddresses = useMemo(() => {
    let filtered = [...addresses];

    // Apply search filter
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(address =>
        address.name?.toLowerCase().includes(searchLower) ||
        address.address.toLowerCase().includes(searchLower) ||
        address.city.toLowerCase().includes(searchLower) ||
        address.phone?.toLowerCase().includes(searchLower) ||
        address.landmark?.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter(address => address.type === filters.type);
    }

    // Apply validation filter
    if (filters.validation) {
      const isVerified = filters.validation === 'verified';
      filtered = filtered.filter(address => (address.isValidated ?? false) === isVerified);
    }

    // Apply sorting
    const [sortField, sortDirection] = filters.sortBy.split('-') as [string, 'asc' | 'desc'];
    
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'created':
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
        case 'lastUsed':
          aValue = new Date(a.lastUsedAt || 0).getTime();
          bValue = new Date(b.lastUsedAt || 0).getTime();
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        default:
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    // Always put default address first if not searching/filtering
    if (!debouncedSearch && !filters.type && !filters.validation) {
      const defaultIndex = filtered.findIndex(addr => addr.id === defaultAddressId);
      if (defaultIndex > 0) {
        const [defaultAddr] = filtered.splice(defaultIndex, 1);
        filtered.unshift(defaultAddr);
      }
    }

    return filtered;
  }, [addresses, debouncedSearch, filters, defaultAddressId]);

  // Handlers
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSelectAll = useCallback((checked: boolean) => {
    const newSelected = checked 
      ? filteredAndSortedAddresses.map(addr => addr.id)
      : [];
    
    setInternalSelected(newSelected);
    onSelectionChange?.(newSelected);
  }, [filteredAndSortedAddresses, onSelectionChange]);

  const handleSelectAddress = useCallback((addressId: string, checked: boolean) => {
    const newSelected = checked
      ? [...internalSelected, addressId]
      : internalSelected.filter(id => id !== addressId);
    
    setInternalSelected(newSelected);
    onSelectionChange?.(newSelected);
  }, [internalSelected, onSelectionChange]);

  const handleBulkAction = (actionId: string) => {
    if (internalSelected.length === 0) return;
    
    const action = bulkActions.find(a => a.id === actionId);
    if (!action) return;

    if (action.requiresConfirmation) {
      if (confirm(`Are you sure you want to ${action.label.toLowerCase()}?`)) {
        onBulkAction?.(actionId, internalSelected);
        setInternalSelected([]);
        onSelectionChange?.([]);
      }
    } else {
      onBulkAction?.(actionId, internalSelected);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      type: '',
      validation: '',
      sortBy: 'name-asc',
      sortOrder: 'asc',
    });
  };

  // Stats (with validation icons)
  const stats = {
    total: addresses.length,
    verified: addresses.filter(addr => addr.isValidated === true).length,
    unverified: addresses.filter(addr => addr.isValidated === false).length,
    home: addresses.filter(addr => addr.type === 'home').length,
    work: addresses.filter(addr => addr.type === 'work').length,
    other: addresses.filter(addr => addr.type === 'other').length,
  };
  
  // Validation status indicators (using icons)
  const validationStatusIcon = (isValidated?: boolean) => {
    if (isValidated === true) return <SuccessIcon className="w-4 h-4 text-green-500" />;
    if (isValidated === false) return <ErrorIcon className="w-4 h-4 text-red-500" />;
    return null;
  };

  const hasActiveFilters = filters.search || filters.type || filters.validation;
  const isAllSelected = internalSelected.length === filteredAndSortedAddresses.length;
  const isPartiallySelected = internalSelected.length > 0 && !isAllSelected;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Delivery Addresses
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your saved addresses ({stats.total} total)
          </p>
        </div>

        {showAddButton && onAddAddress && (
          <Button onClick={onAddAddress} className="gap-2">
            <PlusIcon className="w-4 h-4" />
            Add New Address
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {stats.verified}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">
            Verified
          </div>
        </div>
        
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            {stats.home}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">
            Home
          </div>
        </div>
        
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
            {stats.work}
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-400">
            Work
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
            {stats.other}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Other
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search addresses..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn('gap-2', {
              'bg-primary-50 border-primary-200 text-primary-700': hasActiveFilters,
            })}
          >
            <FunnelIcon className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" size="sm">
                Active
              </Badge>
            )}
          </Button>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SortIcon className="w-4 h-4 text-gray-400" />
            <Select
              value={filters.sortBy}
              onValueChange={(value: string | number) => handleFilterChange('sortBy', value as string)}
              options={sortOptions}
              className="min-w-[150px]"
              placeholder="Sort by..."
            />
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Address Type
                    </label>
                    <Select
                      value={filters.type}
                      onValueChange={(value: string | number) => handleFilterChange('type', value as string)}
                      options={filterOptions.type}
                      placeholder="All types"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Validation Status
                    </label>
                    <Select
                      value={filters.validation}
                      onValueChange={(value: string | number) => handleFilterChange('validation', value as string)}
                      options={filterOptions.validation}
                      placeholder="All addresses"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={handleClearFilters}
                      disabled={!hasActiveFilters}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bulk Actions */}
      {selectionMode && (
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isAllSelected}
              indeterminate={isPartiallySelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {internalSelected.length > 0 
                ? `${internalSelected.length} selected`
                : 'Select all addresses'
              }
            </span>
          </div>

          {internalSelected.length > 0 && (
            <div className="flex items-center gap-2">
              {bulkActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.id}
                    variant={(action.variant === 'danger' ? 'destructive' : action.variant) || 'outline'}
                    size="sm"
                    onClick={() => handleBulkAction(action.id)}
                    className="gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {action.label}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Address List */}
      <div className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}

        {!loading && !error && filteredAndSortedAddresses.length === 0 && (
          <div className="text-center py-12">
            <MapPinIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {hasActiveFilters ? 'No addresses match your filters' : emptyMessage}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {hasActiveFilters 
                ? 'Try adjusting your search or filter criteria'
                : 'Add your first address to get started with deliveries'
              }
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            ) : onAddAddress ? (
              <Button onClick={onAddAddress} className="gap-2">
                <PlusIcon className="w-4 h-4" />
                Add Your First Address
              </Button>
            ) : null}
          </div>
        )}

        {!loading && !error && filteredAndSortedAddresses.length > 0 && (
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {filteredAndSortedAddresses.map((address) => (
                <motion.div
                  key={address.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative"
                >
                  {selectionMode && (
                    <div className="absolute top-4 left-4 z-10">
                      <Checkbox
                        checked={internalSelected.includes(address.id)}
                        onChange={(e) => handleSelectAddress(address.id, e.target.checked)}
                      />
                    </div>
                  )}
                  
                  {/* Validation status indicator */}
                  {address.isValidated !== undefined && (
                    <div className="absolute top-4 right-4 z-10" title={address.isValidated ? 'Verified address' : 'Unverified address'}>
                      {validationStatusIcon(address.isValidated)}
                    </div>
                  )}
                  
                  <AddressCard
                    address={address}
                    isDefault={address.id === defaultAddressId}
                    showActions={!selectionMode}
                    variant="default"
                    selectable={!selectionMode && !!onSelectAddress}
                    isSelected={false}
                    onEdit={onEditAddress}
                    onDelete={onDeleteAddress}
                    onSetDefault={onSetDefault}
                    onSelect={onSelectAddress}
                    className={cn({
                      'ml-12': selectionMode,
                    })}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Results Count */}
      {!loading && !error && filteredAndSortedAddresses.length > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Showing {filteredAndSortedAddresses.length} of {addresses.length} addresses
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="ml-2 text-primary-600 hover:text-primary-700 underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AddressList;