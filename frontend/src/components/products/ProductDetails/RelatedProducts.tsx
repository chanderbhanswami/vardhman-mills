'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Product } from '@/types/product.types';
import { cn } from '@/lib/utils';
import ProductCard from '@/components/products/ProductCard';

export interface RelatedProductsProps {
  product: Product;
  relatedProducts?: Product[];
  className?: string;
  title?: string;
  maxItems?: number;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({
  product,
  relatedProducts = [],
  className,
  title = 'Related Products',
  maxItems = 4,
}) => {
  // Filter out the current product and limit items
  const filteredProducts = relatedProducts
    .filter(p => p.id !== product.id)
    .slice(0, maxItems);

  if (filteredProducts.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        
        {/* View All Link */}
        {product.category && (
          <Link
            href={`/categories/${product.category.slug}`}
            className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((relatedProduct) => (
          <ProductCard
            key={relatedProduct.id}
            product={relatedProduct}
            variant="compact"
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
