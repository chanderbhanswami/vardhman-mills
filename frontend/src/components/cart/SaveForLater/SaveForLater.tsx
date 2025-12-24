/**
 * SaveForLater Component
 * 
 * Allows users to save cart items for later purchase, move between cart
 * and saved items, set reminders, an      id: `cart-${item.id}`,
      productId: item.id,
      quantity: 1,
      name: item.name,
      price: item.price,
      image: item.image,
      slug: item.slug,
      sku: item.sku || `SKU-${item.id}`,
      inStock: item.inStock ? 999 : 0,
      variantId: item.variant?.id,e saved items efficiently.
 * 
 * Features:
 * - Move items between cart and saved list
 * - Price drop notifications
 * - Stock alerts for saved items
 * - Expiry tracking for saved items
 * - Quick add back to cart
 * - Bulk operations (move all, delete all)
 * - Categories for saved items
 * - Notes and reminders
 * - Share saved list
 * - Auto-move to cart on stock/price events
 * 
 * @component
 * @example
 * ```tsx
 * <SaveForLater
 *   items={savedItems}
 *   onMoveToCart={handleMove}
 *   onRemove={handleRemove}
 * />
 * ```
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCartIcon,
  TrashIcon,
  BellIcon,
  TagIcon,
  ClockIcon,
  ShareIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';
import { useCart } from '@/components/providers/CartProvider';
import toast from 'react-hot-toast';

// ============================================================================
// Types
// ============================================================================

export interface SavedItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice?: number;
  savedAt: Date;
  expiresAt?: Date;
  inStock: boolean;
  stockLevel?: number;
  category?: string;
  notes?: string;
  priceDropAlert: boolean;
  stockAlert: boolean;
  variants?: Record<string, string>;
}

export interface SaveForLaterProps {
  /** Saved items */
  items: SavedItem[];
  /** Callback when item is moved to cart */
  onMoveToCart?: (itemId: string) => void;
  /** Callback when item is removed */
  onRemove?: (itemId: string) => void;
  /** Callback when item alerts are updated */
  onUpdateAlerts?: (itemId: string, alerts: { priceDropAlert: boolean; stockAlert: boolean }) => void;
  /** Callback when note is added */
  onAddNote?: (itemId: string, note: string) => void;
  /** Show expired items */
  showExpired?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export const SaveForLater: React.FC<SaveForLaterProps> = ({
  items,
  onMoveToCart,
  onRemove,
  onUpdateAlerts,
  onAddNote,
  showExpired = false,
  className,
}) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const { addItem } = useCart();

  // Filter items
  const filteredItems = items.filter((item) => {
    if (!showExpired && item.expiresAt && new Date(item.expiresAt) < new Date()) {
      return false;
    }
    if (filterCategory !== 'all' && item.category !== filterCategory) {
      return false;
    }
    return true;
  });

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(items.map((item) => item.category).filter(Boolean)))];

  // Get time until expiry
  const getExpiryTime = (item: SavedItem): string => {
    if (!item.expiresAt) return '';
    const now = new Date();
    const expiry = new Date(item.expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`;
    return 'Expiring soon';
  };

  // Handle move to cart
  const handleMoveToCart = (item: SavedItem) => {
    addItem({
      id: `cart-${item.id}`,
      productId: item.productId,
      quantity: 1,
      name: item.name,
      price: item.price,
      image: item.image,
      slug: item.slug,
      sku: `SKU-${item.id}`,
      inStock: item.inStock ? (item.stockLevel || 999) : 0,
    });
    toast.success(`${item.name} moved to cart!`);
    onMoveToCart?.(item.id);
  };

  // Handle remove
  const handleRemove = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    onRemove?.(itemId);
    toast.success(`${item?.name || 'Item'} removed from saved items`);
  };

  // Handle bulk move to cart
  const handleBulkMoveToCart = () => {
    selectedItems.forEach((itemId) => {
      const item = items.find((i) => i.id === itemId);
      if (item && item.inStock) {
        handleMoveToCart(item);
      }
    });
    setSelectedItems(new Set());
  };

  // Handle bulk remove
  const handleBulkRemove = () => {
    selectedItems.forEach((itemId) => {
      onRemove?.(itemId);
    });
    toast.success(`${selectedItems.size} items removed`);
    setSelectedItems(new Set());
  };

  // Handle toggle selection
  const toggleSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map((item) => item.id)));
    }
  };

  // Handle toggle alerts
  const handleToggleAlert = (item: SavedItem, alertType: 'priceDropAlert' | 'stockAlert') => {
    const newAlerts = {
      priceDropAlert: item.priceDropAlert,
      stockAlert: item.stockAlert,
      [alertType]: !item[alertType],
    };
    onUpdateAlerts?.(item.id, newAlerts);
    toast.success(
      `${alertType === 'priceDropAlert' ? 'Price drop' : 'Stock'} alert ${newAlerts[alertType] ? 'enabled' : 'disabled'}`
    );
  };

  // Handle save note
  const handleSaveNote = (itemId: string) => {
    onAddNote?.(itemId, noteText);
    setEditingNote(null);
    setNoteText('');
    toast.success('Note saved!');
  };

  // Handle share saved list
  const handleShare = async () => {
    const itemNames = filteredItems.map((item) => item.name).join(', ');
    const text = `My Saved Items: ${itemNames}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Saved Items',
          text,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success('Saved items copied to clipboard!');
    }
  };

  if (items.length === 0) {
    return (
      <div className={cn('save-for-later text-center py-12', className)}>
        <BookmarkSolidIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Saved Items
        </h3>
        <p className="text-gray-600 mb-6">
          Items you save for later will appear here
        </p>
        <Link href="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={cn('save-for-later', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookmarkSolidIcon className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Saved for Later</h2>
            <p className="text-sm text-gray-600">{filteredItems.length} items saved</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Category Filter */}
          {categories.length > 1 && (
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-md border-gray-300 text-sm"
              aria-label="Filter by category"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          )}

          <Button variant="outline" size="sm" onClick={handleShare}>
            <ShareIcon className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {filteredItems.length > 0 && (
        <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
              onChange={handleSelectAll}
              className="rounded border-gray-300"
              aria-label="Select all items"
            />
            <span className="text-sm text-gray-700">
              {selectedItems.size > 0
                ? `${selectedItems.size} selected`
                : 'Select all'}
            </span>
          </div>

          {selectedItems.size > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkMoveToCart}
              >
                <ShoppingCartIcon className="h-4 w-4 mr-2" />
                Move to Cart ({selectedItems.size})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkRemove}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Remove ({selectedItems.size})
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Items List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                {/* Checkbox */}
                <div className="flex items-start pt-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => toggleSelection(item.id)}
                    className="rounded border-gray-300"
                    aria-label={`Select ${item.name}`}
                  />
                </div>

                {/* Image */}
                <Link href={`/products/${item.slug}`} className="flex-shrink-0">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                    {!item.inStock && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <Badge variant="destructive">Out of Stock</Badge>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title and Category */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-semibold text-gray-900 hover:text-primary line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      {item.category && (
                        <Badge variant="outline" className="mt-1">
                          <TagIcon className="h-3 w-3 mr-1" />
                          {item.category}
                        </Badge>
                      )}
                    </div>

                    {/* Price */}
                    <div className="ml-4 text-right">
                      <div className="text-xl font-bold text-gray-900">
                        {formatCurrency(item.price, 'INR')}
                      </div>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <>
                          <div className="text-sm text-gray-500 line-through">
                            {formatCurrency(item.originalPrice, 'INR')}
                          </div>
                          <Badge variant="success" className="mt-1">
                            {Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Stock Info */}
                  {item.inStock && item.stockLevel && item.stockLevel < 10 && (
                    <div className="text-sm text-primary-600 mb-2">
                      Only {item.stockLevel} left in stock!
                    </div>
                  )}

                  {/* Expiry */}
                  {item.expiresAt && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                      <ClockIcon className="h-4 w-4" />
                      {getExpiryTime(item)}
                    </div>
                  )}

                  {/* Alerts */}
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      onClick={() => handleToggleAlert(item, 'priceDropAlert')}
                      className={cn(
                        'flex items-center gap-1 text-sm px-2 py-1 rounded-md transition-colors',
                        item.priceDropAlert
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      <TagIcon className="h-4 w-4" />
                      Price Alert
                      {item.priceDropAlert && <CheckIcon className="h-3 w-3" />}
                    </button>
                    <button
                      onClick={() => handleToggleAlert(item, 'stockAlert')}
                      className={cn(
                        'flex items-center gap-1 text-sm px-2 py-1 rounded-md transition-colors',
                        item.stockAlert
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      <BellIcon className="h-4 w-4" />
                      Stock Alert
                      {item.stockAlert && <CheckIcon className="h-3 w-3" />}
                    </button>
                  </div>

                  {/* Notes */}
                  {editingNote === item.id ? (
                    <div className="mb-3">
                      <input
                        type="text"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add a note..."
                        className="w-full rounded-md border-gray-300 text-sm"
                        autoFocus
                      />
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveNote(item.id)}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingNote(null);
                            setNoteText('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {item.notes && (
                        <div className="text-sm text-gray-600 mb-3 italic">
                          &quot;{item.notes}&quot;
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setEditingNote(item.id);
                          setNoteText(item.notes || '');
                        }}
                        className="text-sm text-primary hover:underline mb-3"
                      >
                        {item.notes ? 'Edit note' : 'Add note'}
                      </button>
                    </>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleMoveToCart(item)}
                      disabled={!item.inStock}
                    >
                      <ShoppingCartIcon className="h-4 w-4 mr-2" />
                      Move to Cart
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemove(item.id)}
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SaveForLater;
