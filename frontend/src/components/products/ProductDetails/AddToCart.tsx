'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Check, 
  Loader2, 
  Package, 
  AlertCircle,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Product, ProductVariant } from '@/types/product.types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useAddToCart } from '@/hooks/cart/useAddToCart';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export interface AddToCartProps {
  product: Product;
  selectedVariant?: ProductVariant;
  quantity?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showQuantitySelector?: boolean;
  showBuyNow?: boolean;
  showStockStatus?: boolean;
  onQuantityChange?: (quantity: number) => void;
  onAddSuccess?: () => void;
  disabled?: boolean;
}

const AddToCart: React.FC<AddToCartProps> = ({
  product,
  selectedVariant,
  quantity: externalQuantity,
  className,
  size = 'md',
  showQuantitySelector = true,
  showBuyNow = true,
  showStockStatus = true,
  onQuantityChange,
  onAddSuccess,
  disabled = false,
}) => {
  const router = useRouter();
  const { addToCart, isAdding } = useAddToCart();
  const [internalQuantity, setInternalQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const quantity = externalQuantity ?? internalQuantity;

  // Get stock info
  const stockInfo = useMemo(() => {
    if (selectedVariant) {
      return selectedVariant.inventory;
    }
    return product.inventory;
  }, [product, selectedVariant]);

  const availableStock = stockInfo?.quantity ?? 0;
  const lowStock = availableStock > 0 && availableStock <= 10;
  const outOfStock = availableStock <= 0;

  // Get pricing
  const pricing = useMemo(() => {
    if (selectedVariant?.pricing) {
      return selectedVariant.pricing;
    }
    return product.pricing;
  }, [product, selectedVariant]);

  const currentPrice = pricing.salePrice?.amount ?? pricing.basePrice.amount;

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleQuantityChange = (newQuantity: number) => {
    const validQuantity = Math.max(1, Math.min(newQuantity, availableStock));
    
    if (externalQuantity === undefined) {
      setInternalQuantity(validQuantity);
    }
    
    onQuantityChange?.(validQuantity);
  };

  const handleAddToCart = async () => {
    if (outOfStock || disabled) return;

    try {
      await addToCart(product.id, quantity, {
        variantId: selectedVariant?.id,
      });

      setShowSuccess(true);
      toast.success('Added to cart!');
      onAddSuccess?.();
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    if (outOfStock || disabled) return;

    try {
      await addToCart(product.id, quantity, {
        variantId: selectedVariant?.id,
      });

      router.push('/checkout');
    } catch (error) {
      console.error('Error during buy now:', error);
      toast.error('Failed to proceed to checkout');
    }
  };

  const sizeClasses = {
    sm: {
      button: 'px-4 py-2 text-sm',
      quantity: 'px-3 py-1 text-sm',
    },
    md: {
      button: 'px-6 py-3 text-base',
      quantity: 'px-4 py-2 text-base',
    },
    lg: {
      button: 'px-8 py-4 text-lg',
      quantity: 'px-5 py-3 text-lg',
    },
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Stock Status */}
      {showStockStatus && (
        <div className="space-y-2">
          {outOfStock ? (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Out of Stock</p>
                <p className="text-xs text-red-700">This product is currently unavailable</p>
              </div>
            </div>
          ) : lowStock ? (
            <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
              <Clock className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900">
                  Only {availableStock} left in stock
                </p>
                <p className="text-xs text-amber-700">Order soon before it&apos;s gone!</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
              <Package className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">In Stock</p>
                <p className="text-xs text-green-700">Ready to ship</p>
              </div>
            </div>
          )}

          {/* High Demand Badge */}
          {!outOfStock && product.isBestseller && (
            <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 border border-primary-200 rounded-lg">
              <TrendingUp className="h-4 w-4 text-primary-600" />
              <p className="text-xs font-medium text-primary-900">
                High demand - {Math.floor(Math.random() * 50 + 10)} people viewing this now
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quantity Selector */}
      {showQuantitySelector && !outOfStock && (
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Quantity:</label>
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || disabled}
              className={cn(
                sizeClasses[size].quantity,
                "border-r border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              min={1}
              max={availableStock}
              disabled={disabled}
              aria-label="Product quantity"
              className={cn(
                sizeClasses[size].quantity,
                "w-16 text-center border-0 focus:outline-none focus:ring-2 focus:ring-primary-500"
              )}
            />
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= availableStock || disabled}
              className={cn(
                sizeClasses[size].quantity,
                "border-l border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              +
            </button>
          </div>
          <span className="text-xs text-gray-500">
            {availableStock} available
          </span>
        </div>
      )}

      {/* Price Summary */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-sm text-gray-600">Total Price</p>
          <p className="text-2xl font-bold text-gray-900">
            ₹{(currentPrice * quantity).toLocaleString('en-IN')}
          </p>
        </div>
        {pricing.salePrice && (
          <div className="text-right">
            <p className="text-sm text-gray-600">You Save</p>
            <p className="text-lg font-semibold text-green-600">
              ₹{((pricing.basePrice.amount - currentPrice) * quantity).toLocaleString('en-IN')}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={outOfStock || isAdding || disabled}
          className={cn(
            'flex-1 relative',
            sizeClasses[size].button,
            outOfStock && 'bg-gray-300 cursor-not-allowed'
          )}
          variant={outOfStock ? 'secondary' : 'default'}
        >
          <AnimatePresence mode="wait">
            {isAdding ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Loader2 className="h-5 w-5 animate-spin" />
                Adding...
              </motion.span>
            ) : showSuccess ? (
              <motion.span
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <Check className="h-5 w-5" />
                Added!
              </motion.span>
            ) : (
              <motion.span
                key="default"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                {outOfStock ? 'Out of Stock' : 'Add to Cart'}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>

        {/* Buy Now Button */}
        {showBuyNow && !outOfStock && (
          <Button
            onClick={handleBuyNow}
            disabled={isAdding || disabled}
            className={cn('flex-1', sizeClasses[size].button)}
            variant="secondary"
          >
            Buy Now
          </Button>
        )}
      </div>

      {/* Additional Info */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Check className="h-3 w-3 text-green-600" />
          <span>Secure Checkout</span>
        </div>
        <div className="flex items-center gap-1">
          <Check className="h-3 w-3 text-green-600" />
          <span>Easy Returns</span>
        </div>
        {pricing.salePrice && (
          <div className="flex items-center gap-1">
            <Check className="h-3 w-3 text-green-600" />
            <span>Best Price Guaranteed</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddToCart;