'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  TrophyIcon,
  InformationCircleIcon,
  FunnelIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';
import type { ComparisonProduct, ComparisonFeature, FeatureGroup } from '@/types/compare.types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CompareTableProps {
  /**
   * Products being compared
   */
  products: ComparisonProduct[];

  /**
   * Features to display
   */
  features?: ComparisonFeature[];

  /**
   * Feature groups for organization
   */
  featureGroups?: FeatureGroup[];

  /**
   * Show only differences
   */
  showOnlyDifferences?: boolean;

  /**
   * Highlight best values
   */
  highlightBestValues?: boolean;

  /**
   * Enable sticky header
   */
  stickyHeader?: boolean;

  /**
   * Enable sticky first column
   */
  stickyFirstColumn?: boolean;

  /**
   * Compact mode
   */
  compact?: boolean;

  /**
   * Show images in header
   */
  showImages?: boolean;

  /**
   * Show prices in header
   */
  showPrices?: boolean;

  /**
   * Show ratings in header
   */
  showRatings?: boolean;

  /**
   * Enable sorting
   */
  enableSorting?: boolean;

  /**
   * Enable grouping
   */
  enableGrouping?: boolean;

  /**
   * Callback when product is removed
   */
  onRemoveProduct?: (productId: string) => void;

  /**
   * Callback when product is clicked
   */
  onProductClick?: (productId: string) => void;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

interface FeatureRowProps {
  feature: ComparisonFeature;
  products: ComparisonProduct[];
  highlightBestValues: boolean;
  compact: boolean;
}

interface FeatureGroupSectionProps {
  group: FeatureGroup;
  features: ComparisonFeature[];
  products: ComparisonProduct[];
  highlightBestValues: boolean;
  compact: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format currency
 */
const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Get product image
 */
const getProductImage = (product: ComparisonProduct): string => {
  if (product.product?.media?.primaryImage?.url) {
    return product.product.media.primaryImage.url;
  }
  if (product.product?.media?.images?.[0]?.url) {
    return product.product.media.images[0].url;
  }
  return '/placeholder-product.png';
};

/**
 * Get product name
 */
const getProductName = (product: ComparisonProduct): string => {
  if (product.customLabel) return product.customLabel;
  if (product.product?.name) return product.product.name;
  return 'Product';
};

/**
 * Get product price
 */
const getProductPrice = (product: ComparisonProduct): string => {
  const price = product.comparisonContext?.priceAtComparison;
  if (price) {
    return formatCurrency(price.amount, price.currency);
  }
  if (product.product?.pricing?.basePrice) {
    return formatCurrency(
      product.product.pricing.basePrice.amount,
      product.product.pricing.basePrice.currency
    );
  }
  return 'N/A';
};

/**
 * Get product rating
 */
const getProductRating = (product: ComparisonProduct): number => {
  return product.comparisonContext?.ratingAtComparison?.average || 
         product.product?.rating?.average || 
         0;
};

/**
 * Get feature value from product
 */
const getFeatureValue = (product: ComparisonProduct, feature: ComparisonFeature): unknown => {
  const prod = product.product;
  if (!prod) return null;

  // Handle different source fields
  switch (feature.sourceField) {
    case 'price':
      return prod.pricing?.basePrice?.amount || null;
    
    case 'salePrice':
      return prod.pricing?.salePrice?.amount || null;
    
    case 'rating':
      return prod.rating?.average || null;
    
    case 'brand':
      return prod.brand?.name || null;
    
    case 'material':
      return prod.materials?.[0]?.name || null;
    
    case 'dimensions':
      if (prod.dimensions) {
        return `${prod.dimensions.length} × ${prod.dimensions.width} ${prod.dimensions.unit}`;
      }
      return null;
    
    case 'weight':
      if (prod.weight) {
        return `${prod.weight.value} ${prod.weight.unit}`;
      }
      return null;
    
    case 'warranty':
      return prod.warranty?.duration || null;
    
    case 'stock':
      return prod.inventory?.quantity || 0;
    
    case 'availability':
      return prod.inventory?.isInStock ? 'In Stock' : 'Out of Stock';
    
    case 'colors':
      return prod.colors?.length || 0;
    
    case 'sizes':
      return prod.sizes?.length || 0;
    
    default:
      // Try to find in specifications
      const spec = prod.specifications?.find(s => 
        s.name.toLowerCase() === feature.sourceField.toLowerCase()
      );
      if (spec) return spec.value;
      
      // Try direct property access
      return (prod as unknown as Record<string, unknown>)[feature.sourceField] || null;
  }
};

/**
 * Format feature value for display
 */
const formatFeatureValue = (value: unknown, feature: ComparisonFeature): React.ReactNode => {
  if (value === null || value === undefined) {
    return <span className="text-gray-400">N/A</span>;
  }

  // Boolean values
  if (typeof value === 'boolean') {
    return value ? (
      <CheckCircleIcon className="h-5 w-5 text-green-600" />
    ) : (
      <XCircleIcon className="h-5 w-5 text-red-600" />
    );
  }

  // Number values
  if (typeof value === 'number') {
    if (feature.format.type === 'currency') {
      return formatCurrency(value, feature.format.currency || 'INR');
    }
    if (feature.format.type === 'percentage') {
      return `${value}%`;
    }
    if (feature.format.precision !== undefined) {
      return value.toFixed(feature.format.precision);
    }
    return value.toString();
  }

  // String values
  if (typeof value === 'string') {
    if (feature.format.prefix) {
      return `${feature.format.prefix}${value}`;
    }
    if (feature.format.suffix) {
      return `${value}${feature.format.suffix}`;
    }
    return value;
  }

  return String(value);
};

/**
 * Determine if value is the best in comparison
 */
const isBestValue = (
  value: unknown,
  allValues: unknown[],
  feature: ComparisonFeature
): boolean => {
  if (value === null || value === undefined) return false;

  const numericValues = allValues
    .filter(v => typeof v === 'number')
    .map(v => v as number);

  if (numericValues.length === 0) return false;

  if (typeof value === 'number') {
    const max = Math.max(...numericValues);
    const min = Math.min(...numericValues);

    // For price, lower is better
    if (feature.sourceField.includes('price')) {
      return value === min;
    }

    // For most other numeric values, higher is better
    return value === max;
  }

  return false;
};

/**
 * Check if all values are the same (for difference filtering)
 */
const allValuesAreSame = (values: unknown[]): boolean => {
  if (values.length === 0) return true;
  const firstValue = JSON.stringify(values[0]);
  return values.every(v => JSON.stringify(v) === firstValue);
};

// ============================================================================
// DEFAULT DATA
// ============================================================================

const DEFAULT_FEATURES: ComparisonFeature[] = [
  {
    id: '1',
    name: 'Price',
    category: 'pricing',
    type: 'price',
    displayName: 'Price',
    comparisonType: 'numeric',
    weight: 0.3,
    isImportant: true,
    sourceField: 'price',
    format: { type: 'currency', currency: 'INR' },
    showInSummary: true,
    allowUserInput: false,
  },
  {
    id: '2',
    name: 'Rating',
    category: 'reviews',
    type: 'rating',
    displayName: 'Customer Rating',
    comparisonType: 'numeric',
    weight: 0.2,
    isImportant: true,
    sourceField: 'rating',
    format: { type: 'number', precision: 1, suffix: ' / 5' },
    showInSummary: true,
    allowUserInput: false,
  },
  {
    id: '3',
    name: 'Material',
    category: 'materials',
    type: 'text',
    displayName: 'Material',
    comparisonType: 'categorical',
    weight: 0.15,
    isImportant: true,
    sourceField: 'material',
    format: { type: 'text' },
    showInSummary: true,
    allowUserInput: false,
  },
  {
    id: '4',
    name: 'Dimensions',
    category: 'dimensions',
    type: 'text',
    displayName: 'Dimensions',
    comparisonType: 'textual',
    weight: 0.1,
    isImportant: false,
    sourceField: 'dimensions',
    format: { type: 'text' },
    showInSummary: false,
    allowUserInput: false,
  },
  {
    id: '5',
    name: 'Weight',
    category: 'dimensions',
    type: 'text',
    displayName: 'Weight',
    comparisonType: 'textual',
    weight: 0.05,
    isImportant: false,
    sourceField: 'weight',
    format: { type: 'text' },
    showInSummary: false,
    allowUserInput: false,
  },
  {
    id: '6',
    name: 'Availability',
    category: 'availability',
    type: 'text',
    displayName: 'Availability',
    comparisonType: 'categorical',
    weight: 0.1,
    isImportant: true,
    sourceField: 'availability',
    format: { type: 'text' },
    showInSummary: true,
    allowUserInput: false,
  },
  {
    id: '7',
    name: 'Colors',
    category: 'design',
    type: 'number',
    displayName: 'Color Options',
    comparisonType: 'numeric',
    weight: 0.05,
    isImportant: false,
    sourceField: 'colors',
    format: { type: 'number', suffix: ' colors' },
    showInSummary: false,
    allowUserInput: false,
  },
  {
    id: '8',
    name: 'Warranty',
    category: 'availability',
    type: 'text',
    displayName: 'Warranty',
    comparisonType: 'textual',
    weight: 0.05,
    isImportant: false,
    sourceField: 'warranty',
    format: { type: 'text' },
    showInSummary: false,
    allowUserInput: false,
  },
];

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Product header cell
 */
interface ProductHeaderCellProps {
  product: ComparisonProduct;
  showImage: boolean;
  showPrice: boolean;
  showRating: boolean;
  compact: boolean;
  onRemove?: () => void;
  onClick?: () => void;
}

const ProductHeaderCell: React.FC<ProductHeaderCellProps> = ({
  product,
  showImage,
  showPrice,
  showRating,
  compact,
  onRemove,
  onClick,
}) => {
  const [imageError, setImageError] = React.useState(false);
  const rating = getProductRating(product);

  return (
    <div
      className={cn(
        'flex flex-col items-center text-center p-4 bg-gray-50 border-r border-gray-200',
        onClick && 'cursor-pointer hover:bg-gray-100 transition-colors',
        compact && 'p-2'
      )}
      onClick={onClick}
    >
      {/* Best choice badge */}
      {product.isHighlighted && (
        <Badge variant="warning" className="mb-2">
          <TrophyIcon className="h-3 w-3 mr-1" />
          Best Choice
        </Badge>
      )}

      {/* Product image */}
      {showImage && (
        <div className={cn('relative mb-3', compact ? 'w-16 h-16' : 'w-24 h-24')}>
          {!imageError ? (
            <Image
              src={getProductImage(product)}
              alt={getProductName(product)}
              fill
              className="object-contain"
              sizes={compact ? '64px' : '96px'}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
              <span className="text-gray-400 text-xs">No Image</span>
            </div>
          )}
        </div>
      )}

      {/* Product name */}
      <h3 className={cn('font-semibold text-gray-900 mb-2', compact ? 'text-sm' : 'text-base')}>
        {getProductName(product)}
      </h3>

      {/* Brand */}
      {product.product?.brand && (
        <p className="text-xs text-gray-500 mb-2">{product.product.brand.name}</p>
      )}

      {/* Price */}
      {showPrice && (
        <div className="mb-2">
          <span className={cn('font-bold text-primary-600', compact ? 'text-sm' : 'text-lg')}>
            {getProductPrice(product)}
          </span>
        </div>
      )}

      {/* Rating */}
      {showRating && rating > 0 && (
        <div className="flex items-center gap-1 mb-2">
          <StarIconSolid className="h-4 w-4 text-yellow-400" />
          <span className="text-sm text-gray-700">{rating.toFixed(1)}</span>
        </div>
      )}

      {/* Remove button */}
      {onRemove && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          variant="ghost"
          size="sm"
          className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Remove
        </Button>
      )}
    </div>
  );
};

/**
 * Feature row component
 */
const FeatureRow: React.FC<FeatureRowProps> = ({
  feature,
  products,
  highlightBestValues,
  compact,
}) => {
  const values = products.map(p => getFeatureValue(p, feature));
  
  return (
    <div className="flex border-b border-gray-200 hover:bg-gray-50 transition-colors">
      {/* Feature name cell */}
      <div
        className={cn(
          'flex items-center gap-2 border-r border-gray-200 bg-white font-medium text-gray-700',
          compact ? 'p-2 text-sm min-w-[120px] w-[120px]' : 'p-4 text-base min-w-[200px] w-[200px]'
        )}
      >
        <span>{feature.displayName}</span>
        {feature.tooltip && (
          <Tooltip content={feature.tooltip}>
            <InformationCircleIcon className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
          </Tooltip>
        )}
        {feature.isImportant && (
          <StarIcon className="h-4 w-4 text-yellow-500" />
        )}
      </div>

      {/* Value cells */}
      {products.map((product, index) => {
        const value = values[index];
        const isBest = highlightBestValues && isBestValue(value, values, feature);

        return (
          <div
            key={product.productId}
            className={cn(
              'flex-1 flex items-center justify-center border-r border-gray-200 text-center',
              compact ? 'p-2 text-sm' : 'p-4 text-base',
              isBest && 'bg-green-50 font-semibold',
              product.isHighlighted && 'bg-primary-50/30'
            )}
          >
            {isBest && (
              <TrophyIcon className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
            )}
            <span className={cn(isBest && 'text-green-700')}>
              {formatFeatureValue(value, feature)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Feature group section
 */
const FeatureGroupSection: React.FC<FeatureGroupSectionProps> = ({
  group,
  features,
  products,
  highlightBestValues,
  compact,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(group.isExpandedByDefault);

  const groupFeatures = features.filter(f => group.features.includes(f.id));

  if (groupFeatures.length === 0) return null;

  return (
    <div className="border-b-2 border-gray-300">
      {/* Group header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200 transition-colors font-semibold text-gray-900',
          compact && 'p-2 text-sm'
        )}
      >
        <div className="flex items-center gap-2">
          {group.icon && <span>{group.icon}</span>}
          <span>{group.name}</span>
          <Badge variant="outline" className="text-xs">
            {groupFeatures.length} features
          </Badge>
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="h-5 w-5" />
        ) : (
          <ChevronDownIcon className="h-5 w-5" />
        )}
      </button>

      {/* Group features */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {groupFeatures.map(feature => (
              <FeatureRow
                key={feature.id}
                feature={feature}
                products={products}
                highlightBestValues={highlightBestValues}
                compact={compact}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * CompareTable Component
 * 
 * Side-by-side comparison table for products.
 * Features:
 * - Sticky header with product info
 * - Organized feature groups
 * - Highlight best values
 * - Show only differences filter
 * - Expandable/collapsible groups
 * - Responsive design
 * - Compact mode
 * - Tooltips for feature descriptions
 * - Remove product functionality
 * - Click to view product details
 * 
 * @example
 * ```tsx
 * <CompareTable
 *   products={comparisonProducts}
 *   features={features}
 *   featureGroups={groups}
 *   highlightBestValues={true}
 *   showOnlyDifferences={false}
 *   onRemoveProduct={handleRemove}
 * />
 * ```
 */
export const CompareTable: React.FC<CompareTableProps> = ({
  products,
  features = DEFAULT_FEATURES,
  featureGroups,
  showOnlyDifferences = false,
  highlightBestValues = true,
  stickyHeader = true,
  stickyFirstColumn = true,
  compact = false,
  showImages = true,
  showPrices = true,
  showRatings = true,
  enableSorting = false, // eslint-disable-line @typescript-eslint/no-unused-vars -- Reserved for future sorting feature
  enableGrouping = true,
  onRemoveProduct,
  onProductClick,
  isLoading = false,
  className,
}) => {
  const [showDifferencesOnly, setShowDifferencesOnly] = React.useState(showOnlyDifferences);

  // Filter features based on showDifferencesOnly
  const visibleFeatures = React.useMemo(() => {
    if (!showDifferencesOnly) return features;

    return features.filter(feature => {
      const values = products.map(p => getFeatureValue(p, feature));
      return !allValuesAreSame(values);
    });
  }, [features, products, showDifferencesOnly]);

  // Group features if grouping is enabled
  const groupedFeatures = React.useMemo(() => {
    if (!enableGrouping || !featureGroups) return null;

    return featureGroups.map(group => ({
      ...group,
      features: visibleFeatures.filter(f => group.features.includes(f.id)),
    })).filter(g => g.features.length > 0);
  }, [enableGrouping, featureGroups, visibleFeatures]);

  // Ungrouped features
  const ungroupedFeatures = React.useMemo(() => {
    if (!enableGrouping || !featureGroups) return visibleFeatures;

    const groupedFeatureIds = new Set(
      featureGroups.flatMap(g => g.features)
    );

    return visibleFeatures.filter(f => !groupedFeatureIds.has(f.id));
  }, [enableGrouping, featureGroups, visibleFeatures]);

  if (products.length === 0) {
    return (
      <Card className={cn('p-8 text-center', className)}>
        <p className="text-gray-500">No products to compare</p>
      </Card>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Comparing {products.length} Products
          </h3>
          <Badge variant="outline">
            {visibleFeatures.length} Features
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Show differences toggle */}
          <Button
            onClick={() => setShowDifferencesOnly(!showDifferencesOnly)}
            variant={showDifferencesOnly ? 'default' : 'outline'}
            size="sm"
          >
            {showDifferencesOnly ? (
              <>
                <EyeIcon className="h-4 w-4 mr-2" />
                Showing Differences
              </>
            ) : (
              <>
                <EyeSlashIcon className="h-4 w-4 mr-2" />
                Show All
              </>
            )}
          </Button>

          {/* Filter button (placeholder) */}
          <Button variant="outline" size="sm">
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Comparison table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            {/* Header with product cards */}
            <div
              className={cn(
                'flex border-b-2 border-gray-300',
                stickyHeader && 'sticky top-0 z-10 shadow-md'
              )}
            >
              {/* Empty cell for feature names column */}
              <div
                className={cn(
                  'border-r border-gray-200 bg-gray-100 flex items-center justify-center font-semibold text-gray-700',
                  compact ? 'p-2 text-sm min-w-[120px] w-[120px]' : 'p-4 text-base min-w-[200px] w-[200px]',
                  stickyFirstColumn && 'sticky left-0 z-20'
                )}
              >
                Features
              </div>

              {/* Product header cells */}
              {products.map(product => (
                <ProductHeaderCell
                  key={product.productId}
                  product={product}
                  showImage={showImages}
                  showPrice={showPrices}
                  showRating={showRatings}
                  compact={compact}
                  onRemove={onRemoveProduct ? () => onRemoveProduct(product.productId) : undefined}
                  onClick={onProductClick ? () => onProductClick(product.productId) : undefined}
                />
              ))}
            </div>

            {/* Feature rows */}
            <div>
              {/* Grouped features */}
              {groupedFeatures && groupedFeatures.map(group => (
                <FeatureGroupSection
                  key={group.id}
                  group={{ ...group, features: group.features.map(f => f.id) }}
                  features={visibleFeatures}
                  products={products}
                  highlightBestValues={highlightBestValues}
                  compact={compact}
                />
              ))}

              {/* Ungrouped features */}
              {ungroupedFeatures.length > 0 && (
                <>
                  {groupedFeatures && groupedFeatures.length > 0 && (
                    <div className="p-3 bg-gray-100 font-medium text-gray-700 text-sm border-b-2 border-gray-300">
                      Other Features
                    </div>
                  )}
                  {ungroupedFeatures.map(feature => (
                    <FeatureRow
                      key={feature.id}
                      feature={feature}
                      products={products}
                      highlightBestValues={highlightBestValues}
                      compact={compact}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-30">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
          </div>
        )}
      </div>

      {/* Legend */}
      {highlightBestValues && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-green-800">
            <TrophyIcon className="h-5 w-5 text-green-600" />
            <span className="font-medium">Green highlights indicate the best value in each category</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompareTable;