'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  TrashIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/utils';
import { PaymentMethodCard } from './PaymentMethodCard';
import { useNotification } from '@/hooks/notification/useNotification';
import type { PaymentMethod, PaymentMethodType, PaymentProvider } from '@/types/payment.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PaymentMethodsListProps {
  /** Payment methods data */
  methods: PaymentMethod[];
  
  /** Add new payment method handler */
  onAdd?: () => void;
  
  /** Edit payment method handler */
  onEdit?: (method: PaymentMethod) => void;
  
  /** Delete payment method handler */
  onDelete?: (method: PaymentMethod) => void;
  
  /** Set default handler */
  onSetDefault?: (method: PaymentMethod) => void;
  
  /** Select handler */
  onSelect?: (method: PaymentMethod) => void;
  
  /** Selected payment method ID */
  selectedId?: string;
  
  /** Show filters */
  showFilters?: boolean;
  
  /** Show search */
  showSearch?: boolean;
  
  /** Show view toggle */
  showViewToggle?: boolean;
  
  /** Show add button */
  showAdd?: boolean;
  
  /** Show bulk actions */
  showBulkActions?: boolean;
  
  /** Loading state */
  loading?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

export type ViewMode = 'grid' | 'list';
export type SortBy = 'recent' | 'default' | 'type' | 'provider' | 'nickname';

// ============================================================================
// CONSTANTS
// ============================================================================

const PAYMENT_TYPES: Array<{ value: PaymentMethodType; label: string }> = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'net_banking', label: 'Net Banking' },
  { value: 'upi', label: 'UPI' },
  { value: 'digital_wallet', label: 'Digital Wallet' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'emi', label: 'EMI' },
  { value: 'cash_on_delivery', label: 'Cash on Delivery' },
  { value: 'gift_card', label: 'Gift Card' },
  { value: 'store_credit', label: 'Store Credit' },
  { value: 'cryptocurrency', label: 'Cryptocurrency' },
  { value: 'buy_now_pay_later', label: 'Buy Now Pay Later' },
];

const SORT_OPTIONS: Array<{ value: SortBy; label: string }> = [
  { value: 'recent', label: 'Recently Used' },
  { value: 'default', label: 'Default First' },
  { value: 'type', label: 'By Type' },
  { value: 'provider', label: 'By Provider' },
  { value: 'nickname', label: 'By Name' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * PaymentMethodsList Component
 * 
 * Comprehensive list of user's payment methods with features including:
 * - Grid and list view modes
 * - Filtering by type and provider
 * - Search functionality
 * - Sorting options (recently used, default first, type, provider, nickname)
 * - Add new payment method button
 * - Bulk actions (delete multiple)
 * - Empty state handling
 * - Loading states
 * - PaymentMethodCard integration
 * - Active/inactive filter
 * - Verified filter
 * - Selection support
 * - Statistics (total, active, default)
 * 
 * @example
 * ```tsx
 * <PaymentMethodsList
 *   methods={paymentMethods}
 *   onAdd={handleAdd}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   showFilters={true}
 * />
 * ```
 */
export const PaymentMethodsList: React.FC<PaymentMethodsListProps> = ({
  methods,
  onAdd,
  onEdit,
  onDelete,
  onSetDefault,
  onSelect,
  selectedId,
  showFilters = true,
  showSearch = true,
  showViewToggle = true,
  showAdd = true,
  showBulkActions = false,
  loading = false,
  className,
}) => {
  // Hooks
  const toast = useNotification();

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<PaymentMethodType | 'all'>('all');
  const [filterProvider, setFilterProvider] = useState<PaymentProvider | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'verified'>('all');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Available providers from methods
  const availableProviders = useMemo(() => {
    const providers = new Set<PaymentProvider>();
    methods.forEach(method => {
      if (method.provider) providers.add(method.provider);
    });
    return Array.from(providers);
  }, [methods]);

  // Filtered and sorted methods
  const filteredMethods = useMemo(() => {
    let filtered = [...methods];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(method => 
        method.nickname?.toLowerCase().includes(query) ||
        method.type.toLowerCase().includes(query) ||
        method.provider?.toLowerCase().includes(query) ||
        method.cardDetails?.last4.includes(query) ||
        method.bankDetails?.accountNumber.includes(query)
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(method => method.type === filterType);
    }

    // Apply provider filter
    if (filterProvider !== 'all') {
      filtered = filtered.filter(method => method.provider === filterProvider);
    }

    // Apply status filter
    switch (filterStatus) {
      case 'active':
        filtered = filtered.filter(method => method.isActive);
        break;
      case 'inactive':
        filtered = filtered.filter(method => !method.isActive);
        break;
      case 'verified':
        filtered = filtered.filter(method => method.isVerified);
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => {
          const aTime = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0;
          const bTime = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0;
          return bTime - aTime;
        });
        break;
      case 'default':
        filtered.sort((a, b) => {
          if (a.isDefault === b.isDefault) return 0;
          return a.isDefault ? -1 : 1;
        });
        break;
      case 'type':
        filtered.sort((a, b) => a.type.localeCompare(b.type));
        break;
      case 'provider':
        filtered.sort((a, b) => (a.provider || '').localeCompare(b.provider || ''));
        break;
      case 'nickname':
        filtered.sort((a, b) => (a.nickname || '').localeCompare(b.nickname || ''));
        break;
    }

    return filtered;
  }, [methods, searchQuery, filterType, filterProvider, filterStatus, sortBy]);

  // Statistics
  const stats = useMemo(() => ({
    total: methods.length,
    active: methods.filter(m => m.isActive).length,
    default: methods.find(m => m.isDefault),
  }), [methods]);

  // Handlers
  const handleSelectMethod = useCallback((method: PaymentMethod) => {
    if (onSelect) {
      onSelect(method);
    }
  }, [onSelect]);

  const handleToggleSelection = useCallback((methodId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(methodId)) {
        newSet.delete(methodId);
      } else {
        newSet.add(methodId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredMethods.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMethods.map(m => m.id)));
    }
  }, [filteredMethods, selectedIds.size]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedIds.size} payment method(s)?`
    );
    
    if (!confirmed) return;

    try {
      for (const id of Array.from(selectedIds)) {
        const method = methods.find(m => m.id === id);
        if (method && onDelete) {
          await onDelete(method);
        }
      }
      setSelectedIds(new Set());
      toast?.success(`${selectedIds.size} payment method(s) deleted`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete payment methods';
      toast?.error(errorMessage);
    }
  }, [selectedIds, methods, onDelete, toast]);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setFilterType('all');
    setFilterProvider('all');
    setFilterStatus('all');
    setSortBy('recent');
  }, []);

  // Render empty state
  if (!loading && methods.length === 0) {
    return (
      <Card className={className}>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <CreditCardIcon className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payment Methods</h3>
            <p className="text-sm text-gray-500 mb-6 text-center">
              Add a payment method to make purchases easier
            </p>
            {showAdd && onAdd && (
              <Button onClick={onAdd}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render component
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
              <p className="text-sm text-gray-500 mt-1">
                {stats.total} payment method{stats.total !== 1 ? 's' : ''} • {stats.active} active
              </p>
            </div>

            <div className="flex items-center gap-2">
              {showViewToggle && (
                <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-2 rounded transition-colors',
                      viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                    )}
                    title="Grid view"
                  >
                    <Squares2X2Icon className="w-4 h-4" />
                  </button>
                  <button
                    title="List view"
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'p-2 rounded transition-colors',
                      viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                    )}
                  >
                    <ListBulletIcon className="w-4 h-4" />
                  </button>
                </div>
              )}

              {showAdd && onAdd && (
                <Button onClick={onAdd}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add New
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row gap-3">
              {showSearch && (
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search payment methods..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                {showFilters && (
                  <Button
                    variant="outline"
                    onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                  >
                    <FunnelIcon className="w-4 h-4 mr-2" />
                    Filters
                    {(filterType !== 'all' || filterProvider !== 'all' || filterStatus !== 'all') && (
                      <Badge variant="info" size="sm" className="ml-2">
                        Active
                      </Badge>
                    )}
                  </Button>
                )}

                <Select
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as SortBy)}
                  options={SORT_OPTIONS}
                  label="Sort"
                />
              </div>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
              {showFiltersPanel && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Select
                        value={filterType}
                        onValueChange={(value) => setFilterType(value as PaymentMethodType | 'all')}
                        options={[
                          { value: 'all', label: 'All Types' },
                          ...PAYMENT_TYPES,
                        ]}
                        label="Type"
                      />

                      <Select
                        value={filterProvider}
                        onValueChange={(value) => setFilterProvider(value as PaymentProvider | 'all')}
                        options={[
                          { value: 'all', label: 'All Providers' },
                          ...availableProviders.map(p => ({ value: p, label: p.toUpperCase() })),
                        ]}
                        label="Provider"
                      />

                      <Select
                        value={filterStatus}
                        onValueChange={(value) => setFilterStatus(value as 'all' | 'active' | 'inactive' | 'verified')}
                        options={[
                          { value: 'all', label: 'All Status' },
                          { value: 'active', label: 'Active Only' },
                          { value: 'inactive', label: 'Inactive Only' },
                          { value: 'verified', label: 'Verified Only' },
                        ]}
                        label="Status"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" onClick={handleResetFilters}>
                        Reset Filters
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bulk Actions */}
            {showBulkActions && selectedIds.size > 0 && (
              <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg border border-primary-200">
                <div className="flex items-center gap-2">
                  <Badge variant="info">{selectedIds.size} selected</Badge>
                  <Button variant="link" size="sm" onClick={handleSelectAll}>
                    {selectedIds.size === filteredMethods.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>

                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Methods List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredMethods.length === 0 ? (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12">
              <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
              <p className="text-sm text-gray-500 mb-4 text-center">
                Try adjusting your search or filters
              </p>
              <Button variant="outline" onClick={handleResetFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          layout
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
          )}
        >
          <AnimatePresence mode="popLayout">
            {filteredMethods.map((method) => (
              <motion.div
                key={method.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <PaymentMethodCard
                  method={method}
                  selected={selectedId === method.id || selectedIds.has(method.id)}
                  onClick={() => {
                    if (showBulkActions) {
                      handleToggleSelection(method.id);
                    } else {
                      handleSelectMethod(method);
                    }
                  }}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onSetDefault={onSetDefault}
                  compact={viewMode === 'list'}
                  showActions={true}
                  showLastUsed={true}
                  showExpiryWarning={true}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default PaymentMethodsList;
