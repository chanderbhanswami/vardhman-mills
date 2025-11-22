/**
 * CategoryNavigation Component
 * 
 * Navigation system for categories with breadcrumbs, category tree,
 * quick links, and search functionality.
 * 
 * Features:
 * - Breadcrumb navigation
 * - Category tree view
 * - Quick category links
 * - Search with autocomplete
 * - Mobile-responsive menu
 * - Expandable subcategories
 * - Active state indication
 * - Keyboard navigation
 * - Accessibility features
 * 
 * @component
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CategoryTreeItem {
  id: string;
  name: string;
  slug: string;
  icon?: React.ComponentType<{ className?: string }>;
  productCount?: number;
  subcategories?: CategoryTreeItem[];
  isPopular?: boolean;
}

export interface Breadcrumb {
  label: string;
  href: string;
}

export interface CategoryNavigationProps {
  /** Category tree */
  categories: CategoryTreeItem[];
  /** Current breadcrumbs */
  breadcrumbs?: Breadcrumb[];
  /** Quick links */
  quickLinks?: CategoryTreeItem[];
  /** Show search */
  showSearch?: boolean;
  /** Enable mobile menu */
  enableMobile?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** On category select */
  onCategorySelect?: (category: CategoryTreeItem) => void;
  /** On search */
  onSearch?: (query: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CategoryNavigation: React.FC<CategoryNavigationProps> = ({
  categories,
  breadcrumbs = [],
  quickLinks = [],
  showSearch = true,
  enableMobile = true,
  className,
  onCategorySelect,
  onSearch,
}) => {
  const pathname = usePathname();

  // ============================================================================
  // STATE
  // ============================================================================

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchResults, setSearchResults] = useState<CategoryTreeItem[]>([]);

  // ============================================================================
  // SEARCH FUNCTIONALITY
  // ============================================================================

  const searchCategories = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: CategoryTreeItem[] = [];

    const searchTree = (items: CategoryTreeItem[]) => {
      items.forEach((item) => {
        if (item.name.toLowerCase().includes(query)) {
          results.push(item);
        }
        if (item.subcategories) {
          searchTree(item.subcategories);
        }
      });
    };

    searchTree(categories);
    return results.slice(0, 8); // Limit to 8 results
  }, [searchQuery, categories]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      setSearchResults(searchCategories);
      console.log('Search query:', value);
    },
    [searchCategories]
  );

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        onSearch?.(searchQuery);
        setSearchQuery('');
        setSearchResults([]);
        console.log('Search submitted:', searchQuery);
      }
    },
    [searchQuery, onSearch]
  );

  const handleCategoryClick = useCallback(
    (category: CategoryTreeItem) => {
      onCategorySelect?.(category);
      setShowMobileMenu(false);
      setSearchQuery('');
      setSearchResults([]);
      console.log('Category selected:', category.name);
    },
    [onCategorySelect]
  );

  const isActivePath = useCallback(
    (slug: string) => {
      return pathname?.includes(slug) || false;
    },
    [pathname]
  );

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderBreadcrumbs = () => {
    if (!breadcrumbs || breadcrumbs.length === 0) return null;

    return (
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <HomeIcon className="w-4 h-4" />
            </Link>
          </li>
          {breadcrumbs.map((crumb, index) => (
            <li key={index} className="flex items-center space-x-2">
              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
              {index === breadcrumbs.length - 1 ? (
                <span className="text-gray-900 font-medium">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  };

  const renderCategoryTree = (items: CategoryTreeItem[], level: number = 0) => {
    return (
      <ul className={cn('space-y-1', level > 0 && 'ml-4 mt-1')}>
        {items.map((item) => {
          const hasSubcategories =
            item.subcategories && item.subcategories.length > 0;
          const isExpanded = expandedCategories.has(item.id);
          const isActive = isActivePath(item.slug);
          const ItemIcon = item.icon || TagIcon;

          return (
            <li key={item.id}>
              <div
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                  'hover:bg-gray-100 cursor-pointer',
                  isActive && 'bg-primary-50 text-primary-700'
                )}
              >
                {hasSubcategories && (
                  <button
                    onClick={() => toggleCategory(item.id)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    <ChevronDownIcon
                      className={cn(
                        'w-4 h-4 transition-transform',
                        isExpanded && 'transform rotate-180'
                      )}
                    />
                  </button>
                )}

                <Link
                  href={`/categories/${item.slug}`}
                  onClick={() => handleCategoryClick(item)}
                  className="flex-1 flex items-center gap-2 min-w-0"
                >
                  <ItemIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate font-medium">{item.name}</span>
                  {item.isPopular && (
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                      Popular
                    </Badge>
                  )}
                </Link>

                {item.productCount !== undefined && (
                  <span className="text-sm text-gray-500 flex-shrink-0">
                    {item.productCount}
                  </span>
                )}
              </div>

              {hasSubcategories && isExpanded && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderCategoryTree(item.subcategories!, level + 1)}
                  </motion.div>
                </AnimatePresence>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  const renderQuickLinks = () => {
    if (!quickLinks || quickLinks.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Quick Links
        </h3>
        <div className="flex flex-wrap gap-2">
          {quickLinks.map((link) => {
            const LinkIcon = link.icon || TagIcon;
            return (
              <Link
                key={link.id}
                href={`/categories/${link.slug}`}
                onClick={() => handleCategoryClick(link)}
              >
                <Badge
                  className={cn(
                    'cursor-pointer transition-all hover:scale-105',
                    isActivePath(link.slug)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  <LinkIcon className="w-3 h-3 mr-1" />
                  {link.name}
                </Badge>
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSearch = () => {
    if (!showSearch) return null;

    return (
      <div className="mb-6 relative">
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
        </form>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto"
          >
            <div className="p-2">
              <p className="text-xs text-gray-500 px-3 py-2">
                {searchResults.length} results found
              </p>
              <ul className="space-y-1">
                {searchResults.map((result) => {
                  const ResultIcon = result.icon || TagIcon;
                  return (
                    <li key={result.id}>
                      <Link
                        href={`/categories/${result.slug}`}
                        onClick={() => handleCategoryClick(result)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <ResultIcon className="w-4 h-4 text-gray-400" />
                        <span className="flex-1 font-medium text-sm">
                          {result.name}
                        </span>
                        {result.productCount !== undefined && (
                          <span className="text-xs text-gray-500">
                            {result.productCount} products
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  const renderMobileToggle = () => {
    if (!enableMobile) return null;

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        className="lg:hidden mb-4"
      >
        {showMobileMenu ? (
          <>
            <XMarkIcon className="w-5 h-5 mr-2" />
            Close Menu
          </>
        ) : (
          <>
            <Bars3Icon className="w-5 h-5 mr-2" />
            Categories
          </>
        )}
      </Button>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={cn('py-4', className)}>
      {/* Breadcrumbs */}
      {renderBreadcrumbs()}

      {/* Mobile Toggle */}
      {renderMobileToggle()}

      {/* Navigation Content */}
      <div
        className={cn(
          'lg:block',
          enableMobile && !showMobileMenu && 'hidden'
        )}
      >
        {/* Search */}
        {renderSearch()}

        {/* Quick Links */}
        {renderQuickLinks()}

        {/* Category Tree */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            All Categories
          </h3>
          {renderCategoryTree(categories)}
        </div>
      </div>
    </div>
  );
};

export default CategoryNavigation;
