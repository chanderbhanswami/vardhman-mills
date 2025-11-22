'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Product } from '@/types/product.types';
import { cn } from '@/lib/utils';

export interface ProductOptionsProps {
  product: Product;
  selectedOptions: Record<string, string>;
  onOptionChange: (optionName: string, value: string) => void;
  className?: string;
  disabled?: boolean;
}

const ProductOptions: React.FC<ProductOptionsProps> = ({
  product,
  selectedOptions,
  onOptionChange,
  className,
  disabled = false,
}) => {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  // Get unique option types from product colors, sizes, materials
  const options: Array<{
    name: string;
    values: Array<{ value: string; label: string; color?: string; disabled?: boolean; stock?: number }>;
  }> = [];

  // Add color options
  if (product.colors && product.colors.length > 0) {
    options.push({
      name: 'Color',
      values: product.colors.map((color) => ({
        value: color.name,
        label: color.name,
        color: color.hexCode,
        disabled: !color.isAvailable,
      })),
    });
  }

  // Add size options
  if (product.sizes && product.sizes.length > 0) {
    options.push({
      name: 'Size',
      values: product.sizes.map((size) => ({
        value: size.name,
        label: size.name,
        disabled: !size.isAvailable,
      })),
    });
  }

  // Add material options
  if (product.materials && product.materials.length > 0) {
    options.push({
      name: 'Material',
      values: product.materials.map((material) => ({
        value: material.name,
        label: material.name,
        disabled: false,
      })),
    });
  }

  const handleOptionClick = (optionName: string, value: string, isDisabled: boolean) => {
    if (!isDisabled && !disabled) {
      onOptionChange(optionName, value);
    }
  };

  if (options.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-6', className)}>
      {options.map((option) => (
        <div key={option.name} className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">
              {option.name}
              {selectedOptions[option.name] && (
                <span className="ml-2 text-gray-600 font-normal">
                  {selectedOptions[option.name]}
                </span>
              )}
            </h4>
            {hoveredOption && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-gray-500"
              >
                {hoveredOption}
              </motion.span>
            )}
          </div>

          {/* Color Options */}
          {option.name === 'Color' && (
            <div className="flex flex-wrap gap-3">
              {option.values.map((value) => {
                const isSelected = selectedOptions[option.name] === value.value;
                const isDisabled = value.disabled || disabled;

                return (
                  <button
                    key={value.value}
                    onClick={() => handleOptionClick(option.name, value.value, isDisabled)}
                    onMouseEnter={() => setHoveredOption(value.label)}
                    onMouseLeave={() => setHoveredOption(null)}
                    disabled={isDisabled}
                    className={cn(
                      'relative w-12 h-12 rounded-full border-2 transition-all',
                      isSelected
                        ? 'border-primary-600 ring-2 ring-primary-200'
                        : 'border-gray-300 hover:border-gray-400',
                      isDisabled && 'opacity-40 cursor-not-allowed'
                    )}
                    aria-label={`Select ${value.label} color`}
                    title={value.label}
                  >
                    {/* Dynamic background color requires inline style */}
                    <div
                      className="w-full h-full rounded-full bg-gray-200"
                      style={value.color ? { backgroundColor: value.color } : undefined}
                    />
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <Check className="h-5 w-5 text-white drop-shadow" />
                      </motion.div>
                    )}
                    {isDisabled && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-gray-400 rotate-45" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Size Options */}
          {option.name === 'Size' && (
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const isSelected = selectedOptions[option.name] === value.value;
                const isDisabled = value.disabled || disabled;

                return (
                  <button
                    key={value.value}
                    onClick={() => handleOptionClick(option.name, value.value, isDisabled)}
                    disabled={isDisabled}
                    className={cn(
                      'relative min-w-[60px] px-4 py-2 border-2 rounded-lg font-medium transition-all',
                      isSelected
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-gray-400',
                      isDisabled && 'opacity-40 cursor-not-allowed bg-gray-100'
                    )}
                    aria-label={`Select ${value.label} size`}
                  >
                    {value.label}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-primary-600 rounded-full p-0.5"
                      >
                        <Check className="h-3 w-3 text-white" />
                      </motion.div>
                    )}
                    {value.stock !== undefined && value.stock > 0 && value.stock < 10 && (
                      <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {value.stock}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Material Options */}
          {option.name === 'Material' && (
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const isSelected = selectedOptions[option.name] === value.value;
                const isDisabled = value.disabled || disabled;

                return (
                  <button
                    key={value.value}
                    onClick={() => handleOptionClick(option.name, value.value, isDisabled)}
                    disabled={isDisabled}
                    className={cn(
                      'px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all',
                      isSelected
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-gray-400',
                      isDisabled && 'opacity-40 cursor-not-allowed'
                    )}
                    aria-label={`Select ${value.label} material`}
                  >
                    {value.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Size Guide Link for Size Options */}
          {option.name === 'Size' && (
            <button className="text-sm text-primary-600 hover:text-primary-700 underline">
              Size Guide
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProductOptions;
