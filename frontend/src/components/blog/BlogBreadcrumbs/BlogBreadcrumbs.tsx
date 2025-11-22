'use client';

import React from 'react';
import { ChevronRight, Home, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tooltip, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Types
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  disabled?: boolean;
  meta?: {
    description?: string;
    category?: string;
    publishedAt?: string;
  };
}

export interface BlogBreadcrumbsProps {
  items: BreadcrumbItem[];
  variant?: 'default' | 'compact' | 'minimal' | 'pills' | 'arrows';
  size?: 'sm' | 'md' | 'lg';
  separator?: 'chevron' | 'slash' | 'dash' | 'arrow' | 'custom';
  customSeparator?: React.ReactNode;
  showHome?: boolean;
  showBack?: boolean;
  maxItems?: number;
  className?: string;
  itemClassName?: string;
  separatorClassName?: string;
  homeHref?: string;
  homeLabel?: string;
  backLabel?: string;
  collapseFrom?: number;
  showTooltips?: boolean;
  enableHover?: boolean;
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
  onBackClick?: () => void;
  loading?: boolean;
  ariaLabel?: string;
  structured?: boolean; // For structured data/SEO
}

// Size configurations
const sizeConfig = {
  sm: {
    text: 'text-xs',
    padding: 'px-2 py-1',
    gap: 'gap-1',
    iconSize: 14
  },
  md: {
    text: 'text-sm',
    padding: 'px-3 py-1.5',
    gap: 'gap-2',
    iconSize: 16
  },
  lg: {
    text: 'text-base',
    padding: 'px-4 py-2',
    gap: 'gap-3',
    iconSize: 18
  }
};

// Separator components
const separators = {
  chevron: (size: number) => <ChevronRight size={size} className="text-gray-400" />,
  slash: () => <span className="text-gray-400">/</span>,
  dash: () => <span className="text-gray-400">-</span>,
  arrow: () => <span className="text-gray-400">→</span>,
  custom: (custom: React.ReactNode) => custom
};

export const BlogBreadcrumbs: React.FC<BlogBreadcrumbsProps> = ({
  items,
  variant = 'default',
  size = 'md',
  separator = 'chevron',
  customSeparator,
  showHome = true,
  showBack = false,
  maxItems = 5,
  className,
  itemClassName,
  separatorClassName,
  homeHref = '/',
  homeLabel = 'Home',
  backLabel = 'Back',
  collapseFrom = 3,
  showTooltips = false,
  enableHover = true,
  onItemClick,
  onBackClick,
  loading = false,
  ariaLabel = 'Breadcrumb navigation',
  structured = true
}) => {
  const router = useRouter();
  const config = sizeConfig[size];

  // Handle back navigation
  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  // Handle item click
  const handleItemClick = (item: BreadcrumbItem, index: number) => {
    if (onItemClick) {
      onItemClick(item, index);
    }
  };

  // Prepare items with home
  const allItems = React.useMemo(() => {
    const result: BreadcrumbItem[] = [];
    
    if (showHome) {
      result.push({
        label: homeLabel,
        href: homeHref,
        icon: <Home size={config.iconSize} />
      });
    }
    
    return [...result, ...items];
  }, [items, showHome, homeLabel, homeHref, config.iconSize]);

  // Handle item collapse
  const displayItems = React.useMemo(() => {
    if (allItems.length <= maxItems) {
      return allItems;
    }

    // Show first item, ellipsis, and last few items
    const start = allItems.slice(0, collapseFrom);
    const end = allItems.slice(-(maxItems - collapseFrom - 1));
    
    return [
      ...start,
      { label: '...', disabled: true },
      ...end
    ];
  }, [allItems, maxItems, collapseFrom]);

  // Get separator component
  const getSeparator = () => {
    if (separator === 'custom' && customSeparator) {
      return customSeparator;
    }
    return separators[separator](config.iconSize);
  };

  // Breadcrumb item component
  const BreadcrumbItem: React.FC<{ 
    item: BreadcrumbItem; 
    index: number; 
    isLast: boolean;
  }> = ({ item, index, isLast }) => {
    const isEllipsis = item.label === '...';
    const hasHref = item.href && !item.disabled && !item.isActive;
    
    const content = (
      <div
        className={cn(
          'flex items-center',
          config.gap,
          config.text,
          !isLast && !isEllipsis && 'transition-colors',
          enableHover && hasHref && 'hover:text-blue-600 dark:hover:text-blue-400',
          item.isActive && 'text-blue-600 dark:text-blue-400 font-medium',
          item.disabled && 'text-gray-400 cursor-default',
          !hasHref && !item.disabled && !item.isActive && 'text-gray-700 dark:text-gray-300',
          itemClassName
        )}
        onClick={() => !item.disabled && handleItemClick(item, index)}
      >
        {item.icon && (
          <span className="flex-shrink-0">
            {item.icon}
          </span>
        )}
        <span className={cn(
          'truncate',
          isEllipsis && 'cursor-default select-none'
        )}>
          {item.label}
        </span>
      </div>
    );

    // Handle ellipsis with dropdown
    if (isEllipsis) {
      const hiddenItems = allItems.slice(collapseFrom, -(maxItems - collapseFrom - 1));
      
      return (
        <TooltipProvider>
          <Tooltip content={
            <div className="space-y-1 max-w-xs">
              {hiddenItems.map((hiddenItem, hiddenIndex) => (
                <div key={hiddenIndex} className="text-xs">
                  {hiddenItem.label}
                </div>
              ))}
            </div>
          }>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn('h-auto p-1', config.text)}
              >
                <MoreHorizontal size={config.iconSize} />
              </Button>
            </TooltipTrigger>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // Wrap with Link if href exists
    if (hasHref) {
      return (
        <Link href={item.href!} className="hover:no-underline">
          {showTooltips && item.meta?.description ? (
            <TooltipProvider>
              <Tooltip content={item.meta.description}>
                <TooltipTrigger asChild>
                  <span className="cursor-pointer">{content}</span>
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>
          ) : (
            content
          )}
        </Link>
      );
    }

    // Show tooltip if available
    if (showTooltips && item.meta?.description) {
      return (
        <TooltipProvider>
          <Tooltip content={item.meta.description}>
            <TooltipTrigger asChild>
              <span>{content}</span>
            </TooltipTrigger>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return content;
  };

  // Loading state
  if (loading) {
    return (
      <nav className={cn('flex items-center', config.gap, className)} aria-label={ariaLabel}>
        <div className="flex items-center space-x-2">
          {[...Array(3)].map((_, i) => (
            <React.Fragment key={i}>
              <div className={cn('bg-gray-200 dark:bg-gray-700 rounded', 
                i === 0 ? 'w-12 h-4' : i === 1 ? 'w-16 h-4' : 'w-20 h-4'
              )} />
              {i < 2 && (
                <ChevronRight size={config.iconSize} className="text-gray-300" />
              )}
            </React.Fragment>
          ))}
        </div>
      </nav>
    );
  }

  // Empty state
  if (displayItems.length === 0) {
    return null;
  }

  // Render based on variant
  const renderBreadcrumbs = () => {
    switch (variant) {
      case 'pills':
        return (
          <div className={cn('flex items-center flex-wrap', config.gap)}>
            {displayItems.map((item, index) => {
              const isLast = index === displayItems.length - 1;
              return (
                <React.Fragment key={index}>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      'rounded-full border',
                      config.padding,
                      item.isActive 
                        ? 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                        : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                    )}
                  >
                    <BreadcrumbItem item={item} index={index} isLast={isLast} />
                  </motion.div>
                  
                  {!isLast && (
                    <span className={cn('flex-shrink-0', separatorClassName)}>
                      {getSeparator()}
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        );

      case 'arrows':
        return (
          <div className="flex items-center">
            {displayItems.map((item, index) => {
              const isLast = index === displayItems.length - 1;
              return (
                <React.Fragment key={index}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      'relative flex items-center',
                      config.padding,
                      config.text,
                      !isLast && 'pr-8',
                      item.isActive 
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-gray-800',
                      index === 0 && 'rounded-l',
                      isLast && 'rounded-r'
                    )}
                    style={{
                      clipPath: !isLast 
                        ? 'polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%, 20px 50%)'
                        : index > 0 
                        ? 'polygon(20px 0, 100% 0, 100% 100%, 20px 100%, 0 50%)'
                        : undefined
                    }}
                  >
                    <BreadcrumbItem item={item} index={index} isLast={isLast} />
                  </motion.div>
                </React.Fragment>
              );
            })}
          </div>
        );

      case 'compact':
        return (
          <div className={cn('flex items-center', config.gap)}>
            {displayItems.length > 1 && (
              <>
                <BreadcrumbItem 
                  item={displayItems[0]} 
                  index={0} 
                  isLast={false} 
                />
                <span className={separatorClassName}>
                  {getSeparator()}
                </span>
                <span className="text-gray-400">...</span>
                <span className={separatorClassName}>
                  {getSeparator()}
                </span>
                <BreadcrumbItem 
                  item={displayItems[displayItems.length - 1]} 
                  index={displayItems.length - 1} 
                  isLast={true} 
                />
              </>
            )}
          </div>
        );

      case 'minimal':
        const lastItem = displayItems[displayItems.length - 1];
        return (
          <div className={cn('flex items-center', config.gap)}>
            <BreadcrumbItem 
              item={lastItem} 
              index={displayItems.length - 1} 
              isLast={true} 
            />
          </div>
        );

      default:
        return (
          <div className={cn('flex items-center flex-wrap', config.gap)}>
            {displayItems.map((item, index) => {
              const isLast = index === displayItems.length - 1;
              return (
                <React.Fragment key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <BreadcrumbItem item={item} index={index} isLast={isLast} />
                  </motion.div>
                  
                  {!isLast && (
                    <span className={cn('flex-shrink-0 mx-1', separatorClassName)}>
                      {getSeparator()}
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        );
    }
  };

  return (
    <nav 
      className={cn('flex items-center justify-between', className)} 
      aria-label={ariaLabel}
    >
      <div className="flex items-center min-w-0 flex-1">
        {showBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className={cn('mr-2 flex-shrink-0', config.text)}
          >
            <ArrowLeft size={config.iconSize} className="mr-1" />
            {backLabel}
          </Button>
        )}
        
        {renderBreadcrumbs()}
      </div>

      {/* Structured data for SEO */}
      {structured && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": allItems
                .filter(item => item.href)
                .map((item, index) => ({
                  "@type": "ListItem",
                  "position": index + 1,
                  "name": item.label,
                  "item": item.href
                }))
            })
          }}
        />
      )}
    </nav>
  );
};

// Utility components
export const SimpleBreadcrumbs: React.FC<{
  items: BreadcrumbItem[];
  className?: string;
}> = ({ items, className }) => (
  <BlogBreadcrumbs
    items={items}
    variant="minimal"
    showHome={false}
    className={className}
  />
);

export const CompactBreadcrumbs: React.FC<{
  items: BreadcrumbItem[];
  className?: string;
}> = ({ items, className }) => (
  <BlogBreadcrumbs
    items={items}
    variant="compact"
    maxItems={3}
    className={className}
  />
);

export const PillBreadcrumbs: React.FC<{
  items: BreadcrumbItem[];
  className?: string;
}> = ({ items, className }) => (
  <BlogBreadcrumbs
    items={items}
    variant="pills"
    separator="chevron"
    className={className}
  />
);

export const ArrowBreadcrumbs: React.FC<{
  items: BreadcrumbItem[];
  className?: string;
}> = ({ items, className }) => (
  <BlogBreadcrumbs
    items={items}
    variant="arrows"
    showHome={true}
    className={className}
  />
);

// Hook for automatic breadcrumb generation
export const useBlogBreadcrumbs = (pathname: string, postData?: {
  slug?: string;
  title?: string;
  excerpt?: string;
  category?: { name?: string };
  publishedAt?: string;
}) => {
  return React.useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [];

    // Add blog root
    if (segments[0] === 'blog') {
      items.push({
        label: 'Blog',
        href: '/blog'
      });

      // Add category if exists
      if (segments[1] && segments[1] !== postData?.slug) {
        items.push({
          label: segments[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          href: `/blog/${segments[1]}`
        });
      }

      // Add current post
      if (postData) {
        items.push({
          label: postData.title || 'Post',
          isActive: true,
          meta: {
            description: postData.excerpt,
            category: postData.category?.name,
            publishedAt: postData.publishedAt
          }
        });
      }
    }

    return items;
  }, [pathname, postData]);
};

export default BlogBreadcrumbs;
