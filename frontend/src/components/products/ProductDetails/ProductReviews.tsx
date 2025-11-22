'use client';

import React from 'react';
import { Product } from '@/types/product.types';
import { cn } from '@/lib/utils';
import ProductReviewsComponent from '@/components/reviews/ProductReviews';

export interface ProductReviewsProps {
  product: Product;
  className?: string;
}

/**
 * ProductReviews wrapper component that integrates with the existing review system.
 * This component uses the comprehensive ProductReviews component from @/components/reviews
 * which includes all review features: filtering, sorting, pagination, media gallery, etc.
 */
const ProductReviews: React.FC<ProductReviewsProps> = ({
  product,
  className,
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      <ProductReviewsComponent productId={product.id} />
    </div>
  );
};

export default ProductReviews;
