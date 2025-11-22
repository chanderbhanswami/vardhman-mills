/**
 * Product Detail Page - Vardhman Mills
 * Comprehensive product page with all features
 */

'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { notFound } from 'next/navigation';

// UI Components
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Alert, { AlertDescription } from '@/components/ui/Alert';
import Tabs, { TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

// Layout Components
import Breadcrumbs from '@/components/layout/Breadcrumbs';

// Common Components
import {
  LoadingSpinner,
  ErrorBoundary,
  SEOHead,
  BackToTop,
  ShareButtons,
  ImageGallery,
  OptimizedImage,
} from '@/components/common';

// Product Components
import {
  ProductDetails,
  AddToCart,
  DeliveryPincodeAndAddressSelection,
  ProductActions,
  ProductBreadcrumb,
  ProductDescription,
  ProductGallery,
  ProductImageZoom,
  ProductInfo,
  ProductMediaCarousel,
  ProductOffers,
  ProductOptions,
  ProductQuantity,
  ProductReviews,
  ProductSpecs,
  ProductTabs,
  ProductVariants,
  RelatedProducts,
  SocialShare,
  WhatsappEnquiry,
  ProductGrid,
} from '@/components/products';

// Hooks
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/components/providers';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useMediaQuery } from '@/hooks';

// Types
import type { Product, ProductVariant } from '@/types/product.types';

// Utils
import { cn, formatCurrency } from '@/lib/utils';
import { API_ENDPOINTS } from '@/lib/constants';

// Icons
import {
  HeartIcon,
  ShareIcon,
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface ProductPageContentProps {
  initialProduct?: Product | null;
}

function ProductPageContent({ initialProduct = null }: ProductPageContentProps) {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const { toast } = useToast();
  const { user } = useAuth();
  const { addToCart, items: cartItems } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Responsive
  const isMobile = useMediaQuery('(max-width: 768px)');

  // State Management
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [isLoading, setIsLoading] = useState(!initialProduct);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [pincode, setPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState<{ available: boolean; estimatedDays: number; cod: boolean; freeShipping: boolean } | null>(null);
  const [isCheckingDelivery, setIsCheckingDelivery] = useState(false);

  // Generate mock product data
  const generateMockProduct = useCallback((productSlug: string): Product => {
    const categories = ['Cotton', 'Silk', 'Linen', 'Wool', 'Synthetic'];
    const colors = ['White', 'Blue', 'Red', 'Green', 'Yellow', 'Black', 'Pink', 'Purple'];
    const sizes = ['Single', 'Double', 'Queen', 'King'];
    const materials = ['100% Cotton', 'Cotton Blend', 'Pure Silk', 'Linen Mix', 'Microfiber'];

    const index = Math.abs(productSlug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
    const basePrice = 2000 + (index % 20) * 300;
    const discount = Math.floor(Math.random() * 30) + 15;
    const salePrice = basePrice - (basePrice * discount / 100);
    const rating = 4.0 + Math.random() * 1.0;
    const reviewCount = Math.floor(Math.random() * 500) + 100;

    return {
      id: `product-${index}`,
      name: `Premium ${categories[index % categories.length]} Bedsheet Set - ${productSlug}`,
      slug: productSlug,
      description: `Experience luxury and comfort with our Premium ${categories[index % categories.length]} Bedsheet Set. Crafted from the finest ${materials[index % materials.length]}, this bedsheet offers exceptional softness and durability. Perfect for modern homes, it features elegant design patterns that complement any bedroom decor. The high-quality fabric ensures breathability and comfort throughout the night, making it an ideal choice for all seasons.`,
      longDescription: `Our Premium ${categories[index % categories.length]} Bedsheet Set represents the pinnacle of bedding excellence. Each piece is meticulously crafted using premium ${materials[index % materials.length]}, ensuring superior quality that lasts for years. The fabric undergoes rigorous quality checks and is treated with advanced finishing techniques to enhance its natural properties.\n\nKey Features:\n- Ultra-soft and comfortable fabric\n- Breathable material for all-season use\n- Elegant design patterns\n- Easy to maintain and long-lasting\n- Pre-shrunk and color-fast\n- Hypoallergenic and skin-friendly\n\nCare Instructions:\n- Machine wash in cold water\n- Use mild detergent\n- Tumble dry on low heat\n- Iron on medium heat if needed\n- Do not bleach\n\nWhat's Included:\n- 1 Fitted Sheet (${sizes[index % sizes.length]} Size)\n- 1 Flat Sheet\n- 2 Pillow Covers\n- Beautiful packaging perfect for gifting`,
      category: {
        id: `cat-${index % categories.length}`,
        name: categories[index % categories.length],
        slug: categories[index % categories.length].toLowerCase(),
        description: `Premium ${categories[index % categories.length]} bedding products`,
      },
      pricing: {
        basePrice: {
          amount: basePrice,
          currency: 'INR',
          displayAmount: formatCurrency(basePrice),
        },
        salePrice: {
          amount: salePrice,
          currency: 'INR',
          displayAmount: formatCurrency(salePrice),
        },
        compareAtPrice: {
          amount: basePrice,
          currency: 'INR',
          displayAmount: formatCurrency(basePrice),
        },
        discount: {
          amount: basePrice - salePrice,
          percentage: discount,
        },
        isDynamicPricing: false,
        taxable: true,
        taxRate: 12,
      },
      media: {
        images: Array.from({ length: 6 }, (_, i) => ({
          id: `img-${index}-${i}`,
          url: `https://picsum.photos/seed/product${index}${i}/1000/1000`,
          alt: `${categories[index % categories.length]} Bedsheet - Image ${i + 1}`,
          title: `Product Image ${i + 1}`,
          width: 1000,
          height: 1000,
          isPrimary: i === 0,
          position: i,
        })),
        videos: [
          {
            id: `video-${index}`,
            url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            thumbnail: `https://picsum.photos/seed/video${index}/800/450`,
            title: 'Product Video',
            duration: 60,
            type: 'youtube',
          },
        ],
      },
      inventory: {
        inStock: Math.random() > 0.1,
        quantity: Math.floor(Math.random() * 100) + 20,
        isLowStock: Math.random() > 0.7,
        lowStockThreshold: 10,
        allowBackorder: true,
        backorderLimit: 50,
        trackInventory: true,
        sku: `SKU-${index}-${Date.now()}`,
      },
      attributes: {
        color: colors[index % colors.length],
        size: sizes[index % sizes.length],
        material: materials[index % materials.length],
        threadCount: 300 + (index % 5) * 100,
        brand: 'Vardhman Mills',
        weight: `${1.5 + (index % 3) * 0.5} kg`,
        dimensions: `${220 + (index % 2) * 20}x${240 + (index % 2) * 20} cm`,
        pattern: ['Solid', 'Striped', 'Floral', 'Geometric'][index % 4],
        weave: ['Sateen', 'Percale', 'Twill', 'Jersey'][index % 4],
      },
      variants: colors.slice(0, 4).map((color, i) => ({
        id: `variant-${index}-${i}`,
        name: `${color} - ${sizes[index % sizes.length]}`,
        sku: `VAR-${index}-${i}`,
        price: salePrice + (i * 100),
        inStock: Math.random() > 0.2,
        attributes: {
          color,
          size: sizes[index % sizes.length],
        },
        media: {
          images: [
            {
              id: `var-img-${i}`,
              url: `https://picsum.photos/seed/variant${index}${i}/800/800`,
              alt: `${color} variant`,
              title: color,
              width: 800,
              height: 800,
              isPrimary: true,
            },
          ],
          videos: [],
        },
      })),
      specifications: {
        'Material': materials[index % materials.length],
        'Thread Count': `${300 + (index % 5) * 100}`,
        'Size': sizes[index % sizes.length],
        'Color': colors[index % colors.length],
        'Pattern': ['Solid', 'Striped', 'Floral', 'Geometric'][index % 4],
        'Weave': ['Sateen', 'Percale', 'Twill', 'Jersey'][index % 4],
        'Weight': `${1.5 + (index % 3) * 0.5} kg`,
        'Dimensions': `${220 + (index % 2) * 20}x${240 + (index % 2) * 20} cm`,
        'Care Instructions': 'Machine wash cold, tumble dry low',
        'Country of Origin': 'India',
        'Brand': 'Vardhman Mills',
        'Warranty': '6 months manufacturer warranty',
      },
      rating: parseFloat(rating.toFixed(1)),
      reviewCount,
      reviews: Array.from({ length: 5 }, (_, i) => ({
        id: `review-${i}`,
        userId: `user-${i}`,
        userName: ['Rahul S.', 'Priya M.', 'Amit K.', 'Sneha P.', 'Vijay R.'][i],
        rating: 4 + Math.random(),
        title: ['Excellent Quality!', 'Very Comfortable', 'Good Value', 'Highly Recommended', 'Love it!'][i],
        comment: [
          'The bedsheet is extremely soft and comfortable. The quality is top-notch and worth every penny.',
          'Very satisfied with the purchase. The material feels premium and the colors are vibrant.',
          'Great value for money. The bedsheet is durable and maintains its quality after multiple washes.',
          'Highly recommend this product. Perfect fit and the finishing is excellent.',
          'Absolutely love this bedsheet! The texture is amazing and it looks beautiful in my bedroom.',
        ][i],
        createdAt: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true,
        helpful: Math.floor(Math.random() * 50) + 10,
      })),
      tags: ['bestseller', 'premium', 'trending', 'new-arrival', 'top-rated'],
      isFeatured: Math.random() > 0.5,
      isNew: Math.random() > 0.7,
      isBestseller: Math.random() > 0.6,
      collections: ['Premium Collection', 'Summer Special'],
      features: [
        'Premium quality fabric',
        'Soft and comfortable',
        'Breathable material',
        'Easy to maintain',
        'Color-fast and durable',
        'Hypoallergenic',
        'Elegant design',
        'Perfect fit',
      ],
      benefits: [
        'Enhanced sleep quality',
        'All-season comfort',
        'Long-lasting durability',
        'Easy care and maintenance',
        'Skin-friendly material',
      ],
      shipping: {
        freeShipping: salePrice > 1500,
        deliveryTime: '3-5 business days',
        returnPolicy: '30 days easy return',
        warranty: '6 months',
      },
      seo: {
        metaTitle: `${categories[index % categories.length]} Bedsheet - Premium Quality | Vardhman Mills`,
        metaDescription: `Buy premium ${categories[index % categories.length]} bedsheet online. High-quality, comfortable, and durable. Free shipping on orders above ₹1500.`,
        keywords: [categories[index % categories.length].toLowerCase(), 'bedsheet', 'premium', 'quality'],
      },
      relatedProducts: [],
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as Product;
  }, []);

  // Fetch product
  const fetchProduct = useCallback(async () => {
    if (!slug) return;

    try {
      setIsLoading(true);
      setError(null);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockProduct = generateMockProduct(slug);
      
      if (!mockProduct) {
        notFound();
        return;
      }

      setProduct(mockProduct);

      // Set first variant as default
      if (mockProduct.variants && mockProduct.variants.length > 0) {
        setSelectedVariant(mockProduct.variants[0]);
      }

      // Log API endpoint for future real data fetching
      console.log('Product API endpoint:', API_ENDPOINTS.PRODUCT_BY_SLUG(slug));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load product';
      setError(errorMessage);
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [slug, generateMockProduct, toast]);

  // Calculate current price (needed for callbacks)
  const currentPrice = product ? (selectedVariant?.pricing?.salePrice?.amount || product.pricing.salePrice?.amount || product.pricing.basePrice.amount) : 0;

  // Check delivery availability
  const checkDelivery = useCallback(async () => {
    if (!pincode || pincode.length !== 6) {
      toast({
        title: 'Invalid Pincode',
        description: 'Please enter a valid 6-digit pincode',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsCheckingDelivery(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setDeliveryInfo({
        available: Math.random() > 0.1,
        estimatedDays: Math.floor(Math.random() * 5) + 3,
        cod: Math.random() > 0.2,
        freeShipping: currentPrice > 1500, // Free shipping on orders above ₹1500
      });

      toast({
        title: 'Delivery Available',
        description: `Delivery available in ${Math.floor(Math.random() * 5) + 3} days`,
        variant: 'success',
      });

    } catch (err) {
      console.error('Delivery check error:', err);
      toast({
        title: 'Error',
        description: 'Failed to check delivery availability',
        variant: 'destructive',
      });
    } finally {
      setIsCheckingDelivery(false);
    }
  }, [pincode, toast, currentPrice]);

  // Handlers
  const handleAddToCart = useCallback(async () => {
    if (!product) return;

    try {
      await addToCart(product, quantity);
      toast({
        title: 'Added to cart',
        description: `${product.name} has been added to your cart`,
        variant: 'success',
      });
    } catch (err) {
      console.error('Add to cart error:', err);
      toast({
        title: 'Error',
        description: 'Failed to add product to cart',
        variant: 'destructive',
      });
    }
  }, [product, quantity, addToCart, toast]);

  const handleToggleWishlist = useCallback(async () => {
    if (!product) return;

    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
        toast({
          title: 'Removed from wishlist',
          description: `${product.name} has been removed from your wishlist`,
          variant: 'success',
        });
      } else {
        await addToWishlist(product);
        toast({
          title: 'Added to wishlist',
          description: `${product.name} has been added to your wishlist`,
          variant: 'success',
        });
      }
    } catch (err) {
      console.error('Wishlist update error:', err);
      toast({
        title: 'Error',
        description: 'Failed to update wishlist',
        variant: 'destructive',
      });
    }
  }, [product, addToWishlist, removeFromWishlist, isInWishlist, toast]);

  const handleBuyNow = useCallback(() => {
    if (!product) return;
    handleAddToCart();
    setTimeout(() => {
      router.push('/checkout');
    }, 500);
  }, [product, handleAddToCart, router]);

  const handleVariantChange = useCallback((variant: ProductVariant) => {
    setSelectedVariant(variant);
    setQuantity(1);
  }, []);

  // Effects
  useEffect(() => {
    if (!initialProduct) {
      fetchProduct();
    }
  }, [initialProduct, fetchProduct]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <ErrorBoundary>
        <div className="container mx-auto py-12 px-4">
          <Alert variant="destructive">
            <AlertDescription>{error || 'Product not found'}</AlertDescription>
          </Alert>
          <div className="mt-6 flex gap-4 justify-center">
            <Button onClick={() => router.push('/products')}>Browse Products</Button>
            <Button variant="outline" onClick={fetchProduct}>
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const isInCart = cartItems.some(item => item.product.id === product.id);

  return (
    <ErrorBoundary>
      <SEOHead
        title={(product.seo?.metaTitle as string) || `${product.name} | Vardhman Mills`}
        description={(product.seo?.metaDescription as string) || product.description}
        keywords={product.seo?.keywords?.join(', ') || ''}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumbs */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <ProductBreadcrumb
              product={product}
            />
            {/* Alternative Breadcrumbs component for mobile */}
            {isMobile && (
              <Breadcrumbs
                items={[
                  { label: 'Home', href: '/' },
                  { label: 'Products', href: '/products' },
                  { label: product.category.name, href: `/products?category=${product.category.slug}` },
                  { label: product.name }
                ]}
                className="mt-2"
              />
            )}
          </div>
        </div>

        {/* Main Product Section */}
        <div className="container mx-auto px-4 py-8">
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Product Gallery */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ProductGallery
                product={product}
                selectedVariant={selectedVariant || undefined}
                showThumbnails={true}
                showZoom={true}
              />

              {/* View All Images Button */}
              {product.media.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.media.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedImage(index);
                        setShowImageZoom(true);
                      }}
                      aria-label={`View image ${index + 1} of ${product.name}`}
                      className="flex-shrink-0 w-20 h-20 rounded border-2 hover:border-primary-600 transition-colors"
                    >
                      <Image
                        src={image.url}
                        alt={image.alt || `${product.name} - Image ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover rounded"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Image Zoom Modal - Opens when thumbnail clicked */}
              {showImageZoom && product.media.images[selectedImage] && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
                  <button
                    onClick={() => setShowImageZoom(false)}
                    aria-label="Close fullscreen view"
                    className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <ProductImageZoom
                    src={product.media.images[selectedImage].url}
                    alt={product.media.images[selectedImage].alt || product.name}
                    enableFullscreen={true}
                    showControls={true}
                  />
                </div>
              )}

              {/* Product Features - Mobile */}
              {isMobile && (
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <TruckIcon className="w-5 h-5 text-primary-600" />
                        <div className="text-sm">
                          <div className="font-medium">Free Delivery</div>
                          <div className="text-gray-600">On orders above ₹1500</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheckIcon className="w-5 h-5 text-primary-600" />
                        <div className="text-sm">
                          <div className="font-medium">Quality Assured</div>
                          <div className="text-gray-600">Premium materials</div>
                        </div>
                      </div>
                    </div>
                    {/* Quick Actions - Mobile Only */}
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          min={1}
                          max={product.inventory.quantity}
                          className="w-20"
                          placeholder="Qty"
                        />
                        {product.variants && product.variants.length > 0 && (
                          <select
                            value={selectedVariant?.id || ''}
                            onChange={(e) => {
                              const variant = product.variants.find(v => v.id === e.target.value);
                              if (variant) handleVariantChange(variant);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            aria-label="Select product variant"
                            title="Choose a variant"
                          >
                            <option value="">Select Variant</option>
                            {product.variants.map(variant => (
                              <option key={variant.id} value={variant.id}>
                                {variant.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <ProductInfo
                product={product}
                selectedVariant={selectedVariant || undefined}
              />

              {/* Price and Stock */}
              <div className="space-y-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatCurrency(currentPrice)}
                  </span>
                  {product.pricing.compareAtPrice && product.pricing.compareAtPrice.amount > currentPrice && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        {formatCurrency(product.pricing.compareAtPrice.amount)}
                      </span>
                      <Badge variant="success" className="text-lg">
                        {Math.round(((product.pricing.compareAtPrice.amount - currentPrice) / product.pricing.compareAtPrice.amount) * 100)}% OFF
                      </Badge>
                    </>
                  )}
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-2">
                  {product.inventory.isInStock ? (
                    <>
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                      <span className="text-green-600 font-medium">
                        In Stock
                        {product.inventory.isLowStock && ' (Limited Stock)'}
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="w-5 h-5 text-red-600" />
                      <span className="text-red-600 font-medium">Out of Stock</span>
                    </>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIconSolid
                        key={i}
                        className={cn(
                          'w-5 h-5',
                          i < Math.floor(product.rating.average)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-gray-700 font-medium">{product.rating.average.toFixed(1)}</span>
                  <span className="text-gray-500">
                    ({product.rating.count} reviews)
                  </span>
                </div>
              </div>

              {/* Quick Info Tabs */}
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="description">Overview</TabsTrigger>
                  <TabsTrigger value="specs">Specifications</TabsTrigger>
                  <TabsTrigger value="shipping">Delivery</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="text-sm text-gray-600 p-4 bg-gray-50 rounded">
                  {product.description.substring(0, 150)}...
                </TabsContent>
                <TabsContent value="specs" className="text-sm text-gray-600 p-4 bg-gray-50 rounded">
                  {product.specifications.slice(0, 3).map((spec, i) => (
                    <div key={i} className="flex justify-between py-1">
                      <span className="font-medium">{spec.name}:</span>
                      <span>{spec.value}</span>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="shipping" className="text-sm text-gray-600 p-4 bg-gray-50 rounded">
                  <div className="space-y-1">
                    <div>✓ Free shipping on orders above ₹1500</div>
                    <div>✓ Delivery in {Math.floor(Math.random() * 5) + 3}-{Math.floor(Math.random() * 5) + 7} days</div>
                    <div>✓ Cash on Delivery available</div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <ProductVariants
                  product={product}
                  selectedVariant={selectedVariant}
                  onVariantChange={handleVariantChange}
                />
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-2">
                <ProductQuantity
                  value={quantity}
                  onChange={setQuantity}
                  max={product.inventory.quantity}
                  disabled={!product.inventory.isInStock}
                />
                <InformationCircleIcon 
                  className="w-5 h-5 text-gray-400 cursor-help" 
                  title={`Maximum available: ${product.inventory.quantity}`}
                />
              </div>

              {/* Stock Level Indicator with StarIcon */}
              {product.inventory.isInStock && product.inventory.quantity < 10 && (
                <div className="flex items-center gap-2 text-orange-600 text-sm">
                  <StarIcon className="w-4 h-4" />
                  <span>Only {product.inventory.quantity} left in stock - order soon!</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  <AddToCart
                    product={product}
                    quantity={quantity}
                    selectedVariant={selectedVariant || undefined}
                    disabled={!product.inventory.isInStock}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleToggleWishlist}
                    className="px-4"
                  >
                    {inWishlist ? (
                      <HeartIconSolid className="w-6 h-6 text-red-500" />
                    ) : (
                      <HeartIcon className="w-6 h-6" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-4"
                  >
                    <ShareIcon className="w-6 h-6" />
                  </Button>
                </div>

                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full"
                  onClick={handleBuyNow}
                  disabled={!product.inventory.isInStock}
                >
                  Buy Now
                </Button>
              </div>

              {/* Delivery Check */}
              <DeliveryPincodeAndAddressSelection
                product={product}
                onPincodeVerified={(code: string) => {
                  setPincode(code);
                  checkDelivery();
                }}
              />

              {/* Delivery checking loader */}
              {isCheckingDelivery && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Checking delivery availability...</span>
                </div>
              )}

              {deliveryInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Delivery Information</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {deliveryInfo.available ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircleIcon className="w-5 h-5" />
                          <span className="font-medium">
                            Delivery available in {deliveryInfo.estimatedDays} days
                          </span>
                        </div>
                        {deliveryInfo.cod && (
                          <div className="text-gray-600">✓ Cash on Delivery available</div>
                        )}
                        {deliveryInfo.freeShipping && (
                          <div className="text-gray-600">✓ Free Shipping</div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600">
                        <XCircleIcon className="w-5 h-5" />
                        <span>Delivery not available for this pincode</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Product Offers */}
              <ProductOffers
                product={product}
              />

              {/* Quantity Selector with Select Component for Desktop */}
              {!isMobile && product.variants && product.variants.length > 1 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Quick Variant Selection:</label>
                  <Select
                    options={product.variants.map(v => ({ label: v.name, value: v.id }))}
                    value={selectedVariant?.id}
                    onValueChange={(value: string | number) => {
                      const variant = product.variants.find(v => v.id === value);
                      if (variant) handleVariantChange(variant);
                    }}
                    placeholder="Choose a variant"
                  />
                </div>
              )}

              {/* Product Features */}
              {!isMobile && (
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <TruckIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                        <div className="text-sm font-medium">Free Delivery</div>
                        <div className="text-xs text-gray-600">On orders above ₹1500</div>
                      </div>
                      <div className="text-center">
                        <ArrowPathIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                        <div className="text-sm font-medium">Easy Returns</div>
                        <div className="text-xs text-gray-600">30 days return policy</div>
                      </div>
                      <div className="text-center">
                        <ShieldCheckIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                        <div className="text-sm font-medium">Quality Assured</div>
                        <div className="text-xs text-gray-600">Premium materials</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Social Share and WhatsApp */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <SocialShare
                    product={product}
                  />
                  <WhatsappEnquiry product={product} />
                </div>
                {/* Alternative Share Buttons for user engagement */}
                {user && (
                  <ShareButtons
                    url={`${typeof window !== 'undefined' ? window.location.origin : ''}/products/${product.slug}`}
                    title={product.name}
                    description={product.description}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* Alternative Media Gallery View */}
          {!isMobile && product.media.images.length > 3 && (
            <Card className="mb-12">
              <CardHeader>
                <CardTitle>Product Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageGallery
                  images={product.media.images.map((img, idx) => ({
                    id: `img-${idx}`,
                    src: img.url,
                    alt: img.alt || product.name,
                    thumbnail: img.url
                  }))}
                />
                {/* Featured Image with OptimizedImage */}
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {product.media.images.slice(0, 3).map((image, index) => (
                    <div key={index} className="aspect-square">
                      <OptimizedImage
                        src={image.url}
                        alt={image.alt || `${product.name} - View ${index + 1}`}
                        width={300}
                        height={300}
                        className="rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product Tabs */}
          <Card className="mb-12">
            <CardContent className="p-0">
              <ProductTabs
                product={product}
              />
            </CardContent>
          </Card>

          {/* Enhanced Product Details Section */}
          {!isMobile && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {/* ProductDetails Component */}
              <Card>
                <CardHeader>
                  <CardTitle>Complete Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductDetails
                    product={product}
                  />
                </CardContent>
              </Card>

              {/* ProductDescription Component */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductDescription
                    product={product}
                  />
                </CardContent>
              </Card>

              {/* ProductSpecs Component */}
              <Card>
                <CardHeader>
                  <CardTitle>Technical Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductSpecs
                    product={product}
                  />
                </CardContent>
              </Card>

              {/* ProductReviews Component */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductReviews
                    product={product}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Additional Product Components for Enhanced Display */}
          {isInCart && (
            <Card className="mb-12">
              <CardHeader>
                <CardTitle>Product Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductActions
                  product={product}
                />
              </CardContent>
            </Card>
          )}

          {/* ProductOptions alternative view */}
          {product.variants && product.variants.length > 0 && !isMobile && (
            <Card className="mb-12">
              <CardHeader>
                <CardTitle>Available Options</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductOptions
                  product={product}
                  selectedOptions={{}}
                  onOptionChange={() => {}}
                />
              </CardContent>
            </Card>
          )}

          {/* ProductMediaCarousel for video content */}
          {product.media.videos && product.media.videos.length > 0 && (
            <Card className="mb-12">
              <CardHeader>
                <CardTitle>Product Videos</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductMediaCarousel
                  product={product}
                />
              </CardContent>
            </Card>
          )}

          {/* Related Products Grid */}
          <div>
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <RelatedProducts
              product={product}
              maxItems={4}
              title="You May Also Like"
            />
            {/* Alternative ProductGrid view */}
            {!isMobile && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">More from this category</h3>
                <ProductGrid
                  products={[product]} // Would normally be category products
                  columns={4}
                  showQuickView={true}
                />
              </div>
            )}
          </div>
        </div>

        <BackToTop />
      </div>
    </ErrorBoundary>
  );
}

// Main export with Suspense
export default function ProductPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <ProductPageContent />
    </Suspense>
  );
}
