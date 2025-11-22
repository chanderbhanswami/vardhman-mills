'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, ListTree, Star } from 'lucide-react';
import { Product } from '@/types/product.types';
import { cn } from '@/lib/utils';
import ProductDescription from './ProductDescription';
import ProductSpecs from './ProductSpecs';
import ProductReviews from './ProductReviews';

export interface ProductTabsProps {
  product: Product;
  className?: string;
  defaultTab?: 'description' | 'specifications' | 'reviews';
}

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

const ProductTabs: React.FC<ProductTabsProps> = ({
  product,
  className,
  defaultTab = 'description',
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const tabs: Tab[] = [
    {
      id: 'description',
      label: 'Description',
      icon: <FileText className="h-4 w-4" />,
      component: <ProductDescription product={product} />,
    },
    {
      id: 'specifications',
      label: 'Specifications',
      icon: <ListTree className="h-4 w-4" />,
      component: <ProductSpecs product={product} defaultExpanded />,
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: <Star className="h-4 w-4" />,
      component: <ProductReviews product={product} />,
    },
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Tab Headers */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'relative flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="min-h-[400px]"
      >
        {tabs.find(tab => tab.id === activeTab)?.component}
      </motion.div>
    </div>
  );
};

export default ProductTabs;
