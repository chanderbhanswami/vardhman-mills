'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRightIcon,
  XMarkIcon,
  TagIcon,
  SparklesIcon,
  SwatchIcon,
  Squares2X2Icon,
  StarIcon,
  FireIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

export interface CategorySidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  selectedCategory?: string;
  onCategorySelect?: (category: string) => void;
}

interface Category {
  id: string;
  name: string;
  href: string;
  icon?: React.ElementType;
  count?: number;
  subcategories?: Subcategory[];
  isNew?: boolean;
  isFeatured?: boolean;
  hasDiscount?: boolean;
}

interface Subcategory {
  id: string;
  name: string;
  href: string;
  count?: number;
  isPopular?: boolean;
}

const categories: Category[] = [
  {
    id: 'cotton',
    name: 'Cotton Fabrics',
    href: '/category/cotton',
    icon: SwatchIcon,
    count: 156,
    isFeatured: true,
    subcategories: [
      { id: 'cotton-plain', name: 'Plain Cotton', href: '/category/cotton/plain', count: 45, isPopular: true },
      { id: 'cotton-printed', name: 'Printed Cotton', href: '/category/cotton/printed', count: 38 },
      { id: 'cotton-organic', name: 'Organic Cotton', href: '/category/cotton/organic', count: 22, isPopular: true },
      { id: 'cotton-denim', name: 'Denim Cotton', href: '/category/cotton/denim', count: 31 },
      { id: 'cotton-canvas', name: 'Cotton Canvas', href: '/category/cotton/canvas', count: 20 },
    ]
  },
  {
    id: 'silk',
    name: 'Silk Fabrics',
    href: '/category/silk',
    icon: SparklesIcon,
    count: 89,
    isFeatured: true,
    subcategories: [
      { id: 'silk-pure', name: 'Pure Silk', href: '/category/silk/pure', count: 25, isPopular: true },
      { id: 'silk-art', name: 'Art Silk', href: '/category/silk/art', count: 32 },
      { id: 'silk-chiffon', name: 'Silk Chiffon', href: '/category/silk/chiffon', count: 18 },
      { id: 'silk-georgette', name: 'Silk Georgette', href: '/category/silk/georgette', count: 14 },
    ]
  },
  {
    id: 'polyester',
    name: 'Polyester Fabrics',
    href: '/category/polyester',
    icon: Squares2X2Icon,
    count: 134,
    subcategories: [
      { id: 'polyester-satin', name: 'Polyester Satin', href: '/category/polyester/satin', count: 28 },
      { id: 'polyester-crepe', name: 'Polyester Crepe', href: '/category/polyester/crepe', count: 35, isPopular: true },
      { id: 'polyester-chiffon', name: 'Polyester Chiffon', href: '/category/polyester/chiffon', count: 24 },
      { id: 'polyester-taffeta', name: 'Polyester Taffeta', href: '/category/polyester/taffeta', count: 19 },
      { id: 'polyester-jersey', name: 'Polyester Jersey', href: '/category/polyester/jersey', count: 28 },
    ]
  },
  {
    id: 'linen',
    name: 'Linen Fabrics',
    href: '/category/linen',
    icon: TagIcon,
    count: 67,
    isNew: true,
    subcategories: [
      { id: 'linen-pure', name: 'Pure Linen', href: '/category/linen/pure', count: 22 },
      { id: 'linen-blended', name: 'Linen Blends', href: '/category/linen/blended', count: 28, isPopular: true },
      { id: 'linen-handwoven', name: 'Handwoven Linen', href: '/category/linen/handwoven', count: 17 },
    ]
  },
  {
    id: 'wool',
    name: 'Wool Fabrics',
    href: '/category/wool',
    count: 45,
    subcategories: [
      { id: 'wool-pure', name: 'Pure Wool', href: '/category/wool/pure', count: 18 },
      { id: 'wool-blended', name: 'Wool Blends', href: '/category/wool/blended', count: 27 },
    ]
  },
  {
    id: 'synthetic',
    name: 'Synthetic Fabrics',
    href: '/category/synthetic',
    count: 78,
    hasDiscount: true,
    subcategories: [
      { id: 'synthetic-nylon', name: 'Nylon', href: '/category/synthetic/nylon', count: 23 },
      { id: 'synthetic-spandex', name: 'Spandex', href: '/category/synthetic/spandex', count: 19 },
      { id: 'synthetic-acrylic', name: 'Acrylic', href: '/category/synthetic/acrylic', count: 36 },
    ]
  },
];

const featuredCollections = [
  {
    id: 'bestsellers',
    name: 'Best Sellers',
    href: '/collections/bestsellers',
    icon: StarIcon,
    count: 45,
    description: 'Most popular fabrics'
  },
  {
    id: 'trending',
    name: 'Trending Now',
    href: '/collections/trending',
    icon: FireIcon,
    count: 32,
    description: 'Latest trends in fabric'
  },
  {
    id: 'fast-delivery',
    name: 'Fast Delivery',
    href: '/collections/fast-delivery',
    icon: TruckIcon,
    count: 67,
    description: 'Ships within 24 hours'
  },
];

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  className = '',
  isOpen = false,
  onClose,
  selectedCategory,
  onCategorySelect,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleCategorySelect = (categoryId: string) => {
    onCategorySelect?.(categoryId);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        staggerChildren: 0.03
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

  const badgeVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.1 },
    tap: { scale: 0.95 }
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
          className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Categories
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              aria-label="Close sidebar"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </motion.div>

        {/* Featured Collections */}
        <motion.div 
          className="p-4 border-b border-gray-200 dark:border-gray-700"
          variants={itemVariants}
        >
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Featured Collections
          </h3>
          <div className="space-y-2">
            {featuredCollections.map((collection) => {
              const IconComponent = collection.icon;
              return (
                <motion.div
                  key={collection.id}
                  variants={badgeVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Link
                    href={collection.href}
                    className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-all duration-200"
                  >
                    <IconComponent className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {collection.name}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">
                          {collection.count}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {collection.description}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div className="p-4" variants={itemVariants}>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            All Categories
          </h3>
          <div className="space-y-2">
            {filteredCategories.map((category) => {
              const isExpanded = expandedCategories.includes(category.id);
              const isSelected = selectedCategory === category.id;
              const IconComponent = category.icon;
              
              return (
                <div key={category.id}>
                  {/* Main Category */}
                  <motion.div
                    className={`
                      flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200
                      ${isSelected 
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }
                    `}
                    onClick={() => {
                      handleCategorySelect(category.id);
                      if (category.subcategories) {
                        toggleCategory(category.id);
                      }
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {IconComponent && (
                      <IconComponent className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {category.name}
                        </span>
                        <div className="flex items-center space-x-2">
                          {/* Badges */}
                          {category.isNew && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 text-xs font-bold rounded-full">
                              NEW
                            </span>
                          )}
                          {category.isFeatured && (
                            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400 text-xs font-bold rounded-full">
                              ⭐
                            </span>
                          )}
                          {category.hasDiscount && (
                            <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 text-xs font-bold rounded-full">
                              SALE
                            </span>
                          )}
                          
                          {/* Count */}
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-bold rounded-full">
                            {category.count}
                          </span>
                          
                          {/* Expand Arrow */}
                          {category.subcategories && (
                            <motion.div
                              animate={{ rotate: isExpanded ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Subcategories */}
                  <AnimatePresence>
                    {isExpanded && category.subcategories && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="ml-8 mt-2 space-y-1 overflow-hidden"
                      >
                        {category.subcategories.map((subcategory) => (
                          <motion.div
                            key={subcategory.id}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Link
                              href={subcategory.href}
                              className="flex items-center justify-between p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors duration-200"
                            >
                              <span className="flex items-center">
                                {subcategory.name}
                                {subcategory.isPopular && (
                                  <span className="ml-2 px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 text-xs font-bold rounded">
                                    HOT
                                  </span>
                                )}
                              </span>
                              <span className="text-xs text-gray-500">
                                {subcategory.count}
                              </span>
                            </Link>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Footer Stats */}
        <motion.div 
          className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto bg-gray-50 dark:bg-gray-800"
          variants={itemVariants}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {categories.reduce((sum, cat) => sum + (cat.count || 0), 0)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Total Fabric Options
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default CategorySidebar;