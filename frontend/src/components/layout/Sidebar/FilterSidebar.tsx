'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  StarIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

export interface FilterSidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  filters?: FilterState;
  onFilterChange?: (filters: FilterState) => void;
}

export interface FilterState {
  priceRange: [number, number];
  colors: string[];
  materials: string[];
  patterns: string[];
  brands: string[];
  ratings: number;
  availability: string[];
  discounts: boolean;
  freeShipping: boolean;
  inStock: boolean;
}

interface FilterSection {
  id: string;
  title: string;
  type: 'checkbox' | 'radio' | 'range' | 'color' | 'rating';
  options?: FilterOption[];
  expanded?: boolean;
}

interface FilterOption {
  id: string;
  label: string;
  value: string | number;
  count?: number;
  color?: string;
  popular?: boolean;
}

const colorOptions: FilterOption[] = [
  { id: 'red', label: 'Red', value: 'red', color: '#ef4444', count: 34 },
  { id: 'blue', label: 'Blue', value: 'blue', color: '#3b82f6', count: 28, popular: true },
  { id: 'green', label: 'Green', value: 'green', color: '#10b981', count: 22 },
  { id: 'yellow', label: 'Yellow', value: 'yellow', color: '#f59e0b', count: 19 },
  { id: 'purple', label: 'Purple', value: 'purple', color: '#8b5cf6', count: 16 },
  { id: 'pink', label: 'Pink', value: 'pink', color: '#ec4899', count: 24 },
  { id: 'black', label: 'Black', value: 'black', color: '#000000', count: 42, popular: true },
  { id: 'white', label: 'White', value: 'white', color: '#ffffff', count: 38, popular: true },
  { id: 'gray', label: 'Gray', value: 'gray', color: '#6b7280', count: 26 },
  { id: 'brown', label: 'Brown', value: 'brown', color: '#92400e', count: 15 },
];

const filterSections: FilterSection[] = [
  {
    id: 'price',
    title: 'Price Range',
    type: 'range',
    expanded: true,
  },
  {
    id: 'colors',
    title: 'Colors',
    type: 'color',
    options: colorOptions,
    expanded: true,
  },
  {
    id: 'materials',
    title: 'Materials',
    type: 'checkbox',
    expanded: true,
    options: [
      { id: 'cotton', label: 'Cotton', value: 'cotton', count: 156, popular: true },
      { id: 'silk', label: 'Silk', value: 'silk', count: 89 },
      { id: 'polyester', label: 'Polyester', value: 'polyester', count: 134 },
      { id: 'linen', label: 'Linen', value: 'linen', count: 67 },
      { id: 'wool', label: 'Wool', value: 'wool', count: 45 },
      { id: 'synthetic', label: 'Synthetic', value: 'synthetic', count: 78 },
    ]
  },
  {
    id: 'patterns',
    title: 'Patterns',
    type: 'checkbox',
    expanded: false,
    options: [
      { id: 'plain', label: 'Plain/Solid', value: 'plain', count: 234, popular: true },
      { id: 'printed', label: 'Printed', value: 'printed', count: 189 },
      { id: 'striped', label: 'Striped', value: 'striped', count: 78 },
      { id: 'floral', label: 'Floral', value: 'floral', count: 92, popular: true },
      { id: 'geometric', label: 'Geometric', value: 'geometric', count: 45 },
      { id: 'abstract', label: 'Abstract', value: 'abstract', count: 34 },
      { id: 'paisley', label: 'Paisley', value: 'paisley', count: 28 },
      { id: 'checkered', label: 'Checkered', value: 'checkered', count: 56 },
    ]
  },
  {
    id: 'brands',
    title: 'Brands',
    type: 'checkbox',
    expanded: false,
    options: [
      { id: 'vardhman', label: 'Vardhman Mills', value: 'vardhman', count: 145, popular: true },
      { id: 'reliance', label: 'Reliance Textiles', value: 'reliance', count: 89 },
      { id: 'arvind', label: 'Arvind Limited', value: 'arvind', count: 76 },
      { id: 'welspun', label: 'Welspun India', value: 'welspun', count: 54 },
      { id: 'trident', label: 'Trident Group', value: 'trident', count: 43 },
      { id: 'raymond', label: 'Raymond Limited', value: 'raymond', count: 38 },
    ]
  },
  {
    id: 'rating',
    title: 'Customer Rating',
    type: 'rating',
    expanded: false,
  },
  {
    id: 'availability',
    title: 'Availability',
    type: 'checkbox',
    expanded: false,
    options: [
      { id: 'in-stock', label: 'In Stock', value: 'in-stock', count: 387 },
      { id: 'fast-shipping', label: 'Fast Shipping', value: 'fast-shipping', count: 234 },
      { id: 'free-shipping', label: 'Free Shipping', value: 'free-shipping', count: 156 },
      { id: 'discounted', label: 'On Sale', value: 'discounted', count: 89 },
    ]
  },
];

const defaultFilters: FilterState = {
  priceRange: [0, 1000],
  colors: [],
  materials: [],
  patterns: [],
  brands: [],
  ratings: 0,
  availability: [],
  discounts: false,
  freeShipping: false,
  inStock: false,
};

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  className = '',
  isOpen = false,
  onClose,
  filters = defaultFilters,
  onFilterChange,
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(
    filterSections.filter(section => section.expanded).map(section => section.id)
  );
  const [priceRange, setPriceRange] = useState(filters.priceRange);
  const [selectedRating, setSelectedRating] = useState(filters.ratings);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleFilterChange = (type: keyof FilterState, value: string[] | number | boolean | [number, number]) => {
    const newFilters = { ...filters, [type]: value };
    onFilterChange?.(newFilters);
  };

  const handleCheckboxChange = (type: keyof FilterState, value: string, checked: boolean) => {
    const currentValues = filters[type] as string[];
    const newValues = checked 
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    handleFilterChange(type, newValues);
  };

  const clearAllFilters = () => {
    onFilterChange?.(defaultFilters);
    setPriceRange(defaultFilters.priceRange);
    setSelectedRating(defaultFilters.ratings);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.colors.length > 0) count++;
    if (filters.materials.length > 0) count++;
    if (filters.patterns.length > 0) count++;
    if (filters.brands.length > 0) count++;
    if (filters.availability.length > 0) count++;
    if (filters.ratings > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) count++;
    return count;
  };

  const sidebarVariants = {
    closed: {
      x: '-100%',
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30
      }
    },
    open: {
      x: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.02
      }
    }
  } as const;

  const itemVariants = {
    closed: { opacity: 0, x: -20 },
    open: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  const renderStarRating = (rating: number, isInteractive: boolean = false) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon 
            key={star} 
            className={`w-4 h-4 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300 dark:text-gray-600'
            } ${isInteractive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={isInteractive ? () => setSelectedRating(star) : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={`
          fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-900 
          shadow-xl border-r border-gray-200 dark:border-gray-700 z-50
          overflow-y-auto ${className}
        `}
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
      >
        {/* Header */}
        <motion.div 
          className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <AdjustmentsHorizontalIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Filters
              </h2>
              {getActiveFilterCount() > 0 && (
                <span className="ml-2 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-full">
                  {getActiveFilterCount()}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              aria-label="Close filters"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Clear Filters */}
          {getActiveFilterCount() > 0 && (
            <button
              onClick={clearAllFilters}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
            >
              Clear All Filters
            </button>
          )}
        </motion.div>

        {/* Filter Sections */}
        <motion.div className="p-4" variants={itemVariants}>
          {filterSections.map((section) => {
            const isExpanded = expandedSections.includes(section.id);
            
            return (
              <div key={section.id} className="mb-6">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {section.title}
                  </h3>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isExpanded ? (
                      <ChevronUpIcon className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                    )}
                  </motion.div>
                </button>

                {/* Section Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-3 overflow-hidden"
                    >
                      {/* Price Range */}
                      {section.type === 'range' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>${priceRange[0]}</span>
                            <span>${priceRange[1]}</span>
                          </div>
                          <div className="relative">
                            <input
                              type="range"
                              min="0"
                              max="1000"
                              value={priceRange[1]}
                              onChange={(e) => {
                                const newMax = parseInt(e.target.value);
                                const newRange: [number, number] = [priceRange[0], newMax];
                                setPriceRange(newRange);
                                handleFilterChange('priceRange', newRange);
                              }}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                              aria-label="Maximum price range"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={priceRange[0]}
                              onChange={(e) => {
                                const newMin = parseInt(e.target.value) || 0;
                                const newRange: [number, number] = [newMin, priceRange[1]];
                                setPriceRange(newRange);
                                handleFilterChange('priceRange', newRange);
                              }}
                              className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800"
                              placeholder="Min"
                            />
                            <span className="text-gray-500">-</span>
                            <input
                              type="number"
                              value={priceRange[1]}
                              onChange={(e) => {
                                const newMax = parseInt(e.target.value) || 1000;
                                const newRange: [number, number] = [priceRange[0], newMax];
                                setPriceRange(newRange);
                                handleFilterChange('priceRange', newRange);
                              }}
                              className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800"
                              placeholder="Max"
                            />
                          </div>
                        </div>
                      )}

                      {/* Color Swatches */}
                      {section.type === 'color' && section.options && (
                        <div className="grid grid-cols-5 gap-2">
                          {section.options.map((option) => {
                            const isSelected = filters.colors.includes(option.value as string);
                            return (
                              <motion.button
                                key={option.id}
                                onClick={() => handleCheckboxChange('colors', option.value as string, !isSelected)}
                                className={`
                                  relative w-10 h-10 rounded-full border-2 transition-all duration-200
                                  ${isSelected 
                                    ? 'border-purple-500 ring-2 ring-purple-200 dark:ring-purple-800' 
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                  }
                                `}
                                style={{ backgroundColor: option.color }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {isSelected && (
                                  <CheckIcon className={`w-4 h-4 absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
                                    option.color === '#ffffff' ? 'text-gray-800' : 'text-white'
                                  }`} />
                                )}
                                {option.popular && (
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border border-white"></div>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      )}

                      {/* Checkbox Options */}
                      {section.type === 'checkbox' && section.options && (
                        <div className="space-y-2">
                          {section.options.map((option) => {
                            const isChecked = (filters[section.id as keyof FilterState] as string[])?.includes(option.value as string);
                            return (
                              <label
                                key={option.id}
                                className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors duration-200 cursor-pointer"
                              >
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => handleCheckboxChange(
                                      section.id as keyof FilterState, 
                                      option.value as string, 
                                      e.target.checked
                                    )}
                                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                  />
                                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                    {option.label}
                                    {option.popular && (
                                      <span className="ml-1 px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 text-xs font-bold rounded">
                                        HOT
                                      </span>
                                    )}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {option.count}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {/* Rating */}
                      {section.type === 'rating' && (
                        <div className="space-y-3">
                          {[4, 3, 2, 1].map((rating) => (
                            <label
                              key={rating}
                              className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors duration-200 cursor-pointer"
                            >
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  name="rating"
                                  checked={selectedRating === rating}
                                  onChange={() => {
                                    setSelectedRating(rating);
                                    handleFilterChange('ratings', rating);
                                  }}
                                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <div className="ml-2 flex items-center">
                                  {renderStarRating(rating)}
                                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                    & up
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs text-gray-500">
                                {Math.floor(Math.random() * 50) + 10}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>

        {/* Apply Filters Button */}
        <motion.div 
          className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto"
          variants={itemVariants}
        >
          <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-200 font-medium">
            Apply Filters ({getActiveFilterCount()})
          </button>
        </motion.div>
      </motion.div>
    </>
  );
};

export default FilterSidebar;