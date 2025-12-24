'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpDown,
  Check,
  TrendingUp,
  DollarSign,
  Star,
  Clock,
  Sparkles,
  Award,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export type ProductSortOption =
  | 'relevance'
  | 'name_asc'
  | 'name_desc'
  | 'price_asc'
  | 'price_desc'
  | 'rating_desc'
  | 'review_count_desc'
  | 'created_desc'
  | 'created_asc'
  | 'updated_desc'
  | 'popularity'
  | 'bestselling';

export interface SortOption {
  value: ProductSortOption;
  label: string;
  icon: React.ElementType;
  description?: string;
}

export interface ProductSortProps {
  value?: ProductSortOption;
  onChange: (value: ProductSortOption) => void;
  className?: string;
  disabled?: boolean;
  showLabel?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
  options?: SortOption[];
}

const defaultSortOptions: SortOption[] = [
  {
    value: 'relevance',
    label: 'Relevance',
    icon: Sparkles,
    description: 'Most relevant products first',
  },
  {
    value: 'popularity',
    label: 'Popularity',
    icon: TrendingUp,
    description: 'Most popular products',
  },
  {
    value: 'bestselling',
    label: 'Best Selling',
    icon: Award,
    description: 'Top selling products',
  },
  {
    value: 'price_asc',
    label: 'Price: Low to High',
    icon: DollarSign,
    description: 'Lowest price first',
  },
  {
    value: 'price_desc',
    label: 'Price: High to Low',
    icon: DollarSign,
    description: 'Highest price first',
  },
  {
    value: 'rating_desc',
    label: 'Highest Rated',
    icon: Star,
    description: 'Best rated products',
  },
  {
    value: 'review_count_desc',
    label: 'Most Reviewed',
    icon: Star,
    description: 'Most reviewed products',
  },
  {
    value: 'created_desc',
    label: 'Newest First',
    icon: Clock,
    description: 'Latest arrivals',
  },
  {
    value: 'created_asc',
    label: 'Oldest First',
    icon: Clock,
    description: 'Earliest additions',
  },
  {
    value: 'name_asc',
    label: 'Name: A to Z',
    icon: ArrowUpDown,
    description: 'Alphabetical order',
  },
  {
    value: 'name_desc',
    label: 'Name: Z to A',
    icon: ArrowUpDown,
    description: 'Reverse alphabetical',
  },
  {
    value: 'updated_desc',
    label: 'Recently Updated',
    icon: Clock,
    description: 'Latest updates first',
  },
];

export const ProductSort: React.FC<ProductSortProps> = ({
  value = 'relevance',
  onChange,
  className,
  disabled = false,
  showLabel = true,
  variant = 'default',
  options = defaultSortOptions,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (option: SortOption) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent, option: SortOption) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelect(option);
    }
  };

  if (variant === 'minimal') {
    return (
      <div className={cn('relative inline-block', className)} ref={dropdownRef}>
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'inline-flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
            isOpen && 'text-black'
          )}
          aria-label="Sort products"
          aria-haspopup="true"
        >
          <ArrowUpDown className="w-4 h-4" />
          <span>{selectedOption.label}</span>
          <ChevronDown
            className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
            >
              {options.map((option) => {
                const Icon = option.icon;
                const isSelected = option.value === value;

                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    onKeyDown={(e) => handleKeyDown(e, option)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors',
                      isSelected && 'bg-gray-50 text-primary-600'
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-left">{option.label}</span>
                    {isSelected && <Check className="w-4 h-4 flex-shrink-0" />}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('relative inline-block', className)} ref={dropdownRef}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="gap-2 text-gray-900 font-medium"
          aria-label="Sort products"
          aria-haspopup="true"
        >
          <ArrowUpDown className="w-4 h-4" />
          <span className="hidden sm:inline">{selectedOption.label}</span>
          <span className="sm:hidden">Sort</span>
          <ChevronDown
            className={cn('w-4 h-4 transition-transform text-gray-500', isOpen && 'rotate-180')}
          />
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
            >
              <div className="px-4 py-2 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Sort By</h3>
              </div>
              {options.map((option) => {
                const Icon = option.icon;
                const isSelected = option.value === value;

                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    onKeyDown={(e) => handleKeyDown(e, option)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors',
                      isSelected && 'bg-primary-50 text-primary-700'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 flex-shrink-0',
                        isSelected ? 'text-primary-600' : 'text-gray-400'
                      )}
                    />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{option.label}</div>
                      {option.description && (
                        <div className="text-xs text-gray-500">{option.description}</div>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 flex-shrink-0 text-primary-600" />}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('relative inline-block', className)} ref={dropdownRef}>
      <div className="flex items-center gap-2">
        {showLabel && (
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Sort by:
          </label>
        )}
        <Button
          variant="outline"
          size="md"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="gap-2 min-w-[200px] justify-between text-gray-900"
          aria-label="Sort products"
          aria-haspopup="true"
        >
          <div className="flex items-center gap-2">
            {React.createElement(selectedOption.icon, { className: 'w-4 h-4 text-gray-900' })}
            <span className="text-gray-900 font-medium">{selectedOption.label}</span>
          </div>
          <ChevronDown
            className={cn('w-4 h-4 transition-transform text-gray-500', isOpen && 'rotate-180')}
          />
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Sort Products</h3>
              <p className="text-xs text-gray-500 mt-1">Choose how to sort the products</p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {options.map((option) => {
                const Icon = option.icon;
                const isSelected = option.value === value;

                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    onKeyDown={(e) => handleKeyDown(e, option)}
                    className={cn(
                      'w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group',
                      isSelected && 'bg-primary-50'
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                        isSelected
                          ? 'bg-primary-100 text-primary-600'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div
                        className={cn(
                          'font-medium text-sm',
                          isSelected ? 'text-primary-700' : 'text-gray-900'
                        )}
                      >
                        {option.label}
                      </div>
                      {option.description && (
                        <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>
                      )}
                    </div>
                    {isSelected && (
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductSort;