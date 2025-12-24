'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, ProductVariant } from '@/types';
import { X, Heart, ShoppingCart, Share2, Star, Check, Minus, Plus, ZoomIn, ZoomOut, Truck, ShieldCheck, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';

export interface QuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
  className?: string;
}

export const QuickView: React.FC<QuickViewProps> = ({ product, isOpen, onClose, className }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [zoomLevel, setZoomLevel] = useState(1);

  // Local state for cart/wishlist that syncs with localStorage
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0); // Quantity currently in cart
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);


  // Check wishlist state on mount and when product/localStorage changes
  const checkWishlistState = useCallback(() => {
    if (!product) return;
    try {
      const wishlist = JSON.parse(localStorage.getItem('vardhman_wishlist') || '[]');
      const productId = product.id || (product as unknown as { _id?: string })._id || '';
      const inWishlist = wishlist.some((item: { productId: string }) => item.productId === productId);
      setIsWishlisted(inWishlist);
    } catch {
      setIsWishlisted(false);
    }
  }, [product]);

  // Check cart state on mount and when product/localStorage changes
  const checkCartState = useCallback(() => {
    if (!product) return;
    try {
      const cart = JSON.parse(localStorage.getItem('vardhman_cart') || '{"items":[]}');
      const productId = product.id || (product as unknown as { _id?: string })._id || '';
      const cartItem = cart.items?.find((item: { productId: string }) => item.productId === productId);
      if (cartItem) {
        setIsInCart(true);
        setCartQuantity(cartItem.quantity || 1);
        setQuantity(cartItem.quantity || 1); // Sync quantity state with cart
      } else {
        setIsInCart(false);
        setCartQuantity(0);
      }
    } catch {
      setIsInCart(false);
      setCartQuantity(0);
    }
  }, [product]);

  // Load initial state and listen for storage changes
  useEffect(() => {
    checkWishlistState();
    checkCartState();

    const handleStorageChange = () => {
      checkWishlistState();
      checkCartState();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkWishlistState, checkCartState]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (product) {
      setSelectedImage(0);
      setQuantity(1);
      setSelectedOptions({});
      setSelectedVariant(null);
      setZoomLevel(1); // Reset zoom when product changes
      checkWishlistState();
      checkCartState();
    }
  }, [product, checkWishlistState, checkCartState]);

  // Apply color swatch backgrounds via DOM manipulation to avoid inline styles
  useEffect(() => {
    if (!isOpen || !product) return;

    const swatches = document.querySelectorAll('[data-bg]');
    swatches.forEach((swatch) => {
      const bgColor = swatch.getAttribute('data-bg');
      if (bgColor && swatch instanceof HTMLElement) {
        swatch.style.backgroundColor = bgColor;
      }
    });
  }, [isOpen, product, selectedOptions]);

  // Debug logging
  console.log('🔍 QuickView render - isOpen:', isOpen, 'product:', product?.name || 'null');

  // Helper to check if string is MongoDB ObjectID
  const isMongoId = (str: string) => /^[a-f\d]{24}$/i.test(str);

  // Handle Wishlist Toggle - localStorage based
  const handleWishlistToggle = useCallback(() => {
    if (!product) return;
    setWishlistLoading(true);

    try {
      const currentWishlist = JSON.parse(localStorage.getItem('vardhman_wishlist') || '[]');
      const productId = product.id || (product as unknown as { _id?: string })._id || '';
      const existingIndex = currentWishlist.findIndex((item: { productId: string }) => item.productId === productId);

      if (existingIndex > -1) {
        // Remove from wishlist
        currentWishlist.splice(existingIndex, 1);
        localStorage.setItem('vardhman_wishlist', JSON.stringify(currentWishlist));
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        // Add to wishlist
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const variant = (product as any).variants?.[0];
        const basePrice = product.pricing?.basePrice?.amount || variant?.comparePrice || variant?.price || 0;
        const salePrice = product.pricing?.salePrice?.amount || variant?.price || basePrice;

        let brandName = 'Vardhman';
        if (typeof product.brand === 'object' && (product.brand as { name?: string })?.name) {
          brandName = (product.brand as { name: string }).name;
        } else if (typeof product.brand === 'string' && !isMongoId(product.brand)) {
          brandName = product.brand;
        }

        let categoryName = 'Fabric';
        if (typeof product.category === 'object' && product.category?.name) {
          categoryName = product.category.name;
        } else if (typeof product.category === 'string' && !isMongoId(product.category)) {
          categoryName = product.category;
        }

        currentWishlist.push({
          id: `wishlist_${Date.now()}`,
          productId: productId,
          color: variant?.color || (product.colors?.[0] as unknown as { name?: string })?.name || '',
          size: variant?.size || (product.sizes?.[0] as unknown as { name?: string })?.name || '',
          fabric: variant?.material || (product.materials?.[0] as unknown as { name?: string })?.name || '',
          product: {
            id: productId,
            name: product.name,
            slug: product.slug,
            price: basePrice,
            salePrice: salePrice < basePrice ? salePrice : undefined,
            image: typeof product.media?.primaryImage === 'string'
              ? product.media.primaryImage
              : (product.media?.primaryImage as unknown as { url?: string })?.url || '',
            inStock: product.inventory?.quantity !== 0,
            brand: brandName,
            category: categoryName,
            rating: product.rating?.average || 0,
            reviewCount: product.reviewCount || 0,
          },
          addedAt: new Date().toISOString(),
        });
        localStorage.setItem('vardhman_wishlist', JSON.stringify(currentWishlist));
        setIsWishlisted(true);
        toast.success('Added to wishlist');
      }

      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  }, [product]);

  // Handle Add to Cart - localStorage based
  const handleAddToCart = useCallback(() => {
    if (!product) return;
    setCartLoading(true);

    try {
      const currentCart = JSON.parse(localStorage.getItem('vardhman_cart') || '{"items":[],"summary":{}}');
      const productId = product.id || (product as unknown as { _id?: string })._id || '';

      // Check if already in cart
      const existingIndex = currentCart.items.findIndex(
        (item: { productId: string }) => item.productId === productId
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const variant = (product as any).variants?.[0];
      const originalPrice = product.pricing?.basePrice?.amount || variant?.comparePrice || variant?.price || 0;
      const price = product.pricing?.salePrice?.amount || variant?.price || originalPrice;

      let brandName = 'Vardhman';
      if (typeof product.brand === 'object' && (product.brand as { name?: string })?.name) {
        brandName = (product.brand as { name: string }).name;
      } else if (typeof product.brand === 'string' && !isMongoId(product.brand)) {
        brandName = product.brand;
      }

      let categoryName = 'Fabric';
      if (typeof product.category === 'object' && product.category?.name) {
        categoryName = product.category.name;
      } else if (typeof product.category === 'string' && !isMongoId(product.category)) {
        categoryName = product.category;
      }

      if (existingIndex > -1) {
        // Update quantity
        currentCart.items[existingIndex].quantity += quantity;
        currentCart.items[existingIndex].subtotal = currentCart.items[existingIndex].price * currentCart.items[existingIndex].quantity;
        currentCart.items[existingIndex].updatedAt = new Date();
        toast.success(`Updated quantity in cart`);
      } else {
        // Add new item
        currentCart.items.push({
          id: `cart_item_${Date.now()}`,
          productId: productId,
          quantity,
          price,
          originalPrice,
          subtotal: price * quantity,
          product: {
            id: productId,
            name: product.name,
            slug: product.slug,
            image: typeof product.media?.primaryImage === 'string'
              ? product.media.primaryImage
              : (product.media?.primaryImage as unknown as { url?: string })?.url || '',
            category: categoryName,
            brand: brandName,
            inStock: product.inventory?.quantity !== 0,
            maxQuantity: product.inventory?.quantity || 99,
          },
          color: variant?.color || (product.colors?.[0] as unknown as { name?: string })?.name || '',
          size: variant?.size || (product.sizes?.[0] as unknown as { name?: string })?.name || '',
          fabric: variant?.material || (product.materials?.[0] as unknown as { name?: string })?.name || '',
          addedAt: new Date(),
          updatedAt: new Date(),
        });
        toast.success('Added to cart');
      }

      // Update summary
      currentCart.summary = {
        ...currentCart.summary,
        itemCount: currentCart.items.length,
        totalQuantity: currentCart.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0),
        subtotal: currentCart.items.reduce((sum: number, item: { subtotal: number }) => sum + item.subtotal, 0),
        total: currentCart.items.reduce((sum: number, item: { subtotal: number }) => sum + item.subtotal, 0),
      };

      localStorage.setItem('vardhman_cart', JSON.stringify(currentCart));
      setIsInCart(true);
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add to cart');
    } finally {
      setCartLoading(false);
    }
  }, [product, quantity]);

  const handleShare = async () => {
    if (!product) return;
    const shareData = {
      title: product.name,
      text: product.shortDescription || product.description,
      url: `${typeof window !== 'undefined' ? window.location.origin : ''}/products/${product.slug}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Shared successfully');
      } catch {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard');
      } catch {
        toast.error('Failed to copy link');
      }
    }
  };

  // Helper to update cart quantity in localStorage
  const updateCartQuantity = useCallback((newQuantity: number) => {
    if (!product) return;
    try {
      const currentCart = JSON.parse(localStorage.getItem('vardhman_cart') || '{"items":[],"summary":{}}');
      const productId = product.id || (product as unknown as { _id?: string })._id || '';
      const itemIndex = currentCart.items.findIndex((item: { productId: string }) => item.productId === productId);

      if (itemIndex > -1) {
        currentCart.items[itemIndex].quantity = newQuantity;
        currentCart.items[itemIndex].subtotal = currentCart.items[itemIndex].price * newQuantity;
        currentCart.items[itemIndex].updatedAt = new Date();

        // Update summary
        currentCart.summary = {
          ...currentCart.summary,
          itemCount: currentCart.items.length,
          totalQuantity: currentCart.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0),
          subtotal: currentCart.items.reduce((sum: number, item: { subtotal: number }) => sum + item.subtotal, 0),
          total: currentCart.items.reduce((sum: number, item: { subtotal: number }) => sum + item.subtotal, 0),
        };

        localStorage.setItem('vardhman_cart', JSON.stringify(currentCart));
        setCartQuantity(newQuantity);
        window.dispatchEvent(new Event('storage'));
      }
    } catch (error) {
      console.error('Update cart quantity error:', error);
    }
  }, [product]);

  // Helper to remove from cart
  const removeFromCart = useCallback(() => {
    if (!product) return;
    try {
      const currentCart = JSON.parse(localStorage.getItem('vardhman_cart') || '{"items":[],"summary":{}}');
      const productId = product.id || (product as unknown as { _id?: string })._id || '';

      currentCart.items = currentCart.items.filter((item: { productId: string }) => item.productId !== productId);

      // Update summary
      currentCart.summary = {
        ...currentCart.summary,
        itemCount: currentCart.items.length,
        totalQuantity: currentCart.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0),
        subtotal: currentCart.items.reduce((sum: number, item: { subtotal: number }) => sum + item.subtotal, 0),
        total: currentCart.items.reduce((sum: number, item: { subtotal: number }) => sum + item.subtotal, 0),
      };

      localStorage.setItem('vardhman_cart', JSON.stringify(currentCart));
      setIsInCart(false);
      setCartQuantity(0);
      setQuantity(1);
      window.dispatchEvent(new Event('storage'));
      toast.success('Removed from cart');
    } catch (error) {
      console.error('Remove from cart error:', error);
    }
  }, [product]);

  // Handle quantity change - updates cart live when already in cart
  const handleQuantityChange = useCallback((delta: number) => {
    const newQuantity = quantity + delta;
    const maxQuantity = product?.inventory?.quantity || 99;

    // If quantity goes to 0 or below, remove from cart
    if (newQuantity <= 0 && isInCart) {
      removeFromCart();
      return;
    }

    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
      // If product is already in cart, update cart live
      if (isInCart) {
        updateCartQuantity(newQuantity);
      }
    }
  }, [quantity, product, isInCart, removeFromCart, updateCartQuantity]);

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  // Calculate these values matching FeaturedCard's logic
  // (isWishlisted state is already managed above with localStorage)

  // Images - support media.images[], flat images[], or single image
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const primaryImage = (product?.media?.primaryImage || product?.media?.images?.[0]) as any;
  const images = product?.media?.images ||
    (primaryImage ? [primaryImage] :
      (product?.images ? product.images.map((url: string, idx: number) => ({ url, alt: `${product.name} ${idx + 1}` })) :
        (product?.image ? [{ url: product.image, alt: product.name }] : [])));

  const displayImage = (() => {
    if (!primaryImage && images.length === 0) return '/images/placeholder-product.jpg';
    const img = primaryImage || images[0];
    return typeof img === 'string' ? img : img?.url || '/images/placeholder-product.jpg';
  })();

  // Price - Match FeaturedCard's logic: use variants[0].price and variants[0].comparePrice
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variant = product?.variants?.[0] as any;

  const discountedPrice = (() => {
    // First try nested pricing structure
    if (product?.pricing?.salePrice?.amount) {
      return product.pricing.salePrice.amount;
    }
    // Then try variant price
    if (variant?.price) {
      return variant.price;
    }
    // Fallback to basePrice
    return product?.pricing?.basePrice?.amount || 0;
  })();

  const originalPrice = (() => {
    // First try nested pricing structure
    if (product?.pricing?.basePrice?.amount) {
      return product.pricing.basePrice.amount;
    }
    // Then try variant comparePrice
    if (variant?.comparePrice) {
      return variant.comparePrice;
    }
    // Fallback to variant price
    return variant?.price || 0;
  })();

  const hasDiscount = discountedPrice > 0 && discountedPrice < originalPrice;
  const discountPercentage = hasDiscount && originalPrice > 0
    ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
    : 0;

  // Stock - support inventory.quantity and inventory.isInStock
  const stockQuantity = product?.inventory?.quantity ?? 99;
  const inStock = product?.inventory?.quantity !== 0;
  const isLowStock = stockQuantity > 0 && stockQuantity < 10;

  // Helper to check if string is MongoDB ObjectID (24 hex chars)
  const isMongoIdString = (str: string) => /^[a-f\d]{24}$/i.test(str);

  // Helper to safely get value from specifications (handles array or object)
  const getSpecValue = (key: string) => {
    const specs = product?.specifications;
    if (Array.isArray(specs)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return specs.find((s: any) => s.name?.toLowerCase() === key.toLowerCase())?.value;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (specs as any)?.[key];
  };

  // Category - exclude MongoDB IDs
  const categoryName = (() => {
    if (typeof product?.category === 'object' && product.category?.name) {
      return product.category.name;
    }
    if (typeof product?.category === 'string' && !isMongoIdString(product.category)) {
      return product.category;
    }
    return null;
  })();

  // Brand - exclude MongoDB IDs
  const brandName = (() => {
    if (typeof product?.brand === 'object' && (product.brand as { name?: string })?.name) {
      return (product.brand as { name: string }).name;
    }
    if (typeof product?.brand === 'string' && !isMongoIdString(product.brand)) {
      return product.brand;
    }
    return null;
  })();

  // Get available colors from product
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const availableColors = product?.colors?.filter((c: any) => c.isAvailable !== false) || [];

  // Get available sizes from product or variants
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const availableSizes = product?.sizes?.filter((s: any) => s.isAvailable !== false) ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Array.from(new Set(product?.variants?.map((v: any) => v.size).filter(Boolean))) || [];

  // Get fabric/material info
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fabricInfo = product?.materials?.[0]?.name || (variant as any)?.material || getSpecValue('fabric') || getSpecValue('material') || null;

  // Features
  const productFeatures = product?.features || [];

  return (
    <AnimatePresence>
      {isOpen && product && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto',
                className
              )}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                aria-label="Close quick view"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col md:flex-row h-full overflow-y-auto">
                {/* Left Side - Images */}
                <div className="w-full md:w-1/2 p-6 bg-gray-50">
                  <div className="sticky top-6">
                    {/* Main Image with Zoom */}
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-white mb-4 group">
                      <div
                        className="w-full h-full transition-transform duration-200 ease-out"
                        style={{ transform: `scale(${zoomLevel})` }}
                      >
                        {images[selectedImage] && (
                          <Image
                            src={images[selectedImage].url}
                            alt={images[selectedImage].alt || product.name}
                            fill
                            className={cn(
                              "object-contain transition-all duration-200",
                              zoomLevel > 1 ? "cursor-zoom-out" : "cursor-zoom-in"
                            )}
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority
                            onClick={() => setZoomLevel(z => z >= 2 ? 1 : z + 0.5)}
                          />
                        )}
                      </div>

                      {/* Zoom Controls */}
                      <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setZoomLevel(z => Math.min(3, z + 0.5))}
                          disabled={zoomLevel >= 3}
                          className="w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          aria-label="Zoom in"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setZoomLevel(z => Math.max(1, z - 0.5))}
                          disabled={zoomLevel <= 1}
                          className="w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          aria-label="Zoom out"
                        >
                          <ZoomOut className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Zoom Level Indicator */}
                      {zoomLevel > 1 && (
                        <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {zoomLevel.toFixed(1)}x
                        </div>
                      )}

                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {product.isNewArrival && (
                          <Badge variant="default" className="bg-primary-500">
                            New
                          </Badge>
                        )}
                        {hasDiscount && (
                          <Badge variant="destructive">{discountPercentage}% OFF</Badge>
                        )}
                      </div>
                    </div>

                    {/* Thumbnail Images */}
                    {images.length > 1 && (
                      <div className="grid grid-cols-5 gap-2">
                        {images.slice(0, 5).map((image, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedImage(index);
                              setZoomLevel(1);
                            }}
                            className={cn(
                              'relative aspect-square rounded-lg overflow-hidden border-2 transition-all',
                              selectedImage === index
                                ? 'border-primary-600 ring-2 ring-primary-200'
                                : 'border-gray-200 hover:border-gray-300'
                            )}
                            aria-label={`View image ${index + 1}`}
                          >
                            <Image
                              src={image.url}
                              alt={image.alt || `${product.name} ${index + 1}`}
                              fill
                              className="object-cover"
                              sizes="100px"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side - Details */}
                <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto">
                  <div className="space-y-6">
                    {/* Category & Brand */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {categoryName && <span className="uppercase tracking-wider">{categoryName}</span>}
                      {categoryName && brandName && <span>•</span>}
                      {brandName && <span className="font-medium">{brandName}</span>}
                    </div>

                    {/* Title */}
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        {product.name}
                      </h2>
                      {(product.shortDescription || product.description) && (
                        <p className="text-gray-600 line-clamp-3">{product.shortDescription || product.description}</p>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => {
                          const rating = product.rating?.average || product.averageRating || 0;
                          return (
                            <Star
                              key={i}
                              className={cn(
                                'w-5 h-5',
                                i < Math.floor(rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              )}
                            />
                          );
                        })}
                      </div>
                      <span className="text-sm text-gray-600">
                        {(product.rating?.average || product.averageRating || 0).toFixed(1)} ({product.reviewCount || product.totalReviews || 0} reviews)
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex flex-wrap items-baseline gap-3 pb-6 border-b border-gray-200">
                      <span className="text-3xl font-bold text-gray-900">
                        ₹{discountedPrice.toLocaleString()}
                      </span>
                      {hasDiscount && (
                        <>
                          <span className="text-xl text-gray-500 line-through">
                            ₹{originalPrice.toLocaleString()}
                          </span>
                          <span className="px-2 py-1 text-sm font-semibold text-white bg-green-600 rounded">
                            {discountPercentage}% OFF
                          </span>
                        </>
                      )}
                    </div>

                    {/* Colors */}
                    {product.colors && product.colors.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                          Color: {selectedOptions.color || 'Select'}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {product.colors.map((color) => {
                            // Create a color swatch button with dynamic background
                            const bgColor = color.hexCode || color.name.toLowerCase();
                            return (
                              <button
                                key={color.id}
                                onClick={() => handleOptionChange('color', color.name)}
                                className={cn(
                                  'relative w-10 h-10 rounded-full border-2 transition-all overflow-hidden',
                                  selectedOptions.color === color.name
                                    ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-900'
                                    : 'border-gray-300 hover:border-gray-400'
                                )}
                                title={color.name}
                                aria-label={`Select ${color.name} color`}
                              >
                                {/* Background color layer - using data-bg for styling via CSS */}
                                <span
                                  className="absolute inset-0 rounded-full color-swatch-bg"
                                  data-bg={bgColor}
                                />
                                {selectedOptions.color === color.name && (
                                  <Check className="w-5 h-5 text-white absolute inset-0 m-auto z-10" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Sizes */}
                    {product.sizes && product.sizes.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                          Size: {selectedOptions.size || 'Select'}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {product.sizes.map((size) => (
                            <button
                              key={size.id}
                              onClick={() => handleOptionChange('size', size.name)}
                              disabled={!size.isAvailable}
                              className={cn(
                                'px-4 py-2 rounded-lg border-2 font-medium transition-all',
                                selectedOptions.size === size.name
                                  ? 'border-gray-900 bg-gray-900 text-white'
                                  : size.isAvailable
                                    ? 'border-gray-300 hover:border-gray-400'
                                    : 'border-gray-200 text-gray-400 line-through cursor-not-allowed'
                              )}
                            >
                              {size.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Product Details Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm py-4 border-t border-gray-100">
                      {/* Fabric/Material */}
                      {fabricInfo && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Fabric</span>
                          <span className="font-medium text-gray-900">{fabricInfo}</span>
                        </div>
                      )}
                      {/* Thread Count */}
                      {(variant?.threadCount || getSpecValue('threadCount') || getSpecValue('thread count')) && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Thread Count</span>
                          <span className="font-medium text-gray-900">
                            {variant?.threadCount || getSpecValue('threadCount') || getSpecValue('thread count')}
                          </span>
                        </div>
                      )}
                      {/* Weight */}
                      {(variant?.weight || getSpecValue('weight')) && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Weight</span>
                          <span className="font-medium text-gray-900">
                            {variant?.weight || getSpecValue('weight')}
                          </span>
                        </div>
                      )}
                      {/* Available Sizes */}
                      {availableSizes.length > 0 && (
                        <div className="col-span-2 flex flex-wrap gap-2 mt-2">
                          <span className="text-gray-500 w-full text-xs uppercase tracking-wide mb-1">Available Sizes</span>
                          {availableSizes.slice(0, 6).map((size: unknown, idx: number) => {
                            const sizeValue = typeof size === 'object' && size !== null
                              ? (size as { name?: string; value?: string }).name || (size as { value?: string }).value
                              : size;
                            return (
                              <span key={idx} className="px-2 py-1 text-xs border border-gray-200 rounded bg-gray-50">
                                {String(sizeValue)}
                              </span>
                            );
                          })}
                        </div>
                      )}
                      {/* SKU */}
                      {product.sku && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">SKU</span>
                          <span className="font-medium text-gray-900 font-mono text-xs">{product.sku}</span>
                        </div>
                      )}
                    </div>

                    {/* Key Features */}
                    {productFeatures.length > 0 && (
                      <div className="py-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Features</h3>
                        <ul className="space-y-2">
                          {productFeatures.slice(0, 4).map((feature: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Static Services (like FeaturedCard) */}
                    <div className="flex flex-wrap gap-4 py-4 border-t border-gray-100 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-green-600" />
                        <span>Free Shipping</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <span>Warranty</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span>Fast Delivery</span>
                      </div>
                    </div>

                    {/* Actions Section */}
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                      {/* Quantity Selector - Compact UI */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-gray-900">Quantity</h3>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="inline-flex items-center bg-gray-100 rounded-lg overflow-hidden">
                            <button
                              onClick={() => handleQuantityChange(-1)}
                              disabled={!isInCart && quantity <= 1}
                              className={cn(
                                "w-10 h-10 flex items-center justify-center transition-colors",
                                isInCart
                                  ? "hover:bg-red-100 text-gray-700"
                                  : "hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              )}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center font-semibold text-base text-gray-900">
                              {quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(1)}
                              disabled={quantity >= (stockQuantity || 99)}
                              className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          {isLowStock && (
                            <span className="text-sm text-orange-600 font-medium">
                              Only {stockQuantity} left!
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Add to Cart / View Cart Button */}
                      {isInCart ? (
                        <Link href="/cart" className="block">
                          <Button
                            variant="default"
                            size="lg"
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            View Cart ({cartQuantity} items)
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          variant="default"
                          size="lg"
                          onClick={handleAddToCart}
                          disabled={!inStock || cartLoading}
                          className="w-full"
                        >
                          {cartLoading ? (
                            <>Adding...</>
                          ) : (
                            <>
                              <ShoppingCart className="w-5 h-5 mr-2" />
                              {inStock ? 'Add to Cart' : 'Out of Stock'}
                            </>
                          )}
                        </Button>
                      )}

                      <div className="flex gap-3 mt-4">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={handleWishlistToggle}
                          disabled={wishlistLoading}
                          className={cn(
                            'flex-1',
                            isWishlisted && 'text-red-500 border-red-500'
                          )}
                        >
                          <Heart className={cn('w-5 h-5 mr-2', isWishlisted && 'fill-current')} />
                          {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                        </Button>

                        <Button variant="outline" size="lg" onClick={handleShare} className="flex-1">
                          <Share2 className="w-5 h-5 mr-2" />
                          Share
                        </Button>
                      </div>

                      {/* WhatsApp Inquiry Button */}
                      <a
                        href={`https://wa.me/919876543210?text=${encodeURIComponent(
                          `Hi! I'm interested in: ${product.name}\n\nPrice: ₹${discountedPrice.toLocaleString()}${hasDiscount ? ` (was ₹${originalPrice.toLocaleString()})` : ''}\n\nProduct Link: ${typeof window !== 'undefined' ? window.location.origin : ''}/products/${product.slug}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full h-10 px-4 mt-4 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-md transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        WhatsApp Inquiry
                      </a>

                      <Link href={`/products/${product.slug}`} className="mt-3 block">
                        <Button variant="link" size="lg" className="w-full">
                          View Full Details
                        </Button>
                      </Link>
                    </div>

                    {/* Stock Status */}
                    {inStock ? (
                      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg mt-4">
                        <Check className="w-4 h-4" />
                        <span>In Stock {isLowStock ? `- Only ${stockQuantity} left!` : '- Ships within 2-3 business days'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg mt-4">
                        <span>Currently Out of Stock - Contact us for availability</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuickView;