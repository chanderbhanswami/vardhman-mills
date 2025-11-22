/**
 * Breadcrumbs Component
 * 
 * Displays a navigation breadcrumb trail showing the current page's position
 * in the site hierarchy with proper accessibility and SEO markup.
 * 
 * Features:
 * - Structured data for SEO (JSON-LD)
 * - Accessible navigation with aria-labels
 * - Customizable separators
 * - Active item styling
 * - Responsive design
 * - Link and text items support
 * 
 * @component
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  showHome?: boolean;
  homeLabel?: string;
  homeHref?: string;
  className?: string;
  itemClassName?: string;
  separatorClassName?: string;
  activeClassName?: string;
  maxItems?: number;
  variant?: 'default' | 'minimal' | 'bold';
  animated?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  separator,
  showHome = true,
  homeLabel = 'Home',
  homeHref = '/',
  className,
  itemClassName,
  separatorClassName,
  activeClassName,
  maxItems,
  variant = 'default',
  animated = true,
}) => {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Add home item if needed
  const breadcrumbItems = React.useMemo(() => {
    const finalItems = [...items];
    
    if (showHome && (finalItems.length === 0 || finalItems[0].href !== homeHref)) {
      finalItems.unshift({
        label: homeLabel,
        href: homeHref,
        icon: HomeIcon,
      });
    }
    
    // Limit items if maxItems is set
    if (maxItems && finalItems.length > maxItems) {
      const start = finalItems.slice(0, 1);
      const end = finalItems.slice(-(maxItems - 2));
      return [...start, { label: '...', href: undefined }, ...end];
    }
    
    return finalItems;
  }, [items, showHome, homeLabel, homeHref, maxItems]);

  // Mark last item as active
  const itemsWithActive = React.useMemo(() => {
    return breadcrumbItems.map((item, index) => ({
      ...item,
      isActive: item.isActive ?? (index === breadcrumbItems.length - 1),
    }));
  }, [breadcrumbItems]);

  // Generate structured data for SEO
  const structuredData = React.useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: itemsWithActive
        .filter(item => item.href)
        .map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.label,
          item: `${typeof window !== 'undefined' ? window.location.origin : ''}${item.href}`,
        })),
    };
  }, [itemsWithActive]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderSeparator = () => {
    if (separator) return separator;
    
    return (
      <ChevronRightIcon
        className={cn(
          'h-4 w-4 text-gray-400',
          separatorClassName
        )}
        aria-hidden="true"
      />
    );
  };

  const renderItem = (item: BreadcrumbItem & { isActive?: boolean }, index: number) => {
    const Icon = item.icon;
    
    const content = (
      <>
        {Icon && (
          <Icon 
            className={cn(
              'h-4 w-4',
              item.isActive ? 'text-primary-600' : 'text-gray-500'
            )}
            aria-hidden="true"
          />
        )}
        <span>{item.label}</span>
      </>
    );

    const baseClasses = cn(
      'inline-flex items-center gap-1.5 text-sm transition-colors',
      variant === 'bold' && 'font-semibold',
      variant === 'minimal' && 'font-normal',
      itemClassName
    );

    if (item.href && !item.isActive) {
      const linkClasses = cn(
        baseClasses,
        'text-gray-600 hover:text-primary-600',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded',
      );

      return (
        <Link
          key={index}
          href={item.href}
          className={linkClasses}
          aria-label={`Navigate to ${item.label}`}
        >
          {content}
        </Link>
      );
    }

    return (
      <span
        key={index}
        className={cn(
          baseClasses,
          item.isActive
            ? cn('text-gray-900 font-medium', activeClassName)
            : 'text-gray-500',
        )}
        aria-current={item.isActive ? 'page' : undefined}
      >
        {content}
      </span>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (itemsWithActive.length === 0) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.2 },
    },
  };

  const WrapperComponent = animated ? motion.nav : 'nav';
  const ItemWrapper = animated ? motion.li : 'li';

  return (
    <>
      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Breadcrumb Navigation */}
      <WrapperComponent
        aria-label="Breadcrumb"
        className={cn('w-full', className)}
        {...(animated && { 
          variants: containerVariants,
          initial: 'hidden',
          animate: 'visible'
        })}
      >
        <ol className="flex flex-wrap items-center gap-2">
          {itemsWithActive.map((item, index) => (
            <React.Fragment key={index}>
              <ItemWrapper
                className="flex items-center"
                {...(animated && { variants: itemVariants })}
              >
                {renderItem(item, index)}
              </ItemWrapper>
              
              {index < itemsWithActive.length - 1 && (
                <li 
                  className="flex items-center" 
                  aria-hidden="true"
                >
                  {renderSeparator()}
                </li>
              )}
            </React.Fragment>
          ))}
        </ol>
      </WrapperComponent>
    </>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Breadcrumbs;
