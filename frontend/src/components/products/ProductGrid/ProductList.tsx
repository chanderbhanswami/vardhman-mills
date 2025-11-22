'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Product } from '@/types/product.types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Heart, 
  ShoppingCart, 
  Eye, 
  Star, 
  TrendingUp, 
  Sparkles,
  Tag,
  Check
} from 'lucide-react';
import { useToggleWishlist } from '@/hooks/wishlist/useToggleWishlist';
import { useAddToCart } from '@/hooks/cart/useAddToCart';

export interface ProductListProps {
  products: Product[];
  className?: string;
  showBadges?: boolean;
  showRating?: boolean;
  showActions?: boolean;
  animateItems?: boolean;
  onQuickView?: (product: Product) => void;
  onProductClick?: (product: Product) => void;
}

const ProductListItem: React.FC<{
  product: Product;
  index: number;
  showBadges?: boolean;
  showRating?: boolean;
  showActions?: boolean;
  animateItems?: boolean;
  onQuickView?: (product: Product) => void;
  onProductClick?: (product: Product) => void;
}> = ({
  product,
  index,
  showBadges = true,
  showRating = true,
  showActions = true,
  animateItems = true,
  onQuickView,
  onProductClick,
}) => {
  const { quickToggle, isInWishlist, isToggling: wishlistLoading } = useToggleWishlist();
  const { addToCart, isAdding: cartLoading } = useAddToCart();

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await quickToggle(product.id);
    } catch (error) {
      console.error('Wishlist toggle error:', error);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await addToCart(product.id, 1);
    } catch (error) {
      console.error('Add to cart error:', error);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const isWishlisted = isInWishlist(product.id);
  const primaryImage = product.media?.images?.[0];
  const hasDiscount = product.pricing?.salePrice && product.pricing.salePrice.amount < product.pricing.basePrice.amount;
  const regularPrice = product.pricing?.compareAtPrice?.amount || product.pricing?.basePrice?.amount || 0;
  const salePrice = product.pricing?.salePrice?.amount || product.pricing?.basePrice?.amount || 0;
  const discountPercentage = regularPrice > salePrice ? Math.round(((regularPrice - salePrice) / regularPrice) * 100) : 0;
  const inStock = product.inventory?.isInStock;

  return (
    <motion.div
      initial={animateItems ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group"
    >
      <Link
        href={`/products/${product.slug}`}
        onClick={() => onProductClick?.(product)}
        className="flex gap-6 p-6 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300"
      >
        {/* Product Image */}
        <div className="relative flex-shrink-0 w-48 h-48 rounded-lg overflow-hidden bg-gray-100">
          {primaryImage && (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 192px, 192px"
            />
          )}

          {/* Badges */}
          {showBadges && (
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.isNewArrival && (
                <Badge variant="default" className="bg-primary-500">
                  <Sparkles className="w-3 h-3 mr-1" />
                  New
                </Badge>
              )}
              {product.isBestseller && (
                <Badge variant="default" className="bg-primary-500">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Bestseller
                </Badge>
              )}
              {hasDiscount && (
                <Badge variant="destructive">
                  <Tag className="w-3 h-3 mr-1" />
                  {discountPercentage}% OFF
                </Badge>
              )}
              {!inStock && (
                <Badge variant="default" className="bg-gray-500">
                  Out of Stock
                </Badge>
              )}
            </div>
          )}

          {/* Quick Actions Overlay */}
          {showActions && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Button
                size="sm"
                variant="default"
                onClick={handleQuickView}
                className="bg-white text-gray-900 hover:bg-gray-100"
              >
                <Eye className="w-4 h-4 mr-2" />
                Quick View
              </Button>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div className="space-y-3">
            {/* Brand */}
            {product.brand && (
              <p className="text-sm text-gray-600 font-medium">{product.brand.name}</p>
            )}

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {product.name}
            </h3>

            {/* Description */}
            {product.shortDescription && (
              <p className="text-sm text-gray-600 line-clamp-2">{product.shortDescription}</p>
            )}

            {/* Rating */}
            {showRating && product.rating && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-4 h-4',
                        i < Math.floor(product.rating.average)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating.average.toFixed(1)} ({product.reviewCount} reviews)
                </span>
              </div>
            )}

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <ul className="space-y-1">
                {product.features.slice(0, 3).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Colors:</span>
                <div className="flex items-center gap-1.5">
                  {product.colors.slice(0, 5).map((color, idx) => (
                    // Dynamic background color requires inline style
                    <div
                      key={idx}
                      className="w-6 h-6 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: color.hexCode || color.name.toLowerCase() }}
                      title={color.name}
                      aria-label={color.name}
                    />
                  ))}
                  {product.colors.length > 5 && (
                    <span className="text-xs text-gray-500 ml-1">
                      +{product.colors.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-gray-900">
                ₹{salePrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-gray-500 line-through">
                    ₹{regularPrice.toLocaleString()}
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    Save ₹{(regularPrice - salePrice).toLocaleString()}
                  </span>
                </>
              )}
            </div>

            {showActions && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  className={cn(
                    'w-10 h-10 p-0',
                    isWishlisted && 'text-red-500 border-red-500'
                  )}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={cn('w-5 h-5', isWishlisted && 'fill-current')} />
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={handleAddToCart}
                  disabled={!inStock || cartLoading}
                  className="min-w-[140px]"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export const ProductList: React.FC<ProductListProps> = ({
  products,
  className,
  showBadges = true,
  showRating = true,
  showActions = true,
  animateItems = true,
  onQuickView,
  onProductClick,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {products.map((product, index) => (
        <ProductListItem
          key={product.id}
          product={product}
          index={index}
          showBadges={showBadges}
          showRating={showRating}
          showActions={showActions}
          animateItems={animateItems}
          onQuickView={onQuickView}
          onProductClick={onProductClick}
        />
      ))}
    </div>
  );
};

export default ProductList;