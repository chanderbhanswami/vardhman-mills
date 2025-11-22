'use client';

import React, { forwardRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Breadcrumb variants using class-variance-authority
const breadcrumbVariants = cva(
  'flex items-center space-x-1 text-sm',
  {
    variants: {
      variant: {
        default: 'text-gray-500',
        dark: 'text-gray-400',
        colored: 'text-blue-600',
      },
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const breadcrumbItemVariants = cva(
  'transition-colors duration-200 flex items-center',
  {
    variants: {
      variant: {
        default: 'hover:text-gray-700',
        dark: 'hover:text-gray-200',
        colored: 'hover:text-blue-800',
      },
      active: {
        true: 'text-gray-900 font-medium cursor-default',
        false: 'cursor-pointer',
      },
    },
    defaultVariants: {
      variant: 'default',
      active: false,
    },
  }
);

// Types
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export interface BreadcrumbsProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof breadcrumbVariants> {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
  showHome?: boolean;
  homeHref?: string;
  homeIcon?: React.ReactNode;
  animated?: boolean;
  collapsible?: boolean;
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
}

// Separator Component
const BreadcrumbSeparator: React.FC<{
  children?: React.ReactNode;
  animated?: boolean;
}> = ({ children, animated = false }) => {
  const separator = children || <ChevronRightIcon className="h-4 w-4 text-gray-400" />;

  if (animated) {
    return (
      <motion.span
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center"
      >
        {separator}
      </motion.span>
    );
  }

  return <span className="flex items-center">{separator}</span>;
};

// Breadcrumb Item Component
const BreadcrumbItemComponent: React.FC<{
  item: BreadcrumbItem;
  index: number;
  isLast: boolean;
  variant: NonNullable<BreadcrumbsProps['variant']>;
  animated?: boolean;
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
}> = ({ item, index, isLast, variant, animated = false, onItemClick }) => {
  const handleClick = (e: React.MouseEvent) => {
    if (item.disabled) {
      e.preventDefault();
      return;
    }

    item.onClick?.(e);
    onItemClick?.(item, index);
  };

  const content = (
    <span className="flex items-center gap-1.5">
      {item.icon && (
        <span className="flex items-center">
          {item.icon}
        </span>
      )}
      {item.label}
    </span>
  );

  const itemClass = cn(
    breadcrumbItemVariants({ 
      variant, 
      active: isLast || item.disabled 
    }),
    item.disabled && 'opacity-50 cursor-not-allowed'
  );

  if (animated) {
    const motionContent = (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className={itemClass}
      >
        {content}
      </motion.div>
    );

    if (item.href && !isLast && !item.disabled) {
      return (
        <Link href={item.href} onClick={handleClick} className="contents">
          {motionContent}
        </Link>
      );
    }

    return motionContent;
  }

  if (item.href && !isLast && !item.disabled) {
    return (
      <Link href={item.href} onClick={handleClick} className={itemClass}>
        {content}
      </Link>
    );
  }

  return (
    <span className={itemClass} onClick={!isLast ? handleClick : undefined}>
      {content}
    </span>
  );
};

// Collapsed Items Indicator
const CollapsedIndicator: React.FC<{
  count: number;
  onClick: () => void;
  variant: NonNullable<BreadcrumbsProps['variant']>;
}> = ({ count, onClick, variant }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        breadcrumbItemVariants({ variant }),
        'px-2 py-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500'
      )}
      aria-label={`Show ${count} hidden items`}
    >
      ...
    </button>
  );
};

// Home Breadcrumb Component
const HomeBreadcrumb: React.FC<{
  href: string;
  icon?: React.ReactNode;
  variant: NonNullable<BreadcrumbsProps['variant']>;
  animated?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}> = ({ href, icon, variant, animated = false, onClick }) => {
  const homeIcon = icon || <HomeIcon className="h-4 w-4" />;

  const content = (
    <span className="flex items-center" aria-label="Home">
      {homeIcon}
    </span>
  );

  const itemClass = breadcrumbItemVariants({ variant });

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Link href={href} onClick={onClick} className={itemClass}>
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <Link href={href} onClick={onClick} className={itemClass}>
      {content}
    </Link>
  );
};

// Main Breadcrumbs Component
export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      items,
      separator,
      maxItems = 0,
      showHome = false,
      homeHref = '/',
      homeIcon,
      animated = false,
      collapsible = true,
      onItemClick,
      ...props
    },
    ref
  ) => {
    const [expanded, setExpanded] = React.useState(false);

    // Determine which items to show
    const shouldCollapse = collapsible && maxItems > 0 && items.length > maxItems;
    const visibleItems = React.useMemo(() => {
      if (!shouldCollapse || expanded) {
        return items;
      }

      if (items.length <= maxItems) {
        return items;
      }

      // Show first item, ellipsis, and last few items
      const firstItems = items.slice(0, 1);
      const lastItems = items.slice(-(maxItems - 1));
      
      return [...firstItems, ...lastItems];
    }, [items, maxItems, shouldCollapse, expanded]);

    const hiddenCount = items.length - visibleItems.length;

    const handleExpandClick = () => {
      setExpanded(true);
    };

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn(breadcrumbVariants({ variant, size }), className)}
        {...props}
      >
        <ol className="flex items-center space-x-1">
          {/* Home Breadcrumb */}
          {showHome && (
            <>
              <li>
                <HomeBreadcrumb
                  href={homeHref}
                  icon={homeIcon}
                  variant={variant || 'default'}
                  animated={animated}
                  onClick={() => onItemClick?.({ label: 'Home', href: homeHref }, -1)}
                />
              </li>
              {items.length > 0 && (
                <li aria-hidden="true">
                  <BreadcrumbSeparator animated={animated}>
                    {separator}
                  </BreadcrumbSeparator>
                </li>
              )}
            </>
          )}

          {/* Breadcrumb Items */}
          {visibleItems.map((item, index) => {
            const actualIndex = showHome ? index : index;
            const isLast = index === visibleItems.length - 1 && !shouldCollapse;
            const showSeparator = index < visibleItems.length - 1;

            return (
              <React.Fragment key={`${item.label}-${actualIndex}`}>
                <li>
                  <BreadcrumbItemComponent
                    item={item}
                    index={actualIndex}
                    isLast={isLast}
                    variant={variant || 'default'}
                    animated={animated}
                    onItemClick={onItemClick}
                  />
                </li>

                {/* Collapsed Indicator */}
                {shouldCollapse && !expanded && index === 0 && hiddenCount > 0 && (
                  <>
                    <li aria-hidden="true">
                      <BreadcrumbSeparator animated={animated}>
                        {separator}
                      </BreadcrumbSeparator>
                    </li>
                    <li>
                      <CollapsedIndicator
                        count={hiddenCount}
                        onClick={handleExpandClick}
                        variant={variant || 'default'}
                      />
                    </li>
                  </>
                )}

                {/* Regular Separator */}
                {showSeparator && !(shouldCollapse && !expanded && index === 0) && (
                  <li aria-hidden="true">
                    <BreadcrumbSeparator animated={animated}>
                      {separator}
                    </BreadcrumbSeparator>
                  </li>
                )}
              </React.Fragment>
            );
          })}
        </ol>
      </nav>
    );
  }
);

Breadcrumbs.displayName = 'Breadcrumbs';

// Utility function to generate breadcrumbs from pathname
export const generateBreadcrumbs = (
  pathname: string,
  labels?: Record<string, string>
): BreadcrumbItem[] => {
  const segments = pathname.split('/').filter(Boolean);
  
  return segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = labels?.[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    return {
      label,
      href,
    };
  });
};

// Breadcrumbs with auto-generation from Next.js router
export const AutoBreadcrumbs: React.FC<
  Omit<BreadcrumbsProps, 'items'> & {
    pathname: string;
    labels?: Record<string, string>;
    excludeSegments?: string[];
  }
> = ({ 
  pathname, 
  labels, 
  excludeSegments = [], 
  ...props 
}) => {
  const items = React.useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    
    return segments
      .filter(segment => !excludeSegments.includes(segment))
      .map((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/');
        const label = labels?.[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        return {
          label,
          href,
        };
      });
  }, [pathname, labels, excludeSegments]);

  return <Breadcrumbs items={items} {...props} />;
};

// Export utilities
export { BreadcrumbSeparator };

// Default export
export default Breadcrumbs;
