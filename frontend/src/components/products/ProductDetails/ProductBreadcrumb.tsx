'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { Product } from '@/types/product.types';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

export interface ProductBreadcrumbProps {
  product: Product;
  className?: string;
  showHome?: boolean;
  separator?: React.ReactNode;
  maxItems?: number;
}

const ProductBreadcrumb: React.FC<ProductBreadcrumbProps> = ({
  product,
  className,
  showHome = true,
  separator,
  maxItems,
}) => {
  // Build breadcrumb trail
  const breadcrumbs: BreadcrumbItem[] = [];

  if (showHome) {
    breadcrumbs.push({
      label: 'Home',
      href: '/',
    });
  }

  // Add category hierarchy
  if (product.category) {
    breadcrumbs.push({
      label: product.category.name,
      href: `/category/${product.category.slug}`,
    });
  }

  if (product.subcategory) {
    breadcrumbs.push({
      label: product.subcategory.name,
      href: `/category/${product.category.slug}/${product.subcategory.slug}`,
    });
  }

  if (product.brand) {
    breadcrumbs.push({
      label: product.brand.name,
      href: `/brand/${product.brand.slug}`,
    });
  }

  // Add current product
  breadcrumbs.push({
    label: product.name,
    href: `/products/${product.slug}`,
    current: true,
  });

  // Limit items if maxItems is specified
  const displayBreadcrumbs = maxItems && breadcrumbs.length > maxItems
    ? [
        ...breadcrumbs.slice(0, 1),
        { label: '...', href: '#', current: false },
        ...breadcrumbs.slice(-(maxItems - 2)),
      ]
    : breadcrumbs;

  const defaultSeparator = <ChevronRight className="h-4 w-4 text-gray-400" />;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center space-x-2 text-sm', className)}
    >
      <ol className="flex items-center space-x-2">
        {displayBreadcrumbs.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2">
                {separator || defaultSeparator}
              </span>
            )}
            
            {item.current ? (
              <span className="font-medium text-gray-900 truncate max-w-[200px]">
                {item.label}
              </span>
            ) : item.label === '...' ? (
              <span className="text-gray-500">{item.label}</span>
            ) : index === 0 && showHome ? (
              <Link
                href={item.href}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Home className="h-4 w-4" />
                <span className="sr-only">Home</span>
              </Link>
            ) : (
              <Link
                href={item.href}
                className="text-gray-600 hover:text-gray-900 transition-colors truncate max-w-[150px]"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default ProductBreadcrumb;
