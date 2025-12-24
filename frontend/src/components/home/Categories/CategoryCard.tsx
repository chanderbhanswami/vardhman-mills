/**
 * CategoryCard Component
 * 
 * Individual card component for displaying product categories with
 * comprehensive features including hover effects, animations, and
 * interactive elements.
 * 
 * Features:
 * - Category image with hover zoom
 * - Product count display
 * - Subcategory preview
 * - Badge system (Hot, New, Featured)
 * - Icon overlay
 * - Gradient backgrounds
 * - Click animations
 * - Loading states
 * - Responsive design
 * - Analytics tracking
 * - Custom themes
 * - Accessibility features
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  FireIcon,
  StarIcon,
  ArrowRightIcon,
  TagIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { FireIcon as FireSolid, StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/utils';
import type { ImageAsset } from '@/types/product.types';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract image URL from string or ImageAsset object
 */
const getImageUrl = (image: string | ImageAsset | undefined): string => {
  if (!image) return '/images/placeholder-category.jpg';
  if (typeof image === 'string') return image;
  return image.url || '/images/placeholder-category.jpg';
};

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string | ImageAsset;
  icon?: React.ComponentType<{ className?: string }> | string;
  productCount: number;
  subcategories?: Array<{
    id: string;
    name: string;
    slug: string;
    productCount: number;
  }>;
  children?: Array<{
    id: string;
    name: string;
    slug: string;
    productCount: number;
  }>;
  isHot?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  color?: string;
  theme?: 'light' | 'dark' | 'gradient';
}

export interface CategoryCardProps {
  /** Category data */
  category: Category;
  /** Card size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Card variant style */
  variant?: 'default' | 'featured' | 'compact';
  /** Display layout */
  layout?: 'horizontal' | 'vertical';
  /** Show subcategories */
  showSubcategories?: boolean;
  /** Show product count */
  showCount?: boolean;
  /** Show badges */
  showBadges?: boolean;
  /** Enable hover effects */
  enableHover?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** On category click */
  onCategoryClick?: (category: Category) => void;
  /** Alternative onClick handler */
  onClick?: (category: Category) => void;
  /** On subcategory click */
  onSubcategoryClick?: (subcategorySlug: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  size = 'md',
  layout = 'vertical',
  showSubcategories = true,
  showCount = true,
  showBadges = true,
  enableHover = true,
  className,
  onCategoryClick,
  onSubcategoryClick,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const sizeClasses = useMemo(() => {
    switch (size) {
      case 'sm':
        return {
          container: 'h-48',
          title: 'text-base',
          count: 'text-xs',
          icon: 'w-8 h-8',
        };
      case 'lg':
        return {
          container: 'h-96',
          title: 'text-2xl',
          count: 'text-base',
          icon: 'w-16 h-16',
        };
      default:
        return {
          container: 'h-72',
          title: 'text-xl',
          count: 'text-sm',
          icon: 'w-12 h-12',
        };
    }
  }, [size]);

  const hasSubcategories = (category.subcategories && category.subcategories.length > 0) || (category.children && category.children.length > 0);

  const displaySubcategories = useMemo(() => {
    if (!hasSubcategories) return [];
    const subs = category.subcategories || category.children || [];
    return subs.slice(0, 3);
  }, [category.subcategories, category.children, hasSubcategories]);

  const CategoryIcon = (typeof category.icon === 'function' || typeof category.icon === 'object') && category.icon !== null
    ? category.icon as React.ComponentType<{ className?: string }>
    : TagIcon;

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCategoryClick = useCallback(
    (e: React.MouseEvent) => {
      // Prevent navigation if clicking on subcategory links
      if ((e.target as HTMLElement).closest('[data-subcategory]')) {
        return;
      }
      onCategoryClick?.(category);
      console.log('Category clicked:', category.name, 'ID:', category.id);
    },
    [category, onCategoryClick]
  );

  const handleSubcategoryClick = useCallback(
    (e: React.MouseEvent, subcategorySlug: string) => {
      e.preventDefault();
      e.stopPropagation();
      onSubcategoryClick?.(subcategorySlug);
      console.log('Subcategory clicked:', subcategorySlug);
    },
    [onSubcategoryClick]
  );

  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true);
    console.log('Category image loaded:', category.name);
    console.log('Icons available:', { FireIcon, StarIcon });
  }, [category.name]);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderBadges = () => {
    if (!showBadges) return null;

    return (
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
        {category.isFeatured && (
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
            <StarSolid className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        )}
        {category.isHot && (
          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
            <FireSolid className="w-3 h-3 mr-1 animate-pulse" />
            Hot
          </Badge>
        )}
        {category.isNew && (
          <Badge className="bg-blue-600 text-white shadow-lg">
            <SparklesIcon className="w-3 h-3 mr-1" />
            New
          </Badge>
        )}
      </div>
    );
  };

  const renderIcon = () => {
    return (
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: isHovered ? 1.1 : 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className={cn(
          'absolute top-4 left-4 z-20',
          'bg-background/90 backdrop-blur-sm rounded-full p-3 shadow-lg'
        )}
        style={{
          backgroundColor: category.color ? `${category.color}20` : undefined,
        }}
      >
        <CategoryIcon
          className={sizeClasses.icon}
          style={{ color: category.color }}
        />
      </motion.div>
    );
  };

  const renderOverlay = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isHovered ? 1 : 0 }}
      className={cn(
        'absolute inset-0 z-10',
        category.theme === 'dark'
          ? 'bg-gradient-to-t from-black/80 via-black/40 to-transparent'
          : category.theme === 'gradient'
            ? 'bg-gradient-to-t from-purple-900/80 via-pink-800/40 to-transparent'
            : 'bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent'
      )}
    />
  );

  const renderSubcategories = () => {
    if (!showSubcategories || !hasSubcategories) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
        className="absolute bottom-20 left-4 right-4 z-20 space-y-2"
      >
        {displaySubcategories.map((subcategory) => (
          <Link
            key={subcategory.id}
            href={`/categories/${category.slug}/${subcategory.slug}`}
            onClick={(e) => handleSubcategoryClick(e, subcategory.slug)}
            data-subcategory="true"
            className={cn(
              'block px-3 py-2 rounded-lg',
              'bg-white/90 backdrop-blur-sm',
              'hover:bg-white hover:shadow-md',
              'transition-all duration-200',
              'text-sm text-foreground font-medium'
            )}
          >
            <div className="flex items-center justify-between">
              <span>{subcategory.name}</span>
              {showCount && (
                <span className="text-xs text-muted-foreground">
                  {subcategory.productCount}
                </span>
              )}
            </div>
          </Link>
        ))}
        {(category.subcategories?.length || category.children?.length || 0) > 3 && (
          <div className="text-center text-xs text-white">
            +{(category.subcategories?.length || category.children?.length || 0) - 3} more
          </div>
        )}
      </motion.div>
    );
  };

  const renderContent = () => (
    <div className="absolute bottom-0 left-0 right-0 z-20 p-3">
      {/* Product Count */}
      {showCount && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 mb-2"
        >
          <ShoppingBagIcon className="w-4 h-4 text-gray-700 group-hover:text-white transition-colors duration-300" />
          <span className={cn('text-gray-700 group-hover:text-white font-medium transition-colors duration-300', sizeClasses.count)}>
            {(category.productCount || 0).toLocaleString()} products
          </span>
        </motion.div>
      )}

      {/* Category Name */}
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={cn(
          'font-bold text-gray-900 group-hover:text-white mb-2 line-clamp-2 transition-colors duration-300',
          sizeClasses.title
        )}
      >
        {category.name}
      </motion.h3>

      {/* Description */}
      {category.description && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-gray-600 group-hover:text-white line-clamp-2 mb-3 transition-colors duration-300"
        >
          {category.description}
        </motion.p>
      )}

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          size="sm"
          className="bg-background text-foreground hover:bg-accent group"
        >
          Explore
          <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (layout === 'horizontal') {
    return (
      <motion.div
        whileHover={enableHover ? { y: -5 } : undefined}
        transition={{ duration: 0.3 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn('group cursor-pointer', className)}
      >
        <Card className="overflow-hidden border-2 hover:border-primary hover:shadow-lg transition-all duration-300">
          <CardContent className="p-0">
            <Link
              href={`/categories/${category.slug}`}
              onClick={handleCategoryClick}
            >
              <div className="flex items-center gap-4 p-3">
                {/* Image */}
                <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={getImageUrl(category.image)}
                    alt={category.name}
                    fill
                    sizes="96px"
                    className={cn(
                      'object-cover transition-all duration-500',
                      isImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110',
                      enableHover && 'group-hover:scale-110'
                    )}
                    onLoad={handleImageLoad}
                  />
                  {!isImageLoaded && (
                    <div className="absolute inset-0 bg-muted animate-pulse" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                    {category.name}
                  </h3>
                  {showCount && (
                    <p className="text-sm text-muted-foreground">
                      {(category.productCount || 0).toLocaleString()} products
                    </p>
                  )}
                  {category.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                      {category.description}
                    </p>
                  )}
                </div>

                {/* Arrow */}
                <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={enableHover ? { y: -8, scale: 1.02 } : undefined}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn('group cursor-pointer', className)}
    >
      <Card className="overflow-hidden border-2 hover:border-primary hover:shadow-lg transition-all duration-300">
        <CardContent className="p-0">
          <Link
            href={`/categories/${category.slug}`}
            onClick={handleCategoryClick}
          >
            <div className={cn('relative', sizeClasses.container)}>
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={getImageUrl(category.image)}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={cn(
                    'object-cover transition-all duration-700',
                    isImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110',
                    enableHover && 'group-hover:scale-110'
                  )}
                  onLoad={handleImageLoad}
                />
                {!isImageLoaded && (
                  <div className="absolute inset-0 bg-muted animate-pulse" />
                )}
              </div>

              {/* Gradient Overlay */}
              {renderOverlay()}

              {/* Icon */}
              {renderIcon()}

              {/* Badges */}
              {renderBadges()}

              {/* Subcategories */}
              {renderSubcategories()}

              {/* Content */}
              {renderContent()}
            </div>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CategoryCard;
