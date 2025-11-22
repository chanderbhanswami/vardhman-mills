/**
 * Home Components Export Hub
 * 
 * Central export file for all home page components including hero sections,
 * product showcases, categories, brands, collections, deals, and more.
 * Organized by section for easy navigation and imports.
 */

// ============================================================================
// About Section Components
// ============================================================================

export { default as AboutContent } from './AboutSection/AboutContent';
export { default as AboutImage } from './AboutSection/AboutImage';
export { default as AboutSection } from './AboutSection/AboutSection';

export type { AboutContentProps } from './AboutSection/AboutContent';
export type { AboutImageProps } from './AboutSection/AboutImage';
export type { AboutSectionProps } from './AboutSection/AboutSection';

// ============================================================================
// Best Sellers Components
// ============================================================================

export { default as BestSellersBanner } from './BestSellers/BestSellersBanner';
export { default as BestSellersCard } from './BestSellers/BestSellersCard';
export { default as BestSellersProducts } from './BestSellers/BestSellersProducts';
export { default as BestSellersProductCarousel } from './BestSellers/ProductCarousel';

export type { BestSellersBannerProps } from './BestSellers/BestSellersBanner';
export type { BestSellersCardProps } from './BestSellers/BestSellersCard';
export type { BestSellersProductsProps } from './BestSellers/BestSellersProducts';
export type { ProductCarouselProps as BestSellersProductCarouselProps } from './BestSellers/ProductCarousel';

// ============================================================================
// Brand Components
// ============================================================================

export { default as BrandBanner } from './Brands/BrandBanner';
export { default as BrandCard } from './Brands/BrandCard';
export { default as BrandCarousel } from './Brands/BrandCarousel';
export { default as BrandGrid } from './Brands/BrandGrid';

export type { BrandBannerProps } from './Brands/BrandBanner';
export type { BrandCardProps } from './Brands/BrandCard';
export type { BrandCarouselProps } from './Brands/BrandCarousel';
export type { BrandGridProps } from './Brands/BrandGrid';

// ============================================================================
// Category Components
// ============================================================================

export { default as CategoryBanner } from './Categories/CategoryBanner';
export { default as CategoryCard } from './Categories/CategoryCard';
export { default as CategoryCarousel } from './Categories/CategoryCarousel';
export { default as CategoryGrid } from './Categories/CategoryGrid';
export { default as CategoryNavigation } from './Categories/CategoryNavigation';
export { default as CategoryShowcase } from './Categories/CategoryShowcase';
export { default as SubcategoryList } from './Categories/SubcategoryList';

export type { CategoryBannerProps } from './Categories/CategoryBanner';
export type { CategoryCardProps } from './Categories/CategoryCard';
export type { CategoryCarouselProps } from './Categories/CategoryCarousel';
export type { CategoryGridProps } from './Categories/CategoryGrid';
export type { CategoryNavigationProps } from './Categories/CategoryNavigation';
export type { CategoryShowcaseProps } from './Categories/CategoryShowcase';
export type { SubcategoryListProps } from './Categories/SubcategoryList';

// ============================================================================
// Collection Components
// ============================================================================

export { default as Collection } from './Collections/Collection';
export { default as CollectionBanner } from './Collections/CollectionBanner';
export { default as CollectionCard } from './Collections/CollectionCard';
export { default as CollectionCarousel } from './Collections/CollectionCarousel';
export { default as CollectionGrid } from './Collections/CollectionGrid';

export type { CollectionProps } from './Collections/Collection';
export type { CollectionBannerProps } from './Collections/CollectionBanner';
export type { CollectionCardProps } from './Collections/CollectionCard';
export type { CollectionCarouselProps } from './Collections/CollectionCarousel';
export type { CollectionGridProps } from './Collections/CollectionGrid';

// ============================================================================
// Company Favorites Section Components
// ============================================================================

export { default as FavoritesBanner } from './CompanyFavoritesSection/FavoritesBanner';
export { default as FavoritesCard } from './CompanyFavoritesSection/FavoritesCard';
export { default as FavoritesProducts } from './CompanyFavoritesSection/FavoritesProducts';
export { default as FavoritesProductCarousel } from './CompanyFavoritesSection/ProductCarousel';

export type { FavoritesBannerProps } from './CompanyFavoritesSection/FavoritesBanner';
export type { FavoritesCardProps } from './CompanyFavoritesSection/FavoritesCard';
export type { FavoritesProductsProps } from './CompanyFavoritesSection/FavoritesProducts';
export type { ProductCarouselProps as FavoritesProductCarouselProps } from './CompanyFavoritesSection/ProductCarousel';

// ============================================================================
// Deals Components
// ============================================================================

export { default as CountdownTimer } from './Deals/CountdownTimer';
export { default as DealCard } from './Deals/DealCard';
export { default as DealsBanner } from './Deals/DealsBanner';
export { default as DealsSection } from './Deals/DealsSection';
export { default as FlashSales } from './Deals/FlashSales';

export type { 
  CountdownTimerProps,
  TimeLeft 
} from './Deals/CountdownTimer';
export type { DealCardProps } from './Deals/DealCard';
export type { DealsBannerProps } from './Deals/DealsBanner';
export type { DealsSectionProps } from './Deals/DealsSection';
export type { FlashSalesProps } from './Deals/FlashSales';

// ============================================================================
// Featured Products Components
// ============================================================================

export { default as FeaturedBanner } from './FeaturedProducts/FeaturedBanner';
export { default as FeaturedCard } from './FeaturedProducts/FeaturedCard';
export { default as FeaturedProducts } from './FeaturedProducts/FeaturedProducts';
export { default as FeaturedProductCarousel } from './FeaturedProducts/ProductCarousel';

export type { FeaturedBannerProps } from './FeaturedProducts/FeaturedBanner';
export type { FeaturedCardProps } from './FeaturedProducts/FeaturedCard';
export type { FeaturedProductsProps } from './FeaturedProducts/FeaturedProducts';
export type { ProductCarouselProps as FeaturedProductCarouselProps } from './FeaturedProducts/ProductCarousel';

// ============================================================================
// Features Section Components
// ============================================================================

export { default as FeatureCard } from './FeaturesSection/FeatureCard';
export { default as FeatureGrid } from './FeaturesSection/FeatureGrid';
export { default as ValueProposition } from './FeaturesSection/ValueProposition';

export type { FeatureCardProps } from './FeaturesSection/FeatureCard';
export type { FeatureGridProps } from './FeaturesSection/FeatureGrid';
export type { ValuePropositionProps } from './FeaturesSection/ValueProposition';

// ============================================================================
// Hero Section Components
// ============================================================================

export { default as HeroControls } from './HeroSection/HeroControls';
export { default as HeroSlide } from './HeroSection/HeroSlide';
export { default as HeroSlider } from './HeroSection/HeroSlider';

export type { HeroControlsProps } from './HeroSection/HeroControls';
export type { HeroSlideProps } from './HeroSection/HeroSlide';
export type { HeroSliderProps } from './HeroSection/HeroSlider';

// ============================================================================
// New Arrivals Components
// ============================================================================

export { default as NewArrivalsBanner } from './NewArrivals/NewArrivalsBanner';
export { default as NewArrivalsCard } from './NewArrivals/NewArrivalsCard';
export { default as NewArrivalsProducts } from './NewArrivals/NewArrivalsProducts';
export { default as NewArrivalsProductCarousel } from './NewArrivals/ProductCarousel';

export type { NewArrivalsBannerProps } from './NewArrivals/NewArrivalsBanner';
export type { NewArrivalsCardProps } from './NewArrivals/NewArrivalsCard';
export type { NewArrivalsProductsProps } from './NewArrivals/NewArrivalsProducts';
export type { ProductCarouselProps as NewArrivalsProductCarouselProps } from './NewArrivals/ProductCarousel';

// ============================================================================
// Recently Viewed Section Components
// ============================================================================

export { default as RecentItem } from './RecentlyViewedSection/RecentItem';
export { default as RecentlyViewed } from './RecentlyViewedSection/RecentlyViewed';
export { default as RecentlyViewedBanner } from './RecentlyViewedSection/RecentlyViewedBanner';
export { default as RecentlyViewedProductCarousel } from './RecentlyViewedSection/ProductCarousel';

export type { RecentItemProps } from './RecentlyViewedSection/RecentItem';
export type { RecentlyViewedProps } from './RecentlyViewedSection/RecentlyViewed';
export type { RecentlyViewedBannerProps } from './RecentlyViewedSection/RecentlyViewedBanner';
export type { ProductCarouselProps as RecentlyViewedProductCarouselProps } from './RecentlyViewedSection/ProductCarousel';

// ============================================================================
// Testimonials Components
// ============================================================================

export { default as CustomerAvatars } from './Testimonials/CustomerAvatars';
export { default as CustomerRatings } from './Testimonials/CustomerRatings';
export { default as CustomerReviews } from './Testimonials/CustomerReviews';
export { default as TestimonialBanner } from './Testimonials/TestimonialBanner';
export { default as TestimonialCard } from './Testimonials/TestimonialCard';
export { default as TestimonialSlider } from './Testimonials/TestimonialSlider';

export type { CustomerAvatarsProps } from './Testimonials/CustomerAvatars';
export type { CustomerRatingsProps } from './Testimonials/CustomerRatings';
export type { CustomerReviewsProps } from './Testimonials/CustomerReviews';
export type { TestimonialBannerProps } from './Testimonials/TestimonialBanner';
export type { TestimonialCardProps } from './Testimonials/TestimonialCard';
export type { TestimonialSliderProps } from './Testimonials/TestimonialSlider';

// ============================================================================
// Trending Components
// ============================================================================

export { default as TrendingBanner } from './Trending/TrendingBanner';
export { default as TrendingCard } from './Trending/TrendingCard';
export { default as TrendingProducts } from './Trending/TrendingProducts';
export { default as TrendingProductCarousel } from './Trending/ProductCarousel';

export type { TrendingBannerProps } from './Trending/TrendingBanner';
export type { TrendingCardProps } from './Trending/TrendingCard';
export type { TrendingProductsProps } from './Trending/TrendingProducts';
export type { ProductCarouselProps as TrendingProductCarouselProps } from './Trending/ProductCarousel';

// ============================================================================
// Standalone Home Components
// ============================================================================

export { default as BlogPreview } from './BlogPreview';
export { default as SalePreview } from './SalePreview';

export type { BlogPreviewProps } from './BlogPreview';
export type { SalePreviewProps } from './SalePreview';
