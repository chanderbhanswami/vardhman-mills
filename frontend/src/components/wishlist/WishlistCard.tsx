'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShoppingCartIcon,
  EyeIcon,
  ShareIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  PencilIcon,
  EllipsisVerticalIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarSolidIcon
} from '@heroicons/react/24/solid';

// UI Components
import { Button } from '@/components/ui/Button';
import { Card, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { Tooltip } from '@/components/ui/Tooltip';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody } from '@/components/ui/Modal';
import { TextArea } from '@/components/ui/TextArea';

// Hooks and Contexts
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/hooks/useToast';

// Utils
import { cn } from '@/lib/utils';

// Types
export interface WishlistItem {
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
  discount?: number;
  estimatedDelivery?: string;
  brand?: string;
  sku?: string;
}

export interface WishlistCardProps {
  item: WishlistItem;
  variant?: 'default' | 'compact' | 'detailed' | 'minimal';
  layout?: 'vertical' | 'horizontal';
  showQuickActions?: boolean;
  showPriceHistory?: boolean;
  showNotes?: boolean;
  showTags?: boolean;
  showPriority?: boolean;
  showAddedDate?: boolean;
  editable?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (selected: boolean, item: WishlistItem) => void;
  onMoveToCart?: (item: WishlistItem) => void;
  onRemove?: (item: WishlistItem) => void;
  onEdit?: (item: WishlistItem, updates: Partial<WishlistItem>) => void;
  onShare?: (item: WishlistItem) => void;
  onView?: (item: WishlistItem) => void;
  className?: string;
  imageClassName?: string;
  contentClassName?: string;
  actionClassName?: string;
  animated?: boolean;
  lazyLoading?: boolean;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: (item: WishlistItem) => void | Promise<void>;
  variant?: 'default' | 'primary' | 'secondary' | 'destructive';
  disabled?: boolean;
  tooltip?: string;
}

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  discount?: number;
  className?: string;
}

interface RatingDisplayProps {
  rating: number;
  reviewCount: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

interface PriorityIndicatorProps {
  priority: WishlistItem['priority'];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface NotesDisplayProps {
  notes?: string;
  maxLength?: number;
  editable?: boolean;
  onEdit?: (notes: string) => void;
  className?: string;
}

// Price Display Component
const PriceDisplay: React.FC<PriceDisplayProps> = ({ 
  price, 
  originalPrice, 
  discount,
  className 
}) => {
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercentage = discount || (hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-xl font-bold text-gray-900">
        ${price.toFixed(2)}
      </span>
      
      {hasDiscount && (
        <>
          <span className="text-sm text-gray-500 line-through">
            ${originalPrice.toFixed(2)}
          </span>
          {discountPercentage > 0 && (
            <Badge variant="destructive" className="text-xs">
              -{discountPercentage}%
            </Badge>
          )}
        </>
      )}
    </div>
  );
};

// Rating Display Component
const RatingDisplay: React.FC<RatingDisplayProps> = ({ 
  rating, 
  reviewCount, 
  size = 'md',
  showCount = true,
  className 
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const iconSize = sizeClasses[size];

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarSolidIcon
            key={star}
            className={cn(
              iconSize,
              star <= rating ? 'text-yellow-400' : 'text-gray-200'
            )}
          />
        ))}
      </div>
      
      {showCount && reviewCount > 0 && (
        <span className={cn(
          'text-gray-500',
          size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
        )}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
};

// Priority Indicator Component
const PriorityIndicator: React.FC<PriorityIndicatorProps> = ({ 
  priority, 
  size = 'md',
  className 
}) => {
  const getPriorityConfig = () => {
    switch (priority) {
      case 'high':
        return { label: 'High', color: 'bg-red-100 text-red-800 border-red-200' };
      case 'medium':
        return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'low':
        return { label: 'Low', color: 'bg-green-100 text-green-800 border-green-200' };
      default:
        return { label: 'Medium', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const config = getPriorityConfig();
  const sizeClass = size === 'sm' ? 'text-xs px-1.5 py-0.5' : size === 'lg' ? 'text-sm px-2.5 py-1' : 'text-xs px-2 py-1';

  return (
    <span className={cn(
      'inline-flex items-center rounded-full border font-medium',
      config.color,
      sizeClass,
      className
    )}>
      {config.label}
    </span>
  );
};

// Notes Display Component
const NotesDisplay: React.FC<NotesDisplayProps> = ({ 
  notes, 
  maxLength = 100,
  editable = false,
  onEdit,
  className 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(notes || '');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSave = useCallback(() => {
    onEdit?.(editValue);
    setIsEditing(false);
  }, [editValue, onEdit]);

  const handleCancel = useCallback(() => {
    setEditValue(notes || '');
    setIsEditing(false);
  }, [notes]);

  if (!notes && !editable) return null;

  const shouldTruncate = notes && notes.length > maxLength;
  const displayText = shouldTruncate && !isExpanded 
    ? `${notes.slice(0, maxLength)}...` 
    : notes;

  if (isEditing) {
    return (
      <div className={cn('space-y-2', className)}>
        <TextArea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder="Add your notes..."
          rows={3}
          className="text-sm"
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave}>
            <CheckIcon className="w-3 h-3 mr-1" />
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel}>
            <XMarkIcon className="w-3 h-3 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      {notes ? (
        <div className="text-sm text-gray-600 leading-relaxed">
          {displayText}
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-1 text-blue-600 hover:text-blue-800 font-medium"
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      ) : editable ? (
        <button
          onClick={() => setIsEditing(true)}
          className="text-sm text-gray-400 hover:text-gray-600 italic"
        >
          Add notes...
        </button>
      ) : null}
      
      {editable && notes && (
        <button
          onClick={() => setIsEditing(true)}
          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <PencilIcon className="w-3 h-3" />
          Edit
        </button>
      )}
    </div>
  );
};

// Stock Status Component
const StockStatus: React.FC<{ inStock: boolean; className?: string }> = ({ 
  inStock, 
  className 
}) => (
  <div className={cn('flex items-center gap-1', className)}>
    <div className={cn(
      'w-2 h-2 rounded-full',
      inStock ? 'bg-green-500' : 'bg-red-500'
    )} />
    <span className={cn(
      'text-xs font-medium',
      inStock ? 'text-green-700' : 'text-red-700'
    )}>
      {inStock ? 'In Stock' : 'Out of Stock'}
    </span>
  </div>
);

// Main Wishlist Card Component
export const WishlistCard: React.FC<WishlistCardProps> = ({
  item,
  variant = 'default',
  layout = 'vertical',
  showQuickActions = true,
  showNotes = true,
  showTags = true,
  showPriority = true,
  showAddedDate = true,
  editable = false,
  selectable = false,
  selected = false,
  onSelect,
  onMoveToCart,
  onRemove,
  onEdit,
  onShare,
  onView,
  className,
  imageClassName,
  contentClassName,
  actionClassName,
  animated = true,
  lazyLoading = true
}) => {
  // Hooks
  const { removeFromWishlist, moveToCart } = useWishlist();
  const { toast } = useToast();

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Refs
  const cardRef = useRef<HTMLDivElement>(null);

  // Computed values
  const addedDate = useMemo(() => 
    new Date(item.addedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    [item.addedAt]
  );

  // Event handlers
  const handleMoveToCart = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await moveToCart(item.id);
      onMoveToCart?.(item);
      
      toast({
        title: 'Moved to cart',
        description: `${item.name} has been moved to your cart`
      });
    } catch (error) {
      console.error('Move to cart failed:', error);
      toast({
        title: 'Failed to move to cart',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, moveToCart, item, onMoveToCart, toast]);

  const handleRemove = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await removeFromWishlist(item.id);
      onRemove?.(item);
      
      toast({
        title: 'Removed from wishlist',
        description: `${item.name} has been removed from your wishlist`
      });
    } catch (error) {
      console.error('Remove failed:', error);
      toast({
        title: 'Failed to remove item',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  }, [isLoading, removeFromWishlist, item, onRemove, toast]);

  const handleShare = useCallback(() => {
    const shareUrl = `${window.location.origin}/product/${item.productId}`;
    navigator.clipboard.writeText(shareUrl);
    
    onShare?.(item);
    toast({
      title: 'Link copied',
      description: 'Product link copied to clipboard'
    });
  }, [item, onShare, toast]);

  const handleView = useCallback(() => {
    onView?.(item);
  }, [item, onView]);

  const handleNotesEdit = useCallback((notes: string) => {
    onEdit?.(item, { notes });
  }, [item, onEdit]);

  const handleSelect = useCallback(() => {
    onSelect?.(!selected, item);
  }, [selected, item, onSelect]);

  // Quick actions configuration
  const quickActions: QuickAction[] = useMemo(() => [
    {
      id: 'cart',
      label: 'Move to Cart',
      icon: ShoppingCartIcon,
      action: handleMoveToCart,
      variant: 'primary',
      disabled: !item.inStock || isLoading,
      tooltip: item.inStock ? 'Add to cart' : 'Out of stock'
    },
    {
      id: 'view',
      label: 'View Product',
      icon: EyeIcon,
      action: handleView,
      variant: 'secondary',
      tooltip: 'View product details'
    },
    {
      id: 'share',
      label: 'Share',
      icon: ShareIcon,
      action: handleShare,
      variant: 'secondary',
      tooltip: 'Share product'
    },
    {
      id: 'remove',
      label: 'Remove',
      icon: TrashIcon,
      action: () => setShowDeleteConfirm(true),
      variant: 'destructive',
      tooltip: 'Remove from wishlist'
    }
  ], [handleMoveToCart, handleView, handleShare, item.inStock, isLoading]);

  // Layout styles
  const getLayoutStyles = () => {
    if (layout === 'horizontal') {
      return 'flex flex-row gap-4';
    }
    return 'flex flex-col';
  };

  // Variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return 'p-3';
      case 'minimal':
        return 'p-2 border-0 shadow-none bg-transparent';
      case 'detailed':
        return 'p-6';
      default:
        return 'p-4';
    }
  };

  // Image size based on layout and variant
  const getImageSize = () => {
    if (layout === 'horizontal') {
      return variant === 'compact' ? 'w-20 h-20' : 'w-24 h-24';
    }
    return 'w-full h-48';
  };

  // Animation variants
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
    hover: {
      y: -4,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };

  return (
    <>
      <motion.div
        ref={cardRef}
        variants={animated ? cardVariants : undefined}
        initial={animated ? 'initial' : undefined}
        animate={animated ? 'animate' : undefined}
        whileHover={animated ? 'hover' : undefined}
        whileTap={animated ? 'tap' : undefined}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={cn('group', className)}
      >
        <Card className={cn(
          'relative overflow-hidden transition-all duration-200',
          'hover:shadow-lg border border-gray-200',
          selected && 'ring-2 ring-blue-500 border-blue-300',
          getVariantStyles()
        )}>
          {/* Selection Checkbox */}
          {selectable && (
            <div className="absolute top-3 left-3 z-10">
              <input
                type="checkbox"
                checked={selected}
                onChange={handleSelect}
                className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                aria-label={`Select ${item.name}`}
              />
            </div>
          )}

          {/* Quick Actions Overlay */}
          {showQuickActions && (
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-3 right-3 z-10 flex gap-1"
                >
                  {quickActions.slice(0, 3).map((action) => (
                    <Tooltip key={action.id} content={action.tooltip || action.label}>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          action.action(item);
                        }}
                        disabled={action.disabled}
                        className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm"
                      >
                        <action.icon className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                  ))}
                  
                  <DropdownMenu
                    trigger={
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm"
                      >
                        <EllipsisVerticalIcon className="w-4 h-4" />
                      </Button>
                    }
                    items={quickActions.slice(3).map(action => ({
                      key: action.id,
                      label: action.label,
                      icon: action.icon,
                      onClick: () => action.action(item),
                      disabled: action.disabled,
                      destructive: action.variant === 'destructive'
                    }))}
                    align="end"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}

          <div className={getLayoutStyles()}>
            {/* Product Image */}
            <div className={cn(
              'relative overflow-hidden rounded-lg bg-gray-100',
              getImageSize(),
              layout === 'horizontal' ? 'flex-shrink-0' : ''
            )}>
              <Link href={`/product/${item.productId}`}>
                <div className="relative w-full h-full">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className={cn(
                      'object-cover transition-transform duration-300 group-hover:scale-105',
                      !isImageLoaded && 'opacity-0',
                      imageClassName
                    )}
                    onLoad={() => setIsImageLoaded(true)}
                    loading={lazyLoading ? 'lazy' : 'eager'}
                  />
                  
                  {!isImageLoaded && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                  )}
                  
                  {/* Stock overlay */}
                  {!item.inStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm bg-red-600 px-2 py-1 rounded">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            </div>

            {/* Content */}
            <div className={cn(
              'flex-1 space-y-3',
              layout === 'horizontal' ? 'min-w-0' : '',
              contentClassName
            )}>
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <Link 
                    href={`/product/${item.productId}`}
                    className="flex-1 min-w-0"
                  >
                    <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                      {item.name}
                    </h3>
                  </Link>
                  
                  {showPriority && (
                    <PriorityIndicator priority={item.priority} size="sm" />
                  )}
                </div>
                
                {item.brand && (
                  <p className="text-sm text-gray-500">{item.brand}</p>
                )}
              </div>

              {/* Price */}
              <PriceDisplay
                price={item.price}
                originalPrice={item.originalPrice}
                discount={item.discount}
              />

              {/* Rating & Stock */}
              <div className="flex items-center justify-between">
                <RatingDisplay
                  rating={item.rating}
                  reviewCount={item.reviewCount}
                  size="sm"
                />
                <StockStatus inStock={item.inStock} />
              </div>

              {/* Tags */}
              {showTags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {item.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{item.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Notes */}
              {showNotes && (
                <NotesDisplay
                  notes={item.notes}
                  editable={editable}
                  onEdit={handleNotesEdit}
                  maxLength={layout === 'horizontal' ? 60 : 100}
                />
              )}

              {/* Added Date */}
              {showAddedDate && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <ClockIcon className="w-3 h-3" />
                  Added {addedDate}
                </div>
              )}
            </div>
          </div>

          {/* Actions Footer */}
          {(variant === 'detailed' || variant === 'default') && !showQuickActions && (
            <CardFooter className={cn('pt-4 border-t border-gray-100', actionClassName)}>
              <div className="flex gap-2 w-full">
                <Button
                  onClick={handleMoveToCart}
                  disabled={!item.inStock || isLoading}
                  className="flex-1"
                >
                  <ShoppingCartIcon className="w-4 h-4 mr-2" />
                  {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isLoading}
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Remove from Wishlist</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                <div>
                  <p className="font-medium">Are you sure you want to remove this item?</p>
                  <p className="text-sm text-gray-600">{item.name}</p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRemove}
                  disabled={isLoading}
                >
                  {isLoading ? 'Removing...' : 'Remove'}
                </Button>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

// Preset Card Variants
export const CompactWishlistCard: React.FC<Omit<WishlistCardProps, 'variant'>> = (props) => (
  <WishlistCard {...props} variant="compact" />
);

export const DetailedWishlistCard: React.FC<Omit<WishlistCardProps, 'variant'>> = (props) => (
  <WishlistCard {...props} variant="detailed" />
);

export const MinimalWishlistCard: React.FC<Omit<WishlistCardProps, 'variant'>> = (props) => (
  <WishlistCard {...props} variant="minimal" />
);

export const HorizontalWishlistCard: React.FC<Omit<WishlistCardProps, 'layout'>> = (props) => (
  <WishlistCard {...props} layout="horizontal" />
);

export default WishlistCard;
