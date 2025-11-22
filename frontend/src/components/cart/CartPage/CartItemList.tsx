'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCartIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  HeartIcon,
  ClockIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Tooltip } from '@/components/ui/Tooltip';
import { CartItem } from './CartItem';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import type { CartItem as CartItemType } from '@/types/cart.types';
import { formatCurrency } from '@/lib/format';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CartItemListProps {
  /**
   * Array of cart items
   */
  items: CartItemType[];

  /**
   * Callback when quantity changes
   */
  onQuantityChange?: (itemId: string, quantity: number) => void | Promise<void>;

  /**
   * Callback when item is removed
   */
  onRemove?: (itemId: string) => void | Promise<void>;

  /**
   * Callback when item is moved to wishlist
   */
  onMoveToWishlist?: (itemId: string) => void | Promise<void>;

  /**
   * Callback when item is saved for later
   */
  onSaveForLater?: (itemId: string) => void | Promise<void>;

  /**
   * Callback when multiple items are removed
   */
  onBulkRemove?: (itemIds: string[]) => void | Promise<void>;

  /**
   * Callback when multiple items are moved to wishlist
   */
  onBulkMoveToWishlist?: (itemIds: string[]) => void | Promise<void>;

  /**
   * Show filters
   */
  showFilters?: boolean;

  /**
   * Show sorting
   */
  showSorting?: boolean;

  /**
   * Show search
   */
  showSearch?: boolean;

  /**
   * Show bulk actions
   */
  showBulkActions?: boolean;

  /**
   * Show item details
   */
  showItemDetails?: boolean;

  /**
   * Compact view
   */
  compact?: boolean;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

type SortOption = 'name' | 'price-asc' | 'price-desc' | 'quantity' | 'recently-added';
type FilterOption = 'all' | 'in-stock' | 'low-stock' | 'on-sale';

// ============================================================================
// CONSTANTS
// ============================================================================

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recently-added', label: 'Recently Added' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'quantity', label: 'Quantity' },
];

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: 'all', label: 'All Items' },
  { value: 'in-stock', label: 'In Stock' },
  { value: 'low-stock', label: 'Low Stock' },
  { value: 'on-sale', label: 'On Sale' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const sortItems = (items: CartItemType[], sortBy: SortOption): CartItemType[] => {
  const sortedItems = [...items];

  switch (sortBy) {
    case 'name':
      return sortedItems.sort((a, b) => a.product.name.localeCompare(b.product.name));
    case 'price-asc':
      return sortedItems.sort((a, b) => a.unitPrice.amount - b.unitPrice.amount);
    case 'price-desc':
      return sortedItems.sort((a, b) => b.unitPrice.amount - a.unitPrice.amount);
    case 'quantity':
      return sortedItems.sort((a, b) => b.quantity - a.quantity);
    case 'recently-added':
      return sortedItems.sort((a, b) => 
        new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      );
    default:
      return sortedItems;
  }
};

const filterItems = (items: CartItemType[], filterBy: FilterOption): CartItemType[] => {
  switch (filterBy) {
    case 'in-stock':
      return items.filter(item => (item.product.inventory?.quantity || 0) >= 10);
    case 'low-stock':
      return items.filter(item => {
        const stock = item.product.inventory?.quantity || 0;
        return stock > 0 && stock < 10;
      });
    case 'on-sale':
      return items.filter(item => item.product.isOnSale);
    case 'all':
    default:
      return items;
  }
};

const searchItems = (items: CartItemType[], query: string): CartItemType[] => {
  if (!query.trim()) return items;

  const lowerQuery = query.toLowerCase();
  return items.filter(item => 
    item.product.name.toLowerCase().includes(lowerQuery) ||
    item.product.sku?.toLowerCase().includes(lowerQuery) ||
    item.product.brand?.name.toLowerCase().includes(lowerQuery)
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CartItemList: React.FC<CartItemListProps> = ({
  items,
  onQuantityChange,
  onRemove,
  onMoveToWishlist,
  onSaveForLater,
  onBulkRemove,
  onBulkMoveToWishlist,
  showFilters = false,
  showSorting = false,
  showSearch = false,
  showBulkActions = false,
  showItemDetails = true,
  compact = false,
  isLoading = false,
  className,
}) => {
  // State
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>('recently-added');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [isBulkActionProcessing, setIsBulkActionProcessing] = useState(false);

  // Memoized values
  const processedItems = useMemo(() => {
    let result = [...items];
    
    // Apply search
    if (searchQuery) {
      result = searchItems(result, searchQuery);
    }
    
    // Apply filter
    result = filterItems(result, filterBy);
    
    // Apply sort
    result = sortItems(result, sortBy);
    
    return result;
  }, [items, searchQuery, filterBy, sortBy]);

  const totalItems = items.length;
  const displayedItems = processedItems.length;
  const selectedCount = selectedItems.size;
  const isAllSelected = selectedCount > 0 && selectedCount === displayedItems;
  const isSomeSelected = selectedCount > 0 && selectedCount < displayedItems;

  const totalValue = useMemo(() => {
    return items.reduce((sum, item) => sum + item.totalPrice.amount, 0);
  }, [items]);

  const selectedValue = useMemo(() => {
    return items
      .filter(item => selectedItems.has(item.id))
      .reduce((sum, item) => sum + item.totalPrice.amount, 0);
  }, [items, selectedItems]);

  // Handlers
  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(processedItems.map(item => item.id)));
    }
  }, [isAllSelected, processedItems]);

  const handleSelectItem = useCallback((itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const handleBulkRemove = useCallback(async () => {
    if (selectedCount === 0 || isBulkActionProcessing) return;

    const confirmed = window.confirm(
      `Are you sure you want to remove ${selectedCount} item(s) from your cart?`
    );

    if (!confirmed) return;

    setIsBulkActionProcessing(true);

    try {
      const itemIds = Array.from(selectedItems);
      if (onBulkRemove) {
        await onBulkRemove(itemIds);
      } else if (onRemove) {
        // Fallback to individual removals
        await Promise.all(itemIds.map(id => onRemove(id)));
      }
      setSelectedItems(new Set());
      toast.success(`Removed ${selectedCount} item(s) from cart`);
    } catch (error) {
      console.error('Failed to remove items:', error);
      toast.error('Failed to remove items. Please try again.');
    } finally {
      setIsBulkActionProcessing(false);
    }
  }, [selectedCount, selectedItems, isBulkActionProcessing, onBulkRemove, onRemove]);

  const handleBulkMoveToWishlist = useCallback(async () => {
    if (selectedCount === 0 || isBulkActionProcessing) return;

    setIsBulkActionProcessing(true);

    try {
      const itemIds = Array.from(selectedItems);
      if (onBulkMoveToWishlist) {
        await onBulkMoveToWishlist(itemIds);
      } else if (onMoveToWishlist) {
        // Fallback to individual moves
        await Promise.all(itemIds.map(id => onMoveToWishlist(id)));
      }
      setSelectedItems(new Set());
      toast.success(`Moved ${selectedCount} item(s) to wishlist`);
    } catch (error) {
      console.error('Failed to move items to wishlist:', error);
      toast.error('Failed to move items to wishlist. Please try again.');
    } finally {
      setIsBulkActionProcessing(false);
    }
  }, [selectedCount, selectedItems, isBulkActionProcessing, onBulkMoveToWishlist, onMoveToWishlist]);

  const handleClearFilters = useCallback(() => {
    setFilterBy('all');
    setSearchQuery('');
    setSortBy('recently-added');
  }, []);

  // Render helpers
  const renderToolbar = () => (
    <Card className="p-4 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left Section - Info & Bulk Actions */}
        <div className="flex items-center gap-4">
          {showBulkActions && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={input => {
                  if (input) {
                    input.indeterminate = isSomeSelected;
                  }
                }}
                onChange={handleSelectAll}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                aria-label="Select all items"
              />
              <span className="text-sm text-gray-700">
                {selectedCount > 0 ? `${selectedCount} selected` : 'Select all'}
              </span>
            </label>
          )}

          <div className="flex items-center gap-2">
            <ShoppingCartIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">
              {displayedItems} {displayedItems === 1 ? 'item' : 'items'}
            </span>
            {displayedItems !== totalItems && (
              <Badge variant="secondary" size="sm">
                of {totalItems}
              </Badge>
            )}
            {sortBy === 'recently-added' && (
              <Badge variant="default" size="sm" className="flex items-center gap-1">
                <ClockIcon className="h-3 w-3" />
                Recently Added
              </Badge>
            )}
          </div>
        </div>

        {/* Right Section - Search, Filter, Sort */}
        <div className="flex items-center gap-2 flex-wrap">
          {showSearch && (
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full sm:w-48"
                aria-label="Search cart items"
              />
            </div>
          )}

          {showFilters && (
            <Tooltip content="Filter items">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className={cn(showFiltersPanel && 'bg-gray-100')}
              >
                <FunnelIcon className="h-4 w-4" />
                <span className="ml-2">Filter</span>
                {filterBy !== 'all' && (
                  <Badge variant="default" size="sm" className="ml-2">
                    1
                  </Badge>
                )}
              </Button>
            </Tooltip>
          )}

          {showSorting && (
            <div className="relative">
              <ArrowsUpDownIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Sort cart items"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
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
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
                {filterBy !== 'all' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="flex items-center gap-1"
                  >
                    <XCircleIcon className="h-4 w-4" />
                    Clear all
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {FILTER_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFilterBy(option.value)}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                      filterBy === option.value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {showBulkActions && selectedCount > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">
                    {selectedCount} item(s) selected
                  </span>
                  <span className="text-sm text-gray-600">
                    Total: {formatCurrency(selectedValue, 'INR')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {onMoveToWishlist && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkMoveToWishlist}
                      disabled={isBulkActionProcessing}
                    >
                      <HeartIcon className="h-4 w-4 mr-2" />
                      Move to Wishlist
                    </Button>
                  )}
                  {onRemove && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkRemove}
                      disabled={isBulkActionProcessing}
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );

  const renderEmptyState = () => (
    <Card className="p-12 text-center">
      <ShoppingCartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {searchQuery || filterBy !== 'all' ? 'No items found' : 'Your cart is empty'}
      </h3>
      <p className="text-gray-600 mb-6">
        {searchQuery || filterBy !== 'all'
          ? 'Try adjusting your search or filters'
          : 'Start adding items to your cart'}
      </p>
      {(searchQuery || filterBy !== 'all') && (
        <Button onClick={handleClearFilters}>
          Clear filters
        </Button>
      )}
    </Card>
  );

  const renderLoadingState = () => (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <Card key={i} className="p-6 animate-pulse">
          <div className="flex gap-6">
            <div className="w-32 h-32 bg-gray-200 rounded-lg" />
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  // Main render
  if (isLoading) {
    return (
      <div className={className}>
        {renderToolbar()}
        {renderLoadingState()}
      </div>
    );
  }

  if (processedItems.length === 0) {
    return (
      <div className={className}>
        {(showSearch || showFilters || showSorting) && renderToolbar()}
        {renderEmptyState()}
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Toolbar */}
      {(showSearch || showFilters || showSorting || showBulkActions) && renderToolbar()}

      {/* Items List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {processedItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="relative"
            >
              {showBulkActions && (
                <div className="absolute left-4 top-4 z-10">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    aria-label={`Select ${item.product.name}`}
                  />
                </div>
              )}
              <CartItem
                item={item}
                onQuantityChange={onQuantityChange}
                onRemove={onRemove}
                onMoveToWishlist={onMoveToWishlist}
                onSaveForLater={onSaveForLater}
                showDetails={showItemDetails}
                compact={compact}
                className={showBulkActions ? 'pl-12' : ''}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Summary Footer */}
      {processedItems.length > 0 && (
        <Card className="mt-6 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{displayedItems} items</span>
              <span>•</span>
              <span>Total: {formatCurrency(totalValue, 'INR')}</span>
            </div>
            {selectedCount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircleIcon className="h-4 w-4 text-green-600" />
                <span className="text-gray-600">
                  {selectedCount} selected ({formatCurrency(selectedValue, 'INR')})
                </span>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default CartItemList;
