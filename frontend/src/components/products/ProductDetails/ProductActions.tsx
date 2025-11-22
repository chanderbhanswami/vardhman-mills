'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2, GitCompare, Eye, Bell } from 'lucide-react';
import { Product } from '@/types/product.types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useToggleWishlist } from '@/hooks/wishlist/useToggleWishlist';
import { useAuth } from '@/hooks/auth/useAuth';
import { toast } from 'react-hot-toast';
import { Tooltip } from '@/components/ui/Tooltip';

export interface ProductActionsProps {
  product: Product;
  className?: string;
  layout?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  showQuickView?: boolean;
  showNotifyMe?: boolean;
  onQuickView?: () => void;
  onCompare?: () => void;
  onShare?: () => void;
}

const ProductActions: React.FC<ProductActionsProps> = ({
  product,
  className,
  layout = 'horizontal',
  size = 'md',
  showLabels = false,
  showQuickView = true,
  showNotifyMe = false,
  onQuickView,
  onCompare,
  onShare,
}) => {
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleAsync, isToggling } = useToggleWishlist();
  const [isComparing, setIsComparing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const isOutOfStock = (product.inventory?.quantity ?? 0) <= 0;

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }

    try {
      await toggleAsync({ productId: product.id });
      toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const handleCompare = () => {
    setIsComparing(true);
    setTimeout(() => setIsComparing(false), 1000);
    toast.success('Added to compare list');
    onCompare?.();
  };

  const handleShare = async () => {
    setIsSharing(true);
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.shortDescription || product.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      }
      onShare?.();
    } catch (error) {
      console.error('Share error:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleNotifyMe = () => {
    if (!isAuthenticated) {
      toast.error('Please login to get notified');
      return;
    }
    toast.success('You will be notified when back in stock');
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const containerClasses = {
    horizontal: 'flex items-center gap-2',
    vertical: 'flex flex-col gap-2',
  };

  return (
    <div className={cn(containerClasses[layout], className)}>
      {/* Wishlist Button */}
      <Tooltip content={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}>
        <Button
          variant="outline"
          size={size}
          onClick={handleWishlistToggle}
          disabled={isToggling}
          className={cn(
            'relative',
            inWishlist && 'text-red-600 border-red-600 hover:bg-red-50'
          )}
        >
          <motion.div
            animate={{
              scale: isToggling ? [1, 1.2, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <Heart
              className={cn(iconSizes[size], inWishlist && 'fill-current')}
            />
          </motion.div>
          {showLabels && <span>Wishlist</span>}
        </Button>
      </Tooltip>

      {/* Compare Button */}
      <Tooltip content="Add to compare">
        <Button
          variant="outline"
          size={size}
          onClick={handleCompare}
          disabled={isComparing}
        >
          <motion.div
            animate={{
              rotate: isComparing ? 360 : 0,
            }}
            transition={{ duration: 0.5 }}
          >
            <GitCompare className={iconSizes[size]} />
          </motion.div>
          {showLabels && <span>Compare</span>}
        </Button>
      </Tooltip>

      {/* Share Button */}
      <Tooltip content="Share product">
        <Button
          variant="outline"
          size={size}
          onClick={handleShare}
          disabled={isSharing}
        >
          <Share2 className={iconSizes[size]} />
          {showLabels && <span>Share</span>}
        </Button>
      </Tooltip>

      {/* Quick View Button */}
      {showQuickView && onQuickView && (
        <Tooltip content="Quick view">
          <Button
            variant="outline"
            size={size}
            onClick={onQuickView}
          >
            <Eye className={iconSizes[size]} />
            {showLabels && <span>Quick View</span>}
          </Button>
        </Tooltip>
      )}

      {/* Notify Me Button (for out of stock) */}
      {showNotifyMe && isOutOfStock && (
        <Tooltip content="Get notified when back in stock">
          <Button
            variant="outline"
            size={size}
            onClick={handleNotifyMe}
          >
            <Bell className={iconSizes[size]} />
            {showLabels && <span>Notify Me</span>}
          </Button>
        </Tooltip>
      )}
    </div>
  );
};

export default ProductActions;
