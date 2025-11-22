'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Product, ProductVariant } from '@/types/product.types';
import { cn } from '@/lib/utils';

// Import all subcomponents
import ProductBreadcrumb from './ProductBreadcrumb';
import ProductGallery from './ProductGallery';
import ProductInfo from './ProductInfo';
import ProductPrice from '../ProductCard/ProductPrice';
import ProductRating from '../ProductCard/ProductRating';
import ProductActions from './ProductActions';
import ProductVariants from './ProductVariants';
import ProductOptions from './ProductOptions';
import AddToCart from './AddToCart';
import ProductOffers from './ProductOffers';
import DeliveryPincodeAndAddressSelection from './DeliveryPincodeAndAddressSelection';
import SocialShare from './SocialShare';
import WhatsappEnquiry from './WhatsappEnquiry';
import ProductTabs from './ProductTabs';
import RelatedProducts from './RelatedProducts';

export interface ProductDetailsProps {
  product: Product;
  relatedProducts?: Product[];
  className?: string;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  relatedProducts = [],
  className,
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  // Auto-select first variant if available
  useEffect(() => {
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      const firstAvailable = product.variants.find(v => v.inventory.isInStock);
      if (firstAvailable) {
        setSelectedVariant(firstAvailable);
      }
    }
  }, [product.variants, selectedVariant]);

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionName]: value,
    }));
  };

  return (
    <div className={cn('space-y-8', className)}>
      {/* Breadcrumb */}
      <ProductBreadcrumb product={product} />

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ProductGallery
            product={product}
            selectedVariant={selectedVariant || undefined}
            showZoom
            showThumbnails
          />
        </motion.div>

        {/* Right Column - Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Product Info */}
          <ProductInfo
            product={product}
            selectedVariant={selectedVariant || undefined}
            showBrand
            showSKU
            showCategory
            showBadges
          />

          {/* Rating */}
          <ProductRating product={product} />

          {/* Price */}
          <ProductPrice product={product} size="lg" />

          {/* Product Actions (Wishlist, Compare, Share) */}
          <div className="flex items-center gap-3">
            <ProductActions product={product} />
            <SocialShare product={product} variant="compact" />
            <WhatsappEnquiry product={product} />
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <ProductVariants
              product={product}
              selectedVariant={selectedVariant}
              onVariantChange={setSelectedVariant}
            />
          )}

          {/* Options (Color, Size, Material) */}
          <ProductOptions
            product={product}
            selectedOptions={selectedOptions}
            onOptionChange={handleOptionChange}
          />

          {/* Add to Cart */}
          <AddToCart
            product={product}
            selectedVariant={selectedVariant || undefined}
            quantity={quantity}
            onQuantityChange={setQuantity}
          />

          {/* Offers */}
          <ProductOffers product={product} />

          {/* Delivery & Pincode */}
          <DeliveryPincodeAndAddressSelection product={product} />
        </motion.div>
      </div>

      {/* Product Details Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <ProductTabs product={product} defaultTab="description" />
      </motion.div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <RelatedProducts
            product={product}
            relatedProducts={relatedProducts}
            maxItems={4}
          />
        </motion.div>
      )}

      {/* Floating WhatsApp Button */}
      <WhatsappEnquiry product={product} variant="floating" />
    </div>
  );
};

export default ProductDetails;
