'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { 
  ListBulletIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ShoppingCartIcon,
  ShareIcon,
  TrashIcon,
  SparklesIcon,
  ArrowsUpDownIcon,
  Squares2X2Icon,
  TagIcon,
  FolderIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  CheckCircleIcon
} from '@heroicons/react/24/solid';

// UI Components
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import { Tooltip } from '@/components/ui/Tooltip';
import { Skeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { Card, CardContent } from '@/components/ui/Card';
import { Separator } from '@/components/ui/Separator';
import { Chip } from '@/components/ui/Chip';
import { Modal } from '@/components/ui/Modal';
import { Drawer } from '@/components/ui/Drawer';
import { Alert } from '@/components/ui/Alert';

// Wishlist Components
import WishlistItem from './WishlistItem';
import EmptyWishlist from './EmptyWishlist';

// Hooks and Contexts
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/components/providers';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/useToast';
import { useMediaQuery } from '@/hooks/common/useMediaQuery';
import { useDebounce } from '@/hooks/common/useDebounce';

// Utils and Lib
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';

// Types
import type { WishlistItem as WishlistItemType } from '@/types/wishlist.types';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface WishlistGridProps {
  className?: string;
  showHeader?: boolean;
  showFilters?: boolean;
  showSearch?: boolean;
  showSort?: boolean;
  showViewToggle?: boolean;
  showBulkActions?: boolean;
  showCollectionFilter?: boolean;
  showStats?: boolean;
  defaultView?: 'grid' | 'list';
  itemsPerPage?: number;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  enableVirtualization?: boolean;
  enableInfiniteScroll?: boolean;
  onItemClick?: (item: WishlistItemType) => void;
  onItemRemove?: (itemId: string) => void;
  onBulkAction?: (action: string, itemIds: string[]) => void;
}

export interface FilterState {
  search: string;
  collection: string | null;
  priceRange: { min: number; max: number } | null;
  availability: 'all' | 'in_stock' | 'out_of_stock';
  priority: string | null;
  tags: string[];
  category: string | null;
  brand: string | null;
  onSale: boolean;
}

export interface SortOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

// ============================================================================
// Constants
// ============================================================================

const SORT_OPTIONS: SortOption[] = [
  { value: 'added_date_desc', label: 'Recently Added', icon: <SparklesIcon className="w-4 h-4" /> },
  { value: 'added_date_asc', label: 'Oldest First', icon: <SparklesIcon className="w-4 h-4" /> },
  { value: 'price_asc', label: 'Price: Low to High', icon: <ArrowsUpDownIcon className="w-4 h-4" /> },
  { value: 'price_desc', label: 'Price: High to Low', icon: <ArrowsUpDownIcon className="w-4 h-4" /> },
  { value: 'name_asc', label: 'Name: A to Z', icon: <TagIcon className="w-4 h-4" /> },
  { value: 'name_desc', label: 'Name: Z to A', icon: <TagIcon className="w-4 h-4" /> },
  { value: 'priority', label: 'Priority', icon: <BookmarkIcon className="w-4 h-4" /> },
];

const AVAILABILITY_OPTIONS = [
  { value: 'all', label: 'All Items' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
];

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All Priorities' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const DEFAULT_COLUMNS = {
  sm: 1,
  md: 2,
  lg: 3,
  xl: 4,
};

// ============================================================================
// Helper Components
// ============================================================================

// Loading Skeleton
const WishlistSkeleton: React.FC<{ count?: number; view: 'grid' | 'list' }> = ({ 
  count = 6, 
  view 
}) => {
  return (
    <div className={cn(
      'grid gap-4',
      view === 'grid' 
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
        : 'grid-cols-1'
    )}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <div className={cn('flex', view === 'grid' ? 'flex-col' : 'flex-row')}>
            <Skeleton className={cn(
              view === 'grid' ? 'w-full aspect-square' : 'w-32 h-32'
            )} />
            <div className="flex-1 p-4 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 w-9" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

// Stats Bar Component
const WishlistStats: React.FC<{
  totalItems: number;
  totalValue: number;
  totalSavings: number;
  inStockItems: number;
  onSaleItems: number;
  className?: string;
}> = ({ 
  totalItems, 
  totalValue, 
  totalSavings, 
  inStockItems, 
  onSaleItems,
  className 
}) => {
  const stats = [
    { label: 'Total Items', value: totalItems, icon: HeartSolidIcon, color: 'text-red-600' },
    { label: 'Total Value', value: formatCurrency(totalValue), icon: TagIcon, color: 'text-green-600' },
    { label: 'Total Savings', value: formatCurrency(totalSavings), icon: SparklesIcon, color: 'text-primary-600' },
    { label: 'In Stock', value: inStockItems, icon: CheckCircleIcon, color: 'text-blue-600' },
    { label: 'On Sale', value: onSaleItems, icon: TagIcon, color: 'text-orange-600' },
  ];

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-5 gap-4', className)}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg bg-gray-100', stat.color)}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 truncate">{stat.label}</p>
                <p className="text-lg font-semibold text-gray-900 truncate">
                  {stat.value}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

// Bulk Actions Bar
const BulkActionsBar: React.FC<{
  selectedCount: number;
  onAddToCart: () => void;
  onShare: () => void;
  onDelete: () => void;
  onMove: () => void;
  onClearSelection: () => void;
  isProcessing: boolean;
}> = ({ 
  selectedCount, 
  onAddToCart, 
  onShare, 
  onDelete, 
  onMove,
  onClearSelection,
  isProcessing
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <Card className="shadow-2xl border-2">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">
                {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
              </span>
            </div>
            
            <Separator orientation="vertical" className="h-8" />
            
            <div className="flex items-center gap-2">
              <Tooltip content="Add selected to cart">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAddToCart}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  <ShoppingCartIcon className="w-4 h-4" />
                  Add to Cart
                </Button>
              </Tooltip>
              
              <Tooltip content="Move to collection">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMove}
                  disabled={isProcessing}
                >
                  <FolderIcon className="w-4 h-4" />
                </Button>
              </Tooltip>
              
              <Tooltip content="Share selected">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onShare}
                  disabled={isProcessing}
                >
                  <ShareIcon className="w-4 h-4" />
                </Button>
              </Tooltip>
              
              <Tooltip content="Delete selected">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  disabled={isProcessing}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </Tooltip>
            </div>
            
            <Separator orientation="vertical" className="h-8" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              disabled={isProcessing}
            >
              <XMarkIcon className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const WishlistGrid: React.FC<WishlistGridProps> = ({
  className,
  showHeader = true,
  showFilters = true,
  showSearch = true,
  showSort = true,
  showViewToggle = true,
  showBulkActions = true,
  showCollectionFilter = true,
  showStats = true,
  defaultView = 'grid',
  itemsPerPage = 12,
  columns = DEFAULT_COLUMNS,
  enableVirtualization = false,
  enableInfiniteScroll = false,
  onItemClick,
  onItemRemove,
  onBulkAction,
}) => {
  // ============================================================================
  // Hooks
  // ============================================================================
  
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { toast } = useToast();
  const isMobile = useMediaQuery('(max-width: 640px)');
  
  const wishlistContext = useWishlist();
  const wishlistItems = wishlistContext.state.items.map(item => ({
    id: item.id,
    wishlistId: 'default',
    productId: item.productId,
    variantId: undefined,
    product: {
      id: item.productId,
      name: item.name,
      slug: item.slug,
      description: '',
      sku: '',
      brandId: item.brand,
      categoryId: item.category,
      tags: [] as string[],
      isNewArrival: false,
      isBestseller: false,
      category: { id: item.category, name: item.category, slug: item.category },
      brand: { id: item.brand, name: item.brand, slug: item.brand },
      pricing: {
        basePrice: { amount: item.price, currency: 'INR' },
        salePrice: item.salePrice ? { amount: item.salePrice, currency: 'INR' } : undefined,
      },
      media: {
        images: [{ id: '1', url: item.image, alt: item.name, isPrimary: true }],
      },
      inventory: {
        quantity: item.inStock ? 10 : 0,
        status: item.inStock ? 'in_stock' : 'out_of_stock',
      },
      rating: undefined,
    },
    addedAt: item.addedAt,
    isAvailable: item.inStock,
    priority: 'medium' as const,
    notes: undefined as string | undefined,
    priceAlertEnabled: false,
    stockAlertEnabled: false,
    priceChanged: false,
    priceChangePercentage: undefined,
    createdAt: item.addedAt,
    updatedAt: item.addedAt,
  }));
  
  const collections = [{ id: 'default', name: 'Default Collection', itemCount: wishlistItems.length }];
  const activeCollectionId = 'default';
  const wishlistLoading = wishlistContext.state.loading;
  const removeFromWishlist = wishlistContext.removeFromWishlist;
  const setActiveCollection = useCallback((id: string) => {
    // No-op for now - collection management coming soon
    console.log('Setting active collection:', id);
  }, []);
  
  // Simulated functions for features not in context
  const moveToCollection = useCallback(async ({ itemIds, targetCollectionId }: { itemIds: string[]; targetCollectionId: string }) => {
    // Marking params as used by logging
    console.log('Move to collection:', itemIds, targetCollectionId);
    toast({
      title: 'Feature coming soon',
      description: 'Collection management will be available soon',
    });
  }, [toast]);
  
  const wishlistBulkAddToCart = useCallback(async (itemIds: string[]) => {
    for (const itemId of itemIds) {
      const item = wishlistItems.find(i => i.id === itemId);
      if (item) {
        await addItem({
          id: item.productId,
          productId: item.productId,
          variantId: undefined,
          name: item.product.name,
          price: item.product.pricing.salePrice?.amount || item.product.pricing.basePrice.amount,
          quantity: 1,
          image: item.product.media.images[0]?.url || '',
          slug: item.product.slug,
          sku: item.product.sku,
          inStock: item.product.inventory.quantity,
        });
      }
    }
  }, [wishlistItems, addItem]);

  // ============================================================================
  // State Management
  // ============================================================================
  
  const [view, setView] = useState<'grid' | 'list'>(defaultView);
  const [sortBy, setSortBy] = useState<string>('added_date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    collection: activeCollectionId,
    priceRange: null,
    availability: 'all',
    priority: null,
    tags: [],
    category: null,
    brand: null,
    onSale: false,
  });

  // Debounced search
  const debouncedSearch = useDebounce(filters.search, 300);

  // Refs
  const gridRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // ============================================================================
  // Computed Values
  // ============================================================================

  // Filter items based on active filters
  const filteredItems = useMemo(() => {
    let items = [...wishlistItems];

    // Search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      items = items.filter(item => 
        item.product.name.toLowerCase().includes(searchLower) ||
        item.product.description?.toLowerCase().includes(searchLower) ||
        item.product.category?.name.toLowerCase().includes(searchLower) ||
        item.notes?.toLowerCase().includes(searchLower)
      );
    }

    // Collection filter
    if (filters.collection) {
      items = items.filter(item => 
        (item as unknown as { collection?: string }).collection === filters.collection
      );
    }

    // Availability filter
    if (filters.availability !== 'all') {
      items = items.filter(item => 
        filters.availability === 'in_stock' ? item.isAvailable : !item.isAvailable
      );
    }

    // Priority filter
    if (filters.priority && filters.priority !== 'all') {
      items = items.filter(item => item.priority === filters.priority);
    }

    // Price range filter
    if (filters.priceRange) {
      items = items.filter(item => {
        const price = item.product.pricing?.salePrice?.amount || 
                     item.product.pricing?.basePrice?.amount || 
                     0;
        return price >= (filters.priceRange?.min || 0) && 
               price <= (filters.priceRange?.max || Infinity);
      });
    }

    // Category filter
    if (filters.category) {
      items = items.filter(item => item.product.categoryId === filters.category);
    }

    // Brand filter
    if (filters.brand) {
      items = items.filter(item => item.product.brandId === filters.brand);
    }

    // On sale filter
    if (filters.onSale) {
      items = items.filter(item => item.product.pricing?.salePrice);
    }

    // Tags filter
    if (filters.tags.length > 0) {
      items = items.filter(item => 
        filters.tags.some(tag => item.product.tags?.includes(tag))
      );
    }

    return items;
  }, [wishlistItems, debouncedSearch, filters]);

  // Sort items
  const sortedItems = useMemo(() => {
    const items = [...filteredItems];
    
    switch (sortBy) {
      case 'added_date_desc':
        return items.sort((a, b) => 
          new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        );
      case 'added_date_asc':
        return items.sort((a, b) => 
          new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()
        );
      case 'price_asc':
        return items.sort((a, b) => {
          const priceA = a.product.pricing?.salePrice?.amount || 
                        a.product.pricing?.basePrice?.amount || 
                        0;
          const priceB = b.product.pricing?.salePrice?.amount || 
                        b.product.pricing?.basePrice?.amount || 
                        0;
          return priceA - priceB;
        });
      case 'price_desc':
        return items.sort((a, b) => {
          const priceA = a.product.pricing?.salePrice?.amount || 
                        a.product.pricing?.basePrice?.amount || 
                        0;
          const priceB = b.product.pricing?.salePrice?.amount || 
                        b.product.pricing?.basePrice?.amount || 
                        0;
          return priceB - priceA;
        });
      case 'name_asc':
        return items.sort((a, b) => 
          a.product.name.localeCompare(b.product.name)
        );
      case 'name_desc':
        return items.sort((a, b) => 
          b.product.name.localeCompare(a.product.name)
        );
      case 'priority': {
        const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
        return items.sort((a, b) => 
          (priorityOrder[a.priority] || 999) - (priorityOrder[b.priority] || 999)
        );
      }
      default:
        return items;
    }
  }, [filteredItems, sortBy]);

  // Paginate items
  const paginatedItems = useMemo(() => {
    if (enableInfiniteScroll) {
      return sortedItems.slice(0, currentPage * itemsPerPage);
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedItems, currentPage, itemsPerPage, enableInfiniteScroll]);

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const hasMore = enableInfiniteScroll && (currentPage * itemsPerPage) < sortedItems.length;

  // Calculate statistics
  const stats = useMemo(() => {
    const totalValue = sortedItems.reduce((sum, item) => {
      const price = item.product.pricing?.basePrice?.amount || 0;
      return sum + price;
    }, 0);

    const totalSavings = sortedItems.reduce((sum, item) => {
      const basePrice = item.product.pricing?.basePrice?.amount || 0;
      const salePrice = item.product.pricing?.salePrice?.amount;
      return sum + (salePrice ? basePrice - salePrice : 0);
    }, 0);

    const inStockItems = sortedItems.filter(item => item.isAvailable).length;
    const onSaleItems = sortedItems.filter(item => item.product.pricing?.salePrice).length;

    return {
      totalItems: sortedItems.length,
      totalValue,
      totalSavings,
      inStockItems,
      onSaleItems,
    };
  }, [sortedItems]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.collection && filters.collection !== 'default') count++;
    if (filters.availability !== 'all') count++;
    if (filters.priority) count++;
    if (filters.priceRange) count++;
    if (filters.category) count++;
    if (filters.brand) count++;
    if (filters.onSale) count++;
    if (filters.tags.length > 0) count += filters.tags.length;
    return count;
  }, [filters]);

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleItemClick = useCallback((item: WishlistItemType) => {
    onItemClick?.(item);
  }, [onItemClick]);

  const handleItemRemove = useCallback(async (itemId: string) => {
    try {
      setIsProcessing(true);
      await removeFromWishlist(itemId);
      
      toast({
        title: 'Item removed',
        description: 'Item has been removed from your wishlist',
      });
      
      onItemRemove?.(itemId);
      
      // Remove from selection if selected
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item from wishlist',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [removeFromWishlist, toast, onItemRemove]);

  const handleSelectItem = useCallback((itemId: string, checked: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(paginatedItems.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  }, [paginatedItems]);

  const handleBulkAddToCart = useCallback(async () => {
    if (selectedItems.size === 0) return;
    
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to add items to cart',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      const itemsToAdd = Array.from(selectedItems)
        .map((id: string) => wishlistItems.find((item) => item.id === id))
        .filter(Boolean) as typeof wishlistItems;

      if (wishlistBulkAddToCart) {
        await wishlistBulkAddToCart(Array.from(selectedItems));
      } else {
        // Fallback to adding one by one
        for (const item of itemsToAdd) {
          await addItem({
            id: item.productId,
            productId: item.productId,
            variantId: item.variantId,
            name: item.product.name,
            price: item.product.pricing.salePrice?.amount || item.product.pricing.basePrice.amount,
            quantity: 1,
            image: item.product.media.images[0]?.url || '',
            slug: item.product.slug,
            sku: item.product.sku,
            inStock: item.product.inventory.quantity,
          });
        }
      }

      toast({
        title: 'Added to cart',
        description: `${selectedItems.size} ${selectedItems.size === 1 ? 'item' : 'items'} added to cart`,
      });

      setSelectedItems(new Set());
      onBulkAction?.('add_to_cart', Array.from(selectedItems));
    } catch (error) {
      console.error('Failed to add items to cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add items to cart',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedItems, wishlistItems, wishlistBulkAddToCart, addItem, toast, onBulkAction, isAuthenticated]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedItems.size === 0) return;

    try {
      setIsProcessing(true);
      
      const itemIdsArray = Array.from(selectedItems);
      for (const itemId of itemIdsArray) {
        await removeFromWishlist(itemId);
      }

      toast({
        title: 'Items removed',
        description: `${selectedItems.size} ${selectedItems.size === 1 ? 'item' : 'items'} removed from wishlist`,
      });

      setSelectedItems(new Set());
      setShowDeleteConfirm(false);
      onBulkAction?.('delete', Array.from(selectedItems));
    } catch (error) {
      console.error('Failed to delete items:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove items from wishlist',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedItems, removeFromWishlist, toast, onBulkAction]);

  const handleBulkMove = useCallback(async (targetCollectionId: string) => {
    if (selectedItems.size === 0) return;

    try {
      setIsProcessing(true);
      
      if (moveToCollection) {
        await moveToCollection({
          itemIds: Array.from(selectedItems),
          targetCollectionId,
        });
      }

      toast({
        title: 'Items moved',
        description: `${selectedItems.size} ${selectedItems.size === 1 ? 'item' : 'items'} moved to collection`,
      });

      setSelectedItems(new Set());
      setShowMoveModal(false);
      onBulkAction?.('move', Array.from(selectedItems));
    } catch (error) {
      console.error('Failed to move items:', error);
      toast({
        title: 'Error',
        description: 'Failed to move items',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedItems, moveToCollection, toast, onBulkAction]);

  const handleBulkShare = useCallback(() => {
    if (selectedItems.size === 0) return;
    setShowShareModal(true);
  }, [selectedItems]);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      collection: null,
      priceRange: null,
      availability: 'all',
      priority: null,
      tags: [],
      category: null,
      brand: null,
      onSale: false,
    });
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((key: keyof FilterState, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    if (!enableInfiniteScroll || !hasMore || wishlistLoading) return;

    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting) {
        setCurrentPage(prev => prev + 1);
      }
    };

    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    });

    const sentinel = document.getElementById('load-more-sentinel');
    if (sentinel) {
      observerRef.current.observe(sentinel);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enableInfiniteScroll, hasMore, wishlistLoading]);

  // Sync active collection with context
  useEffect(() => {
    if (filters.collection && filters.collection !== activeCollectionId) {
      setActiveCollection(filters.collection);
    }
  }, [filters.collection, activeCollectionId, setActiveCollection]);

  // ============================================================================
  // Render Methods
  // ============================================================================

  const renderHeader = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            My Wishlist
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {sortedItems.length} {sortedItems.length === 1 ? 'item' : 'items'}
            {activeFiltersCount > 0 && ` (${activeFiltersCount} ${activeFiltersCount === 1 ? 'filter' : 'filters'} active)`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {showViewToggle && !isMobile && (
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Tooltip content="Grid view">
                <Button
                  variant={view === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('grid')}
                  className="p-2"
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </Button>
              </Tooltip>
              <Tooltip content="List view">
                <Button
                  variant={view === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('list')}
                  className="p-2"
                >
                  <ListBulletIcon className="w-4 h-4" />
                </Button>
              </Tooltip>
            </div>
          )}

          {showBulkActions && sortedItems.length > 0 && (
            <Checkbox
              checked={selectedItems.size === paginatedItems.length && paginatedItems.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
              label="Select all"
              className="hidden md:flex"
            />
          )}
        </div>
      </div>

      {showStats && sortedItems.length > 0 && (
        <WishlistStats {...stats} />
      )}
    </div>
  );

  const renderFiltersAndSort = () => (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      {showSearch && (
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search wishlist..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10 pr-10"
            />
            {filters.search && (
              <button
                onClick={() => handleFilterChange('search', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
                type="button"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Collection Filter */}
      {showCollectionFilter && collections && collections.length > 1 && (
        <Select
          value={filters.collection || 'all'}
          onValueChange={(value: string | number) => handleFilterChange('collection', value === 'all' ? null : String(value))}
          options={[
            { value: 'all', label: 'All Collections' },
            ...collections.map((c: { id: string; name: string }) => ({ value: c.id, label: c.name }))
          ]}
          className="w-40"
        />
      )}

      {/* Sort */}
      {showSort && (
        <Select
          value={sortBy}
          onValueChange={(value: string | number) => setSortBy(String(value))}
          options={SORT_OPTIONS.map(opt => ({ 
            value: opt.value, 
            label: opt.label 
          }))}
          className="w-48"
        />
      )}

      {/* Filters Button */}
      {showFilters && (
        <Button
          variant="outline"
          onClick={() => setShowFiltersDrawer(true)}
          className="gap-2"
        >
          <FunnelIcon className="w-4 h-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      )}

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button
          variant="ghost"
          onClick={handleClearFilters}
          className="gap-2"
        >
          <XMarkIcon className="w-4 h-4" />
          Clear
        </Button>
      )}
    </div>
  );

  const renderActiveFilters = () => {
    if (activeFiltersCount === 0) return null;

    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-600">Active filters:</span>
        
        {filters.availability !== 'all' && (
          <Chip
            onRemove={() => handleFilterChange('availability', 'all')}
            variant="primary"
            removable
          >
            Availability: {filters.availability.replace('_', ' ')}
          </Chip>
        )}
        
        {filters.priority && (
          <Chip
            onRemove={() => handleFilterChange('priority', null)}
            variant="primary"
            removable
          >
            Priority: {filters.priority}
          </Chip>
        )}
        
        {filters.onSale && (
          <Chip
            onRemove={() => handleFilterChange('onSale', false)}
            variant="primary"
            removable
          >
            On Sale
          </Chip>
        )}
        
        {filters.tags.map(tag => (
          <Chip
            key={tag}
            onRemove={() => handleFilterChange('tags', filters.tags.filter(t => t !== tag))}
            variant="secondary"
            removable
          >
            {tag}
          </Chip>
        ))}
      </div>
    );
  };

  const renderGrid = () => {
    const itemsToRender = enableVirtualization ? paginatedItems.slice(0, 50) : paginatedItems;
    
    return (
    <LayoutGroup>
      <motion.div
        ref={gridRef}
        layout
        className={cn(
          'grid gap-4 md:gap-6',
          view === 'grid' 
            ? cn(
                'grid-cols-1',
                `sm:grid-cols-${columns.sm || 1}`,
                `md:grid-cols-${columns.md || 2}`,
                `lg:grid-cols-${columns.lg || 3}`,
                `xl:grid-cols-${columns.xl || 4}`
              )
            : 'grid-cols-1'
        )}
      >
        <AnimatePresence mode="popLayout">
          {itemsToRender.map((item) => (
            <WishlistItem
              key={item.id}
              item={item as unknown as WishlistItemType}
              view={view}
              isSelected={selectedItems.has(item.id)}
              onSelect={(checked) => handleSelectItem(item.id, checked)}
              onRemove={() => handleItemRemove(item.id)}
              onClick={() => handleItemClick(item as unknown as WishlistItemType)}
              showCheckbox={showBulkActions && selectedItems.size > 0}
              className="h-full"
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Infinite Scroll Sentinel */}
      {enableInfiniteScroll && hasMore && (
        <div id="load-more-sentinel" className="h-20 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <SparklesIcon className="w-6 h-6 text-gray-400" />
          </motion.div>
        </div>
      )}
    </LayoutGroup>
    );
  };

  const renderPagination = () => {
    if (enableInfiniteScroll || totalPages <= 1) return null;

    return (
      <div className="flex justify-center mt-8">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          siblingCount={isMobile ? 0 : 1}
        />
      </div>
    );
  };

  const renderFiltersDrawer = () => (
    <Drawer
      open={showFiltersDrawer}
      onOpenChange={(open) => setShowFiltersDrawer(open)}
      side="right"
    >
      <div className="p-6 space-y-6">
        {/* Availability */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-900">Availability</Label>
          <div className="space-y-2">
            {AVAILABILITY_OPTIONS.map(option => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="availability"
                  value={option.value}
                  checked={filters.availability === option.value}
                  onChange={(e) => handleFilterChange('availability', e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <Separator />

        {/* Priority */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-900">Priority</Label>
          <Select
            value={filters.priority || 'all'}
            onValueChange={(value: string | number) => handleFilterChange('priority', value === 'all' ? null : String(value))}
            options={PRIORITY_OPTIONS}
            className="w-full"
          />
        </div>

        <Separator />

        {/* On Sale */}
        <div className="flex items-center justify-between">
          <Label htmlFor="on-sale-filter" className="text-sm font-medium text-gray-900">
            Show only sale items
          </Label>
          <input
            id="on-sale-filter"
            type="checkbox"
            checked={filters.onSale}
            onChange={(e) => handleFilterChange('onSale', e.target.checked)}
            className="w-4 h-4"
            aria-label="Show only sale items"
          />
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="flex-1"
          >
            Clear All
          </Button>
          <Button
            onClick={() => setShowFiltersDrawer(false)}
            className="flex-1"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </Drawer>
  );

  // ============================================================================
  // Main Render
  // ============================================================================

  // Loading state
  if (wishlistLoading && !wishlistItems.length) {
    return (
      <div className={cn('container mx-auto px-4 py-8', className)}>
        <div className="space-y-6">
          {showHeader && (
            <div className="space-y-4">
              <Skeleton className="h-10 w-64" />
              {showStats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              )}
            </div>
          )}
          <WishlistSkeleton count={itemsPerPage} view={view} />
        </div>
      </div>
    );
  }

  // Empty state
  if (!wishlistLoading && sortedItems.length === 0 && activeFiltersCount === 0) {
    return <EmptyWishlist />;
  }

  // Main render
  return (
    <div className={cn('container mx-auto px-4 py-8', className)}>
      <div className="space-y-6">
        {/* Header */}
        {showHeader && renderHeader()}

        {/* Filters and Sort */}
        {(showFilters || showSearch || showSort) && renderFiltersAndSort()}

        {/* Active Filters */}
        {renderActiveFilters()}

        {/* No results after filtering */}
        {sortedItems.length === 0 && activeFiltersCount > 0 ? (
          <Alert variant="info" className="mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">No items found</h3>
                <p className="text-sm mt-1">
                  Try adjusting your filters to see more results
                </p>
              </div>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          </Alert>
        ) : (
          <>
            {/* Grid */}
            {renderGrid()}

            {/* Pagination */}
            {renderPagination()}
          </>
        )}

        {/* Bulk Actions Bar */}
        <AnimatePresence>
          {showBulkActions && selectedItems.size > 0 && (
            <BulkActionsBar
              selectedCount={selectedItems.size}
              onAddToCart={handleBulkAddToCart}
              onShare={handleBulkShare}
              onDelete={() => setShowDeleteConfirm(true)}
              onMove={() => setShowMoveModal(true)}
              onClearSelection={() => setSelectedItems(new Set())}
              isProcessing={isProcessing}
            />
          )}
        </AnimatePresence>

        {/* Filters Drawer */}
        {renderFiltersDrawer()}

        {/* Delete Confirmation Modal */}
        <Modal
          open={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Delete items"
          size="sm"
        >
          <div className="p-6 space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete {selectedItems.size} {selectedItems.size === 1 ? 'item' : 'items'} from your wishlist?
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={isProcessing}
              >
                {isProcessing ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Move Modal */}
        <Modal
          open={showMoveModal}
          onClose={() => setShowMoveModal(false)}
          title="Move to collection"
          size="sm"
        >
          <div className="p-6 space-y-4">
            <Select
              placeholder="Select collection"
              onValueChange={(value: string | number) => handleBulkMove(String(value))}
              options={collections?.map((c: { id: string; name: string }) => ({ value: c.id, label: c.name })) || []}
              className="w-full"
            />
          </div>
        </Modal>

        {/* Share Modal */}
        <Modal
          open={showShareModal}
          onClose={() => setShowShareModal(false)}
          title="Share items"
          size="lg"
        >
          <div className="p-6">
            <p className="text-gray-700">Share functionality coming soon...</p>
          </div>
        </Modal>
      </div>
    </div>
  );
};

// Additional helper component for Label (if not exists in UI)
const Label: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  htmlFor?: string;
}> = ({ children, className, htmlFor }) => (
  <label htmlFor={htmlFor} className={cn('block text-sm font-medium', className)}>
    {children}
  </label>
);

export default WishlistGrid;
