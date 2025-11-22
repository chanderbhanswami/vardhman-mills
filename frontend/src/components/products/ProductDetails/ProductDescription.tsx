'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, FileText, AlertCircle } from 'lucide-react';
import { Product } from '@/types/product.types';
import { cn } from '@/lib/utils';

export interface ProductDescriptionProps {
  product: Product;
  className?: string;
  maxLength?: number;
  showReadMore?: boolean;
  defaultExpanded?: boolean;
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({
  product,
  className,
  maxLength = 300,
  showReadMore = true,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const description = product.description || '';
  const shortDescription = product.shortDescription || '';
  
  const needsTruncation = description.length > maxLength;
  const displayText = !isExpanded && needsTruncation 
    ? description.substring(0, maxLength) + '...'
    : description;

  const hasContent = description || shortDescription || product.features?.length > 0;

  if (!hasContent) {
    return (
      <div className={cn('p-6 bg-gray-50 rounded-lg border border-gray-200', className)}>
        <div className="flex items-center gap-3 text-gray-500">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">Product description not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Short Description */}
      {shortDescription && (
        <div className="p-4 bg-primary-50 border-l-4 border-primary-500 rounded">
          <p className="text-sm font-medium text-primary-900">{shortDescription}</p>
        </div>
      )}

      {/* Main Description */}
      {description && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Description</h3>
          </div>

          <div className="prose prose-sm max-w-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={isExpanded ? 'expanded' : 'collapsed'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-gray-700 leading-relaxed whitespace-pre-line"
              >
                {displayText}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Read More Button */}
          {showReadMore && needsTruncation && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
            >
              <span>{isExpanded ? 'Read Less' : 'Read More'}</span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      )}

      {/* Key Features */}
      {product.features && product.features.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-gray-900">Key Features</h4>
          <ul className="space-y-2">
            {product.features.map((feature, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 text-sm text-gray-700"
              >
                <span className="flex-shrink-0 w-1.5 h-1.5 bg-primary-600 rounded-full mt-2" aria-hidden="true" />
                {feature}
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Care Instructions */}
      {product.careInstructions && product.careInstructions.length > 0 && (
        <div className="space-y-3 p-4 bg-primary-50 rounded-lg">
          <h4 className="text-base font-semibold text-primary-900">Care Instructions</h4>
          <div className="space-y-2">
            {product.careInstructions.map((instruction, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-1.5 h-1.5 bg-primary-600 rounded-full mt-2" />
                <span className="text-sm text-primary-900">{instruction}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warranty Info */}
      {product.warranty && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-sm font-semibold text-green-900 mb-2">Warranty Information</h4>
          <div className="space-y-1 text-sm text-green-800">
            <p><strong>Duration:</strong> {product.warranty.duration}</p>
            {product.warranty.description && (
              <p className="text-xs mt-1">{product.warranty.description}</p>
            )}
          </div>
        </div>
      )}

      {/* Certifications */}
      {product.certifications && product.certifications.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-gray-900">Certifications</h4>
          <div className="flex flex-wrap gap-2">
            {product.certifications.map((cert, index) => (
              <div
                key={index}
                className="px-3 py-2 bg-primary-50 border border-primary-200 rounded-lg text-xs font-medium text-primary-900"
              >
                {cert.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDescription;
