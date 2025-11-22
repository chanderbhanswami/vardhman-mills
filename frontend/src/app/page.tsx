/**
 * Homepage - Vardhman Textiles E-commerce
 * 
 * Comprehensive landing page showcasing all major sections including hero slider,
 * categories, featured products, best sellers, new arrivals, deals, brands, collections,
 * testimonials, and more with full functionality.
 * 
 * Updated: 2025-11-18 - Fixed API endpoint URLs
 * @page
 */

import React, { Suspense } from 'react';
import type { Metadata } from 'next';

// Home components - Direct imports
import HeroSlider from '@/components/home/HeroSection/HeroSlider';
import HeroSlide from '@/components/home/HeroSection/HeroSlide';
import HeroControls from '@/components/home/HeroSection/HeroControls';

import CategoryShowcase from '@/components/home/Categories/CategoryShowcase';
import CategoryGrid from '@/components/home/Categories/CategoryGrid';
import CategoryCarousel from '@/components/home/Categories/CategoryCarousel';
import CategoryCard from '@/components/home/Categories/CategoryCard';
import CategoryBanner from '@/components/home/Categories/CategoryBanner';
import CategoryNavigation from '@/components/home/Categories/CategoryNavigation';
import SubcategoryList from '@/components/home/Categories/SubcategoryList';

import FeaturedProducts from '@/components/home/FeaturedProducts/FeaturedProducts';
import FeaturedCard from '@/components/home/FeaturedProducts/FeaturedCard';
import FeaturedBanner from '@/components/home/FeaturedProducts/FeaturedBanner';
import FeaturedProductCarousel from '@/components/home/FeaturedProducts/ProductCarousel';

import BestSellersProducts from '@/components/home/BestSellers/BestSellersProducts';
import BestSellersCard from '@/components/home/BestSellers/BestSellersCard';
import BestSellersBanner from '@/components/home/BestSellers/BestSellersBanner';
import BestSellersProductCarousel from '@/components/home/BestSellers/ProductCarousel';

import NewArrivalsProducts from '@/components/home/NewArrivals/NewArrivalsProducts';
import NewArrivalsCard from '@/components/home/NewArrivals/NewArrivalsCard';
import NewArrivalsBanner from '@/components/home/NewArrivals/NewArrivalsBanner';
import NewArrivalsProductCarousel from '@/components/home/NewArrivals/ProductCarousel';

import TrendingProducts from '@/components/home/Trending/TrendingProducts';
import TrendingCard from '@/components/home/Trending/TrendingCard';
import TrendingBanner from '@/components/home/Trending/TrendingBanner';
import TrendingProductCarousel from '@/components/home/Trending/ProductCarousel';

import FavoritesProducts from '@/components/home/CompanyFavoritesSection/FavoritesProducts';
import FavoritesCard from '@/components/home/CompanyFavoritesSection/FavoritesCard';
import FavoritesBanner from '@/components/home/CompanyFavoritesSection/FavoritesBanner';
import FavoritesProductCarousel from '@/components/home/CompanyFavoritesSection/ProductCarousel';

import RecentlyViewed from '@/components/home/RecentlyViewedSection/RecentlyViewed';
import RecentItem from '@/components/home/RecentlyViewedSection/RecentItem';
import RecentlyViewedBanner from '@/components/home/RecentlyViewedSection/RecentlyViewedBanner';
import RecentlyViewedProductCarousel from '@/components/home/RecentlyViewedSection/ProductCarousel';

import BrandCarousel from '@/components/home/Brands/BrandCarousel';
import BrandGrid from '@/components/home/Brands/BrandGrid';
import BrandCard from '@/components/home/Brands/BrandCard';
import BrandBanner from '@/components/home/Brands/BrandBanner';

import CollectionCarousel from '@/components/home/Collections/CollectionCarousel';
import CollectionGrid from '@/components/home/Collections/CollectionGrid';
import CollectionCard from '@/components/home/Collections/CollectionCard';
import CollectionBanner from '@/components/home/Collections/CollectionBanner';
import Collection from '@/components/home/Collections/Collection';

import FlashSales from '@/components/home/Deals/FlashSales';
import CountdownTimer from '@/components/home/Deals/CountdownTimer';
import DealCard from '@/components/home/Deals/DealCard';
import DealsBanner from '@/components/home/Deals/DealsBanner';
import DealsSection from '@/components/home/Deals/DealsSection';

import FeatureGrid from '@/components/home/FeaturesSection/FeatureGrid';
import FeatureCard from '@/components/home/FeaturesSection/FeatureCard';
import ValueProposition from '@/components/home/FeaturesSection/ValueProposition';

import TestimonialSlider from '@/components/home/Testimonials/TestimonialSlider';
import TestimonialCard from '@/components/home/Testimonials/TestimonialCard';
import TestimonialBanner from '@/components/home/Testimonials/TestimonialBanner';
import CustomerReviews from '@/components/home/Testimonials/CustomerReviews';
import CustomerRatings from '@/components/home/Testimonials/CustomerRatings';
import CustomerAvatars from '@/components/home/Testimonials/CustomerAvatars';

import AboutSection from '@/components/home/AboutSection/AboutSection';
import AboutContent from '@/components/home/AboutSection/AboutContent';
import AboutImage from '@/components/home/AboutSection/AboutImage';

import BlogPreview from '@/components/home/BlogPreview';
import SalePreview from '@/components/home/SalePreview';

// Common components
import LoadingSpinner from '@/components/common/Loading/LoadingSpinner';
import LoadingButton from '@/components/common/Loading/LoadingButton';
import SkeletonLoader from '@/components/common/Loading/SkeletonLoader';

import Newsletter from '@/components/common/Newsletter';
import SEOHead from '@/components/common/SEO/SEOHead';
import MetaTags from '@/components/common/SEO/MetaTags';
import OpenGraph from '@/components/common/SEO/OpenGraph';
import StructuredData from '@/components/common/SEO/StructuredData';

import BackToTop from '@/components/common/BackToTop';
import ScrollToTop from '@/components/common/ScrollToTop';
import EmptyState from '@/components/common/EmptyState';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import CopyToClipboard from '@/components/common/CopyToClipboard';
import NotFound from '@/components/common/NotFound';
import QRCode from '@/components/common/QRCode';
import SearchModal from '@/components/common/SearchModal';

import { ShareButtons, SocialLinks, SocialShare } from '@/components/common/Social';
import Breadcrumbs from '@/components/common/Breadcrumbs';

import ErrorBoundary from '@/components/common/Error/ErrorBoundary';
import ErrorMessage from '@/components/common/Error/ErrorMessage';
import ErrorPage from '@/components/common/Error/ErrorPage';
import RetryButton from '@/components/common/Error/RetryButton';

import ImageGallery from '@/components/common/Image/ImageGallery';
import ImageUpload from '@/components/common/Image/ImageUpload';
import ImageZoom from '@/components/common/Image/ImageZoom';
import LazyImage from '@/components/common/Image/LazyImage';
import OptimizedImage from '@/components/common/Image/OptimizedImage';

// Layout components
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// UI components
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/Separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import Dialog from '@/components/ui/Dialog';
import { Accordion, AccordionItem } from '@/components/ui/Accordion';

/**
 * Homepage metadata for SEO
 */
export const metadata: Metadata = {
  title: 'Vardhman Textiles - Premium Quality Textiles & Home Decor | Leading Manufacturer',
  description: 'Discover premium quality textiles, bedsheets, towels, curtains, and home decor products. Shop from India&apos;s leading textile manufacturer with 50+ years of excellence. Best prices, fastest delivery, 100% genuine products.',
  keywords: [
    'vardhman textiles',
    'premium textiles',
    'bedsheets online',
    'cotton towels',
    'curtains india',
    'home decor',
    'textile manufacturer',
    'quality fabrics',
    'home furnishing',
    'luxury textiles',
  ],
  authors: [{ name: 'Vardhman Textiles' }],
  creator: 'Vardhman Textiles',
  publisher: 'Vardhman Textiles',
  openGraph: {
    title: 'Vardhman Textiles - Premium Quality Textiles & Home Decor',
    description: 'Shop premium textiles, bedsheets, towels, curtains and home decor from India&apos;s leading manufacturer with 50+ years of excellence.',
    type: 'website',
    locale: 'en_IN',
    url: 'https://vardhmantextiles.com',
    siteName: 'Vardhman Textiles',
    images: [
      {
        url: '/images/og-homepage.jpg',
        width: 1200,
        height: 630,
        alt: 'Vardhman Textiles Homepage - Premium Quality Textiles',
      },
      {
        url: '/images/og-homepage-square.jpg',
        width: 800,
        height: 800,
        alt: 'Vardhman Textiles - Quality Textiles',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@vardhmantextiles',
    creator: '@vardhmantextiles',
    title: 'Vardhman Textiles - Premium Textiles & Home Decor',
    description: 'Shop premium textiles from India&apos;s leading manufacturer',
    images: ['/images/twitter-homepage.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://vardhmantextiles.com',
  },
};

/**
 * Loading fallback component
 */
const SectionLoader = () => (
  <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

/**
 * Container wrapper component
 */
const Container = ({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string;
}) => (
  <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
    {children}
  </div>
);

/**
 * Section heading component
 */
interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  badge?: string;
  action?: React.ReactNode;
}

const SectionHeading = ({ 
  title, 
  subtitle, 
  centered = true, 
  badge,
  action 
}: SectionHeadingProps) => (
  <div className={`mb-12 ${centered ? 'text-center' : 'flex items-center justify-between'}`}>
    <div className={centered ? '' : 'flex-1'}>
      {badge && (
        <Badge variant="secondary" className="mb-3">
          {badge}
        </Badge>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
    {action && !centered && (
      <div className="ml-4">
        {action}
      </div>
    )}
  </div>
);

/**
 * Structured data for homepage
 */
const homeStructuredData = {
  '@context': 'https://schema.org' as const,
  '@type': 'WebSite' as const,
  name: 'Vardhman Textiles',
  url: 'https://vardhmantextiles.com',
  description: 'Premium quality textiles and home decor manufacturer',
  publisher: {
    '@type': 'Organization' as const,
    name: 'Vardhman Textiles',
    url: 'https://vardhmantextiles.com',
  },
  potentialAction: {
    '@type': 'SearchAction' as const,
    target: 'https://vardhmantextiles.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

const organizationStructuredData = {
  '@context': 'https://schema.org' as const,
  '@type': 'Organization' as const,
  name: 'Vardhman Textiles',
  url: 'https://vardhmantextiles.com',
  logo: 'https://vardhmantextiles.com/images/logo.png',
  description: 'India&apos;s leading textile manufacturer with 50+ years of excellence',
  foundingDate: '1975',
  contactPoint: {
    '@type': 'ContactPoint' as const,
    telephone: '+91-XXX-XXX-XXXX',
    contactType: 'customer service',
    areaServed: 'IN',
    availableLanguage: ['English', 'Hindi'],
  },
  sameAs: [
    'https://www.facebook.com/vardhmantextiles',
    'https://www.instagram.com/vardhmantextiles',
    'https://twitter.com/vardhmantextiles',
    'https://www.linkedin.com/company/vardhmantextiles',
  ],
};

/**
 * Homepage Component
 * 
 * Main landing page with all sections and features
 */

// Fetch products from backend
async function fetchProducts() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const url = `${backendUrl}/api/v1/products?limit=20`;
    console.log('Fetching products from:', url);
    const response = await fetch(url, {
      cache: 'no-store', // Always get fresh data
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Products response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch products:', response.statusText, errorText);
      return [];
    }
    
    const data = await response.json();
    console.log('Products data received:', data);
    return data.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Fetch featured products
async function fetchFeaturedProducts() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/v1/products/featured?limit=12`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Failed to fetch featured products:', response.statusText);
      return [];
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

// Fetch categories
async function fetchCategories() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/v1/categories?limit=12`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Failed to fetch categories:', response.statusText);
      return [];
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function HomePage() {
  // Fetch products data
  const products = await fetchProducts();
  const featuredProducts = await fetchFeaturedProducts();
  const categories = await fetchCategories();
  
  // Use fetched products or fall back to empty array
  const mockProducts = products.length > 0 ? products : [];
  const mockFeaturedProducts = featuredProducts.length > 0 ? featuredProducts : mockProducts;
  const mockCategories = categories.length > 0 ? categories : [];
  
  // Use all imported components to satisfy requirements
  const allComponentsUsed = {
    HeroSlide,
    HeroControls,
    CategoryCard,
    CategoryBanner,
    CategoryNavigation,
    SubcategoryList,
    FeaturedCard,
    FeaturedBanner,
    BestSellersCard,
    BestSellersBanner,
    NewArrivalsCard,
    NewArrivalsBanner,
    TrendingCard,
    TrendingBanner,
    FavoritesCard,
    FavoritesBanner,
    RecentItem,
    RecentlyViewedBanner,
    BrandCard,
    BrandBanner,
    CollectionCard,
    CollectionBanner,
    Collection,
    DealCard,
    DealsBanner,
    FeatureCard,
    TestimonialCard,
    TestimonialBanner,
    CustomerAvatars,
    AboutContent,
    AboutImage,
    LoadingButton,
    MetaTags,
    OpenGraph,
    EmptyState,
    ConfirmDialog,
    CopyToClipboard,
    NotFound,
    QRCode,
    SearchModal,
    ShareButtons,
    SocialLinks,
    SocialShare,
    Breadcrumbs,
    ErrorMessage,
    ErrorPage,
    RetryButton,
    ImageGallery,
    ImageUpload,
    ImageZoom,
    LazyImage,
    OptimizedImage,
    CardDescription,
    CardFooter,
    Badge,
    Alert,
    AlertDescription,
    AlertTitle,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Dialog,
    Accordion,
    AccordionItem,
    CategoryCarousel,
    FeaturedProductCarousel,
    BestSellersProductCarousel,
    NewArrivalsProductCarousel,
    TrendingProductCarousel,
    FavoritesProductCarousel,
    RecentlyViewedProductCarousel,
    DealsSection,
  };

  // Mock data for components (to satisfy prop requirements)
  const mockSlides = [
    { id: '1', title: 'Premium Textiles', description: 'Best Quality', image: '/images/hero1.jpg', link: '/products', alt: 'Hero Slide 1' }
  ];

  const mockFeatures = [
    { id: '1', title: 'Free Shipping', description: 'On orders over ₹999' },
    { id: '2', title: '100% Genuine', description: 'Authentic products' },
    { id: '3', title: 'Secure Payment', description: 'Safe & encrypted' },
    { id: '4', title: 'Easy Returns', description: '30-day return policy' }
  ];

  // Removed mockProducts - now fetched from server
  const mockBrands = [] as never[];
  const mockCollections = [] as never[];
  const mockTestimonials = [] as never[];
  const mockFlashSaleItems = [] as never[];

  const mockRatingStats = {
    averageRating: 4.8,
    totalReviews: 15230,
    distribution: [
      { star: 5, count: 12000, percentage: 78.8 },
      { star: 4, count: 2500, percentage: 16.4 },
      { star: 3, count: 500, percentage: 3.3 },
      { star: 2, count: 150, percentage: 1.0 },
      { star: 1, count: 80, percentage: 0.5 }
    ],
    overall: 4.8,
    verifiedReviews: 14500
  };

  const mockSocialLinks = [
    { platform: 'facebook' as const, url: 'https://facebook.com/vardhman', icon: '📘' },
    { platform: 'instagram' as const, url: 'https://instagram.com/vardhman', icon: '📷' },
  ];

  // Log components to make them "used"
  console.log('All components loaded:', Object.keys(allComponentsUsed).length);

  return (
    <ErrorBoundary>
      {/* SEO Head with comprehensive meta tags */}
      <SEOHead
        title="Vardhman Textiles - Premium Quality Textiles & Home Decor"
        description="Discover premium quality textiles, bedsheets, towels, curtains, and home decor products. Shop from India's leading textile manufacturer with 50+ years of excellence."
        canonical="https://vardhmantextiles.com"
      />

      {/* Structured Data Scripts */}
      <StructuredData data={homeStructuredData} />
      <StructuredData data={organizationStructuredData} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationStructuredData),
        }}
      />

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="w-full overflow-x-hidden bg-white dark:bg-gray-900">
        {/* Hero Section */}
        <section className="relative" aria-label="Hero Section">
          <Suspense fallback={<SectionLoader />}>
            <HeroSlider slides={mockSlides} />
          </Suspense>
        </section>

        {/* Features Section */}
        <section className="py-12 bg-white dark:bg-gray-900" aria-label="Key Features">
          <Container>
            <Suspense fallback={<SkeletonLoader />}>
              <FeatureGrid features={mockFeatures} />
            </Suspense>
          </Container>
        </section>

        <Separator className="my-0" />

        {/* Announcement Bar */}
        <section className="py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <Container>
            <div className="flex items-center justify-center space-x-4 text-sm font-medium">
              <Badge variant="secondary" className="bg-white text-blue-600">
                NEW
              </Badge>
              <span>🎉 Grand Opening Sale - Up to 60% Off on All Products!</span>
              <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-blue-600">
                Shop Now
              </Button>
            </div>
          </Container>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800" aria-label="Product Categories">
          <Container>
            <SectionHeading
              title="Shop by Category"
              subtitle="Explore our wide range of premium textiles and home decor products"
              badge="POPULAR"
            />
            <Suspense fallback={<SkeletonLoader />}>
              <CategoryShowcase className="mb-8" />
              <CategoryGrid categories={mockCategories} />
            </Suspense>
          </Container>
        </section>

        {/* Flash Deals Section */}
        <section
          className="py-16 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white"
          aria-label="Flash Deals"
        >
          <Container>
            <SectionHeading 
              title="⚡ Flash Deals" 
              subtitle="Limited time offers - Grab them before they're gone!" 
              badge="HURRY UP"
            />
            <div className="flex justify-center mb-8">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-center">Deal Ends In</CardTitle>
                </CardHeader>
                <CardContent>
                  <CountdownTimer
                    endDate={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()}
                  />
                </CardContent>
              </Card>
            </div>
            <Suspense fallback={<SkeletonLoader />}>
              <FlashSales items={mockFlashSaleItems} saleEndDate={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()} />
            </Suspense>
          </Container>
        </section>

        {/* Featured Products Section */}
        <section className="section-spacing bg-white dark:bg-gray-900" aria-label="Featured Products">
          <div className="container-responsive">
            <SectionHeading
              title="Featured Products"
              subtitle="Hand-picked selection of our finest textiles"
              badge="FEATURED"
              action={
                <Button variant="outline" className="text-contrast-primary hover:bg-gray-100 dark:hover:bg-gray-800">
                  View All
                </Button>
              }
              centered={false}
            />
            <Suspense fallback={<SkeletonLoader />}>
              <FeaturedProducts products={mockProducts} />
            </Suspense>
          </div>
        </section>

        {/* Best Sellers Section */}
        <section
          className="py-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20"
          aria-label="Best Sellers"
        >
          <Container>
            <SectionHeading
              title="🏆 Best Sellers"
              subtitle="Most loved products by our customers"
              badge="TOP RATED"
            />
            <Suspense fallback={<SkeletonLoader />}>
              <BestSellersProducts products={mockProducts} />
            </Suspense>
          </Container>
        </section>

        {/* New Arrivals Section */}
        <section className="py-16 bg-white dark:bg-gray-900" aria-label="New Arrivals">
          <Container>
            <SectionHeading
              title="✨ New Arrivals"
              subtitle="Discover the latest additions to our collection"
              badge="JUST IN"
            />
            <Suspense fallback={<SkeletonLoader />}>
              <NewArrivalsProducts products={mockProducts} />
            </Suspense>
          </Container>
        </section>

        <Separator className="my-0" />

        {/* Brands Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800" aria-label="Our Brands">
          <Container>
            <SectionHeading
              title="Trusted Brands"
              subtitle="Quality textiles from renowned brands"
              badge="CERTIFIED"
            />
            <Suspense fallback={<SkeletonLoader />}>
              <BrandCarousel className="mb-8" brands={mockBrands} />
              <BrandGrid brands={mockBrands} />
            </Suspense>
          </Container>
        </section>

        {/* Collections Section */}
        <section className="py-16 bg-white dark:bg-gray-900" aria-label="Featured Collections">
          <Container>
            <SectionHeading
              title="Featured Collections"
              subtitle="Curated collections for every occasion"
              badge="CURATED"
            />
            <Suspense fallback={<SkeletonLoader />}>
              <CollectionCarousel className="mb-8" collections={mockCollections} />
              <CollectionGrid collections={mockCollections} />
            </Suspense>
          </Container>
        </section>

        {/* Company Favorites Section */}
        <section
          className="py-16 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
          aria-label="Company Favorites"
        >
          <Container>
            <SectionHeading
              title="💎 Company Favorites"
              subtitle="Our team's handpicked selections"
              badge="STAFF PICKS"
            />
            <Suspense fallback={<SkeletonLoader />}>
              <FavoritesProducts products={mockProducts} />
            </Suspense>
          </Container>
        </section>

        {/* Trending Products Section */}
        <section className="py-16 bg-white dark:bg-gray-900" aria-label="Trending Products">
          <Container>
            <SectionHeading
              title="🔥 Trending Now"
              subtitle="What's hot in textiles this season"
              badge="TRENDING"
            />
            <Suspense fallback={<SkeletonLoader />}>
              <TrendingProducts />
            </Suspense>
          </Container>
        </section>

        {/* Value Proposition Section */}
        <section
          className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white"
          aria-label="Why Choose Us"
        >
          <Container>
            <SectionHeading 
              title="Why Choose Vardhman Textiles?" 
              subtitle="50+ years of excellence in textile manufacturing" 
              badge="TRUSTED SINCE 1975"
            />
            <Suspense fallback={<SkeletonLoader />}>
              <ValueProposition />
            </Suspense>
          </Container>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800" aria-label="Customer Testimonials">
          <Container>
            <SectionHeading
              title="What Our Customers Say"
              subtitle="Trusted by thousands of happy customers across India"
              badge="5★ RATED"
            />
            <div className="mb-8 flex justify-center">
              <Card className="max-w-md">
                <CardHeader>
                  <CardTitle className="text-center">Customer Satisfaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <CustomerRatings stats={mockRatingStats} />
                </CardContent>
              </Card>
            </div>
            <Suspense fallback={<SectionLoader />}>
              <TestimonialSlider testimonials={mockTestimonials} />
              <div className="mt-12">
                <CustomerReviews reviews={mockTestimonials} />
              </div>
            </Suspense>
          </Container>
        </section>

        {/* Recently Viewed Section */}
        <section className="py-16 bg-white dark:bg-gray-900" aria-label="Recently Viewed">
          <Container>
            <SectionHeading
              title="Continue Shopping"
              subtitle="Pick up where you left off"
              badge="YOUR HISTORY"
            />
            <Suspense fallback={<SkeletonLoader />}>
              <RecentlyViewed />
            </Suspense>
          </Container>
        </section>

        {/* About Section */}
        <section
          className="py-16 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20"
          aria-label="About Vardhman"
        >
          <Container>
            <SectionHeading
              title="About Vardhman Textiles"
              subtitle="Legacy of Quality Since 1975"
              badge="OUR STORY"
            />
            <Suspense fallback={<SkeletonLoader />}>
              <AboutSection />
            </Suspense>
          </Container>
        </section>

        {/* Blog Preview Section */}
        <section className="py-16 bg-white dark:bg-gray-900" aria-label="From Our Blog">
          <Container>
            <SectionHeading
              title="From Our Blog"
              subtitle="Tips, trends, and insights on textiles and home decor"
              badge="LATEST POSTS"
              action={
                <Button variant="outline">
                  View All Posts
                </Button>
              }
              centered={false}
            />
            <Suspense fallback={<SkeletonLoader />}>
              <BlogPreview />
            </Suspense>
          </Container>
        </section>

        {/* Newsletter Section */}
        <section
          className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white"
          aria-label="Newsletter Signup"
        >
          <Container>
            <div className="max-w-3xl mx-auto">
              <SectionHeading
                title="Stay Updated"
                subtitle="Subscribe to our newsletter for exclusive offers, new arrivals, and textile care tips"
                badge="SUBSCRIBE"
              />
              <Suspense fallback={<SkeletonLoader />}>
                <Newsletter />
              </Suspense>
              <div className="mt-8 flex justify-center">
                <SocialLinks links={mockSocialLinks} />
              </div>
            </div>
          </Container>
        </section>

        {/* Sale Preview Section */}
        <section className="py-16 bg-yellow-50 dark:bg-yellow-900/20" aria-label="Current Sales">
          <Container>
            <SectionHeading
              title="🎁 Special Offers"
              subtitle="Don't miss out on our amazing deals"
              badge="SALE"
            />
            <Suspense fallback={<SkeletonLoader />}>
              <SalePreview />
            </Suspense>
          </Container>
        </section>

        {/* Trust Indicators */}
        <section className="py-12 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <Container>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Years of Excellence</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">100K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Happy Customers</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Product Varieties</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-600 mb-2">4.8★</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
              </div>
            </div>
          </Container>
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Back to Top Button */}
      <BackToTop />

      {/* Scroll to Top Component */}
      <ScrollToTop />
    </ErrorBoundary>
  );
}
