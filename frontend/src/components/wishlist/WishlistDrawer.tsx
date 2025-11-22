'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { 
  XMarkIcon,
  HeartIcon,
  ShoppingCartIcon,
  TrashIcon,
  ShareIcon,
  EyeIcon,
  PlusIcon,
  MinusIcon,
  ArrowTopRightOnSquareIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  Bars3Icon,
  Squares2X2Icon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  StarIcon as StarOutlineIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  StarIcon as StarSolidIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/solid';

// UI Components
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Tooltip } from '@/components/ui/Tooltip';
import { Skeleton } from '@/components/ui/Skeleton';
import { DropdownMenu } from '@/components/ui/DropdownMenu';

// Hooks and Contexts
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/hooks/useToast';

// Utils
import { cn } from '@/lib/utils';

// Types
interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  addedAt: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  brand?: string;
  discount?: number;
}

export interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right';
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showHeader?: boolean;
  showFooter?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showQuickActions?: boolean;
  enableBulkActions?: boolean;
  enableSorting?: boolean;
  viewMode?: 'list' | 'grid' | 'compact';
  maxItems?: number;
  emptyStateMessage?: string;
  emptyStateAction?: React.ReactNode;
  onItemClick?: (item: WishlistItem) => void;
  onItemRemove?: (item: WishlistItem) => void;
  onItemMoveToCart?: (item: WishlistItem) => void;
  onBulkAction?: (action: string, items: WishlistItem[]) => void;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  animated?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  persistent?: boolean;
}

interface DrawerItemProps {
  item: WishlistItem;
  viewMode: 'list' | 'grid' | 'compact';
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onRemove: () => void;
  onMoveToCart: () => void;
  onView: () => void;
  onShare: () => void;
  showQuickActions: boolean;
  enableSelection: boolean;
}

interface EmptyStateProps {
  message?: string;
  action?: React.ReactNode;
  className?: string;
}

interface WishlistStatsProps {
  items: WishlistItem[];
  className?: string;
}

// Wishlist Stats Component
const WishlistStats: React.FC<WishlistStatsProps> = ({ items, className }) => {
  const stats = useMemo(() => {
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + item.price, 0);
    const inStockItems = items.filter(item => item.inStock).length;
    const highPriorityItems = items.filter(item => item.priority === 'high').length;
    
    return {
      totalItems,
      totalValue,
      inStockItems,
      highPriorityItems,
      outOfStockItems: totalItems - inStockItems
    };
  }, [items]);

  return (
    <div className={cn('grid grid-cols-2 gap-3 p-4 bg-gray-50 border-b', className)}>
      <div className="text-center">
        <div className="text-xl font-bold text-gray-900">{stats.totalItems}</div>
        <div className="text-xs text-gray-500">Total Items</div>
      </div>
      <div className="text-center">
        <div className="text-xl font-bold text-gray-900">${stats.totalValue.toFixed(2)}</div>
        <div className="text-xs text-gray-500">Total Value</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold text-green-600">{stats.inStockItems}</div>
        <div className="text-xs text-gray-500">In Stock</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold text-red-600">{stats.highPriorityItems}</div>
        <div className="text-xs text-gray-500">High Priority</div>
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState: React.FC<EmptyStateProps> = ({ 
  message = "Your wishlist is empty", 
  action,
  className 
}) => (
  <div className={cn('flex flex-col items-center justify-center py-12 px-6 text-center', className)}>
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <HeartIcon className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">No items in wishlist</h3>
    <p className="text-gray-500 mb-6 max-w-sm">{message}</p>
    {action}
  </div>
);

// Drawer Item Component
const DrawerItem: React.FC<DrawerItemProps> = ({
  item,
  viewMode,
  selected,
  onSelect,
  onRemove,
  onMoveToCart,
  onView,
  onShare,
  showQuickActions,
  enableSelection
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleMoveToCart = useCallback(async () => {
    setIsLoading(true);
    try {
      await onMoveToCart();
    } finally {
      setIsLoading(false);
    }
  }, [onMoveToCart]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (viewMode === 'compact') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          'flex items-center gap-3 p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors',
          selected && 'bg-blue-50 border-blue-200'
        )}
      >
        {enableSelection && (
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            aria-label={`Select ${item.name}`}
          />
        )}
        
        <div className="relative w-12 h-12 flex-shrink-0">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className={cn(
              'object-cover rounded transition-opacity',
              !imageLoaded && 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && <Skeleton className="w-full h-full rounded" />}
          {!item.inStock && (
            <div className="absolute inset-0 bg-black/40 rounded flex items-center justify-center">
              <span className="text-white text-xs font-medium">OOS</span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-gray-900 truncate">{item.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-semibold text-gray-900">${item.price.toFixed(2)}</span>
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="text-xs text-gray-500 line-through">
                ${item.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
        
        {showQuickActions && (
          <div className="flex gap-1">
            <Tooltip content="Add to cart">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleMoveToCart}
                disabled={!item.inStock || isLoading}
                className="w-8 h-8 p-0"
              >
                <ShoppingCartIcon className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Remove">
              <Button
                size="sm"
                variant="ghost"
                onClick={onRemove}
                className="w-8 h-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <TrashIcon className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors',
        selected && 'bg-blue-50 border-blue-200'
      )}
    >
      <div className="flex gap-4">
        {enableSelection && (
          <div className="flex items-start pt-1">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              aria-label={`Select ${item.name}`}
            />
          </div>
        )}
        
        <div className="relative w-20 h-20 flex-shrink-0">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className={cn(
              'object-cover rounded-lg transition-opacity',
              !imageLoaded && 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && <Skeleton className="w-full h-full rounded-lg" />}
          {!item.inStock && (
            <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-medium">Out of Stock</span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <Link href={`/product/${item.productId}`} onClick={onView}>
              <h3 className="font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 flex items-center gap-2">
                {item.name}
                <ArrowTopRightOnSquareIcon className="w-3 h-3 text-gray-400" />
              </h3>
            </Link>
            <div className="flex items-center gap-2">
              {item.brand && (
                <p className="text-sm text-gray-500">{item.brand}</p>
              )}
              <div className={cn(
                "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                item.inStock 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              )}>
                {item.inStock ? (
                  <>
                    <CheckIcon className="w-3 h-3" />
                    In Stock
                  </>
                ) : (
                  <>
                    <ExclamationTriangleIcon className="w-3 h-3" />
                    Out of Stock
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-900">${item.price.toFixed(2)}</span>
            {item.originalPrice && item.originalPrice > item.price && (
              <>
                <span className="text-sm text-gray-500 line-through">
                  ${item.originalPrice.toFixed(2)}
                </span>
                <Badge variant="destructive" className="text-xs">
                  -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                </Badge>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                star <= item.rating ? (
                  <StarSolidIcon
                    key={star}
                    className="w-3 h-3 text-yellow-400"
                  />
                ) : (
                  <StarOutlineIcon
                    key={star}
                    className="w-3 h-3 text-gray-300"
                  />
                )
              ))}
            </div>
            <span className="text-xs text-gray-500">({item.reviewCount})</span>
            
            <div className={cn(
              'ml-auto px-2 py-1 rounded-full text-xs font-medium border',
              getPriorityColor(item.priority)
            )}>
              {item.priority}
            </div>
          </div>
          
          {showQuickActions && (
            <div className="space-y-2 pt-2">
              {/* Quantity Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Qty:</span>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setQuantity(prev => Math.max(prev - 1, 1))}
                    disabled={quantity <= 1}
                    className="h-8 w-8 p-0 border-r border-gray-300"
                  >
                    <MinusIcon className="w-3 h-3" />
                  </Button>
                  <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                    {quantity}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setQuantity(prev => Math.min(prev + 1, 10))}
                    disabled={quantity >= 10}
                    className="h-8 w-8 p-0 border-l border-gray-300"
                  >
                    <PlusIcon className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleMoveToCart}
                disabled={!item.inStock || isLoading}
                className="flex-1"
              >
                <ShoppingCartIcon className="w-4 h-4 mr-2" />
                {item.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              
              <Tooltip content="Quick View">
                <Button size="sm" variant="outline" onClick={onView} className="px-3">
                  <EyeIcon className="w-4 h-4" />
                </Button>
              </Tooltip>
              
              <Tooltip content="Share">
                <Button size="sm" variant="outline" onClick={onShare} className="px-3">
                  <ShareIcon className="w-4 h-4" />
                </Button>
              </Tooltip>
              
              <Tooltip content="Remove">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRemove}
                  className="px-3 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </Tooltip>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Main Wishlist Drawer Component
export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  position = 'right',
  width = 'md',
  showHeader = true,
  showFooter = true,
  showSearch = true,
  showFilters = false,
  showQuickActions = true,
  enableBulkActions = true,
  enableSorting = true,
  viewMode = 'list',
  maxItems,
  emptyStateMessage,
  emptyStateAction,
  onItemClick,
  onItemRemove,
  onItemMoveToCart,
  onBulkAction,
  className,
  overlayClassName,
  contentClassName,
  headerClassName,
  footerClassName,
  animated = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  persistent = false
}) => {
  // Hooks
  const { state: { items: contextItems }, removeFromWishlist, moveToCart } = useWishlist();
  const { toast } = useToast();

  // Enhanced items with additional properties for full functionality
  const enhancedItems: WishlistItem[] = useMemo(() => 
    contextItems.map(item => ({
      ...item,
      priority: ('priority' in item ? item.priority : 'medium') as 'low' | 'medium' | 'high',
      notes: ('notes' in item ? item.notes : '') as string,
      rating: ('rating' in item ? item.rating : 0) as number,
      reviewCount: ('reviewCount' in item ? item.reviewCount : 0) as number,
      tags: ('tags' in item ? item.tags : []) as string[],
      originalPrice: ('originalPrice' in item ? item.originalPrice : undefined) as number | undefined,
      addedAt: item.addedAt.toISOString(),
      discount: ('discount' in item ? item.discount : undefined) as number | undefined,
    })),
    [contextItems]
  );
  
  const wishlistItems = enhancedItems;

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'added' | 'priority'>('added');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterInStock, setFilterInStock] = useState<boolean | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('');

  // Refs
  const drawerRef = useRef<HTMLDivElement>(null);

  // Computed values
  const widthClasses = {
    sm: 'w-80',
    md: 'w-96',
    lg: 'w-[28rem]',
    xl: 'w-[32rem]',
    full: 'w-full'
  };

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = [...wishlistItems];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (filterCategory) {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    // Apply stock filter
    if (filterInStock !== null) {
      filtered = filtered.filter(item => item.inStock === filterInStock);
    }

    // Apply priority filter
    if (filterPriority) {
      filtered = filtered.filter(item => item.priority === filterPriority);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'added':
          comparison = new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
          break;
        case 'priority':
          const priorityOrder: Record<'high' | 'medium' | 'low', number> = { high: 3, medium: 2, low: 1 };
          comparison = (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Apply max items limit
    if (maxItems && filtered.length > maxItems) {
      filtered = filtered.slice(0, maxItems);
    }

    return filtered;
  }, [wishlistItems, searchQuery, filterCategory, filterInStock, filterPriority, sortBy, sortOrder, maxItems]);

  const selectedItemsArray = useMemo(() =>
    filteredAndSortedItems.filter(item => selectedItems.has(item.id)),
    [filteredAndSortedItems, selectedItems]
  );

  const categories = useMemo(() =>
    Array.from(new Set(wishlistItems.map(item => item.category))),
    [wishlistItems]
  );

  // Event handlers
  const handleClose = useCallback(() => {
    if (!persistent) {
      onClose();
    }
  }, [persistent, onClose]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      handleClose();
    }
  }, [closeOnOverlayClick, handleClose]);

  const handleItemSelect = useCallback((itemId: string, selected: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.size === filteredAndSortedItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredAndSortedItems.map(item => item.id)));
    }
  }, [selectedItems.size, filteredAndSortedItems]);

  const handleItemRemove = useCallback(async (item: WishlistItem) => {
    try {
      await removeFromWishlist(item.id);
      onItemRemove?.(item);
      
      toast({
        title: 'Removed from wishlist',
        description: `${item.name} has been removed`
      });
    } catch (error) {
      console.error('Remove failed:', error);
      toast({
        title: 'Failed to remove item',
        description: 'Please try again',
        variant: 'destructive'
      });
    }
  }, [removeFromWishlist, onItemRemove, toast]);

  const handleItemMoveToCart = useCallback(async (item: WishlistItem) => {
    try {
      await moveToCart(item.id);
      onItemMoveToCart?.(item);
      
      toast({
        title: 'Moved to cart',
        description: `${item.name} has been added to your cart`
      });
    } catch (error) {
      console.error('Move to cart failed:', error);
      toast({
        title: 'Failed to add to cart',
        description: 'Please try again',
        variant: 'destructive'
      });
    }
  }, [moveToCart, onItemMoveToCart, toast]);

  const handleBulkRemove = useCallback(async () => {
    try {
      await Promise.all(selectedItemsArray.map(item => removeFromWishlist(item.id)));
      onBulkAction?.('remove', selectedItemsArray);
      
      setSelectedItems(new Set());
      toast({
        title: 'Items removed',
        description: `${selectedItemsArray.length} items removed from wishlist`
      });
    } catch (error) {
      console.error('Bulk remove failed:', error);
      toast({
        title: 'Failed to remove items',
        description: 'Please try again',
        variant: 'destructive'
      });
    }
  }, [selectedItemsArray, removeFromWishlist, onBulkAction, toast]);

  const handleBulkMoveToCart = useCallback(async () => {
    const inStockItems = selectedItemsArray.filter(item => item.inStock);
    
    try {
      await Promise.all(inStockItems.map(item => moveToCart(item.id)));
      onBulkAction?.('moveToCart', inStockItems);
      
      setSelectedItems(new Set());
      toast({
        title: 'Items moved to cart',
        description: `${inStockItems.length} items added to your cart`
      });
    } catch (error) {
      console.error('Bulk move to cart failed:', error);
      toast({
        title: 'Failed to move items',
        description: 'Please try again',
        variant: 'destructive'
      });
    }
  }, [selectedItemsArray, moveToCart, onBulkAction, toast]);

  const handleItemShare = useCallback((item: WishlistItem) => {
    const shareUrl = `${window.location.origin}/product/${item.productId}`;
    navigator.clipboard.writeText(shareUrl);
    
    toast({
      title: 'Link copied',
      description: 'Product link copied to clipboard'
    });
  }, [toast]);

  const handleItemView = useCallback((item: WishlistItem) => {
    onItemClick?.(item);
  }, [onItemClick]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, closeOnEscape, handleClose]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const drawerVariants = {
    hidden: {
      x: position === 'left' ? '-100%' : '100%',
      transition: { type: 'tween' as const, duration: 0.3 }
    },
    visible: {
      x: 0,
      transition: { type: 'tween' as const, duration: 0.3 }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Overlay */}
        <motion.div
          variants={animated ? overlayVariants : undefined}
          initial={animated ? 'hidden' : undefined}
          animate={animated ? 'visible' : undefined}
          exit={animated ? 'hidden' : undefined}
          className={cn('absolute inset-0 bg-black/50 backdrop-blur-sm', overlayClassName)}
          onClick={handleOverlayClick}
        />

        {/* Drawer */}
        <motion.div
          ref={drawerRef}
          variants={animated ? drawerVariants : undefined}
          initial={animated ? 'hidden' : undefined}
          animate={animated ? 'visible' : undefined}
          exit={animated ? 'hidden' : undefined}
          className={cn(
            'absolute top-0 h-full bg-white shadow-xl flex flex-col',
            position === 'left' ? 'left-0' : 'right-0',
            widthClasses[width],
            className
          )}
        >
          {/* Header */}
          {showHeader && (
            <div className={cn('flex-shrink-0 border-b border-gray-200', headerClassName)}>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <HeartSolidIcon className="w-6 h-6 text-red-500" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Wishlist</h2>
                    <p className="text-sm text-gray-500">
                      {filteredAndSortedItems.length} {filteredAndSortedItems.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {enableSorting && (
                    <DropdownMenu
                      trigger={
                        <Button variant="ghost" size="sm" className="gap-2">
                          <AdjustmentsHorizontalIcon className="w-4 h-4" />
                          Sort
                        </Button>
                      }
                      items={[
                        {
                          key: 'name-asc',
                          label: 'Name A-Z',
                          onClick: () => { setSortBy('name'); setSortOrder('asc'); }
                        },
                        {
                          key: 'name-desc',
                          label: 'Name Z-A',
                          onClick: () => { setSortBy('name'); setSortOrder('desc'); }
                        },
                        {
                          key: 'price-asc',
                          label: 'Price Low-High',
                          onClick: () => { setSortBy('price'); setSortOrder('asc'); }
                        },
                        {
                          key: 'price-desc',
                          label: 'Price High-Low',
                          onClick: () => { setSortBy('price'); setSortOrder('desc'); }
                        },
                        {
                          key: 'added-desc',
                          label: 'Recently Added',
                          onClick: () => { setSortBy('added'); setSortOrder('desc'); }
                        },
                        {
                          key: 'priority-desc',
                          label: 'Priority High-Low',
                          onClick: () => { setSortBy('priority'); setSortOrder('desc'); }
                        }
                      ]}
                    />
                  )}
                  
                  <Button variant="ghost" size="sm" onClick={handleClose}>
                    <XMarkIcon className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Search */}
              {showSearch && (
                <div className="px-4 pb-4">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search wishlist..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              {/* Filters */}
              {showFilters && (
                <div className="px-4 pb-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Filters</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                      className="gap-2"
                    >
                      <FunnelIcon className="w-4 h-4" />
                      {showFiltersPanel ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                  
                  {showFiltersPanel && (
                    <div className="space-y-3">
                      <div>
                        <label id="category-filter-label" className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                        <select
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded-md px-3 py-2"
                          aria-labelledby="category-filter-label"
                        >
                          <option value="">All Categories</option>
                          {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label id="priority-filter-label" className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                        <select
                          value={filterPriority}
                          onChange={(e) => setFilterPriority(e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded-md px-3 py-2"
                          aria-labelledby="priority-filter-label"
                        >
                          <option value="">All Priorities</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700">In Stock Only</span>
                        <Switch
                          checked={filterInStock === true}
                          onCheckedChange={(checked) => setFilterInStock(checked ? true : null)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* View Mode Toggle */}
              <div className="px-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <Button
                      variant={currentViewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setCurrentViewMode('list')}
                      className="px-3"
                    >
                      <Bars3Icon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={currentViewMode === 'compact' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setCurrentViewMode('compact')}
                      className="px-3"
                    >
                      <Squares2X2Icon className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {enableBulkActions && filteredAndSortedItems.length > 0 && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.size === filteredAndSortedItems.length && filteredAndSortedItems.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        aria-label="Select all items"
                      />
                      <span className="text-xs text-gray-500">
                        {selectedItems.size > 0 ? `${selectedItems.size} selected` : 'Select all'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bulk Actions Bar */}
          {enableBulkActions && selectedItems.size > 0 && (
            <div className="flex-shrink-0 bg-blue-50 border-b border-blue-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleBulkMoveToCart}>
                    <ShoppingCartIcon className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button size="sm" variant="destructive" onClick={handleBulkRemove}>
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          {wishlistItems.length > 0 && (
            <WishlistStats items={filteredAndSortedItems} />
          )}

          {/* Content */}
          <div className={cn('flex-1 overflow-y-auto', contentClassName)}>
            {filteredAndSortedItems.length === 0 ? (
              <EmptyState
                message={emptyStateMessage}
                action={emptyStateAction || (
                  <Button onClick={handleClose}>
                    Continue Shopping
                  </Button>
                )}
              />
            ) : (
              <AnimatePresence>
                {filteredAndSortedItems.map((item) => (
                  <DrawerItem
                    key={item.id}
                    item={item}
                    viewMode={currentViewMode}
                    selected={selectedItems.has(item.id)}
                    onSelect={(selected) => handleItemSelect(item.id, selected)}
                    onRemove={() => handleItemRemove(item)}
                    onMoveToCart={() => handleItemMoveToCart(item)}
                    onView={() => handleItemView(item)}
                    onShare={() => handleItemShare(item)}
                    showQuickActions={showQuickActions}
                    enableSelection={enableBulkActions}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Footer */}
          {showFooter && filteredAndSortedItems.length > 0 && (
            <div className={cn('flex-shrink-0 border-t border-gray-200 p-4', footerClassName)}>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Value:</span>
                  <span className="font-semibold text-gray-900">
                    ${filteredAndSortedItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                  </span>
                </div>
                
                <Button
                  onClick={() => {
                    const inStockItems = filteredAndSortedItems.filter(item => item.inStock);
                    if (inStockItems.length > 0) {
                      Promise.all(inStockItems.map(item => moveToCart(item.id)));
                      toast({
                        title: 'All items moved to cart',
                        description: `${inStockItems.length} items added to your cart`
                      });
                    }
                  }}
                  disabled={filteredAndSortedItems.filter(item => item.inStock).length === 0}
                  className="w-full"
                >
                  <ShoppingBagIcon className="w-4 h-4 mr-2" />
                  Add All to Cart
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WishlistDrawer;
