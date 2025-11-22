'use client';

import React, { useState, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingCartIcon,
  ShareIcon,
  TrashIcon,
  EyeIcon,
  StarIcon,
  TagIcon,
  CheckCircleIcon,
  XCircleIcon,
  BellIcon,
  PencilIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import {
  BellIcon as BellSolidIcon
} from '@heroicons/react/24/solid';

// UI Components
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Checkbox } from '@/components/ui/Checkbox';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { TextArea } from '@/components/ui/TextArea';
import { Separator } from '@/components/ui/Separator';
import { Alert } from '@/components/ui/Alert';

// Hooks and Contexts
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/components/providers';

// Utils and Lib
import { cn } from '@/lib/utils';
import { formatCurrency, formatDiscount, formatRelativeDate } from '@/lib/formatters';

// Types
import type { WishlistItem as WishlistItemType } from '@/types/wishlist.types';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface WishlistItemProps {
  item: WishlistItemType;
  view?: 'grid' | 'list';
  isSelected?: boolean;
  showCheckbox?: boolean;
  onSelect?: (checked: boolean) => void;
  onRemove?: () => void;
  onClick?: () => void;
  onAddToCart?: () => void;
  onShare?: () => void;
  onPriceAlertToggle?: (enabled: boolean) => void;
  onPriorityChange?: (priority: string) => void;
  onNotesUpdate?: (notes: string) => void;
  className?: string;
  showActions?: boolean;
  showPriceHistory?: boolean;
  showNotes?: boolean;
  showPriority?: boolean;
  showAlerts?: boolean;
  compact?: boolean;
  interactive?: boolean;
}

interface EditModalState {
  open: boolean;
  type: 'priority' | 'notes' | 'alert' | null;
}

// ============================================================================
// Sub Components
// ============================================================================

// Price Display Component
const PriceDisplay: React.FC<{
  basePrice: number;
  salePrice?: number;
  currency?: string;
  showDiscount?: boolean;
  priceChanged?: boolean;
  priceChangePercentage?: number;
  className?: string;
}> = memo(({
  basePrice,
  salePrice,
  currency = 'INR',
  showDiscount = true,
  priceChanged = false,
  priceChangePercentage,
  className
}) => {
  const currentPrice = salePrice || basePrice;
  const hasDiscount = salePrice && salePrice < basePrice;
  
  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-gray-900">
          {formatCurrency(currentPrice, currency)}
        </span>
        
        {hasDiscount && (
          <span className="text-sm text-gray-500 line-through">
            {formatCurrency(basePrice, currency)}
          </span>
        )}
      </div>
      
      {hasDiscount && showDiscount && (
        <Badge variant="destructive" className="text-xs">
          {formatDiscount(basePrice, salePrice)}
        </Badge>
      )}
      
      {priceChanged && priceChangePercentage !== undefined && (
        <div className={cn(
          'flex items-center gap-1 text-xs font-medium',
          priceChangePercentage < 0 ? 'text-green-600' : 'text-red-600'
        )}>
          {priceChangePercentage < 0 ? (
            <ArrowTrendingDownIcon className="w-3 h-3" />
          ) : (
            <ArrowTrendingUpIcon className="w-3 h-3" />
          )}
          <span>{Math.abs(priceChangePercentage).toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
});

PriceDisplay.displayName = 'PriceDisplay';

// Stock Status Component
const StockStatus: React.FC<{
  isAvailable: boolean;
  quantity?: number;
  lowStockThreshold?: number;
  className?: string;
}> = memo(({ isAvailable, quantity, lowStockThreshold = 10, className }) => {
  if (!isAvailable) {
    return (
      <div className={cn('flex items-center gap-1 text-sm text-red-600', className)}>
        <XCircleIcon className="w-4 h-4" />
        <span>Out of Stock</span>
      </div>
    );
  }
  
  if (quantity !== undefined && quantity <= lowStockThreshold) {
    return (
      <div className={cn('flex items-center gap-1 text-sm text-orange-600', className)}>
        <BellSolidIcon className="w-4 h-4" />
        <span>Low Stock ({quantity} left)</span>
      </div>
    );
  }
  
  return (
    <div className={cn('flex items-center gap-1 text-sm text-green-600', className)}>
      <CheckCircleIcon className="w-4 h-4" />
      <span>In Stock</span>
    </div>
  );
});

StockStatus.displayName = 'StockStatus';

// Priority Badge Component
const PriorityBadge: React.FC<{
  priority: 'low' | 'medium' | 'high' | 'urgent';
  className?: string;
}> = memo(({ priority, className }) => {
  const config = {
    urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800 border-red-200', icon: '🔥' },
    high: { label: 'High', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: '⚡' },
    medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '📌' },
    low: { label: 'Low', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '📋' },
  };
  
  const { label, color, icon } = config[priority];
  
  return (
    <Badge 
      variant="secondary" 
      className={cn('text-xs border', color, className)}
    >
      <span className="mr-1">{icon}</span>
      {label}
    </Badge>
  );
});

PriorityBadge.displayName = 'PriorityBadge';

// Rating Display Component
const RatingDisplay: React.FC<{
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}> = memo(({ rating, reviewCount, size = 'sm', showCount = true, className }) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
  
  const iconSize = sizeClasses[size];
  
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={cn(
              iconSize,
              i < Math.floor(rating)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            )}
          />
        ))}
      </div>
      {showCount && reviewCount !== undefined && (
        <span className="text-xs text-gray-600">
          ({reviewCount})
        </span>
      )}
    </div>
  );
});

RatingDisplay.displayName = 'RatingDisplay';

// ============================================================================
// Main Component
// ============================================================================

export const WishlistItem: React.FC<WishlistItemProps> = ({
  item,
  view = 'grid',
  isSelected = false,
  showCheckbox = false,
  onSelect,
  onRemove,
  onClick,
  onAddToCart,
  onShare,
  onPriceAlertToggle,
  onPriorityChange,
  onNotesUpdate,
  className,
  showActions = true,
  showPriceHistory = true,
  showNotes = false,
  showPriority = true,
  showAlerts = true,
  compact = false,
  interactive = true,
}) => {
  // ============================================================================
  // Hooks
  // ============================================================================
  
  const { addItem } = useCart();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // ============================================================================
  // State Management
  // ============================================================================
  
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [editModal, setEditModal] = useState<EditModalState>({ open: false, type: null });
  const [localNotes, setLocalNotes] = useState(item.notes || '');
  const [localPriority, setLocalPriority] = useState(item.priority);

  // ============================================================================
  // Computed Values
  // ============================================================================
  
  const productUrl = useMemo(() => 
    `/products/${item.product.slug}`, 
    [item.product.slug]
  );

  const productImage = useMemo(() => 
    item.product.media?.images?.[0]?.url || 
    '/images/placeholder-product.jpg',
    [item.product.media]
  );

  const basePrice = useMemo(() => 
    item.product.pricing?.basePrice?.amount || 0,
    [item.product.pricing]
  );

  const salePrice = useMemo(() => 
    item.product.pricing?.salePrice?.amount,
    [item.product.pricing]
  );

  const isOnSale = useMemo(() => 
    !!salePrice && salePrice < basePrice,
    [salePrice, basePrice]
  );

  const discount = useMemo(() => 
    isOnSale ? Math.round(((basePrice - salePrice!) / basePrice) * 100) : 0,
    [isOnSale, basePrice, salePrice]
  );

  // ============================================================================
  // Event Handlers
  // ============================================================================
  
  const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to add items to cart',
        variant: 'destructive',
      });
      return;
    }
    
    setIsAddingToCart(true);
    
    try {
      await addItem({
        id: `${item.productId}-${item.variantId || 'default'}`,
        productId: item.productId,
        variantId: item.variantId,
        quantity: 1,
        price: salePrice || basePrice,
        image: productImage,
        name: item.product.name,
        slug: item.product.slug,
        sku: item.product.sku || '',
        inStock: item.product.inventory?.quantity || 0,
      });
      
      toast({
        title: 'Added to cart',
        description: `${item.product.name} has been added to your cart`,
      });
      
      onAddToCart?.();
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        variant: 'destructive',
      });
    } finally {
      setIsAddingToCart(false);
    }
  }, [item, addItem, toast, isAuthenticated, onAddToCart, basePrice, salePrice, productImage]);

  const handleRemove = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    onRemove?.();
  }, [onRemove]);

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.product.name,
          text: item.product.shortDescription || item.product.description,
          url: window.location.origin + productUrl,
        });
        
        onShare?.();
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy link to clipboard
      try {
        await navigator.clipboard.writeText(window.location.origin + productUrl);
        toast({
          title: 'Link copied',
          description: 'Product link copied to clipboard',
        });
      } catch (error) {
        console.error('Failed to copy link:', error);
      }
    }
  }, [item, productUrl, toast, onShare]);

  const handlePriceAlertToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newState = !item.priceAlertEnabled;
    onPriceAlertToggle?.(newState);
    
    toast({
      title: newState ? 'Price alert enabled' : 'Price alert disabled',
      description: newState 
        ? 'You will be notified when the price drops'
        : 'Price alerts disabled for this item',
    });
  }, [item.priceAlertEnabled, onPriceAlertToggle, toast]);

  const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect?.(e.target.checked);
  }, [onSelect]);

  const handleProductClick = useCallback((e: React.MouseEvent) => {
    if (!interactive) return;
    
    // Don't navigate if clicking on action buttons
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('a[href]')) {
      return;
    }
    
    onClick?.();
  }, [interactive, onClick]);

  const handleSavePriority = useCallback(() => {
    onPriorityChange?.(localPriority);
    setEditModal({ open: false, type: null });
    
    toast({
      title: 'Priority updated',
      description: `Item priority set to ${localPriority}`,
    });
  }, [localPriority, onPriorityChange, toast]);

  const handleSaveNotes = useCallback(() => {
    onNotesUpdate?.(localNotes);
    setEditModal({ open: false, type: null });
    
    toast({
      title: 'Notes updated',
      description: 'Your notes have been saved',
    });
  }, [localNotes, onNotesUpdate, toast]);

  // ============================================================================
  // Render Methods
  // ============================================================================

  const renderImage = () => (
    <div className="relative group">
      <Link href={productUrl} className="block">
        <div className={cn(
          'relative overflow-hidden bg-gray-100',
          view === 'grid' ? 'aspect-square' : 'w-32 h-32',
          'rounded-lg'
        )}>
          <Image
            src={productImage}
            alt={item.product.name}
            fill
            sizes={view === 'grid' 
              ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
              : '128px'
            }
            className={cn(
              'object-cover transition-transform duration-300',
              isHovered && 'scale-110'
            )}
            quality={85}
            priority={false}
          />
          
          {/* Overlay on hover */}
          <AnimatePresence>
            {isHovered && interactive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/20 flex items-center justify-center"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-white/90 hover:bg-white"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(productUrl, '_blank');
                  }}
                >
                  <EyeIcon className="w-4 h-4 mr-1" />
                  Quick View
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Link>

      {/* Badges Overlay */}
      <div className="absolute top-2 left-2 flex flex-col gap-1">
        {isOnSale && (
          <Badge variant="destructive" className="text-xs font-bold shadow-md">
            -{discount}%
          </Badge>
        )}
        
        {item.product.isNewArrival && (
          <Badge variant="secondary" className="text-xs bg-green-500 text-white shadow-md">
            New
          </Badge>
        )}
        
        {item.product.isBestseller && (
          <Badge variant="secondary" className="text-xs bg-primary-500 text-white shadow-md">
            <SparklesIcon className="w-3 h-3 mr-1" />
            Bestseller
          </Badge>
        )}
      </div>

      {/* Selection Checkbox */}
      {showCheckbox && (
        <div className="absolute top-2 right-2">
          <div className="bg-white rounded-md shadow-md p-1">
            <Checkbox
              checked={isSelected}
              onChange={handleCheckboxChange}
              aria-label="Select item"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => (
    <div className={cn(
      'flex flex-col',
      view === 'grid' ? 'space-y-3' : 'space-y-2 flex-1'
    )}>
      {/* Product Info */}
      <div className="space-y-1">
        <Link 
          href={productUrl}
          className="hover:text-blue-600 transition-colors"
        >
          <h3 className={cn(
            'font-medium text-gray-900 line-clamp-2',
            compact ? 'text-sm' : 'text-base'
          )}>
            {item.product.name}
          </h3>
        </Link>
        
        {item.product.category && (
          <p className="text-xs text-gray-500">
            {item.product.category.name}
          </p>
        )}
        
        {item.product.brand && (
          <p className="text-xs text-gray-600 font-medium">
            {item.product.brand.name}
          </p>
        )}
      </div>

      {/* Rating */}
      {item.product.rating && (
        <RatingDisplay
          rating={item.product.rating.average}
          reviewCount={item.product.rating.count}
          size="sm"
        />
      )}

      {/* Price */}
      <PriceDisplay
        basePrice={basePrice}
        salePrice={salePrice}
        priceChanged={item.priceChanged}
        priceChangePercentage={item.priceChangePercentage}
      />

      {/* Stock Status */}
      <StockStatus
        isAvailable={item.isAvailable}
        quantity={item.product.inventory?.quantity}
      />

      {/* Priority & Added Date */}
      <div className="flex items-center gap-2 flex-wrap">
        {showPriority && (
          <PriorityBadge priority={item.priority} />
        )}
        
        <span className="text-xs text-gray-500">
          Added {formatRelativeDate(item.addedAt)}
        </span>
        
        {showAlerts && item.priceAlertEnabled && (
          <Tooltip content="Price alert active">
            <Badge variant="secondary" className="text-xs">
              <BellSolidIcon className="w-3 h-3 mr-1" />
              Alert On
            </Badge>
          </Tooltip>
        )}
      </div>

      {/* Notes Preview */}
      {showNotes && item.notes && (
        <div className="text-xs text-gray-600 italic line-clamp-2">
          &ldquo;{item.notes}&rdquo;
        </div>
      )}

      {/* Price History Indicator */}
      {showPriceHistory && item.priceChanged && (
        <Alert variant="info" className="py-2 px-3">
          <div className="flex items-center gap-2 text-xs">
            <TagIcon className="w-3 h-3" />
            <span>
              Price {item.priceChangePercentage && item.priceChangePercentage < 0 ? 'dropped' : 'increased'} since you added it
            </span>
          </div>
        </Alert>
      )}
    </div>
  );

  const renderActions = () => {
    if (!showActions) return null;

    return (
      <div className="flex items-center gap-2">
        {item.isAvailable ? (
          <Button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            size="sm"
            className="flex-1 gap-2"
          >
            <ShoppingCartIcon className="w-4 h-4" />
            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled
            className="flex-1"
          >
            Out of Stock
          </Button>
        )}
        
        <div className="flex gap-1">
          <Tooltip content="Price alert">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePriceAlertToggle}
              className="p-2"
            >
              {item.priceAlertEnabled ? (
                <BellSolidIcon className="w-4 h-4 text-blue-600" />
              ) : (
                <BellIcon className="w-4 h-4" />
              )}
            </Button>
          </Tooltip>
          
          <Tooltip content="Share">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="p-2"
            >
              <ShareIcon className="w-4 h-4" />
            </Button>
          </Tooltip>
          
          <Tooltip content="Edit">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setEditModal({ open: true, type: 'notes' });
              }}
              className="p-2"
            >
              <PencilIcon className="w-4 h-4" />
            </Button>
          </Tooltip>
          
          <Tooltip content="Remove">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>
      </div>
    );
  };

  const renderEditModal = () => (
    <Modal
      open={editModal.open}
      onClose={() => setEditModal({ open: false, type: null })}
      title={editModal.type === 'priority' ? 'Edit Priority' : 'Edit Notes'}
      size="sm"
    >
      <div className="p-6 space-y-4">
        {editModal.type === 'priority' ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Select Priority
              </label>
              <Select
                value={localPriority}
                onValueChange={(value: string | number) => setLocalPriority(String(value) as typeof localPriority)}
                options={[
                  { value: 'urgent', label: '🔥 Urgent' },
                  { value: 'high', label: '⚡ High' },
                  { value: 'medium', label: '📌 Medium' },
                  { value: 'low', label: '📋 Low' },
                ]}
                className="w-full"
              />
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setEditModal({ open: false, type: null })}
              >
                Cancel
              </Button>
              <Button onClick={handleSavePriority}>
                Save
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Notes
              </label>
              <TextArea
                value={localNotes}
                onChange={(e) => setLocalNotes(e.target.value)}
                placeholder="Add notes about this item..."
                rows={4}
                className="w-full"
              />
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setEditModal({ open: false, type: null })}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveNotes}>
                Save Notes
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={className}
      >
        <Card
          className={cn(
            'overflow-hidden h-full transition-all duration-200',
            interactive && 'hover:shadow-lg cursor-pointer',
            isSelected && 'ring-2 ring-blue-500 ring-offset-2'
          )}
          onClick={handleProductClick}
        >
          <div className={cn(
            'flex',
            view === 'grid' ? 'flex-col' : 'flex-row gap-4'
          )}>
            {/* Image */}
            <div className={cn(view === 'list' && 'flex-shrink-0')}>
              {renderImage()}
            </div>

            {/* Content */}
            <CardContent className={cn(
              'p-4',
              view === 'list' ? 'flex flex-col flex-1' : 'flex flex-col'
            )}>
              {renderContent()}
              
              {/* Actions */}
              <div className={cn(
                view === 'list' && 'mt-auto',
                view === 'grid' && 'mt-4'
              )}>
                <Separator className="mb-3" />
                {renderActions()}
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>

      {/* Edit Modal */}
      {renderEditModal()}
    </>
  );
};

// Memoized export
export default memo(WishlistItem);
