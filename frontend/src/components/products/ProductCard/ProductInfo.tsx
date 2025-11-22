'use client';

import React from 'react';
import Link from 'next/link';
import { Product, ProductVariant } from '@/types/product.types';
import { cn } from '@/lib/utils';
import { Package, Truck, Shield, RotateCcw, Info } from 'lucide-react';

export interface ProductInfoProps {
  product: Product;
  variant?: ProductVariant;
  className?: string;
  showCategory?: boolean;
  showBrand?: boolean;
  showSKU?: boolean;
  showDescription?: boolean;
  showFeatures?: boolean;
  showShipping?: boolean;
  descriptionLines?: number;
  linkToProduct?: boolean;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  variant,
  className,
  showCategory = true,
  showBrand = true,
  showSKU = false,
  showDescription = false,
  showFeatures = false,
  showShipping = false,
  descriptionLines = 2,
  linkToProduct = true,
}) => {
  const productName = variant?.name || product.name;
  const productSKU = variant?.sku || product.sku;
  
  const ProductNameElement = () => {
    if (linkToProduct) {
      return (
        <Link 
          href={`/products/${product.slug}`}
          className="font-semibold text-gray-900 line-clamp-2 hover:text-primary transition-colors"
        >
          {productName}
        </Link>
      );
    }

    return (
      <h3 className="font-semibold text-gray-900 line-clamp-2">
        {productName}
      </h3>
    );
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Category and Brand */}
      {(showCategory || showBrand) && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {showCategory && product.category && (
            <>
              <Link 
                href={`/categories/${product.category.slug}`}
                className="hover:text-primary transition-colors"
              >
                {product.category.name}
              </Link>
              {showBrand && product.brand && <span className="text-gray-300">|</span>}
            </>
          )}
          {showBrand && product.brand && (
            <Link 
              href={`/brands/${product.brand.slug}`}
              className="hover:text-primary transition-colors font-medium"
            >
              {product.brand.name}
            </Link>
          )}
        </div>
      )}

      {/* Product Name */}
      <ProductNameElement />

      {/* SKU */}
      {showSKU && productSKU && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Package className="h-3 w-3" />
          <span>SKU: {productSKU}</span>
        </div>
      )}

      {/* Short Description */}
      {showDescription && product.shortDescription && (
        <p 
          className={cn(
            'text-sm text-gray-600',
            `line-clamp-${descriptionLines}`
          )}
        >
          {product.shortDescription}
        </p>
      )}

      {/* Key Features */}
      {showFeatures && product.features && product.features.length > 0 && (
        <ul className="space-y-1">
          {product.features.slice(0, 3).map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-xs text-gray-600">
              <Info className="h-3 w-3 mt-0.5 flex-shrink-0 text-primary" />
              <span className="line-clamp-1">{feature}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Shipping & Returns Info */}
      {showShipping && (
        <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Truck className="h-3.5 w-3.5 text-green-600" />
            <span>Free Shipping</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <RotateCcw className="h-3.5 w-3.5 text-primary-600" />
            <span>Easy Returns</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Shield className="h-3.5 w-3.5 text-primary-600" />
            <span>Secure Payment</span>
          </div>
        </div>
      )}

      {/* Material Tags */}
      {product.materials && product.materials.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {product.materials.slice(0, 3).map((material) => (
            <span
              key={material.id}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
            >
              {material.name}
            </span>
          ))}
        </div>
      )}

      {/* Color Options Preview */}
      {product.colors && product.colors.length > 1 && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Colors:</span>
          <div className="flex gap-1">
            {product.colors.slice(0, 5).map((color) => (
              // Dynamic hex color from database requires inline style
              <span
                key={color.id}
                className={cn(
                  "w-4 h-4 rounded-full border border-gray-300 shadow-sm inline-block",
                  color.hexCode === '#FFFFFF' && 'bg-white',
                  color.hexCode === '#000000' && 'bg-black'
                )}
                style={color.hexCode !== '#FFFFFF' && color.hexCode !== '#000000' ? { backgroundColor: color.hexCode } : undefined}
                title={color.name}
                aria-label={color.name}
              />
            ))}
            {product.colors.length > 5 && (
              <span className="text-xs text-gray-500 ml-1">
                +{product.colors.length - 5}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Size Options Preview */}
      {product.sizes && product.sizes.length > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Sizes:</span>
          <div className="flex gap-1 flex-wrap">
            {product.sizes.slice(0, 4).map((size) => (
              <span
                key={size.id}
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded border',
                  size.isAvailable
                    ? 'border-gray-300 text-gray-700'
                    : 'border-gray-200 text-gray-400 line-through'
                )}
              >
                {size.name}
              </span>
            ))}
            {product.sizes.length > 4 && (
              <span className="text-xs text-gray-500">
                +{product.sizes.length - 4}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductInfo;
