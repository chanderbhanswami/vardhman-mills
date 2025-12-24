'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, Shield, Truck, Award, Tag } from 'lucide-react';
import { Product, ProductVariant } from '@/types/product.types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export interface ProductInfoProps {
  product: Product;
  selectedVariant?: ProductVariant;
  className?: string;
  showBrand?: boolean;
  showSKU?: boolean;
  showCategory?: boolean;
  showBadges?: boolean;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  selectedVariant,
  className,
  showBrand = true,
  showSKU = true,
  showCategory = true,
  showBadges = true,
}) => {
  const sku = selectedVariant?.sku || product.sku;
  const inStock = selectedVariant?.inventory?.isInStock !== undefined
    ? selectedVariant.inventory.isInStock
    : product.inventory.isInStock;

  // Check if product has sale price
  const isOnSale = !!product.pricing.salePrice;

  const getBadges = () => {
    const badges: Array<{ label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon?: React.ReactNode }> = [];

    // Add sale badge if product is on sale
    if (isOnSale) {
      badges.push({ label: 'Sale', variant: 'destructive', icon: <Tag className="h-3 w-3" /> });
    }

    return badges;
  };

  const highlights = [
    { icon: <Package className="h-4 w-4" />, text: 'Authentic Product' },
    { icon: <Shield className="h-4 w-4" />, text: 'Secure Payments' },
    { icon: <Truck className="h-4 w-4" />, text: 'Fast Delivery' },
  ];

  if (product.warranty) {
    highlights.push({
      icon: <Award className="h-4 w-4" />,
      text: `${product.warranty.duration} Warranty`
    });
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Badges */}
      {showBadges && getBadges().length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2"
        >
          {getBadges().map((badge, index) => (
            <Badge key={index} variant={badge.variant} className="flex items-center gap-1">
              {badge.icon}
              {badge.label}
            </Badge>
          ))}
        </motion.div>
      )}

      {/* Product Name */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900"
      >
        {product.name}
      </motion.h1>

      {/* Brand and Category */}
      {(showBrand || showCategory) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center gap-4 text-sm text-gray-600"
        >
          {showBrand && product.brand && (
            <Link
              href={`/brands/${product.brand.slug}`}
              className="flex items-center gap-2 hover:text-primary-600 transition-colors"
            >
              <span className="font-medium">Brand:</span>
              <span className="underline">{product.brand.name}</span>
            </Link>
          )}

          {showCategory && product.category && (
            <Link
              href={`/categories/${product.category.slug}`}
              className="flex items-center gap-2 hover:text-primary-600 transition-colors"
            >
              <span className="font-medium">Category:</span>
              <span className="underline">{product.category.name}</span>
            </Link>
          )}
        </motion.div>
      )}

      {/* SKU and Availability */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap items-center gap-4 text-sm"
      >
        {showSKU && (
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-600">SKU:</span>
            <span className="text-gray-900">{sku}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-600">Availability:</span>
          <Badge variant={inStock ? 'default' : 'destructive'}>
            {inStock ? 'In Stock' : 'Out of Stock'}
          </Badge>
        </div>
      </motion.div>

      {/* Short Description */}
      {product.shortDescription && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 leading-relaxed"
        >
          {product.shortDescription}
        </motion.p>
      )}

      {/* Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {highlights.map((highlight, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
          >
            <div className="text-primary-600">{highlight.icon}</div>
            <span className="text-xs text-gray-700">{highlight.text}</span>
          </div>
        ))}
      </motion.div>

      {/* Collections */}
      {product.collections && product.collections.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="pt-4 border-t"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-600">Collections:</span>
            {product.collections.map((collection, index) => (
              <React.Fragment key={collection.id || index}>
                <Link
                  href={`/collections/${collection.slug}`}
                  className="text-sm text-primary-600 hover:text-primary-700 underline"
                >
                  {collection.name}
                </Link>
                {index < product.collections.length - 1 && <span className="text-gray-400">, </span>}
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProductInfo;
