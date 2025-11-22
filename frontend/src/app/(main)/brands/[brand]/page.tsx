/**
 * Brand Detail Page - Vardhman Mills
 * 
 * Individual brand showcase page with products, story, and information.
 * 
 * Features:
 * - Brand hero banner with statistics
 * - Brand story and values
 * - Product showcase with filtering
 * - Related brands carousel
 * - Brand testimonials
 * - Social media links
 * - Follow/unfollow functionality
 * - SEO optimization
 * - Breadcrumb navigation
 * - Share functionality
 * - Responsive design
 * - Loading states
 * - Error handling
 * 
 * @page
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartIcon,
  ShareIcon,
  MapPinIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  TrophyIcon,
  UsersIcon,
  ShoppingBagIcon,
  StarIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

// Components
import { Container } from '@/components/ui';
import SEOHead from '@/components/common/SEO/SEOHead';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

// Home Components
import BrandBanner from '@/components/home/Brands/BrandBanner';
import BrandCarousel from '@/components/home/Brands/BrandCarousel';

// Product Components
import {
  ProductGrid,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ProductCard,
} from '@/components/products';

// Types
import type { Brand, Product } from '@/types/product.types';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils/utils';

// ============================================================================
// TYPES
// ============================================================================

interface BrandStats {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}

interface Testimonial {
  id: string;
  author: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MOCK_BRAND: Brand | null = null;
const MOCK_PRODUCTS: Product[] = [];
const MOCK_RELATED_BRANDS: Brand[] = [];

const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    author: 'Sarah Johnson',
    role: 'Interior Designer',
    content: 'Exceptional quality and timeless designs. This brand never disappoints.',
    rating: 5,
  },
  {
    id: '2',
    author: 'Michael Chen',
    role: 'Home Owner',
    content: 'The attention to detail and craftsmanship is outstanding. Highly recommended!',
    rating: 5,
  },
  {
    id: '3',
    author: 'Emily Rodriguez',
    role: 'Hotel Manager',
    content: 'We trust this brand for all our textile needs. Consistent excellence.',
    rating: 5,
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function BrandDetailPage() {
  const router = useRouter();
  const params = useParams();
  const brandSlug = params?.brand as string;

  // ============================================================================
  // STATE
  // ============================================================================

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [brand, setBrand] = useState<Brand | null>(MOCK_BRAND);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [relatedBrands, setRelatedBrands] = useState<Brand[]>(MOCK_RELATED_BRANDS);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [productFilters, setProductFilters] = useState({
    category: 'all',
    sortBy: 'popular',
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const brandStats: BrandStats[] = useMemo(() => {
    if (!brand) return [];
    
    return [
      {
        icon: ShoppingBagIcon,
        label: 'Products',
        value: formatNumber(brand.productCount || 0),
        color: 'from-blue-500 to-cyan-500',
      },
      {
        icon: UsersIcon,
        label: 'Followers',
        value: formatNumber(brand.followersCount || 0),
        color: 'from-purple-500 to-pink-500',
      },
      {
        icon: TrophyIcon,
        label: 'Awards',
        value: formatNumber(brand.awards || 0),
        color: 'from-yellow-500 to-orange-500',
      },
      {
        icon: StarIcon,
        label: 'Rating',
        value: `${brand.rating || 0}/5`,
        color: 'from-green-500 to-emerald-500',
      },
    ];
  }, [brand]);

  const seoData = useMemo(() => ({
    title: brand ? `${brand.name} - Premium Home Textiles | Vardhman Mills` : 'Brand Details',
    description: brand?.description || 'Explore our premium home textile brand',
    keywords: `${brand?.name}, home textiles, premium furnishings`,
    ogImage: brand?.logo || '/images/brand-og.jpg',
    canonical: `https://vardhmanmills.com/brands/${brandSlug}`,
  }), [brand, brandSlug]);

  const breadcrumbItems = useMemo(() => [
    { label: 'Home', href: '/' },
    { label: 'Brands', href: '/brands' },
    { label: brand?.name || 'Loading...', href: `/brands/${brandSlug}` },
  ], [brand, brandSlug]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (productFilters.category !== 'all') {
      result = result.filter(p => p.categoryId === productFilters.category);
    }

    // Sort
    result.sort((a, b) => {
      switch (productFilters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return (a.pricing?.basePrice?.amount || 0) - (b.pricing?.basePrice?.amount || 0);
        case 'price-high':
          return (b.pricing?.basePrice?.amount || 0) - (a.pricing?.basePrice?.amount || 0);
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'popular':
        default:
          return (b.reviewCount || 0) - (a.reviewCount || 0);
      }
    });

    return result;
  }, [products, productFilters]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Simulate API call
    const fetchBrandData = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const brandData = await fetch(`/api/v1/brands/bySlug/${brandSlug}`);
        // const productsData = await fetch(`/api/v1/brands/${brand.id}/products`);
        // const relatedData = await fetch(`/api/v1/brands/related/${brand.id}`);
        
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching brand:', error);
        setLoading(false);
      }
    };

    if (brandSlug) {
      fetchBrandData();
    }
  }, [brandSlug]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFollowToggle = useCallback(() => {
    setIsFollowing(prev => !prev);
    // TODO: Implement actual follow/unfollow API call
  }, []);

  const handleShare = useCallback(async () => {
    if (navigator.share && brand) {
      try {
        await navigator.share({
          title: brand.name,
          text: brand.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  }, [brand]);

  const handleProductClick = useCallback((product: Product) => {
    router.push(`/products/${product.slug}`);
  }, [router]);

  // TODO: Implement related brand navigation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleBrandClick = useCallback((relatedBrand: Brand) => {
    router.push(`/brands/${relatedBrand.slug}`);
  }, [router]);

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderBreadcrumbs = () => (
    <nav className="flex items-center space-x-2 text-sm mb-6">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.href}>
          {index > 0 && <span className="text-gray-400">/</span>}
          <a
            href={item.href}
            className={cn(
              'hover:text-blue-600 transition-colors',
              index === breadcrumbItems.length - 1
                ? 'text-gray-900 dark:text-white font-semibold'
                : 'text-gray-600 dark:text-gray-400'
            )}
          >
            {item.label}
          </a>
        </React.Fragment>
      ))}
    </nav>
  );

  const renderBrandHeader = () => {
    if (!brand) return null;

    return (
      <div className="space-y-6">
        {renderBreadcrumbs()}

        {/* Brand Banner with Image */}
        <div className="relative mb-6">
          {brand.bannerImage && (
            <div className="w-full h-48 rounded-xl overflow-hidden mb-4">
              <Image
                src={brand.bannerImage.url}
                alt={brand.name}
                width={1200}
                height={400}
                className="object-cover w-full h-full"
                priority
              />
            </div>
          )}
          <BrandBanner 
            brand={brand}
            showStats
            showTestimonials
            animated
          />
          {/* Verified Badge */}
          {brand.isVerified && (
            <Badge variant="success" className="absolute top-4 right-4">
              <CheckBadgeIcon className="w-4 h-4 mr-1" />
              Verified Brand
            </Badge>
          )}
          {/* Awards Badge */}
          {brand.awards && brand.awards > 0 && (
            <Badge variant="warning" className="absolute top-4 left-4">
              <TrophyIcon className="w-4 h-4 mr-1" />
              {brand.awards} Awards
            </Badge>
          )}
        </div>        {/* Quick Actions */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button
              size="lg"
              onClick={handleFollowToggle}
              className={cn(
                isFollowing && 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              )}
            >
              {isFollowing ? (
                <>
                  <HeartIconSolid className="w-5 h-5 mr-2 text-red-500" />
                  Following
                </>
              ) : (
                <>
                  <HeartIcon className="w-5 h-5 mr-2" />
                  Follow
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleShare}
            >
              <ShareIcon className="w-5 h-5 mr-2" />
              Share
            </Button>
          </div>

          {/* Social Links */}
          {brand.socialLinks && brand.socialLinks.length > 0 && (
            <div className="flex items-center gap-3">
              {brand.socialLinks.find(link => link.url.includes('http'))?.url && (
                <a 
                  href={brand.socialLinks.find(link => link.url.includes('http'))?.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit ${brand.name} website`}
                  title={`Visit ${brand.name} website`}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <GlobeAltIcon className="w-5 h-5" />
                </a>
              )}
              {/* Add more social links as needed */}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {brandStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center">
                      <div className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center mb-2',
                        'bg-gradient-to-br', stat.color
                      )}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderBrandStory = () => {
    if (!brand) return null;

    return (
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">About {brand.name}</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Brand Story</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {brand.brandStory || brand.description}
            </p>
          </div>

          {brand.foundedYear && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <BuildingOfficeIcon className="w-5 h-5" />
              <span>Founded in {brand.foundedYear}</span>
            </div>
          )}

          {brand.origin && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPinIcon className="w-5 h-5" />
              <span>{brand.origin}</span>
            </div>
          )}

          {brand.isVerified && (
            <div className="flex items-center gap-2">
              <CheckBadgeIcon className="w-6 h-6 text-blue-500" />
              <span className="text-sm font-medium">Verified Brand</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderTestimonials = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MOCK_TESTIMONIALS.map((testimonial) => (
          <Card key={testimonial.id}>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIconSolid
                    key={i}
                    className={cn(
                      'w-5 h-5',
                      i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'
                    )}
                  />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                &quot;{testimonial.content}&quot;
              </p>
              <div>
                <p className="font-semibold text-sm">{testimonial.author}</p>
                <p className="text-xs text-gray-500">{testimonial.role}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderProducts = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          Products ({formatNumber(filteredProducts.length)})
        </h2>
        <select
          value={productFilters.sortBy}
          onChange={(e) => setProductFilters(prev => ({ ...prev, sortBy: e.target.value }))}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
          aria-label="Sort products"
        >
          <option value="popular">Most Popular</option>
          <option value="newest">Newest First</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name">Name: A-Z</option>
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No products available from this brand yet.
          </p>
        </Card>
      ) : (
        <>
          {/* Use ProductGrid for displaying products */}
          <ProductGrid
            products={filteredProducts}
            columns={4}
            gap="md"
            isLoading={loading}
            onProductClick={handleProductClick}
          />
        </>
      )}
    </div>
  );

  const renderRelatedBrands = () => {
    if (relatedBrands.length === 0) return null;

    return (
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Similar Brands</h2>
        <BrandCarousel
          brands={relatedBrands}
          autoPlay
          showArrows
          showDots
          slidesPerView={4}
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
        />
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading brand...</p>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <Container className="py-16">
        <Card className="p-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Brand Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The brand you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button onClick={() => router.push('/brands')}>
            Back to Brands
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <>
      <SEOHead {...seoData} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8"
      >
        <Container>
          {renderBrandHeader()}

          {/* Tabs Section */}
          <div className="mt-12">
            <AnimatePresence mode="wait">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-8">
                  <TabsTrigger value="products">Products</TabsTrigger>
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="products" className="space-y-8">
                  <motion.div
                    key="products-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderProducts()}
                  </motion.div>
                </TabsContent>

                <TabsContent value="about" className="space-y-8">
                  <motion.div
                    key="about-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderBrandStory()}
                  </motion.div>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-8">
                  <motion.div
                    key="reviews-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderTestimonials()}
                  </motion.div>
                </TabsContent>
              </Tabs>
            </AnimatePresence>
          </div>

          {renderRelatedBrands()}
        </Container>
      </motion.div>
    </>
  );
}
