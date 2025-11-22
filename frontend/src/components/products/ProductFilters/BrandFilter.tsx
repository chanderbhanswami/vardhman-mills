'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface BrandOption {
  id: string;
  name: string;
  count: number;
  logo?: string;
}

export interface BrandFilterProps {
  brands: BrandOption[];
  selectedBrandIds: string[];
  onBrandChange: (brandIds: string[]) => void;
  maxVisible?: number;
  className?: string;
  disabled?: boolean;
  showSearch?: boolean;
}

const BrandFilter: React.FC<BrandFilterProps> = ({
  brands,
  selectedBrandIds,
  onBrandChange,
  maxVisible = 5,
  className,
  disabled = false,
  showSearch = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredBrands = useMemo(() => {
    if (!searchQuery) return brands;
    const query = searchQuery.toLowerCase();
    return brands.filter(brand => brand.name.toLowerCase().includes(query));
  }, [brands, searchQuery]);

  const visibleBrands = isExpanded ? filteredBrands : filteredBrands.slice(0, maxVisible);
  const hasMore = filteredBrands.length > maxVisible;

  const handleBrandToggle = (brandId: string) => {
    if (disabled) return;
    
    if (selectedBrandIds.includes(brandId)) {
      onBrandChange(selectedBrandIds.filter(id => id !== brandId));
    } else {
      onBrandChange([...selectedBrandIds, brandId]);
    }
  };

  const handleSelectAll = () => {
    if (disabled) return;
    onBrandChange(filteredBrands.map(brand => brand.id));
  };

  const handleClearAll = () => {
    if (disabled) return;
    onBrandChange([]);
  };

  const selectedCount = selectedBrandIds.length;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Brand</h3>
        {selectedCount > 0 && (
          <button
            onClick={handleClearAll}
            disabled={disabled}
            className="text-xs text-primary-600 hover:text-primary-700 disabled:opacity-50"
          >
            Clear ({selectedCount})
          </button>
        )}
      </div>

      {showSearch && brands.length > 5 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brands..."
            disabled={disabled}
            className={cn(
              'w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg',
              'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              aria-label="Clear search"
              title="Clear search"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      )}

      {filteredBrands.length > 0 ? (
        <>
          <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {visibleBrands.map((brand, index) => {
                const isSelected = selectedBrandIds.includes(brand.id);
                
                return (
                  <motion.label
                    key={brand.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.03 }}
                    className={cn(
                      'flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors',
                      isSelected ? 'bg-primary-50' : 'hover:bg-gray-50',
                      disabled && 'opacity-50 cursor-not-allowed',
                      brand.count === 0 && 'opacity-40'
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleBrandToggle(brand.id)}
                        disabled={disabled || brand.count === 0}
                        className={cn(
                          'w-4 h-4 rounded border-gray-300 text-primary-600',
                          'focus:ring-2 focus:ring-primary-500',
                          'disabled:cursor-not-allowed'
                        )}
                        aria-label={`Select ${brand.name} brand`}
                        title={brand.name}
                      />
                      
                      {brand.logo && (
                        <div className="relative w-6 h-6 flex-shrink-0">
                          <Image
                            src={brand.logo}
                            alt={brand.name}
                            fill
                            className="object-contain rounded"
                          />
                        </div>
                      )}
                      
                      <span className={cn(
                        'text-sm',
                        isSelected ? 'font-medium text-gray-900' : 'text-gray-700'
                      )}>
                        {brand.name}
                      </span>
                    </div>

                    <span className="text-xs text-gray-500 ml-2">
                      ({brand.count})
                    </span>
                  </motion.label>
                );
              })}
            </AnimatePresence>
          </div>

          {hasMore && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              disabled={disabled}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
            >
              {isExpanded ? (
                <>
                  <span>Show Less</span>
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span>Show All ({filteredBrands.length})</span>
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          )}

          {filteredBrands.length > 1 && selectedCount < filteredBrands.length && (
            <button
              onClick={handleSelectAll}
              disabled={disabled}
              className="w-full py-2 text-sm text-primary-600 hover:text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-50 disabled:opacity-50"
            >
              Select All Visible
            </button>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No brands found</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-primary-600 hover:text-primary-700 text-sm"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BrandFilter;
