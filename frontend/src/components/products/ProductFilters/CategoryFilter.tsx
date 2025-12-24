'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CategoryOption {
  id: string;
  name: string;
  count: number;
  parentId?: string | null;
  children?: CategoryOption[];
  level: number;
}

export interface CategoryFilterProps {
  categories: CategoryOption[];
  selectedCategoryIds: string[];
  onCategoryChange: (categoryIds: string[]) => void;
  multiSelect?: boolean;
  className?: string;
  disabled?: boolean;
  showHierarchy?: boolean;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategoryIds,
  onCategoryChange,
  multiSelect = true,
  className,
  disabled = false,
  showHierarchy = true,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Build category tree if flat list provided
  const categoryTree = useMemo(() => {
    if (categories.some(cat => cat.children && cat.children.length > 0)) {
      return categories;
    }

    const map = new Map<string, CategoryOption>();
    const roots: CategoryOption[] = [];

    categories.forEach(cat => {
      map.set(cat.id, { ...cat, children: [] });
    });

    categories.forEach(cat => {
      const node = map.get(cat.id)!;
      if (cat.parentId && map.has(cat.parentId)) {
        map.get(cat.parentId)!.children!.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [categories]);

  const handleCategoryToggle = (categoryId: string) => {
    if (disabled) return;

    if (multiSelect) {
      if (selectedCategoryIds.includes(categoryId)) {
        onCategoryChange(selectedCategoryIds.filter(id => id !== categoryId));
      } else {
        onCategoryChange([...selectedCategoryIds, categoryId]);
      }
    } else {
      onCategoryChange([categoryId]);
    }
  };

  const handleExpandToggle = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleClearAll = () => {
    if (disabled) return;
    onCategoryChange([]);
  };

  const renderCategory = (category: CategoryOption, depth = 0) => {
    const isSelected = selectedCategoryIds.includes(category.id);
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <motion.div
        key={category.id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        className="space-y-1"
      >
        {/* Dynamic padding based on category depth requires inline style */}
        {/* @typescript-eslint/no-explicit-any */}
        <div
          className={cn(
            'flex items-center gap-2 p-2.5 rounded-lg transition-colors',
            isSelected ? 'bg-primary-50' : 'hover:bg-gray-50',
            disabled && 'opacity-50 cursor-not-allowed',
            category.count === 0 && 'opacity-40'
          )}
          style={{ paddingLeft: `${depth * 1.5 + 0.625}rem` } as React.CSSProperties}
        >
          {hasChildren && showHierarchy && (
            <button
              onClick={() => handleExpandToggle(category.id)}
              disabled={disabled}
              className="p-0.5 hover:bg-gray-200 rounded transition-colors"
              aria-label={isExpanded ? 'Collapse category' : 'Expand category'}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              )}
            </button>
          )}

          <label
            className={cn(
              'flex items-center justify-between flex-1 cursor-pointer',
              disabled && 'cursor-not-allowed'
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <input
                type={multiSelect ? 'checkbox' : 'radio'}
                checked={isSelected}
                onChange={() => handleCategoryToggle(category.id)}
                disabled={disabled || category.count === 0}
                className={cn(
                  'w-4 h-4 border-gray-300 text-primary-600 flex-shrink-0',
                  multiSelect ? 'rounded' : 'rounded-full',
                  'focus:ring-2 focus:ring-primary-500',
                  'disabled:cursor-not-allowed'
                )}
              />

              <span
                className={cn(
                  'text-sm truncate',
                  isSelected ? 'font-medium text-gray-900' : 'text-gray-700'
                )}
                title={category.name}
              >
                {category.name}
              </span>
            </div>

            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
              ({category.count})
            </span>
          </label>
        </div>

        {hasChildren && showHierarchy && (
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {category.children!.map(child => renderCategory(child, depth + 1))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    );
  };

  const selectedCount = selectedCategoryIds.length;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Categories</h3>
        {multiSelect && selectedCount > 0 && (
          <button
            onClick={handleClearAll}
            disabled={disabled}
            className="text-xs font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50 transition-colors"
          >
            Clear ({selectedCount})
          </button>
        )}
      </div>

      <div className="space-y-1 max-h-96 overflow-y-auto custom-scrollbar pr-2">
        <AnimatePresence mode="popLayout">
          {categoryTree.map(category => renderCategory(category))}
        </AnimatePresence>
      </div>

      {categoryTree.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No categories available</p>
        </div>
      )}

      {multiSelect && categoryTree.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={() => {
              const allIds = categories.map(cat => cat.id);
              onCategoryChange(allIds);
            }}
            disabled={disabled || selectedCount === categories.length}
            className="flex-1 py-2 text-sm text-primary-600 hover:text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-50 disabled:opacity-50"
          >
            Select All
          </button>
          <button
            onClick={() => {
              const rootIds = categoryTree.map(cat => cat.id);
              onCategoryChange(rootIds);
            }}
            disabled={disabled}
            className="flex-1 py-2 text-sm text-primary-600 hover:text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-50 disabled:opacity-50"
          >
            Root Only
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
