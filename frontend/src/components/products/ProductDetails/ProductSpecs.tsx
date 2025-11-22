'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Product } from '@/types/product.types';
import { cn } from '@/lib/utils';

export interface ProductSpecsProps {
  product: Product;
  className?: string;
  defaultExpanded?: boolean;
  showGroups?: boolean;
}

interface SpecGroup {
  name: string;
  specs: Array<{ label: string; value: string }>;
}

const ProductSpecs: React.FC<ProductSpecsProps> = ({
  product,
  className,
  defaultExpanded = false,
  showGroups = true,
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    defaultExpanded ? new Set(getAllGroupNames()) : new Set()
  );

  function getAllGroupNames(): string[] {
    const groups: string[] = [];
    
    if (product.specifications && product.specifications.length > 0) {
      product.specifications.forEach(spec => {
        const groupName = spec.group || 'General';
        if (!groups.includes(groupName)) {
          groups.push(groupName);
        }
      });
    }
    
    return groups;
  }

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  // Group specifications by category
  const groupedSpecs: SpecGroup[] = [];
  
  if (product.specifications && product.specifications.length > 0) {
    const specsByCategory: Record<string, Array<{ label: string; value: string }>> = {};
    
    product.specifications.forEach(spec => {
      const groupName = spec.group || 'General';
      if (!specsByCategory[groupName]) {
        specsByCategory[groupName] = [];
      }
      specsByCategory[groupName].push({
        label: spec.name,
        value: spec.value
      });
    });
    
    Object.entries(specsByCategory).forEach(([category, specs]) => {
      groupedSpecs.push({
        name: category,
        specs
      });
    });
  }

  // Add additional specs from product properties
  const additionalSpecs: SpecGroup = {
    name: 'Product Details',
    specs: []
  };

  if (product.sku) {
    additionalSpecs.specs.push({ label: 'SKU', value: product.sku });
  }

  if (product.brand) {
    additionalSpecs.specs.push({ label: 'Brand', value: product.brand.name });
  }

  if (product.dimensions) {
    const dim = product.dimensions;
    additionalSpecs.specs.push({
      label: 'Dimensions',
      value: `${dim.length} × ${dim.width} × ${dim.height} ${dim.unit}`
    });
  }

  if (product.weight) {
    additionalSpecs.specs.push({
      label: 'Weight',
      value: `${product.weight.value} ${product.weight.unit}`
    });
  }

  if (product.colors && product.colors.length > 0) {
    additionalSpecs.specs.push({
      label: 'Available Colors',
      value: product.colors.map(c => c.name).join(', ')
    });
  }

  if (product.sizes && product.sizes.length > 0) {
    additionalSpecs.specs.push({
      label: 'Available Sizes',
      value: product.sizes.map(s => s.name).join(', ')
    });
  }

  if (product.materials && product.materials.length > 0) {
    additionalSpecs.specs.push({
      label: 'Materials',
      value: product.materials.map(m => m.name).join(', ')
    });
  }

  if (additionalSpecs.specs.length > 0) {
    groupedSpecs.unshift(additionalSpecs);
  }

  if (groupedSpecs.length === 0) {
    return (
      <div className={cn('flex items-center gap-2 p-6 bg-gray-50 rounded-lg', className)}>
        <Info className="h-5 w-5 text-gray-400" />
        <p className="text-gray-600">No specifications available</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {groupedSpecs.map((group) => (
        <div key={group.name} className="border rounded-lg overflow-hidden">
          {/* Group Header */}
          {showGroups && groupedSpecs.length > 1 && (
            <button
              onClick={() => toggleGroup(group.name)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
              {expandedGroups.has(group.name) ? (
                <ChevronUp className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-600" />
              )}
            </button>
          )}

          {/* Specs Table */}
          <AnimatePresence initial={false}>
            {(!showGroups || groupedSpecs.length === 1 || expandedGroups.has(group.name)) && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="divide-y">
                  {group.specs.map((spec, specIndex) => (
                    <motion.div
                      key={spec.label}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: specIndex * 0.05 }}
                      className="grid grid-cols-2 gap-4 p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-gray-700">{spec.label}</div>
                      <div className="text-gray-900">{spec.value}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default ProductSpecs;
